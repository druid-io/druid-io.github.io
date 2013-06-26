---
title: 
layout: post
author: Eric Tschetter
image: http://metamarkets.com/wp-content/uploads/2012/10/Druid.jpg
---

In [April 2011](http://metamarkets.com/2011/druid-part-i-real-time-analytics-at-a-billion-rows-per-second/),
we introduced Druid, our distributed, real-time data store.  Today I am
extremely proud to announce that we are releasing the Druid data store to the
community as an open source project. To mark this special occasion, I wanted to
recap why we built Druid, and why we believe there is broader utility for Druid
beyond [Metamarkets' analytical SaaS offering](http://metamarkets.com/2012/metamarkets-open-sources-druid/metamarkets.com/product).

When we started to build Metamarkets’ analytics solution, we tried several
commercially available data stores. Our requirements were driven by our online
advertising customers who have data volumes often upwards of hundreds of
billions of events per month, and need highly interactive queries on the latest
data as well as an ability to arbitrarily filter across any dimension – with
data sets that contain 30 dimensions or more.  For example, a typical query
might be “find me how many advertisements were seen by female executives, aged
35 to 44, from the US, UK, and Canada, reading sports blogs on weekends.”

First, we went the traditional database route. Companies have successfully used
data warehouses to manage the cost and overhead of querying historical data,
and the architecture aligned with our goals of data aggregation and drill down.
For our data volumes (reaching billions of records), we found that the scan
rates were not fast enough to support our interactive dashboard, and caching
could not be used to reliably speed up queries due to the arbitrary drill-downs
we need to support. In addition, because RDBMS data updates are inherently
batch, updates made via inserts lead to locking of rows for queries.

Next, we investigated a NoSQL architecture. To support our use case of allowing
users to drill down on arbitrary dimensions, we pre-computed dimensional
aggregations and wrote them into a NoSQL key-value store.  While this approach
provided fast query times, pre-aggregations required hours of processing time
for just millions of records (on a ~10-node Hadoop cluster).  More
problematically, as the number of dimensions increased, the aggregation and
processing time increased exponentially, exceeding 24 hours.  Beyond its cost,
this time created an unacceptably high latency between when events occurred and
when they were available for querying – negating any possibility of supporting
our customers’ desire for real-time visibility into their data.

We thus decided to build Druid, to better meet the needs of analytics workloads
requiring fast, real-time access to data at scale.

Druid’s key features are:

- **Distributed architecture.** Swappable read-only data segments using an MVCC
swapping protocol. Per-segment replication relieves load on hot segments.
Supports both in-memory and memory-mapped versions.

- **Real-time ingestion.** Real-time ingestion coupled with broker servers to
query across real-time and historical data. Automated migration of real-time to
historical as it ages.

- **Column-oriented for speed.**  Data is laid out in columns so that scans are
limited to specific data being searched. Compression decreases overall data
footprint.

- **Fast filtering.** Bitmap indices with CONCISE compression.

- **Operational simplicity.** Fault tolerant due to replication. Supports
rolling deployments and restarts. Allows simple scale up and scale down – just
add or remove nodes.

From a query perspective, Druid supports arbitrary Boolean filters as well as
Group By, time series roll-ups, aggregation functions and regular expression
searches.

In terms of performance, Druid’s scan speed is 33M rows per second per core,
and can ingest up to 10K incoming records per second per node. We have
horizontally scaled Druid to support [scan speeds of 26B records per
second](http://metamarkets.com/2012/scaling-druid/).

Now that more people have hands-on experience with Hadoop, there is a
broadening realization that while it is ideal for batch processing of large
data volumes, tools for real-time data queries are lacking. Hence there is
growing interest in tools like Google’s Dremel and PowerDrill, as evidenced by
the new Apache Drill project. We believe that Druid addresses a gap in the
existing big data ecosystem for a real-time analytical data store, and we are
excited to make it available to the open source community.

Metamarkets has engaged with multiple large internet properties like Netflix,
providing early access to the code for evaluation purposes. Netflix is
assessing Druid for operational monitoring of real-time metrics across their
streaming media business.

Sudhir Tonse, Manager, Cloud Platform Infrastructure says, “Netflix manages
billions of streaming events each day, so we need a highly scalable data store
for operational reporting. We are so far impressed with the speed and
scalability of Druid, and are continuing to evaluate it for providing critical
real-time transparency into our operational metrics.”

Metamarkets anticipates that open sourcing Druid will also help other
organizations solve their real-time data analysis and processing needs. We are
excited to see how the open source community benefits from using Druid in their
own applications, and hopeful that Druid improves through their feedback and
usage.

Druid is available for download on GitHub at <https://github.com/metamx/druid>,
and more information can be found on the [Druid project
website](http://metamarkets.com/druid).

