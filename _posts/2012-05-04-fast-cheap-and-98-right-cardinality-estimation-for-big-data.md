---
title: "Fast, Cheap, and 98% Right: Cardinality Estimation for Big Data"
author: Fangjin Yang
layout: post
image: http://metamarkets.com/wp-content/uploads/2012/05/cardinality1.jpg
---

The nascent era of big data brings new challenges, which in turn require new
tools and algorithms. At Metamarkets, one such challenge focuses on cardinality
estimation: efficiently determining the number of distinct elements within a
dimension of a large-scale data set. Cardinality estimations have a wide range
of applications from monitoring network traffic to data mining. If leveraged
correctly, these algorithms can also be used to provide insights into user
engagement and growth, via metrics such as “daily active users.”

### The HyperLogLog Algorithm:  Every Bit is Great

It is well known that the cardinality of a large data set can be precisely
calculated if the storage complexity is proportional to the number of elements
in the data set. However, given the scale and complexity of some Druid data
sets (with record counts routinely in the billions), the data ensemble is often
far too large to be kept in core memory. Furthermore, because Druid data sets
can be arbitrarily queried with varying time granularities and filter sets, we
needed the ability to estimate dimension cardinalities on the fly across
multiple granular buckets. To address our requirements, we opted to implement
the [HyperLogLog](http://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf)
algorithm, originally described by Flajolet and colleagues in 2007. The
HyperLogLog algorithm can estimate cardinalities well beyond 10^9 with a
relative accuracy (standard error) of 2% while only using 1.5kb of memory.
Other [companies](http://www.addthis.com/blog/2012/03/26/probabilistic-counting/#.T5nYl8SpnIZ) have
also leveraged variations of this algorithm in their cardinality estimations.

HyperLogLog takes advantage of the randomized distribution of bits from hashing
functions in order to estimate how many things you would’ve needed to see in
order to experience a specific phenomenon.  But as that sentence probably made
little sense to any reader, let’s try a simple example to explain what it does.

### An Example:  Making a Hash of Things

First, there’s a fundamental mental model shift that is important to realize. 
A hash function is generally understood as a function that maps a value from
one (larger) space onto another (smaller) space.  In order to randomly hash on
a computer system, which is binary at its core, you can view the input value as
a series of bits. The hash function acts to contort the input value in some
meaningful way such that an output value that is N bits long is produced. A
good hash function should assure that the bits of the output value are
independent and each have an equal probability (50%) of occurring.

Given a random uniform distribution for likelihoods of N 0s and 1s, you can
extract a probability distribution for the likelihood of a specific
phenomenon.  The phenomenon we care about is the maximum index of a 1 bit. 
Specifically, we expect the following to be true:

50% of hashed values will look like this: 1xxxxxxx…x  
25% of hashed values will look like this: 01xxxxxx…x  
12.5% of hashed values will look like this: 001xxxxxxxx…x  
6.25% of hashed values will look like this: 0001xxxxxxxx…x  
…

So, naively speaking, we expect that if we were to hash 8 unique things, one of
them will start with 001.  If we were to hash 4 unique things, we would expect
one to start with 01.  This expectation can also be inverted: if the “highest”
index of a 1 is 2 (we start counting with index 1 as the leftmost bit
location), then we probably saw ~4 unique values.  If the highest index is
4, we probably saw ~16 unique values.  This level of approximation is pretty
coarse and it is pretty easy to see that it is only approximate at best, but it
is the basic idea behind HyperLogLog.

### Buckets and Bits:  Tuning Precision and Scale

The adjustment HyperLogLog makes is that it essentially takes the above
algorithm and introduces multiple “buckets”.  That is, you can take the first k
bits of the hashed value and use that as a bucket index, then you keep track of
the max(index of 1) for the remaining bits in that bucket.  The authors then
provide some math for converting the values in all of the buckets back into an
approximate cardinality.

Another interesting thing about this algorithm is that it introduces two
parameters to adjust the accuracy of the approximation:

* Increasing the number of buckets (the k) increases the accuracy of the approximation
* Increasing the number of bits of your hash increases the highest possible number you can accurately approximate


### Now, Do it in Parallel

So how exactly is all of this useful?  When working with large data sets, it is
common to maintain a summarization of the data set inside of a data warehouse
and run analytical queries against that summarization.  Often, including
information like user ids, user cookies or IP addresses (things that are used
to compute unique users) in these summarizations results in a tradeoff with
the potential reduction of data volume seen in the summarization and the
ability to compute cardinalities.  We wanted to be able to take advantage of
the space savings and row reduction of summarization while still being able to
compute cardinalities:  this is where HyperLogLog comes in.

In [Druid](http://druid.io/), our summarization process applies the hash
function ([Murmur 128](http://sites.google.com/site/murmurhash/)) and computes
the intermediate HyperLogLog format (i.e. the list of buckets of
`max(index of 1)`) and stores that in a column.  Thus, for every row in our
summarized dataset, we have a HyperLogLog “sketch” of the unique users that
were seen in the original event rows comprising that summarized line.  These
sketches are combinable in an additive/commutative way, just like sum, max, and
min.  In other words, this intermediate format fits in perfectly with the
hierarchical scatter/gather query distribution and processing paradigm employed
by Druid, allowing us to provide granular time-series and top lists of unique
users, with the full arbitrary slicing and dicing power of Druid.

We don’t just end there though.  We also further optimize the storage format of
the intermediate data structure depending on whether the set of buckets is
sparse or dense. Stored densely, the data structure is just n buckets of 1 byte
(or an array of n bytes, generally, k is less than 256, so it can be
represented in one byte).  However, in the sparse case, we only need to store
buckets with valid index values in them.  This means that instead of storing n
buckets of 1 byte apiece, we can just store the (index, value) pairs.

### We Are the 99% (ok, the 98.5%)

Given our implementation of the algorithm, the theoretical average amount of
error is 1.5% (i.e. the values will be off by an average of 1.5%). The graph
below shows the benchmark results for a loop that ran from 0 to
`Integer.MAX_VALUE` and added the result of a `Random.nextLong()` to the
HyperLogLog.  For this particular benchmark, the average error rate was found
to be 1.202526%.

![](http://metamarkets.com/wp-content/uploads/2012/05/plot1-1024x1024.png)

#### Looking for more Druid information? [Learn more about our core technology.](http://metamarkets.com/product/technology/)
