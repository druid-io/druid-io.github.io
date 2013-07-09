---
published: true
title: "Druid, Part Deux: Three Principles for Fast, Distributed OLAP"
author: Eric Tschetter
image: "http://metamarkets.com/wp-content/uploads/2011/05/toyota-sized-470x288.jpg"
layout: post
---

In a [previous blog
post](http://druid.io/blog/2011/04/30/introducing-druid.html) we introduced the
distributed indexing and query processing infrastructure we call Druid. In that
post, we characterized the performance and scaling challenges that motivated us
to build this system in the first place. Here, we discuss three design
principles underpinning its architecture.

---

**1. Partial Aggregates + In-Memory + Indexes => Fast Queries** 

We work with two representations of our data: *alpha* represents the raw,
unaggregated event logs, while *beta* is its partially aggregated derivative.
This *beta* is the basis against which all further queries are evaluated:

    2011-01-01T01:00:00Z  ultratrimfast.com  google.com  Male    USA  1800  25  15.70 
    2011-01-01T01:00:00Z  bieberfever.com    google.com  Male    USA  2912  42  29.18 
    2011-01-01T02:00:00Z  ultratrimfast.com  google.com  Male    UK   1953  17  17.31 
    2011-01-01T02:00:00Z  bieberfever.com    google.com  Male    UK   3194  170 34.01 

This is the most compact representation that preserves the finest grain of data,
while enabling on-the-fly computation of all O(2^n) possible dimensional
roll-ups.

The key to Druid’s speed is maintaining the *beta* data entirely in memory. Full
scans are several orders of magnitude faster in memory than via disk. What we
lose in having to compute roll-ups on the fly, we make up for with speed.

To support drill-downs on specific dimensions (such as results for only
‘bieberfever.com’), we maintain a set of inverted indices. This allows for fast
calculation (using AND & OR operations) of rows matching a search query. The
inverted index enables us to scan a limited subset of rows to compute final
query results – and these scans are themselves distributed, as we discuss next.

**2. Distributed Data + Parallelizable Queries => Horizontal Scalability** 

Druid’s performance depends on having memory — lots of it. We achieve the requisite
memory scale by dynamically distributing data across a cluster of nodes. As the
data set grows, we can horizontally expand by adding more machines.

To facilitate rebalancing, we take chunks of *beta* data and index them into
segments based on time ranges. For high cardinality dimensions, distributing by
time isn’t enough (we generally try to keep segments no larger than 20M rows),
so we have introduced partitioning. We store metadata about segments within the
query layer and partitioning logic within the segment generation code.

We persist these segments in a storage system (currently S3) that is accessible
from all nodes. If a node goes down, [Zookeeper](http://zookeeper.apache.org/)
coordinates the remaining live nodes to reconstitute the missing *beta* set.

Downstream clients of the API are insulated from this rebalancing: Druid’s
query API seamlessly handles changes in cluster topology.

Queries against the Druid cluster are perfectly horizontal. We limited the
aggregation operations we support – count, mean, variance and other parametric
statistics – that are inherently parallelizable. While less parallelizable
operations, such as median, are not supported, this limitation is offset by
rich support of histogram and higher-order moment stores. The co-location of
processing with in-memory data on each node reduces network load and
dramatically improves performance.

This architecture provides a number of extra benefits:

* Segments are read-only, so they can simultaneously serve multiple servers. If
  we have a hotspot in a particular index, we can replicate that index to
multiple servers and load balance across them.  
* We can provide tiered classes of service for our data, with servers occupying
  different points in the “query latency vs. data size” spectrum 
* Our clusters can span data center boundaries



**3. Real-Time Analytics: Immutable Past, Append-Only Future** 

Our system for real-time analytics is centered, naturally, on time. Because past events
happen once and never change, they need not be re-writable. We need only be
able to append new events.

For real-time analytics, we have an event stream that flows into a set of
real-time indexers. These are servers that advertise responsibility for the
most recent 60 minutes of data and nothing more. They aggregate the real-time
feed and periodically push an index segment to our storage system. The segment
then gets loaded into memory of a standard server, and is flushed from the
real-time indexer.

Similarly, for long-range historical data that we want to make available, but
not keep hot, we have deep-history servers. These use a memory mapping strategy
for addressing segments, rather than loading them all into memory. This
provides access to long-range data while maintaining the high-performance that
our customers expect for near-term data.


##Summary## 
Druid’s power resides in providing users fast, arbitrarily deep
exploration of large-scale transaction data. Queries over billions of rows,
that previously took minutes or hours to run, can now be investigated directly
with sub-second response times.

We believe that the performance, scalability, and unification of real-time and
historical data that Druid provides could be of broader interest. As such, we
plan to open source our code base in the coming year.
