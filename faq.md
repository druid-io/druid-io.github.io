---
published: true
title: FAQ
layout: page
sectionid: faq
---

# Frequently Asked Questions {.index}

### Don't see your question here? Ask us on the [Druid mailing list](/community.html#converse).

+-- {.text-part}

+-- {.text-item}
## Why did Metamarkets Open Source Druid? {#why}

Originally built by Metamarkets as a component of its analytics service as a platform to provide immediate insight against live data feeds for the [on-line advertising space](http://metamarkets.com/product/), we realized Druid itself was broadly applicable for real-time and n-dimensional drill down use cases.  Presenting Druid to the community helps evolve Druid as a horizontal platform, and over time, helps Metamarkets understand requirements from adjacent verticals.
=--

+-- {.text-item}
## Is Druid in-memory? {#memory}

Given that it is impossible to process data with a modern processor without first loading the data into memory, yes, it is in-memory.  The earliest iterations of Druid didn't allow for data to be paged in from and out to disk, so we often called it an "in-memory" system.  However, we very quickly realized that RAM hasn't become cheap enough to actually store all data in RAM and sell a product at a price-point that customers are willing to pay.  Since the Summer of 2011, we have leveraged memory-mapping to allow us to page data between disk and memory and extend the amount of data a single node can load up to the size of its disks.

That said, as we made the shift, we didn't want to compromise on the ability to configure the system to run such that everything is essentially in memory.  To this end, individual Historical nodes can be configured with the maximum amount of data they should be given.  Couple that with the Coordinator's ability to assign data blocks to different "tiers" based on differing query requirements and Druid essentially becomes a system that can be configured across the whole spectrum of performance requirements.  Configuration can be such that all data can be in memory and processed, it can be such that data is heavily over-committed compared to the amount of memory available, and it can also be that the most recent month of data is in memory, while everything else is over-committed.
=--

+-- {.text-item}
## Is Druid a NoSql database? {#no-sql}

No.  Druid's write support is very limited, so it is best not thought of as a database of any kind.  Similar to other NoSQL stores, the query interface is not SQL and it is fault-tolerant with hands-off scaling operations, but NoSQL stores are generally extensions of a key-value store and Druid is a horrible key-value store.  

In general, we prefer to not try to group Druid into the cluster of NoSQL stores because it is used to solve a different problem than NoSQL stores generally do.  NoSQL stores are generally not good at doing what Druid does and vice versa.
=--

+-- {.text-item}
## Does Druid speak SQL? {#sql-client}

Yes, to an extent.  An ANTLR grammar was written to support a limited set of SQL on top of Druid.  It is available in the repository but has not been exposed yet via any of the normal mechanisms, and so it really only accessible to individuals comfortable with building and running Java.

[https://github.com/metamx/druid/blob/master/client/src/main/java/com/metamx/druid/sql/SQLRunner.java](https://github.com/metamx/druid/blob/master/client/src/main/java/com/metamx/druid/sql/SQLRunner.java)

=--

+-- {.text-item}
## How does Druid compare to Redshift? {#redshift}

[https://github.com/metamx/druid/wiki/Druid-vs-redshift](https://github.com/metamx/druid/wiki/Druid-vs-redshift)

=--

+-- {.text-item}
## How does Druid compare to Vertica? {#vertica}
=--
https://github.com/metamx/druid/wiki/Druid-vs-vertica
+-- {.text-item}
## How does Druid compare to Cassandra? {#cassandra}

=--
https://github.com/metamx/druid/wiki/Druid-vs-Cassandra
+-- {.text-item}
## How does Druid compare to Hadoop? {#hadoop}

=--
https://github.com/metamx/druid/wiki/Druid-vs-Hadoop
+-- {.text-item}

## How does Druid compare to Impala/Shark? {#impala}

=--
https://github.com/metamx/druid/wiki/Druid-vs-Impala-or-Shark
+-- {.text-item}

## What external dependencies does Druid have? {#external}

Druid has three external dependencies that must be running in order for the Druid cluster to operate

1. Deep Storage
2. An RDBMS Database (MySQL or Postgres)
3. ZooKeeper

=--

+-- {.text-item}
## What is "deep storage"?

Simply put, deep storage is some storage infrastructure that Druid depends on for data availability.  If this infrastructure goes down, then Druid cannot load new data into the system, nor can it recover from failures in the cluster.  As long as this infrastructure is operational, Druid Historical nodes cannot lose data.

A more technical description of Deep Storage and the options available exists on our wiki.  
<https://github.com/metamx/druid/wiki/Deep-Storage>
=--

+-- {.text-item}
## Can anything other than S3 be used for "deep storage"? {#deep-storage}

Yes.  Options include HFDS and any shared mountable file system.  More details are availabe on our wiki.  
<https://github.com/metamx/druid/wiki/Deep-Storage>

=--

+-- {.text-item}
## Where can I find a set of simple queries to run? {#queries}

We recommend started with our tutorials on the wiki:

[https://github.com/metamx/druid/wiki/Tutorial](https://github.com/metamx/druid/wiki/Tutorial)
=--

+-- {.text-item}
## Can Druid accept non-structured data? {#non-structured}

Druid requires some structure to the data it ingests.  In general data should consist of a timestamp, dimensions and metrics.  These are discussed in a bit more detail in our original blog post: [Introducing Druid: Real-Time Analytics at a Billion Rows Per Second](blog/2011/04/30/introducing-druid.html)
=--

+-- {.text-item}
## Does Druid only accept data with a timestamp? {#time-series}

Yes. Data that is ingested into Druid *must* have a timestamp.  
=--

+-- {.text-item}
## Isn't Zookeeper a single point of failure? {#zookeeper}

No, Zookeeper can be deployed to withstand a configurable number of individual node failures.  Also, if ZooKeeper goes down, the cluster will continue to operate.

Losing ZooKeeper does, however, mean that the cluster cannot add new data segments, nor can it effectively react to the lose of one of the nodes.  So, while it is safe to lose access to ZooKeeper, it is definitely a degraded state.
=--

+-- {.text-item}
## Isn't the Master a single point of failure? {#master}

No, the "Master" or "Coordinator" node is merely a coordinator.  It is ***not*** involved in the query path.  Losing all coordinators means that new segments will not be loaded by the Historical nodes, i.e. no new data will enter the cluster.  Also, segment balancing decisions will not be made, so it stops the cluster from being able to effectively scale up and down.  Just like ZooKeeper, losing the coordinators puts the cluster in a degraded state, but it will keep operating just fine.

Also, there can be multiple coordinator nodes deployed.  Extra coordinators will act as "hot spares" in case the active coordinator is lost.
=--

+-- {.text-item}
## Do all queries go through the master? {#mas-queries}

Queries ***never*** touch the master.  Ever.
=--

+-- {.text-item}
## Can I query Druid even after the master dies? {#mas-dies}

Yes, the Master has no impact on queries.
=--

+-- {.text-item}
## How do I update data? {#update}

Updating data means that you have to re-generate the segments for the time period that you need to update.  This can be done by reindexing the data for that time period.  Once the indexer finishes, the Druid cluster will swap the new segment in and stop serving the old segment.
=--

+-- {.text-item}
## What is the IndexingService, do I need that? {#ind-serv}

The IndexingService is a job scheduling service with tasks that operate on Segments.  Long-term, we intend to move indexing activities to be fronted by this service.

It is not a requirement yet, but will become one as time goes on.

More information can be found on the wiki:

[https://github.com/metamx/druid/wiki/Indexing-Service](https://github.com/metamx/druid/wiki/Indexing-Service)
=--

=--