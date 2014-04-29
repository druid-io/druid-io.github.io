---
title: "How We Scaled HyperLogLog: Three Real-World Optimizations"
author: NELSON RAY AND FANGJIN YANG
image: http://metamarkets.com/wp-content/uploads/2014/02/sequoia-600x400.jpg
layout: post
---

At Metamarkets, we specialize in converting mountains of programmatic ad data
into real-time, explorable views. Because these datasets are so large and
complex, we’re always looking for ways to maximize the speed and efficiency of
how we deliver them to our clients.  In this post, we’re going to continue our
discussion of some of the techniques we use to calculate critical metrics such
as unique users and device IDs with maximum performance and accuracy.

Approximation algorithms are rapidly gaining traction as the preferred way to
determine the unique number of elements in high cardinality sets. In the space
of cardinality estimation algorithms, HyperLogLog has quickly emerged as the
de-facto standard. Widely discussed by [technology companies][pub40671] and
[popular blogs][highscalability-count], HyperLogLog trades
accuracy in data and query results for massive reductions in data storage and
vastly improved [system performance][strata-talk].

In our [previous][previous-hll-post] investigation of HyperLogLog, we briefly
discussed our motivations for using approximate algorithms and how we leveraged
HyperLogLog in [Druid][druid], Metamarkets’ open source, distributed data
store.  Since implementing and deploying HyperLogLog last year, we’ve made
several optimizations to further improve performance and reduce storage cost.
This blog post will share some of those optimizations. This blog post assumes
that you are already familiar with how HyperLogLog works. If you are not
familiar with the algorithm, there are plenty of resources [online][flajolet].

## Compacting Registers

In our initial implementation of HLL, we allocated 8 bits of memory for each
register. Recall that each value stored in a register indicates the position of
the first ‘1’ bit of a hashed input. Given that 2^255 ~== 10^76, a single 8 bit
register could approximate (not well, though) a cardinality close to the number
of atoms in the entire [observable universe][atoms-in-the-universe]. Martin
Traverso, et. al. of [Facebook’s Presto][presto] , realized that this was a bit
wasteful and proposed an optimization, exploiting the fact that the registers
increment in near lockstep.

Given that each register is initially initialized with value 0, with 0 uniques,
there is no change in any of the registers. Let’s say we have 8 registers. Then
with 8 * 2^10 uniques, each register will have values ~ 10. Of course, there
will be some variance, which can be calculated exactly if one were so inclined,
given that the distribution in each register is an independent maximum of
[Negative Binomial][negative-binomial] (1, .5) draws.

With 4 bit registers, each register can only approximate up to 2^15 = 32,768
uniques. In fact, the reality is worse because the higher numbers cannot be
represented and are lost, impacting accuracy. Even with 2,048 registers, we
can’t do much better than ~60M, which is one or two orders of magnitude lower
than what we need.

Since the register values tend to increase together, the FB folks decided to
introduce an offset counter and only store positive differences from it in the
registers. That is, if we have register values of 8, 7, and 9, this corresponds
to having an offset of 7 and using register difference values of 1, 0, and 2.
Given the smallish spread that we expect to see, we typically won’t observe a
difference of more than 15 among register values. So we feel comfortable using
2,048 4 bit registers with an 8 bit offset, for 1025 bytes of storage &lt; 2048
bytes (no offset and 8 bit registers).

In fact, others have commented on the concentrated distribution of the register
values as well. In her [thesis][durand-thesis], Marianne Durand suggested using
a variable bit prefix encoding. Researchers at [Google][google-40671] have had
success with difference encodings and variable length encodings.

### Problem

This optimization has served us well, with no appreciable loss in accuracy when
streaming many uniques into a single HLL object, because the offset increments
when all the registers get hit. Similarly, we can combine many HLL objects of
moderate size together and watch the offsets increase. However, a curious
phenomenon occurs when we try to combine many “small” HLL objects together.

Suppose each HLL object stores a single unique value. Then its offset will be
0, one register will have a value between 1 and 15, and the remaining registers
will be 0. No matter how many of these we combine together, our aggregate HLL
object will never be able to exceed a value of 15 in each register with a 0
offset, which is equivalent to an offset of 15 with 0’s in each register. Using
2,048 registers, this means we won’t be able to produce estimates greater than
~ .7 * 2048^2 * 1 / (2048 / 2^15) ~ 47M. ([*Flajolet, et al. 2007*][flajolet])

Not good, because this means our estimates are capped at 10^7 instead of 10^80,
irrespective of the number of true uniques. And this isn’t just some
pathological edge case. Its untimely appearance in production a while ago was
no fun trying to fix.

### Floating Max

The root problem in the above scenario is that the high values (&gt; 15) are
being clipped, with no hope of making it into a “small” HLL object, since the
offset is 0. Although they are rare, many cumulative misses can have a
noticeably large effect. Our solution involves storing one additional pair, a
“floating max” bucket with higher resolution. Previously, a value of 20 in
bucket 94 would be clipped to 15. Now, we store (20, 94) as the floating max,
requiring at most an additional 2 bytes, bringing our total up to 1027 bytes.
With enough small HLL objects so that each position is covered by a floating
max, the combined HLL object can exceed the previous limit of 15 in each
position. It also turns out that just one floating max is sufficient to largely
fix the problem.

