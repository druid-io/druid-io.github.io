---
title: 关于Druid
layout: simple_page
sectionid: druid
---

Druid是一个开源的分析型数据存储， 用于支持事件数据之上的BI
([OLAP](http://en.wikipedia.org/wiki/Online_analytical_processing))查询。
Druid提供低延时（实时）数据接入， 灵活的数据探索， 以及高速的数据聚合。现存的Druid
部署已经扩展至万亿级事件以及PB级数据。 Druid最常用于驱动面向用户的分析型应用。

## 关键特性

**次秒级OLAP查询** Druid的列式特性以及倒排索引使得它能够支持复杂的多维度过滤， 仅需要扫描查询所需要的数据。 聚合和过滤都在毫秒级。

**实时流接入** 通常的分析数据库通过批处理接入数据。一次接入一个事件往往需要使用通过事务锁或者其他可能降低接入性能的方式实现。
Druid对数据集采用追加式无锁接入，支持单节点同时每秒10,000+事件的接入和查询。简而言之， 一个事件从发生到可以查询之间的延迟，
仅仅受限于事件被发送到Druid的速度。

**驱动分析型应用** Druid有数个内置的针对多租户的特性， 能够驱动支持数千用户使用的分析型应用。

**高性价比** Druid在大规模场景下具有极高的性价比， 同时有数个内置的用于降低成本的特性。可以通过简单的配置权衡成本和性能。

**高可用** Druid被用于支撑需要永久在线的SaaS应用。 Druid支持滚动更新，因此在软件更新过程中你的数据依旧可用且可查。 扩容和缩容无数据丢失。

**可扩展** 现存的Druid集群每秒处理万亿级事件，PB级数据以及数千查询。

## Druid是否适合我？

许多组织部署Druid用于分析广告技术、 运维、 网络流量、 云安全、 网站流量、 金融， 以及传感器数据。
如果你存在以下需求，那么Druid会是不错的选择：

- 你正在构建一个需要快速聚合和探索分析的应用
- 你需要基于正在发生的数据进行分析（实时）
- 你拥有大量的数据（万亿级事件，PB级数据）
- 你需要一个无单点问题，始终可用的数据存储

## 高级架构
Druid一定程度上是受已有的分析型数据存储启发，例如Google的
[BigQuery/Dremel](http://static.googleusercontent.com/media/research.google.com/en/us/pubs/archive/36632.pdf)，
Google的[PowerDrill](http://vldb.org/pvldb/vol5/p1436_alexanderhall_vldb2012.pdf)以及搜索框架。 Druid索引数据用于创建不变的视图，
同时将这些数据存储于针对聚合和过滤操作高度优化的自定义列格式中。
Druid由多种不同类型的节点组成， 它们各自只完成一小部分工作。这些节点并不需要完全独立部署，不同类型的节点在生产环境可以合布。

## 全面架构

需要全面认识Druid架构的话，请阅读我们的[白皮书](http://static.druid.io/docs/druid.pdf).

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

