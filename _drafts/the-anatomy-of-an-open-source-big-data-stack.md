---
title: "The Anatomy of an Open Source \"Big Data\" Stack"
author: Fangjin Yang and Gian Merlino
layout: post
---

In recent years, the rapid growth of online transactions has led to a wave of
challenges as organizations strived to make sense out of the myriad of data.
Technologists soon realized that traditional relational database management
systems, data collection methods, and visualization packages were insufficient
to meet the scale of the data being generated. As a result, the “big data”
space has grown rapidly to address the problem.

## The Limitations of Hadoop

At the core of the “big data” space lies Hadoop. Hadoop has provided
immeasurable value in helping organizations make sense of their data for a
variety of purposes, but as with every great technology, it has also opened our
eyes to a new set of problems. For most modern companies, Hadoop is no longer
sufficient to provide interactive insight into large volumes of data.

MapReduce can solve virtually every distributed computing problem out there.
However, as great as MapReduce is as a general framework for parallel
computation, it is not optimized to solve any problem particularly well.
Specifically, issuing queries using MapReduce can be quite slow. To overcome
slow query latencies, many organizations elected to use dedicated query layers
in front of Hadoop. Selecting a query layer can be a daunting task, but certain
solutions are better suited for certain types of queries.

At Metamarkets, we elected to build Druid, a streaming data store highly
optimized for “business intelligence” style queries. Examples of these types of
queries include “how much revenue was made last quarter”, or “how many unique
visitors visited my web page last month”. In these queries, we are not dumping
an entire data set, nor are we querying for an individual row. The questions we
want answered involve aggregating some metric over some span of time, filtered
over some set of dimensions. For more on why we decided to build Druid, check
out this [blog post](http://druid.io/blog/2011/04/30/introducing-druid.html).

## An Open Source Real-time Analytics Stack

Druid gave us [fast
queries](http://druid.io/blog/2014/03/17/benchmarking-druid.html) and both a
streaming and batch interface to ingest data, but it still wasn’t enough. Druid
only understands single denormalized feeds, and we needed to be able to perform
streaming ETL operations for incoming data. For that purpose, we added Storm to
our stack.

With Storm and Druid in place, we could ingest, transform, and query events
within seconds of their occurrence. Our story would end here if real-time
processing were perfect. Sadly, some events can come in days late, and need to
be corrected after the fact. Storm topologies can also go down for an extended
period of time. These are realities of any production data pipeline, and our
ingestion process had to be robust enough to handle these failures.
Coincidentally, Hadoop excelled at solving these problems.

<img src="{{ relative }}/img/radstack.png" alt="RADStack" title="RADStack" width="612px" height="414px">

Our stack consists of two separate data pipelines, one for real-time ingestion,
and the other for batching processing. Kafka acts as the collection point for
event streams for both pipelines. In our real-time pipeline, a Storm topology
consumes all events from Kafka, retains only those that are “on time”, and
applies any relevant business logic. This can range from simple
transformations, such as ID-to-name lookups, up to complex operations such as
multi-stream joins. The Storm topology forwards the processed event stream to
Druid in real-time. Druid can immediately answer queries over this stream,
yielding a very low latency event pipeline. 

In our batch pipeline, all events are copied from Kafka to either HDFS or S3
and are processed by a Hadoop job that applies the same business logic as the
Storm topology. The processed events are then written back to HDFS and loaded
into Druid using its built-in Hadoop indexer. Once loaded, this data completely
replaces the data that was loaded in real-time for the same interval, providing
the correctness guarantee we need.

## Do Try This At Home

Kafka, Storm, Hadoop, and Druid are all open source. All of the connecting bits
have already been written: [Kafka consumers for
Storm](https://github.com/nathanmarz/storm-contrib/tree/master/storm-kafka) and
[Hadoop](https://github.com/linkedin/camus) are available, we have open sourced
a real-time Druid sink for [Storm](https://github.com/metamx/tranquility), and
a Hadoop indexer is built-in to Druid. (Note: We don’t actually use Camus
internally; it looks like it should work for this purpose, though.)

<img src="{{ relative }}/img/radglue.png" alt="RADStack Glue" title="RADStack Glue" width="612px" height="414px">

If you have any custom business logic or if you need to translate formats, you
will need to implement this as a Storm topology, and in Hadoop using either raw
MapReduce or something like Cascading or Pig. If you don’t have any special
logic to apply, your Storm topology will be very simple and you don’t need that
Hadoop job at all. (But you still need your data in Hadoop for Druid indexing.)
You will need to set something up that periodically runs the Kafka-to-HDFS
importer, your business logic job (if any), and the Druid Hadoop indexer.

You don’t need to implement anything to perform aggregations or to merge
real-time and batch results: Druid handles all that for you.

We’ve found that this combination of technologies is flexible enough to handle
a wide variety of processing requirements and query loads. Each piece of the
stack is designed to do a specific set of things very well. In future blog
posts, we hope to cover the architecture of our data stack in greater detail.
