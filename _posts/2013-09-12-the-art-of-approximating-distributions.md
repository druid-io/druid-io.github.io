---
title: "The Art of Approximating Distributions: Histograms and Quantiles at Scale"
layout: post
author: Nelson Ray
image: http://metamarkets.com/wp-content/uploads/2013/06/atlas-600x402.jpeg
---

_I’d like to acknowledge Xavier Léauté for his extensive contributions (in
particular, for suggesting several algorithmic improvements and work on
implementation), helpful comments, and fruitful discussions.  Featured image
courtesy of CERN._

Many businesses care about accurately computing quantiles over their key
metrics, which can pose several interesting challenges at scale. For example,
many service level agreements hinge on these metrics, such as guaranteeing that
95% of queries return in < 500ms. Internet service providers routinely use
burstable billing, a fact that Google famously exploited to transfer terabytes
of data across the US for free. Quantile calculations just involve sorting the
data, which can be easily parallelized. However, this requires storing the raw
values, which is at odds with a pre-aggregation step that helps Druid achieve
such dizzying speed. Instead, we store smaller, adaptive approximations of
these values as the building blocks of our “approximate histograms.” In this
post, we explore the related problems of accurate estimation of quantiles and
building histogram visualizations that enable the live exploration of
distributions of values. Our solution is capable of scaling out to aggregate
billions of values in seconds.

## Druid Summarization

