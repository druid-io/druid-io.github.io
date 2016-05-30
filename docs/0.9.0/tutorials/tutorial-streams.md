---
layout: doc_page
---

# 教程：加载实时流数据

## 新手入门

这个教程将指导你如何加载实时流数据到Druid。

在这个教程中, 我们将假设你已经下载了Druid，就像 [单机快速开始](quickstart.html)中描述的一样 ，并且已经在本地机器运行。当前你不需要加载任何数据。

这个一旦完成，你就可以写1个定制的加载规格来加载你自己的数据集。

## 编写加载规格

要加载实时流数据到Druid,我们建议使用[stream push](../ingestion/stream-push.html)进程. 在本教程中，我们使用[Tranquility Server](../ingestion/stream-ingestion.html#server)通过HTTP推送数据到Druid。

<div class="note info">
本教程将指导你如何通过HTTP推送实时流数据到Druid，同时Druid也支持各种批量和实时数据流加载方式。请看<a href="../ingestion/batch-ingestion.html">加载文件</a>
and <a href="../ingestion/stream-ingestion.html">加载数据流</a>获取更多信息，包括从Hadoop、 HTTP、Storm、Samza、Spark Streaming和JVM apps。
</div>

你可以通过编写定制的Tranquility Server配置，然后通过HTTP加载新的数据集。自带的配置在`conf-quickstart/tranquility/server.json`，你可以根据自己的需求修改。

最重要的问题是：

  * 数据集应该被什么调用？它应该是"dataSchema"的"dataSource"字段。
  * 什么字段作为时间戳？它应该是"timestampSpec"的"column"字段。
  * 什么字段作为维度？它应该是"dimensionsSpec"的"dimensions"字段。
  * 什么字段作为度量？它应该是"metricsSpec"字段。

我们在topic *pageviews*中使用JSON pageviews数据集作为样例，包含以下记录：

```json
{"time": "2000-01-01T00:00:00Z", "url": "/foo/bar", "user": "alice", "latencyMs": 32}
```

以上问题的答案如下：

  * 调用数据集"pageviews"。
  * 时间戳就是"time"字段。
  * 维度可以选择"url"和"user"字符串字段。
  * 度量可以选择pageviews的count，"latencyMs"的sum。统计当我们加载数据的sum，将允许我们在查询的时候计算平均值。

现在，编辑已有的`conf-quickstart/tranquility/server.json`文件并修改以下部分：

  1. 修改`"dataSources"`下的key`"metrics"`为`"pageviews"`
  2. 在新的`"pageviews"` key中，修改以下部分：
  ```json
  "dataSource": "pageviews"
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

## 重启服务器

停止Tranquility (CTRL-C) 并重启来获取新的配置文件。

## 发送数据

发送一些数据！通过以下三条记录开始：

```json
{"time": "2000-01-01T00:00:00Z", "url": "/foo/bar", "user": "alice", "latencyMs": 32}
{"time": "2000-01-01T00:00:00Z", "url": "/", "user": "bob", "latencyMs": 11}
{"time": "2000-01-01T00:00:00Z", "url": "/foo/bar", "user": "bob", "latencyMs": 45}
```

Druid实时流数据加载需要关联当前消息（关联[窗口时间](../ingestion/stream-ingestion.html#segmentgranularity-and-windowperiod)控制的松弛时间值）, 你需要用ISO8601格式的当前时间替换消息中的`2000-01-01T00:00:00Z`。通过执行以下命令：

```bash
python -c 'import datetime; print(datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"))'
```

更新以上JSON的时间戳，并保存到`pageviews.json`。然后通过以下命令发送：

```bash
curl -XPOST -H'Content-Type: application/json' --data-binary @pageviews.json http://localhost:8200/v1/post/pageviews
```

打印出如下内容：

```
{"result":{"received":3,"sent":3}}
```

表明HTTP服务器接收到3个event，同时发送了3个event到Druid。首次运行会花几秒时间来完成，因为Druid资源必须放到加载任务中。随后的POSTs应该很快完成。

如果你看到`"sent":0`，这很可能意味着你的时间戳不是最新的。调整你的时间戳并重新发送数据。

## 查询数据

发送数据后，你可以使用任何[支持的查询方法](../querying/querying.html)立即进行查询。

## 进一步了解

要了解实时流数据加载的更多信息，请看[实时流数据加载文档](../ingestion/stream-ingestion.html)。