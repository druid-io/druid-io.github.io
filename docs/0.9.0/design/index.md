---
layout: doc_page
---

# Druid的概念

Druid是一个开源的数据存储,为[OLAP](http://en.wikipedia.org/wiki/Online_analytical_processing)的事件查询而设计。
本文旨在让读者对Druid怎样存储数据和Druid集群的结构有一个粗略的认识。

## 数据

在我们讨论之前,先让我们看看一个数据集的例子 (来源于线上广告):

    timestamp             publisher          advertiser  gender  country  click  price
    2011-01-01T01:01:35Z  bieberfever.com    google.com  Male    USA      0      0.65
    2011-01-01T01:03:63Z  bieberfever.com    google.com  Male    USA      0      0.62
    2011-01-01T01:04:51Z  bieberfever.com    google.com  Male    USA      1      0.45
    2011-01-01T01:00:00Z  ultratrimfast.com  google.com  Female  UK       0      0.87
    2011-01-01T02:00:00Z  ultratrimfast.com  google.com  Female  UK       0      0.99
    2011-01-01T02:00:00Z  ultratrimfast.com  google.com  Female  UK       1      1.53

这个数据集有三部分组成。如果你比较熟悉OLAP的术语的话,应该会很熟悉下面的概念。

* **Timestamp列**: 我们将timestamp区别开是因为我们所有的查询都以时间为中心。

* **Dimension列**: Dimensions对应事件的维度,通常用于筛选过滤数据。
在我们例子中的数据有四个dimensions: publisher, advertiser, gender, and country。
它们每一个都可以看作是我们已选都数据的主体。

* **Metric列**: Metrics是用于聚合和计算的列。在我们的例子中,click和price就是metrics。
Metrics通常是数字,并且包含支持count、sum、mean等计算操作。
在OLAP的术语中也被叫做measures。

## Roll-up

和我们例子中数据相比,万亿级别的的数据会更有趣。
但是,总结上面的例子可以得出很多有用的启示。
Druid原始数据的聚合过程我们称作"roll-up"。
Roll-up是在一系列维度选定后的数据之上做的第一级聚合,类似于(伪代码):

    GROUP BY timestamp, publisher, advertiser, gender, country
      :: impressions = COUNT(1),  clicks = SUM(click),  revenue = SUM(price)

我们原始数据的合并后看起来如下:

     timestamp             publisher          advertiser  gender country impressions clicks revenue
     2011-01-01T01:00:00Z  ultratrimfast.com  google.com  Male   USA     1800        25     15.70
     2011-01-01T01:00:00Z  bieberfever.com    google.com  Male   USA     2912        42     29.18
     2011-01-01T02:00:00Z  ultratrimfast.com  google.com  Male   UK      1953        17     17.31
     2011-01-01T02:00:00Z  bieberfever.com    google.com  Male   UK      3194        170    34.01

事实上,这种预聚合的方式可以很显著的减少数据的存储(可减少100倍)。
Druid也是通过这种方式来减少数据的存储。
这种减少存储的方式也会带来副作用,比如我们没有办法再查询到每条数据具体的明细。换句话说,数据聚合的粒度是我们能查询数据的最小粒度。
因此,Druid在ingestionSpecs中需要定义`queryGranularity`作为数据的粒度,最小能支持的`queryGranularity`是毫秒。

## 数据Sharding

Druid以`segments`的形式就行分片,并且以时间作为第一级分片。在上面我们合并的数据集中,我们可以每小时一个,创建两个segments。

例如:

Segment `sampleData_2011-01-01T01:00:00:00Z_2011-01-01T02:00:00:00Z_v1_0` 包含

     2011-01-01T01:00:00Z  ultratrimfast.com  google.com  Male   USA     1800        25     15.70
     2011-01-01T01:00:00Z  bieberfever.com    google.com  Male   USA     2912        42     29.18


Segment `sampleData_2011-01-01T02:00:00:00Z_2011-01-01T03:00:00:00Z_v1_0` 包含

     2011-01-01T02:00:00Z  ultratrimfast.com  google.com  Male   UK      1953        17     17.31
     2011-01-01T02:00:00Z  bieberfever.com    google.com  Male   UK      3194        170    34.01

Segments是自包含容器,包含着一个时间段内的数据。Segments包括基于列的压缩,以及这些列的索引。Druid只需要清楚如何扫描这些segments就可以查询。

Segments通过datasource, interval, version, 和一个可选的partition number来区分。查看下例子中的segments,名称的格式如下: `dataSource_interval_version_partitionNumber`。


## 数据索引

提升Druid速度部分依赖于它怎样存储数据。借鉴search infrastructure的思想,Druid创建不变的快照数据,为分析查询提供极优的数据结构来存储。

Druid是列式存储,这就意味这每一个列都是单独存储,在查询的过程中Druid只扫描查询呢所需的列即可。不同的列可以采用不同的压缩方式,也可以关联不同的索引。

Druid的索引是基于每一个分片(即segment)上的。

## 数据加载

Druid有实时和批量两种数据加载方式。实时加载数据是尽力而为型的,目前也不支持exactly once,但是我们已经计划加入这一特性。
批量加载是exactly once的,通过批量处理能保证数据的精确。
Druid使用的通常情况是,近期的数据通过实时方式处理,离线批量处理来来提高精度。

## 数据查询

Druid原生的查询方式是通过http发送json,但是社区已经贡献出[多种](../development/libraries.html)查询库,包括SQL。

Druid被设计为执行单表操作,不支持join操纵(实际上可以做join)。
生产环境需要在ETL阶段进行join,因为数据在加载进Druid之前必须规范化。

## Druid集群

Druid集群有不同节点组成,每个节点都很好都设计成做一小部分事情。

* **Historical节点** Historical节点是Druid集群都骨干, 它下载不变的segments到本地,并提供segments的查询服务。
Historical节点采用shared nothing的架构,能够清楚怎样下载segments,删除segments,以及为segments提供查询服务。

* **Broker节点** Broker节点是客户端和应用程序从Druid查询数据的地方。Broker节点负责分发查询,以及收集和合并结果。
Broker节点清楚每一个segment在哪个Historical节点查询。

* **Coordinator节点** Coordinator节点管理集群中historical节点的segments。Coordinator节点通知historical节点下载新的segments,删除旧的segments,以及迁移segments以达到负载均衡。

* **Real-time处理** Real-time处理目前可以通过独立的realtime节点,或者通过indexing service实现,这两种方式都很常见。
Real-time处理包括加载数据、创建数据索引(创建segments)、以及交接segments给historical节点。数据立马可查只要实时处理逻辑加载。数据交接的过程也是安全的,数据在整个流程中都保持可查。

### 外部依赖

Druid的集群需要有一些外部依赖。

* **Zookeeper** Druid依赖Zookeeper来保证集群内的信息一致。

* **Metadata Storage** Druid依赖metadata storage存储segments的元数据和配置。创建segments的服务在元数据中记录信息, coordinator监听着元数据以便了解什么时候需要下载新数据或者删除旧数据。
 元数据的存储不涉及查询的路径。MySQL和PostgreSQL非常有利于生产环境下元数据的存储, 但Derby在你部署单机版做测试的时候非常好用。

* **Deep Storage** Deep storage是segments的永久备份。创建segments的服务上传segments到Deep storage,然后historical节点下载。
Deep storage不涉及查询路径。 S3和HDFS是比较推荐到deep storages。

### 高可用到特性

Druid的涉及没有单点故障。不同类型的节点失败也不会影响到其他类型节点的正常服务。
为了到达高可用集群的目的,你最好至少每种节点类型运行在两台机器。

### 综合结构

想要对Druid对结构有一个整体对了解,轻阅读我们的 [白皮书](http://static.druid.io/docs/druid.pdf).

