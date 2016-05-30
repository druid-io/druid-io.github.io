---
layout: doc_page
---

# 加载数据

## 选择一种加载方式

Druid支持实时和批量两种数据加载方式。最常用的配置如下：

- [Files](../ingestion/batch-ingestion.html) - 从HDFS、S3、本地文件、或者其他支持批处理的Hadoop文件系统加载数据。如果在平面文件中你的数据集已经准备好，我们建议使用这种方法。

- [Stream push](../ingestion/stream-ingestion.html#stream-push) - 推送实时数据流到Druid使用 [Tranquility](http://github.com/druid-io/tranquility)，一个发送数据流到Druid的客户端库。如果你的数据集来自于一个数据流系统，如Kafka、Storm、Spark Streaming、或者你自己的系统，我们建议使用这种方法。

- [Stream pull](../ingestion/stream-ingestion.html#stream-pull) - 使用Realtime节点直接从外部数据源拉数据流进入Druid。

## 新手入门

开始加载你自己数据的最简单方式就是阅读以下3个教程。
- [Files-based tutorial](tutorial-batch.html) 指导你如何从本地磁盘加载文件。
- [Streams-based tutorial](tutorial-streams.html) 指导你如何通过HTTP推送数据。
- [Kafka-based tutorial](tutorial-kafka.html) 指导你如何从Kafka加载数据。

## 批量和实时混搭

你可以在混合架构中联合使用批量和实时数据流的加载方法。在混合架构中，你可以使用实时数据流的方式初始化加载，然后使用批量模式周期性再加载旧数据（通常是每几小时或者每天）。当Druid再加载一个时间周期的数据，新的数据会自动替换较早加载的数据。

在一些失败场景中，当前Druid支持的所有实时数据流加载方式都有可能出现消息丢失或者消息重复，因此批量再加载方式消除了这种历史数据的潜在错误 。

如果由于某种原因，你需要修改你的数据，批量再加载方式也提供给你再加载数据的选项。
