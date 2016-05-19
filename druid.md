---
title: 关于Druid
layout: simple_page
sectionid: druid
---

Druid is an open-source analytics data store designed for business intelligence
([OLAP](http://en.wikipedia.org/wiki/Online_analytical_processing))
queries on event data. Druid提供低延时（实时）数据接入， 灵活的数据探索， 以及高速的数据聚合。现存的Druid
部署已经扩展至万亿级事件以及PB级数据。 Druid is
most commonly used to power user-facing analytic applications.

## 关键特性

**次秒级OLAP查询** Druid’s column orientation and inverted indexes enable
complex multi-dimensional filtering and scanning exactly what is needed for a
query. 聚合和过滤都在毫秒级。

**实时流接入** 通常的分析数据库通过批处理接入数据。
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

**高可用** Druid is used to back SaaS implementations that need to be
up all the time. Druid supports rolling updates so your data is still available and queryable during software
updates. Scale up or down without data loss.

**可扩展** 现存的Druid集群每秒处理万亿级事件，PB级数据以及数千查询。

## Druid是否适合我？

许多组织部署Druid用于分析广告技术、 运维、 网络流量、 云安全、 网站流量、 金融， 以及传感器数据。
如果你存在以下需求，那么Druid会是不错的选择：

- 你正在构建一个需要快速聚合和探索分析的应用
- 你需要基于正在发生的数据进行分析（实时）
- 你拥有大量的数据（万亿级事件，PB级数据
- 你需要一个无单点问题，始终可用的数据存储

## 高级架构
Druid一定程度上是受已有的分析型数据存储启发，例如Google的
[BigQuery/Dremel](http://static.googleusercontent.com/media/research.google.com/en/us/pubs/archive/36632.pdf),
Google的[PowerDrill](http://vldb.org/pvldb/vol5/p1436_alexanderhall_vldb2012.pdf)以及搜索架构。 Druid indexes data to create mostly immutable views,
and stores the data in a custom column format highly optimized for aggregations and
filters. Druid由多种不同类型的节点组成， 它们各自只完成一小部分工作。这些节点并不需要完全独立部署，许多不同类型的节点在生产环境可以合布。

## 全面架构

需要对Druid架构有全面认识的话，请阅读我们的[白皮书](http://static.druid.io/docs/druid.pdf).

## 对比

- [Druid vs Elasticsearch](/docs/latest/comparisons/druid-vs-elasticsearch.html)
- [Druid vs Key/Value Stores (HBase/Cassandra)](/docs/latest/comparisons/druid-vs-key-value.html)
- [Druid vs Redshift](/docs/latest/comparisons/druid-vs-redshift.html)
- [Druid vs Spark](/docs/latest/comparisons/druid-vs-spark.html)
- [Druid vs SQL-on-Hadoop (Hive/Impala/Drill/Spark SQL/Presto)](/docs/latest/comparisons/druid-vs-sql-on-hadoop.html)

## 扩展

[现存的生产Druid集群](http://www.marketwired.com/press-release/metamarkets-clients-analyzing-100-billion-programmatic-events-daily-on-track-surpass-2061596.htm) 已扩展至如下规模：

- 3+ 万亿事件/月
- 3M+ 事件/秒，通过实时流接入
- 100+ PB raw数据
- 50+ 万亿事件
- 每秒数千用户，数千查询
- 数万cpu核心

