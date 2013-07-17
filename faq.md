---
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

In terms of drawing a differentiation, Redshift is essentially ParAccel (Actian) which Amazon is licensing.

Aside from potential performance differences, there are some functional differences:

1. Real-time data ingestion

    Because Druid is optimized to provide insight against massive quantities of streaming data; it is able to load and aggregate data in real-time.

    Generally traditional data warehouses including column stores work only with batch ingestion and are not optimal for streaming data in regularly.

1. Druid is a read oriented analytical data store

    It's write semantics aren't as fluid and does not support joins. ParAccel is a full database with SQL support including joins and insert/update statements.

1. Data distribution model

    Druid's data distribution, is segment based which exists on highly available "deep" storage, like S3 or HDFS.  Scaling up (or down) does not require massive copy actions or downtime; in fact, losing any number of compute nodes does not result in data loss because new compute nodes can always be brought up by reading data from "deep" storage.

    To contrast, ParAccel's data distribution model is hash-based.  Expanding the cluster requires re-hashing the data across the nodes, making it difficult to perform without taking downtime.  Amazon's Redshift works around this issue with a multi-step process:

    a) set cluster into read-only mode  
    b) copy data from cluster to new cluster that exists in parallel  
    c) redirect traffic to new cluster

1. Replication strategy

    Druid employs segment-level data distribution meaning that more nodes can be added and rebalanced without having to perform a staged swap.  The replication strategy also makes all replicas available for querying.

    ParAccel's hash-based distribution generally means that replication is conducted via hot spares. This puts a numerical limit on the number of nodes you can lose without losing data, and this replication strategy often does not allow the hot spare to help share query load.

1. Indexing strategy

    Along with column oriented structures, Druid uses indexing structures to speed up query execution when a filter is provided. Indexing structures do increase storage overhead (and make it more difficult to allow for mutation), but they can also significantly speed up queries.

    ParAccel does not appear to employ indexing strategies.
=--

+-- {.text-item}
## How does Druid compare to Vertica? {#vertica}

Vertica is similar to ParAccel (RedShift) described above in that it wasn't built for real-time streaming data ingestion and it supports full SQL.

The other big difference is that instead of employing indexing, Vertica tries to optimize processing by leveraging run-length encoding (RLE) and other compression techniques along with a "projection" system that creates materialized copies of the data in a different sort order (to maximize the effectiveness of RLE).

We are unclear about how Vertica handles data distribution and replication, so we cannot speak to if/how Druid is different.
=--

+-- {.text-item}
## How does Druid compare to Cassandra? {#cassandra}

Druid is highly optimized for scans and aggregations, it supports arbitrarily deep drill downs into data sets without the need to pre-compute, and it can ingest event streams in real-time and allow users to query events as they come in. Cassandra is a great key-value store and it has some features that allow you to use it to do more interesting things than what you can do with a pure key-value store.  But, it is not built for the same use cases that Druid handles, namely regularly scanning over billions of entries per query.

Furthermore, Druid is fully read-consistent. Druid breaks down a data set into immutable chunks known as segments. All replicants always present the exact same view for the piece of data they are holding and we don't have to worry about data synchronization. The tradeoff is that Druid has limited semantics for write and update operations. Cassandra, similar to Amazon's Dynamo, has an eventually consistent data model. Writes are always supported but updates to data may take some time before all replicas synch up (data reconciliation is done at read time). This model favors availability and scalability over consistency.
=--

+-- {.text-item}
## How does Druid compare to Hadoop? {#hadoop}

Druid is a complementary addition to Hadoop.  Hadoop is great at storing and making accessible large amounts of individually low-value data.  Unfortunately, Hadoop is not great at providing query speed guarantees on top of that data, nor does it have very good operational characteristics for a customer-facing production system.  Druid, on the other hand, excels at taking high-value summaries of the low-value data on Hadoop, making it available in a fast and always-on fashion, such that it could be exposed directly to a customer.

Druid also requires some infrastructure to exist for "deep storage".  HDFS is one of the implemented options for this "deep storage".
=--

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
