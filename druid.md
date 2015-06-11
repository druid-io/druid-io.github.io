---
title: About Druid
layout: simple_page
sectionid: druid
---

Druid is an open-source analytics data store designed for business intelligence
([OLAP](http://en.wikipedia.org/wiki/Online_analytical_processing))
queries on timeseries data. Druid provides low latency (real-time) data
ingestion, flexible data exploration, and fast data aggregation. Existing Druid
deployments have scaled to trillions of events and petabytes of data. Druid is
best used to power analytic dashboards and applications.

- Get started with the ["Hello, Druid"
  tutorial](http://druid.io/docs/latest/Tutorial:-A-First-Look-at-Druid.html)
- Learn more about the architecture by reading the [Druid White
  Paper](http://static.druid.io/docs/druid.pdf)

## Key Features

**Designed for Analytics** Druid is built for exploratory analytics for OLAP
workflows. It supports a variety of filters, aggregators and query types and
provides a framework for plugging in new functionality. Druid also supports
approximate algorithms for cardinality estimation, and histogram and quantile
calculations.

**Interactive Queries** Druid’s query latency is optimized by reading and
scanning only exactly what is needed. Aggregate and filter on data without
sitting around waiting for results. Druid is ideal for powering analytic
dashboards. Druid is a column-oriented data store and supports ad-hoc,
  multi-dimensional filtering.

**Real-time Data** Typical analytics databases ingest data via batches.
Ingesting an event at a time is often accompanied with transactional locks and
other overhead that slows down the ingestion rate. Druid's real-time nodes
employ lock-free ingestion of append-heavy data sets to allow for simultaneous
ingestion and querying of 10,000+ events per second. Simply put, the latency
between when an event happens and when it is visible is limited only by how
quickly the event can be delivered to Druid.

**Highly Available** Druid is used to back SaaS implementations that need to be
up all the time. Your data is still available and queryable during system
updates. Scale up or down without data loss.

**Scalable** Existing Druid deployments handle billions of events and terabytes
of data per day.

## Scale

Large Druid production clusters have scaled to following:

- 3+ trillion events/month
- 1M+ events/sec through Druid's real-time ingestion
- 100+ PB of raw data
- 30+ trillion events
- Hundreds of queries per second for applications used by thousands of users

## Is Druid Right for Me?

Organizations have deployed Druid to analyze ad-tech, dev ops, network,
activity stream (website), finance, and sensor data. In particular, Druid is a
good fit if you have the following requirements:

- You need to do interactive aggregations and fast exploration on large amounts of data
- You need ad-hoc analytic queries (not a key-value store)
- You have a lot of data (trillions of events, petabytes of data)
- You want to do your analysis on data as it’s happening (in real-time)
- You need a data store that is always available with no single point of failure

## Architecture Overview

Druid is partially inspired by existing analytic data stores such as Google's
[BigQuery/Dremel](http://static.googleusercontent.com/media/research.google.com/en/us/pubs/archive/36632.pdf),
Google's
[PowerDrill](http://vldb.org/pvldb/vol5/p1436_alexanderhall_vldb2012.pdf), and
search infrastructure. Druid indexes data to create mostly immutable views, 
and stores the data in a format highly optimized for aggregations and
filters. A Druid cluster is composed of various types of nodes, each designed
to do a small set of things very well.

## Druid vs Other Systems

The data infrastructure space has many different options for various problems.
Below, we describe how
Druid compares to some common systems:

- [Druid vs Hive/Impala/Shark/Presto](/docs/latest/Druid-vs-Impala-or-Shark.html)
- [Druid vs Redshift](/docs/latest/Druid-vs-redshift.html)
- [Druid vs Vertica](/docs/latest/Druid-vs-vertica.html)
- [Druid vs Cassandra](/docs/latest/Druid-vs-Cassandra.html)
- [Druid vs Hadoop](/docs/latest/Druid-vs-Hadoop.html)
- [Druid vs Spark](/docs/latest/Druid-vs-Spark.html)
- [Druid vs Elasticsearch](/docs/latest/Druid-vs-Elasticsearch.html)

The data infrastructure world is vast, confusing and constantly in flux. This
page is meant to help potential evaluators decide if Druid is right for them.
If you see anything incorrect in here, [please let us know](/community/).
