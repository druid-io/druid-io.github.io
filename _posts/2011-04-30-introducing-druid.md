----
 -title: "Introducing Druid: Real-Time Analytics at a Billion Rows Per Second"
 -layout: post
 -author: Eric Tschetter
 -image: http://metamarkets.com/wp-content/uploads/2011/04/fastcar-sized-470x288.jpg
 ----
 -

Here at Metamarkets we have developed a web-based analytics console that
supports drill-downs and roll-ups of high dimensional data sets – comprising
billions of events – in real-time.  This is the first of two blog posts
introducing Druid, the data store that powers our console.  Over the last twelve
months, we tried and failed to achieve scale and speed with relational databases
(Greenplum, InfoBright, MySQL) and NoSQL offerings (HBase). So instead we did
something crazy: we rolled our own database. Druid is the distributed, in-memory
OLAP data store that resulted.

**The Challenge: Fast Roll-Ups Over Big Data**

To frame our discussion, let’s begin with an illustration of what our raw impression event logs look 
like, containing many dimensions and two metrics (click and price).


    timestamp             publisher          advertiser  gender  country  dimensions  click  price
    2011-01-01T01:01:35Z  bieberfever.com    google.com  Male    USA                  0      0.65
    2011-01-01T01:03:63Z  bieberfever.com    google.com  Male    USA                  0      0.62
    2011-01-01T01:04:51Z  bieberfever.com    google.com  Male    USA                  1      0.45
    ...
    2011-01-01T01:00:00Z  ultratrimfast.com  google.com  Female  UK                   0      0.87
    2011-01-01T02:00:00Z  ultratrimfast.com  google.com  Female  UK                   0      0.99
    2011-01-01T02:00:00Z  ultratrimfast.com  google.com  Female  UK                   1      1.53
    ...


We call this our *alpha* data set. We perform a first-level aggregation operation over a selected set of 
dimensions, equivalent to (in pseudocode):


    GROUP BY timestamp, publisher, advertiser, gender, country
      :: impressions = COUNT(1),  clicks = SUM(click),  revenue = SUM(price)

to yield a compacted version:

     timestamp             publisher          advertiser  gender country impressions clicks revenue
     2011-01-01T01:00:00Z  ultratrimfast.com  google.com  Male   USA     1800        25     15.70
     2011-01-01T01:00:00Z  bieberfever.com    google.com  Male   USA     2912        42     29.18
     2011-01-01T02:00:00Z  ultratrimfast.com  google.com  Male   UK      1953        17     17.31
     2011-01-01T02:00:00Z  bieberfever.com    google.com  Male   UK      3194        170    34.01

This is our *beta* data set, filtered for five selected dimensions and compacted. In the limit, as we group 
by all available dimensions, the size of this aggregated beta converges to the original *alpha*. In practice, 
it is dramatically smaller (often by a factor of 100). Our *beta* data comprises three distinct parts:

> **Timestamp column**: We treat timestamp separately because all of our queries
> center around the time axis. Timestamps are faceted by varying granularities
> (hourly, in the example above).
> 
> **Dimension columns**: Here we have four dimensions of publisher, advertiser,
> gender, and country. They each represent an axis of the data that we’ve chosen
> to slice across.
> 
>    **Metric columns**: These are impressions, clicks and revenue. These represent
> values, usually numeric, which are derived from an aggregation operation – such
> as count, sum, and mean (we also run variance and higher moment calculations).
> For example, in the first row, the revenue metric of 15.70 is the sum of 1800
> event-level prices.

Our goal is to rapidly compute drill-downs and roll-ups over this data set. We
want to answer questions like “How many impressions from males were on
bieberfever.com?” and “What is the average cost to advertise to women at
ultratrimfast.com?”  But we have a hard requirement to meet: we want queries
over any arbitrary combination of dimensions at sub-second latencies.

Performance of such a system is dependent on the size of our beta set, and
there are two ways that this becomes large: (i) when we include additional
dimensions, and (ii) when we include a dimension whose cardinality is large.
Using our example, for every hour’s worth of data we calculate the maximum
number of rows as:

	number_of_publishers * number_of_advertisers * number_of_genders * number of countries

If we have 10 publishers, 50 advertisers, 2 genders, and 120 countries, that
would yield a maximum of 120,000 rows.  If there had been 1,000,000 possible
publishers, it would become a maximum of 12 billion rows. If we add 10 more
dimensions of cardinality 10, then it becomes a maximum of 1.2 quadrillion (1.2
x 10^15) rows.

Luckily for us, these data sets are generally sparse, as dimension values are
not conditionally independent (few Kazakhstanis visit beiberfever.com, for
example). Thus the combinatorial explosion is far less than the theoretical
worst-case. Nonetheless, as a rule, more dimensions and more cardinality
dramatically inflate the size of the data set.

