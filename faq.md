---
title: FAQ
layout: page
sectionid: faq
---

# Frequently Asked Questions {.index}

### Don't see your question here? Ask us on the [Druid mailing list](/community.html).

+-- {.text-part}

+-- {.text-item}
## Why did Metamarkets Open Source Druid? {#why}

Originally built by Metamarkets as a component of its analytics service as a
platform to provide immediate insight against live data feeds for the [on-line advertising space](http://metamarkets.com/product/), we realized Druid itself
was broadly applicable for real-time and n-dimensional drill down use cases.
Presenting Druid to the community helps evolve Druid as a horizontal platform,
and over time, helps Metamarkets understand requirements from adjacent verticals.

It's not a secret, Druid is a very important piece of the Metamarkets platform. For use cases not directly covered by Metamarkets focus, open source Druid helps users create software that can leverage the power of a real-time, scalable analytics-oriented data store.
=--

+-- {.text-item}
## Is Druid in-memory? {#memory}

It can be. Druid was designed to be a highly economical solution without
compromising speed, flexibility and scale. Druid deployment architecture allows
users to tier nodes: ones that handle more frequent queries can be fast and in
memory and queries that are less frequent can be on slower nodes and draw data
from storage.
=--

+-- {.text-item}
## Is Druid a NoSql database? {#no-sql}

Yes. The native interface relies on JSON based queries. We have a standard query syntax located here. That said, our community has created connectors and clients  that allow Druid to communicate easily with many systems. Ruby, SQL, R, etc.
=--

+-- {.text-item}
## Is there a SQL client for Druid? {#sql-client}

Yes. it's open source and located on the Metamarkets Github repository: [here](https://github.com/metamx/druid/tree/bb1b3cd2f999e2ffa406e3c410e5e5f3724d3270/client/src/main/java/com/metamx/druid/sql)
=--

+-- {.text-item}
## How does Druid compare to Redshift? {#redshift}

There is a more comprehensive answer on Quora: [here](http://www.quora.com/What-are-the-differences-between-Druid-and-AWS-Redshift)

In terms of drawing a differentiation, Redshift is essentially ParAccel (Actian) which Amazon is licensing.

Aside from potential performance differences, there are some functional differences:

1. Druid is a read oriented analytical data store

    It's write semantics aren't as fluid and does not support joins (though the community has been discussing ways to implement joins). ParAccel is a full on database with SQL support including joins and insert/update statements.

2. Data distribution model

    Druid's data distribution, is segment based which exists on highly available "deep" storage, like S3 or HDFS.  Scaling up (or down) does not require massive copy actions or downtime; in fact, losing any number of compute nodes does not cripple the system because Druid creates new compute nodes to handle the query volume - reading from "deep" storage.

    To contrast, ParAccel's data distribution model is hash-based.  Expanding the cluster size requires re-hashing the data across the nodes, making it difficult to perform without taking downtime.  Amazon's Redshift guide works around this issue with a multi-step process:

    a) set cluster into read-only mode  
    b) copy data from cluster to new cluster that exists in parallel  
    c) redirect traffic to new cluster

    They do not indicate if they charge for the extra machines consumed during the copy.

3. Replication strategy

    Druid employs segment-level data distribution meaning that more nodes can be added and rebalanced without having to perform a staged swap.  The replication strategy also makes all replicas available for querying.

    ParAccel's hash-based distribution generally means that replication strategy is conducted via hot spares. When a node is lost with ParAccel, you are covered by a hot spare; the hot spare may or may not be available as a query node.

4. Indexing strategy

    Along with column oriented structures, Druid uses indexing structures to speed up query execution when a filter is provided. Indexing structures do increase storage overhead (and make it more difficult to allow for mutation), but they can also significantly speed up queries.

    ParAccel solely relies on column-orientation to process queries.

