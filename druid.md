---
title: About Druid
layout: simple_page
sectionid: druid
---

Druid is an open-source analytics data store designed for business intelligence
([OLAP](http://en.wikipedia.org/wiki/Online_analytical_processing))
queries on event data. Druid provides low latency (real-time) data
ingestion, flexible data exploration, and fast data aggregation. Existing Druid
deployments have scaled to trillions of events and petabytes of data. Druid is
most commonly used to power user-facing analytic applications.

## Key Features

**Sub-second OLAP Queries** Druid’s column orientation and inverted indexes enable
complex multi-dimensional filtering and scanning exactly what is needed for a
query. Aggregate and filter on data in milliseconds.

**Real-time Streaming Ingestion** Typical analytics databases ingest data via batches.
Ingesting an event at a time is often accompanied with transactional locks and
other overhead that slows down the ingestion rate. Druid employs lock-free
ingestion of append-heavy data sets to allow for simultaneous ingestion and
querying of 10,000+ events per second per node. Simply put, the latency between
when an event happens and when it is visible is limited only by how quickly the
event can be delivered to Druid.

**Power Analytic Applications** Druid has numerous features built in for multi-tenancy. Power user-facing analytic applications designed to be used by
thousands of concurrent users.

**Cost Effective** Druid is extremely cost effective at scale and has numerous features built in for cost reduction.
Trade off cost and performance with simple configuration knobs.

**Highly Available** Druid is used to back SaaS implementations that need to be
up all the time. Druid supports rolling updates so your data is still available and queryable during software
updates. Scale up or down without data loss.

**Scalable** Existing Druid deployments handle trillions of events, petabytes
of data, and thousands of queries every second.

## Is Druid Right for Me?

Organizations have deployed Druid to analyze ad-tech, dev-ops, network traffic,
website traffic, finance, and sensor data. Druid is a good fit
if you have the following requirements:

- You are building an application that requires fast aggregations and exploratory analytics
- You want to do your analysis on data as it’s happening (in real-time)
- You have lots of data (trillions of events, petabytes of data)
- You need a data store that is always available with no single point of failure

## High Level Architecture
Druid is partially inspired by existing analytic data stores such as Google's
[BigQuery/Dremel](http://static.googleusercontent.com/media/research.google.com/en/us/pubs/archive/36632.pdf),
Google's [PowerDrill](http://vldb.org/pvldb/vol5/p1436_alexanderhall_vldb2012.pdf), and
search infrastructure. Druid indexes data to create mostly immutable views,
and stores the data in a custom column format highly optimized for aggregations and
filters. A Druid cluster is composed of various types of nodes, each designed
to do a small set of things very well. Nodes do not need to be deployed on individual hardware,
and many node types can be colocated in production.

## Comprehensive Architecture

For a comprehensive look at Druid architecture, please read our [white paper](http://static.druid.io/docs/druid.pdf).

## Comparisons

- [Druid vs SQL-on-Hadoop (Hive/Impala/Drill/Spark SQL/Presto)](/docs/latest/druid-vs-sql-on-hadoop.html)
- [Druid vs Key/Value Stores (HBase/Cassandra)](/docs/latest/druid-vs-key-value.html)
- [Druid vs Search Systems (Elasticsearch/Solr)](/docs/latest/Druid-vs-search-systems.html)
- [Druid vs General Computing Frameworks (Spark/Hadoop)](/docs/latest/druid-vs-computing-frameworks.html)
- [Druid vs Proprietary Commercial Solutions (Vertica/Redshift)](/docs/latest/druid-vs-commercial-solutions.html)

## Scale

Existing production Druid clusters have scaled to the following:

- 3+ trillion events/month
- 3M+ events/sec through Druid's real-time ingestion
- 100+ PB of raw data
- 50+ trillion events
- Thousands of queries per second for applications used by thousands of users
- Tens of thousands of cores