**Failed Solution I: Dynamic Roll-Ups with a RDBMS**

Our stated goals of aggregation and drill-down are well suited to a classical
relational architecture. So about a year ago, we fired up a RDBMS instance
(actually, the Greenplum Community Edition, running on an m1.large EC2 box),
and began loading our data into it. It worked and we were able to build the
initial version of our console on this system. However, we had two problems:

1. We stored the data in a star schema, which meant that there was operational
   overhead maintaining dimension and fact tables.

2. Whenever we needed to do a full table scan, for things like global counts,
   the queries ran slow. For example, naive benchmarks showed scanning 33
million rows took 3 seconds.

We initially just decided to eat the operational overhead of (1) because that’s
how these systems work and we benefited from having the database to do our
storage and computation. But, (2) was painful. We started materializing all
dimensional roll-ups of a certain depth, and began routing queries to these
pre-aggregated tables. We also implemented a caching layer in front of our
queries.

This approach generally worked and is, I believe, a fairly common strategy in
the space. Except, when things weren’t in the cache and a query couldn’t be
mapped to a pre-aggregated table, we were back to full scans and slow
performance.  We tried indexing our way out of it, but given that we are
allowing arbitrary combinations of dimensions, we couldn’t really take
advantage of composite indexes. Additionally, index merge strategies are not
always implemented, or only implemented for bitmap indexes, depending on the
flavor of RDBMS.

We also benchmarked plain Postgres, MySQL, and InfoBright, but did not observe
dramatically better performance. Seeing no path ahead for our relational
database, we turned to one of those new-fangled, massively scalable NOSQL
solutions.

**Failed Solution II: Pre-compute the World in NoSQL**

We used a data storage schema very similar to Twitter’s
[Rainbird](http://www.slideshare.net/kevinweil/rainbird-realtime-analytics-at-twitter-strata-2011).

In short, we took all of our data and pre-computed aggregates for every
combination of dimensions. At query time we need only locate the specific
pre-computed aggregate and and return it: an O(1) key-value lookup. This made
things fast and worked wonderfully when we had a six dimension beta data set.
But when we added five more dimensions – giving us 11 dimensions total – the
time to pre-compute all aggregates became unmanageably large (such that we
never waited more than 24 hours required to see it finish).

So we decided to limit the depth that we aggregated to. By only pre-computing
aggregates of five dimensions or less, we were able to limit some of the
exponential expansion of the data. The data became manageable again, meaning it
only took about 4 hours on 15 machines to compute the expansion of a 500k beta
rows into the full multi-billion entry output data set.

Then we added three more dimensions, bringing us up to 14. This turned into 9
hours on 25 machines. We realized that we were [doing it
wrong](http://knowyourmeme.com/memes/youre-doing-it-wrong).

Lesson learned: massively scalable counter systems like rainbird are intended
for high cardinality data sets with pre-defined hierarchical drill-downs. But
they break down when supporting arbitrary drill downs across all dimensions.

**Introducing Druid: A Distributed, In-Memory OLAP Store**

Stepping back from our two failures, let’s examine why these systems failed to
scale for our needs:

1. Relational Database Architectures

    * Full table scans were slow, regardless of the storage engine used
    * Maintaining proper dimension tables, indexes and aggregate tables was painful
    * Parallelization of queries was not always supported or non-trivial

2. Massive NOSQL With Pre-Computation

    * Supporting high dimensional OLAP requires pre-computing an exponentially large amount of data

Looking at the problems with these solutions, it looks like the first,
RDBMS-style architecture has a simpler issue to tackle: namely, how to scan
tables fast?  When we were looking at our 500k row data set, someone remarked,
“Dude, I can store that in memory”. That was the answer.

Keeping everything in memory provides fast scans, but it does introduce a new
problem: machine memory is limited. The corollary thus was: distribute the data
over multiple machines. Thus, our requirements were:

* Ability to load up, store, and query data sets in memory
* Parallelized architecture that allows us to add more machines in order to relieve memory pressure

And then we threw in a couple more that seemed like good ideas:

* Parallelized queries to speed up full scan processing
* No dimensional tables to manage

These are the requirements we used to implement Druid. The system makes a
number of simplifying assumptions that fit our use case (namely that all
analytics are time-based) and integrates access to real-time and historical
data for a configurable amount of time into the past.

The [next
installment](http://metamarketsgroup.com/blog/druid-part-deux-three-principles-for-fast-distributed-olap/)
will go into the architecture of Druid, how queries work and how the system can
scale out to handle query hotspots and high cardinality data sets. For now, we
leave you with a benchmark:

* Our 40-instance (m2.2xlarge) cluster can scan, filter, and aggregate 1 billion rows in 950 milliseconds.


[CONTINUE TO PART II…](http://metamarkets.com/2011/druid-part-deux-three-principles-for-fast-distributed-olap/)