5. Real-time data ingestion

    Because Druid is optimized to provide insight against massive quantities of streaming data; it is able to load and aggregate data in real-time -- separating the concerns of that load from the "historical" processing concerns of the "data warehouse."

    Generally traditional data warehouses including column store optimize around batch ingestion at a regular interval which generally works cost effectively for small to moderate data streams.

=--

+-- {.text-item}
## How does Druid compare to Vertica? {#vertica}
=--

+-- {.text-item}
## How does Druid compare to Cassandra? {#cassandra}

Druid is highly optimized for scans and aggregations, it supports arbitrarily deep drill downs into data sets without the need to pre-compute, and it can ingest event streams in real-time and allow users to query events as they come in. At Metamarkets, we actually experimented with HBase as our core data store platform but it failed to achieve the speed and scale we desired. We found that in order to get the query latencies we wanted with HBase and to be able to arbitrarily drill into the data, we had to pre-compute permutations of dimension values of data sets. If the schema of a particular data set changed, we had to recompute everything for that data set. The problem became computationally intractable. We actually wrote up [a blog post on the subject](http://metamarkets.com/2011/druid-part-i-real-time-analytics-at-a-billion-rows-per-second/#more-189).

HBase and Cassandra are great systems for certain use cases, but we found query latencies were too slow to power an interactive dashboard where schema changes are common.

Druid is fully read-consistent. Druid breaks down a data set into immutable chunks known as segments. All replicants always present the exact same view for the piece of data they are holding and we don't have to worry about data synchronization. The tradeoff is that Druid has limited semantics for write and update operations. Cassandra, similar to Amazon's Dynamo, has an eventually consistent data model. Writes are always supported but updates to data may take some time before all replicas synch up (data reconciliation is done at read time). This model favors availability and scalability over consistency.
=--

+-- {.text-item}
## How does Druid compare to Hadoop? {#hadoop}

Druid, if anything, amplifies the value Hadoop brings to data centers; at Metamarkets, we use Hadoop as our backbone for all batch related processing, ingestion and updates. We recently introduced functionality that allows Druid to read from HDFS. Together, a Druid/Hadoop system is  simultaneously capable of real-time query against ingesting data and batch data.
=--

+-- {.text-item}
## What external dependencies does Druid have? {#external}

Yes; as in the previous answer, Druid is able to utilize any storage system as long as it is mountable. In terms of best practices, we recommend that deep storage have the following properties: fully backed up, highly available and low latency.
=--

+-- {.text-item}
## What is "deep storage"?

Druid relies on "deep storage" as the reference data which its compute nodes represent. We consider deep storage to be any traditional mountable storage system that ideally is highly available and serves as the data of record. For Metamarkets, its Amazon's S3 but other implementations like Virtustream uses its own back end, or deep storage.
=--

+-- {.text-item}
## Can anything other than S3 be used for "deep storage"? {#deep-storage}

Yes; as in the previous answer, Druid is able to utilize any storage system as long as it is mountable. In terms of best practices, we recommend that deep storage have the following properties: fully backed up, highly available and low latency.
=--

+-- {.text-item}
## Where can I find a set of simple queries to run? {#queries}
=--

+-- {.text-item}
## Can Druid accept non-structured data? {#non-structured}

Druid is optimized for semi-structured data; meaning that we expect the schema to change infrequently and in a known and predictable way.
=--

+-- {.text-item}
## Does Druid only accept time-series data? {#time-series}

Yes. That said, depending on how data is read into the system, almost everything can express uniqueness with a timestamp. Timestamp granularity?
=--

+-- {.text-item}
## Isn't Zookeeper a single point of failure? {#zookeeper}
=--

+-- {.text-item}
## Isn't the Master a single point of failure? {#master}
=--

+-- {.text-item}
## Do all queries go through the master? {#mas-queries}
=--

+-- {.text-item}
## Can I query Druid even after the master dies? {#mas-dies}
=--

+-- {.text-item}
## How do I update data? {#update}
=--

+-- {.text-item}
## What is the IndexingService, do I need that? {#ind-serv}
=--

=--