Let’s take a look at one measure of the accuracy of our approximations. We
simulate 1,000 runs of streaming 1B uniques into an HLL object and look at the
proportion of cases in which we observed clipping with the offset approximation
(black) and the addition of the floating max (red). So for 1e9 uniques, the max
reduced clipping from 95%+ to ~15%. That is, in 85% of cases, the much smaller
HLL objects with the floating max agreed with HLL versus less than 5% without
the floating max.

![Clipping on Cardinality](http://metamarkets.com/wp-content/uploads/2014/02/FJblogpost-600x560.png "Clipping on Cardinality")

For the cost of only 2 bytes, the floating max register allowed us to union
millions of HLL objects with minimal measurable loss in accuracy.

## Sparse and Dense Storage

We first discussed the concept of representing HLL buckets in either a sparse
or dense format in our [first blog post][previous-hll-post]. Since that time,
Google has also written a [great paper][pub40671] on the matter. Data undergoes
a [summarization process][druid-part-deux] when it is ingested in Druid. It is
unnecessarily expensive to store raw event data and instead, Druid rolls
ingested data up to some time granularity.

![](https://lh6.googleusercontent.com/O2YefUQdRdmCTXzh6xdxthD0VJY0Vq96DTXkhhPVAL_JXaJ1JuAWfFaxZDSmf9NDZgrmHS61RMFLqivacqsOw7evy1Ff73KNb1MdjoLchpCwc-YE8d9eCLiAAA)

In practice, we see tremendous reductions in data volume by summarizing our
[data][strata-talk]. For a given summarized row, we can maintain HLL objects
where each object represents the estimated number of unique elements for a
column of that row.

When the summarization granularity is sufficiently small, only a limited number
of unique elements may be seen for a dimension. In this case, a given HLL
object may have registers that contain no values. The HLL registers are thus
‘sparsely’ populated.

Our normal storage representation of HLL stores 2 register values per byte. In
the sparse representation, we instead store the explicit indexes of buckets
that have valid values in them as (index, value) pairs. When the sparse
representation exceeds the size of the normal or ‘dense’ representation (1027
bytes), we can switch to using only the dense representation. Our actual
implementation uses a heuristic to determine when this switch occurs, but the
idea is the same. In practice, many dimensions in real world data sets are of
low cardinality, and this optimization can greatly reduce storage versus only
storing the dense representation.

## Faster Lookups

One of the simpler optimizations that we implemented for faster cardinality
calculations was to use lookups for register values. Instead of computing the
actual register value by summing the register offset with the stored register
value, we instead perform a lookup into a precalculated map. Similarly, to
determine the number of zeros in a register value, we created a secondary
lookup table. Given the number of registers we have, the cost of storing these
lookup tables is near trivial. This problem is often known as the [Hamming
Weight problem][hamming-weight].

## Lessons

Many of our optimizations came out of necessity, both to provide the
interactive query latencies that Druid users have come to expect, and to keep
our storage costs reasonable. If you have any further improvements to our
optimizations, please share them with us! We strongly believe that as data sets
get increasingly larger, estimation algorithms are key to keeping query times
acceptable. The approximate algorithm space remains relatively new, but it is
something we can build together.

For more information on Druid, please visit [druid.io][druid] and follow
[@druidio][twitter]. We’d also like to thank Eric Tschetter and Xavier Léauté
for their contributions to this work.  Featured image courtesy of [Donna L
Martin][image-credits].

[druid]: http://druid.io/
[twitter]: https://twitter.com/druidio
[pub40671]: http://research.google.com/pubs/pub40671.html
[highscalability-count]: http://highscalability.com/blog/2012/4/5/big-data-counting-how-to-count-a-billion-distinct-objects-us.html
[flajolet]: http://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf
[previous-hll-post]: http://metamarkets.com/2012/fast-cheap-and-98-right-cardinality-estimation-for-big-data
[atoms-in-the-universe]: http://www.universetoday.com/36302/atoms-in-the-universe/
[presto]: https://www.facebook.com/notes/facebook-engineering/presto-interacting-with-petabytes-of-data-at-facebook/10151786197628920
[negative-binomial]: http://en.wikipedia.org/wiki/Negative_binomial_distribution
[durand-thesis]: http://algo.inria.fr/durand/Articles/these.ps
[google-40671]: http://static.googleusercontent.com/media/research.google.com/en/us/pubs/archive/40671.pdf
[strata-talk]: http://strataconf.com/stratany2013/public/schedule/detail/30045
[druid-part-deux]: http://druid.io/blog/2011/05/20/druid-part-deux.html
[hamming-weight]: http://en.wikipedia.org/wiki/Hamming_weight
[image-credits]: http://donasdays.blogspot.com/2012/10/are-you-sprinter-or-long-distance-runner.html
