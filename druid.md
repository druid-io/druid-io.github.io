---
title: About Druid
layout: simple_page
sectionid: druid
---

Druid is an open-source data store designed for sub-second queries on real-time
and historical data. It is primarily used for business intelligence
([OLAP](http://en.wikipedia.org/wiki/Online_analytical_processing)) queries on
event data. Druid provides low latency (real-time) data ingestion, flexible
data exploration, and fast data aggregation. Existing Druid deployments have
scaled to trillions of events and petabytes of data. Druid is most commonly
used to power user-facing analytic applications.

## Key Features

**Sub-second OLAP Queries** Druid’s unique architecture enables rapid
multi-dimensional filtering, ad-hoc attribute groupings, and extremely fast
aggregations.

**Real-time Streaming Ingestion** Druid employs lock-free ingestion to allow
for simultaneous ingestion and querying of high dimensional, high volume data
sets. Explore events immediately after they occur.

**Power Analytic Applications** Druid has numerous features built for
multi-tenancy. Power user-facing analytic applications designed to be used by
thousands of concurrent users.

**Cost Effective** Druid is extremely cost effective at scale and has numerous
features built in for cost reduction.  Trade off cost and performance with
simple configuration knobs.

**Highly Available** Druid is used to back SaaS implementations that need to be
up all the time. Druid supports rolling updates so your data is still available
and queryable during software updates. Scale up or down without data loss.

**Scalable** Existing Druid deployments handle trillions of events, petabytes
of data, and thousands of queries every second.

## Is Druid Right for Me?

Organizations have deployed Druid to analyze user, server, and marketplace
events across a variety of industries including media, telecommunications,
security, banking, health care, and retail. Druid is a good fit if you have the
following requirements:

- You are building an application that requires fast aggregations and
  OLAP queries
- You want to do real-time analysis
- You have lots of data (trillions of events, petabytes of data)
- You need a data store that is always available with no single point of
  failure

## High Level Architecture

Druid is partially inspired by existing analytic data stores such as Google's
[BigQuery/Dremel](http://static.googleusercontent.com/media/research.google.com/en/us/pubs/archive/36632.pdf),
Google's
[PowerDrill](http://vldb.org/pvldb/vol5/p1436_alexanderhall_vldb2012.pdf), and
search infrastructure. Druid indexes all ingested data in a custom column
format optimized for aggregations and filters. A Druid cluster is composed of
various types of processes (called nodes), each designed to do a small set of
things very well. 

## Comprehensive Architecture

For a comprehensive look at Druid architecture, please read our [white paper](http://static.druid.io/docs/druid.pdf) from 2014.

## Comparisons

- [Druid vs Elasticsearch](/docs/latest/comparisons/druid-vs-elasticsearch.html)
- [Druid vs Key/Value Stores (HBase/Cassandra)](/docs/latest/comparisons/druid-vs-key-value.html)
- [Druid vs Redshift](/docs/latest/comparisons/druid-vs-redshift.html)
- [Druid vs Spark](/docs/latest/comparisons/druid-vs-spark.html)
- [Druid vs SQL-on-Hadoop (Hive/Impala/Drill/Spark SQL/Presto)](/docs/latest/comparisons/druid-vs-sql-on-hadoop.html)

## Scale

[Existing production Druid clusters](http://www.marketwired.com/press-release/metamarkets-clients-analyzing-100-billion-programmatic-events-daily-on-track-surpass-2061596.htm) have scaled to the following:

- 3+ trillion events/month
- 3M+ events/sec through Druid's real-time ingestion
- 100+ PB of raw data
- 50+ trillion events
- Thousands of queries per second for applications used by thousands of users
- Tens of thousands of cores