When we first [met
Druid](http://metamarkets.com/2011/druid-part-i-real-time-analytics-at-a-billion-rows-per-second/),
we considered the following example of a raw impression event log:

    timestamp             publisher          advertiser  gender  country  dimensions  click  price
    2011-01-01T01:01:35Z  bieberfever.com    google.com  Male    USA                  0      0.65
    2011-01-01T01:03:63Z  bieberfever.com    google.com  Male    USA                  0      0.62
    2011-01-01T01:04:51Z  bieberfever.com    google.com  Male    USA                  1      0.45
    ...
    2011-01-01T01:00:00Z  ultratrimfast.com  google.com  Female  UK                   0      0.87
    2011-01-01T02:00:00Z  ultratrimfast.com  google.com  Female  UK                   0      0.99
    2011-01-01T02:00:00Z  ultratrimfast.com  google.com  Female  UK                   1      1.53
    ...

By giving up some resolution in the timestamp column (e.g., by truncating the
timestamps to the hour), we can produce a summarized dataset by grouping by the
dimensions and aggregating the metrics. We also introduce the “impressions”
column, which counts the rows from the raw data with that combination of
dimensions:

     timestamp             publisher          advertiser  gender country impressions clicks revenue
     2011-01-01T01:00:00Z  ultratrimfast.com  google.com  Male   USA     1800        25     15.70
     2011-01-01T01:00:00Z  bieberfever.com    google.com  Male   USA     2912        42     29.18
     2011-01-01T02:00:00Z  ultratrimfast.com  google.com  Male   UK      1953        17     17.31
     2011-01-01T02:00:00Z  bieberfever.com    google.com  Male   UK      3194        170    34.01

All is well and good if we content ourselves with computations that can be
distributed efficiently such as summing hourly revenue to produce daily
revenue, or calculating click-through rates. In the language of [Gray et
al.](http://paul.rutgers.edu/~aminabdu/cs541/cube_op.pdf), the former
calculation is _distributive_: we can sum the raw event prices to produce hourly
revenue over each combination of dimensions and in turn sum this intermediary
for further coarsening into daily and quarterly totals. The latter is
algebraic: it is a combination of a fixed number of distributive statistics, in
particular, clicks / impressions.

However, sums and averages are of very little use when one wants to ask certain
questions of bid-level data. Exchanges may wish to visualize the [bid
landscape](http://users.cis.fiu.edu/~lzhen001/activities/KDD2011Program/docs/p265.pdf)
so as to provide guidance to publishers on how to set floor prices. Because of
our data-summarization process, we have lost the individual bid prices–and
knowing that the 20 total bids sum to $5 won’t tell us how many exceed $1 or
$2. Quantiles, by contrast, are holistic: there is no constant bound on the
size of the storage needed to exactly describe a sub-aggregate.

Although the raw data contain the unadulterated prices–with which we can answer
these bid landscape questions exactly–let’s recall why we much prefer the
summarized dataset. In the above example, each raw row corresponds to an
impression, and the summarized data represent an average compression ratio of
~2500:1 (in practice, we see ratios in the 1 to 3 digit range). Less data is
both cheaper to store in memory and faster to scan through. In effect, we are
trading off increased ETL effort against less storage and faster queries with
this pre-aggregation.

One solution to support quantile queries is to store the entire array of ~2500
prices in each row:

     timestamp             publisher          advertiser  gender country impressions clicks prices
     2011-01-01T01:00:00Z  ultratrimfast.com  google.com  Male   USA     1800        25     [0.64, 1.93, 0.93, ...]
     2011-01-01T01:00:00Z  bieberfever.com    google.com  Male   USA     2912        42     [0.65, 0.62, 0.45, ...]
     2011-01-01T02:00:00Z  ultratrimfast.com  google.com  Male   UK      1953        17     [0.07, 0.34, 1.23, ...]
     2011-01-01T02:00:00Z  bieberfever.com    google.com  Male   UK      3194        170    [0.53, 0.92, 0.12, ...]

But the storage requirements for this approach are prohibitive. If we can
accept _approximate_ quantiles, then we can replace the complete array of prices
with a data structure that is sublinear in storage–similar to our sketch-based
approach to cardinality estimation.

## Approximate Histograms

[Ben-Haim and
Tom-Tov](http://jmlr.org/papers/volume11/ben-haim10a/ben-haim10a.pdf) suggest
summarizing the unbounded-length arrays with a fixed number of (count,
centroid) pairs. Suppose we attempt to summarize a set of numbers with a single
pair. The mean (centroid) has the nice property of minimizing the sum of the
squared differences between it and each value, but it is sensitive to outliers
because of the squaring. The median is the minimizer of the sum of the absolute
differences and for an odd number of observations, corresponds to an actual bid
price. Bid prices tend to be skewed due to the mechanics of second price
auctions–some bidders have no problem bidding $100, knowing that they will
likely only have to pay $2. So a median of $1 is more representative of the
“average” bid price than a mean of $20. However, with the (count, median)
representation, there is no way to merge medians: knowing that 8 prices have a
median of $.43 and 10 prices have a median of $.59 doesn’t tell you that the
median of all 18 prices is $.44. Merging centroids is simple–just use the
weighted mean. Given some approximate histogram representation of (count,
centroid) pairs, we can make _online_ updates as we scan through data.

Of course, there is no way to accurately summarize an arbitrary number of
prices with a single pair, so we are confronted with a classical
accuracy/storage/speed tradeoff. We can fix the number of pairs that we store
like so:

     timestamp             publisher          advertiser  gender country impressions clicks prices
     2011-01-01T01:00:00Z  ultratrimfast.com  google.com  Male   USA     1800        25     [(1, .16), (48, .62), (83, .71), ...]
     2011-01-01T01:00:00Z  bieberfever.com    google.com  Male   USA     2912        42     [(1, .12), (3, .15), (30, 1.41), ...]
     2011-01-01T02:00:00Z  ultratrimfast.com  google.com  Male   UK      1953        17     [(2, .03), (1, .62), (20, .93), ...]
     2011-01-01T02:00:00Z  bieberfever.com    google.com  Male   UK      3194        170    [(1, .05), (94, .84), (1, 1.14), ...]

In the first row, there is one bid at $.16, 48 bids with an average price of
$.62, and so on. But given a set of prices, how do we summarize them as (count,
centroid) pairs? This is a special case of the k-means clustering problem,
which in general is [NP-hard](http://dl.acm.org/citation.cfm?id=1519389), even
in the [plane](http://cseweb.ucsd.edu/~avattani/papers/kmeans_hardness.pdf).
Fortunately, however, the one-dimensional case is tractable and admits a
[solution via dynamic
programming](http://journal.r-project.org/archive/2011-2/RJournal_2011-2_Wang+Song.pdf).
The [B-H/T-T](http://jmlr.org/papers/volume11/ben-haim10a/ben-haim10a.pdf)
approach is to iteratively combine the closest two pairs together by taking
weighted means until we reach our desired size.

Here we illustrate the B-H/T-T summarization process for the integers 1 through
10, 15 and 20, and 12 and 25 each repeated 3 times, for 3 different choices of
the number of (count, centroid) pairs.

<img src="http://metamarkets.com/wp-content/uploads/2013/06/histogram_pairs-1024x614.png" alt="Histogram Pairs" style="width: 1024px; height: 614px;"/>

There 4 salient operations on these approximate histogram objects:

1. Adding new values to the histogram: add a new pair, (1, value), and merge
the closest pair if we exceed the size parameter 

2. Merging two histograms together: repeatedly add all pairs of values from one
histogram to another 

3. Estimating the count of values below some reference value: build trapezoids
between the pairs and look at the various areas 

4. Estimating the quantiles of the values represented in a histogram: walk
along the trapezoids until you reach the desired quantile We apply operation 1
during our ETL phase, as we group by the dimensions and build a histogram on
the resulting prices, serializing this object into a Druid data segment. The
[compute nodes](http://static.druid.io/docs/druid.pdf) repeat operation 2 in
parallel, each emitting an intermediate histogram to the [query
broker](http://static.druid.io/docs/druid.pdf) for combination (another
application of operation 2). Finally, we can apply operation 3 repeatedly to
estimate counts in between various breakpoints, producing a histogram plot. Or
we can estimate quantiles of interest with operation 4.

Here we review the trapezoidal estimation of [Ben-Haim and
Tom-Tov](http://jmlr.org/papers/volume11/ben-haim10a/ben-haim10a.pdf) with an
example. Suppose we wanted to estimate the number of values less than or equal
to 10 (the exact answer is 10) knowing that there are 10 points with mean 5.5,
4 with mean 12.8, and 4 with mean 23.8. We assume that half of the values lie
to the left and half lie to the right (we shall improve upon this assumption in
the next section) of the centroid. So we mark off that 5 values are smaller
than the first centroid (this turns out to be correct). We then draw a
trapezoid connecting the next two centroids and assume that the number of
values between 5.5 and 10 is proportional to the area that this sub-trapezoid
occupies (the latter half of which is marked in blue). We assume that half of
the 10 values near 5.5 lie to its right, and half of the 4 values near 12.8 lie
to its left and multiply the sum of 7 by the ratio of areas to come up with our
estimate of 5.05 in this region (the exact answer is 5). Therefore, we estimate
that there are 10.05 values less than or equal to 10.

<img src="http://metamarkets.com/wp-content/uploads/2013/06/ah_trapezoid.png" alt="AH Trapezoid" style="width: 1024px; height: 614px;"/>

## Improvements

Here we describe some improvements and efficiencies specific to our
implementation of the B-H/T-T approximate histogram.

Computational efficiency at query time (operation 2) is more
[dear](http://metamarkets.com/2012/scaling-druid/) to us than at ETL time
(operation 1). That is, we can spend a few more cycles in building the
histograms if it allows for a very efficient means of combination. Our
Java-based implementation of operation 2 using a heap to keep track of the
differences between pairs can combine roughly 200K (size 50) histograms per
second per core (on an i7-3615QM). This compares unfavorably with [core scan
rates](http://metamarkets.com/2012/scaling-druid/) an order of magnitude or two
higher for count, sum, and group by queries.  Although, to be fair, a histogram
contains 1-2 orders of magnitude more information than a single count or sum.
Still, we sought a faster solution. If we know ahead of time what the proper
threshold below which to merge pairs is, then we can do a linear scan through
the sorted pairs (which we can do at ETL time), choosing to merge or not based
on the threshold. The exact determination of this threshold is difficult to do
efficiently, but eschewing the heap-based solution for this approximation
results in core aggregation rates of ~1.3M (size 50) histograms per second.

We have 3 different serialization formats when indexing depending on the nature
of the data, for which we use the most efficent encoding:

1. a dense format, storing all counts and centroids up to the configurable size
parameter

2. a sparse format, storing some number of pairs below the limit

3. a compact format, storing the individual values themselves

It is important to emphasize that we can specify different levels of accuracy
hierarchically. The above formats come into play when we index the data,
turning the arrays of raw values into (count, centroid) pairs. Because indexing
is slow and expensive and Druid segments are
[immutable](http://static.druid.io/docs/druid.pdf), it’s better at this level
to err on the side of accuracy. So we do something like specify a maximum of
100 (count, centroid) pairs in indexing, which will allow for greater
flexibility at query time, when we aggregate these together into some possibly
different number of (count, centroid) pairs.

We use the superfluous sign bit of the count to determine whether a (count,
centroid) pair with count > 1 is exact or not. Does a value of (2, 1.51)
indicate 2 bid prices of $1.51, or 2 unequal bid prices that average to $1.51?
The trapezoid method of count estimation makes no such distinction and will
“spread out” its uncertainty equally. This can be problematic for the discrete,
multimodal distributions characteristic of bid data. But given knowledge of
which (count, centroid) pairs are exact, we can make more accurate estimates.

Recall that our data typically exhibit high skewness. Because the closest
histogram pairs are continuously merged until the number of pairs is small
enough, the remaining pairs are necessarily (relatively) far apart. It is
logical to summarize 12 prices around $.10 and 6 prices around $.12 as 18
prices around $.11, but we wouldn’t want to merge all prices under $2 because
of the influence of 49 wildly-high prices–unless we are particularly interested
in those outliers, that is. At the very least, we would like to be able to
control our “area of interest”–do we care about the majority of the data or
about those few outliers? For when we aggregate millions or billions of values,
even with the tiniest skew, we’ll end up summarizing the bulk of the
distribution with a single (count, centroid) pair. Our solution is to define
special limits, inside of which we maintain the accuracy of our estimates. This
typically jives well with setting x-axis limits for our histogram
visualization.

## Accuracy

Here, we plot a histogram over ~18M prices, using default settings for the
x-axis limits and bin widths. Due to the high degree of skew, the inferred
limits are suboptimal, as they include prices ~$100. In addition, there are
even negative bid prices (which could be erroneous or a way of expressing
uninterest in the auction)!

<img src="https://metamarkets.com/wp-content/uploads/2013/06/histogram_skew-1024x614.png" alt="Histogram Skew" style="width: 1024px; height: 614px;"/>

Below, we set our resolution limits to $0 and $1 and vary the number of (count,
centroid) pairs in our approximate histogram datastructure. The accuracy using
only 5 pairs is abysmal and doesn’t even capture the second mode in the $.20 to
$.25 bucket. 50 pairs fare much better, and 200 are very accurate.

<img src="https://metamarkets.com/wp-content/uploads/2013/06/histogram_accuracy-1024x614.png" alt="Histogram Accuracy" style="width: 1024px; height: 614px;"/>

## Speed

Let’s take a look at some benchmarks on our modest demo cluster (4 m2.2xlarge
compute nodes) with some wikipedia data. We’ll look at the performance of the
following aggregators:

1. a count aggregator, which simply counts the number of rows 

2. a uniques aggregator, which implements a version of the HyperLogLog algorithm

3. approximate histogram aggregators, varying the resolution from 10
pairs to 50 pairs to 200 pairs We get about 1-3M summarized rows of data per
week from Wikipedia, and the benchmarks over the full 32 week period cover 84M
rows. There appears to be a roughly linear relationship between the query time
and the quantity of data:

<img src="https://metamarkets.com/wp-content/uploads/2013/06/ah_speed-1024x614.png" alt="AH Speed" style="width: 1024px; height: 614px;"/>

Indeed, the cluster scan rates tend to flatten out once we hit enough data:

<img src="http://metamarkets.com/wp-content/uploads/2013/06/ah_scan_rate.png" alt="AH Scan Rate" style="width: 1024px; height: 614px;"/>

We previously obtained cluster scan rates of [26B rows per second](http://metamarkets.com/2012/scaling-druid/) on a beefier
cluster. Very roughly speaking, the approximate histogram aggregator is 1/10
the speed of the count aggregator, so we might expect speeds of 2-3B rows per
second on such a cluster. Recall that our summarization step compacts 10-100
rows of data into 1, for typical datasets. This means that it is possible to
construct histograms representing tens to hundreds of billions of prices in
seconds.

Finally, my colleague Fangjin Yang and I will continue the discussion in
October in New York at the Strata Conference where we will present, [“Not
Exactly! Fast Queries via Approximation
Algorithms.”](http://strataconf.com/stratany2013/public/schedule/detail/30045)

