---
layout: doc_page
---

# 教程：从Kafka加载数据

## 新手入门

这个教程将指导你如何从Kafka加载数据到Druid。

在这个教程中, 我们将假设你已经下载了Druid，就像 [单机快速开始](quickstart.html)中描述的一样 ，并且已经在本地机器运行。当前你不需要加载任何数据。

<div class="note info">
这个教程将指导你如何从Kafka加载数据到Druid，但是Druid也支持各种的批量和实时数据加载方式。请看<a href="../ingestion/batch-ingestion.html">加载文件</a>和<a href="../ingestion/stream-ingestion.html">加载数据流</a> 获取更多信息，包括从Hadoop、 HTTP、Storm、Samza、Spark Streaming和JVM apps.
</div>

## 启动Kafka

[Apache Kafka](http://kafka.apache.org/)是一个高吞量的消息总线，并且与Druid整合良好。这个教程中，我们使用Kafka 0.9.0.0。下载Kafka，在你的终端执行以下命令：

```bash
curl -O http://www.us.apache.org/dist/kafka/0.9.0.0/kafka_2.11-0.9.0.0.tgz
tar -xzf kafka_2.11-0.9.0.0.tgz
cd kafka_2.11-0.9.0.0
```

启动1个Kafka节点，在新的终端执行以下命令：

```bash
./bin/kafka-server-start.sh config/server.properties
```

Run this command to create a Kafka topic called *metrics*, to which we'll send data:

```bash
./bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic metrics
```

## 发送数据

让我们为topic启动1个控制台producer并发送一些数据！

在Druid目录中，产生一些新的metrics,通过执行以下命令：

```bash
bin/generate-example-metrics
```

In your Kafka directory, run:

```bash
./bin/kafka-console-producer.sh --broker-list localhost:9092 --topic metrics
```

*kafka-console-producer*命令等待输入。复制产生的metrics，把它们粘贴到*kafka-console-producer*终端，并键入enter。如果你喜欢，你也可以粘贴更多信息到producer，或者你使用CTRL-D退出控制台producer。

你可以立即查询这个数据，或者如果你愿意加载你自己的数据集，请看[加载你自己的数据](#loading-your-own-data)部分。

## 查询数据

发送数据后，你可以立即使用任何[支持的查询方法](../querying/querying.html)进行查询。

## 加载你自己的数据

目前，你已经使用我们在发行版本提供的加载规格，从Kafka加载数据到Druid。每一个加载规格被设计用来与特定的数据集使用。你可以编写定制的加载规格，加载数据类型到Imply。

你可以通过自带的配置`conf-quickstart/tranquility/kafka.json`并根据自己的需求进行修改，来定制自己折加载规格。

最重要的问题是：

  * 数据集应该被什么调用？它应该是"dataSchema"的"dataSource"字段。
  * 什么字段作为时间戳？它应该是"timestampSpec"的"column"。
  * 什么字段作为维度？它应该是"dimensionsSpec"的"dimensions"。
  * 什么字段作为度量？它应该是"metricsSpec"。

让我们在topic *pageviews*中使用JSON pageviews数据集作为样例，包含以下记录：

```json
{"time": "2000-01-01T00:00:00Z", "url": "/foo/bar", "user": "alice", "latencyMs": 32}
```

首先，创建topic：

```bash
./bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic pageviews
```

然后，编辑`conf-quickstart/tranquility/kafka.json`:

  * 调用数据集"pageviews-kafka"。
  * 时间戳就是"time"字段。
  * 维度可以选择"url"和"user"字符串字段。
  * 度量可以选择pageviews的count，"latencyMs"的sum。统计当我们加载数据的sum，将允许我们在查询的时候计算平均值。

你可以编辑已有的`conf-quickstart/tranquility/kafka.json`文件并修改以下部分：

  1. 修改`"dataSources"`下的key`"metrics-kafka"`为 `"pageviews-kafka"`
  2. 在新的`"pageviews-kafka"` key中，修改以下部分：
  ```json
  "dataSource": "pageviews-kafka"
  ```

  ```json
  "timestampSpec": {
       "format": "auto",
       "column": "time"
  }
  ```

  ```json
  "dimensionsSpec": {
       "dimensions": ["url", "user"]
  }
  ```

  ```json
  "metricsSpec": [
       {"name": "views", "type": "count"},
       {"name": "latencyMs", "type": "doubleSum", "fieldName": "latencyMs"}
  ]
  ```

  ```json
  "properties" : {
       "task.partitions" : "1",
       "task.replicants" : "1",
       "topicPattern" : "pageviews"
  }
  ```

然后，启动Druid Kafka加载数据：

```bash
bin/tranquility kafka -configFile ../druid-0.9.0/conf-quickstart/tranquility/kafka.json
```

- 如果Tranquility server或者Kafka已经在运行，停止它（CTRL-C）并再次启动。

最后，发送一些数据到Kafka topic。通过以下消息开始：

```json
{"time": "2000-01-01T00:00:00Z", "url": "/foo/bar", "user": "alice", "latencyMs": 32}
{"time": "2000-01-01T00:00:00Z", "url": "/", "user": "bob", "latencyMs": 11}
{"time": "2000-01-01T00:00:00Z", "url": "/foo/bar", "user": "bob", "latencyMs": 45}
```

Druid实时数据流加载需要关联当前消息 （关联[窗口时间](../ingestion/stream-ingestion.html#segmentgranularity-and-windowperiod)控制的松弛时间值）, 你需要用ISO8601格式的当前时间替换消息中的`2000-01-01T00:00:00Z`。通过执行以下命令：

```bash
python -c 'import datetime; print(datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"))'
```

更新上面的JSON时间戳，然后复制并粘贴这些消息到控制台producer并键入enter：

```bash
./bin/kafka-console-producer.sh --broker-list localhost:9092 --topic pageviews
```

好了，你的数据现在应该在Druid里了。你可以使用任何[支持的查询方法](../querying/querying.html)立即进行查询。

## 进一步了解

要了解实时加载数据的更多信息，请看[实时数据流加载文档](../ingestion/stream-ingestion.html)。
