---
layout: doc_page
---

# 教程: 批量加载数据

## 新手入门

这个教程将指导你如何加载你自己的数据到Druid。

在这个教程中, 我们将假设你已经下载了Druid，就像 [单机快速开始](quickstart.html)中描述的一样 ，并且已经在本地机器运行。当前你不需要加载任何数据。
这个一旦完成，你就可以写1个定制的加载规格来加载你自己的数据集。

## 编写加载规格

当加载文件到Druid，你将会用到Druid的[批量加载](../ingestion/batch-ingestion.html) 进程.
这里有1个批量加载规格在 `quickstart/wikiticker-index.json`，你可以根据你的需求修改。

最重要的问题是：

  * 数据集应该被什么调用？它应该是"dataSchema"的"dataSource"字段。
  * 数据集位于什么位置？文件路径在"inputSpec"的"paths"。如果你想加载多个文件，你可以向它们提供以逗号分隔的字符串。
  * 什么字段作为时间戳？它应该是"timestampSpec"的"column"。
  * 什么字段作为维度？它应该是"dimensionsSpec"的"dimensions"。
  * 什么字段作为度量？它应该是"metricsSpec"。
  * 什么时间范围（时间间隔）被加载？它应该是"granularitySpec"的"intervals"。

如果你的数据对时间没有特殊的要求，你可以在每一行加上当前时间的标签。
你也可以给所有行加上个固定的时间戳，比如"2000-01-01T00:00:00.000Z"。

让我们用pageviews的数据集作为一个例子。Druid很好地支持TSV，CSV和JSON。
注意到嵌入JSON对象不被支持，如果你要用JSON，你应该提供包含扁平化对象的文件。

```json
{"time": "2015-09-01T00:00:00Z", "url": "/foo/bar", "user": "alice", "latencyMs": 32}
{"time": "2015-09-01T01:00:00Z", "url": "/", "user": "bob", "latencyMs": 11}
{"time": "2015-09-01T01:30:00Z", "url": "/foo/bar", "user": "bob", "latencyMs": 45}
```

确保文件末端没有新行。如果你保存到"pageviews.json"，然后作为数据集：

  * 让我们调用数据集"pageviews"。
  * 数据位于"pageviews.json"。
  * 时间戳就是"time"字段。
  * 维度可以选择"url"和"user"字符串字段。
  * 度量可以选择pageviews的count，"latencyMs"的sum。统计当我们加载数据的总量，将允许我们在查询的时候计算平均值。
  * 数据包含时间时间范围从2015-09-01（包含）到2015-09-02（不包含）。

你可以复制已有的`quickstart/wikiticker-index.json`索引任务到新的文件：

```bash
cp quickstart/wikiticker-index.json my-index-task.json
```

并且修改这些地方:

```json
"dataSource": "pageviews"
```

```json
"inputSpec": {
  "type": "static",
  "paths": "pageviews.json"
}
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
"granularitySpec": {
  "type": "uniform",
  "segmentGranularity": "day",
  "queryGranularity": "none",
  "intervals": ["2015-09-01/2015-09-02"]
}
```

## 运行任务

要运行这个任务，首先得确保索引任务可以读取*pageviews.json*：

- 如果你在本地运行（没有配置连接到Hadoop；这是默认的），然后把它放到Druid发行版本的根目录。
- 如果你配置Druid连接Hadoop集群，需要上传pageviews.json文件到HDFS。你可能需要调整ingestion spec中的`paths`。

启动索引进程，需要POST你的索引任务到Druid的Overlord。在标准的Druid安装中，URL是`http://OVERLORD_IP:8090/druid/indexer/v1/task`。

```bash
curl -X 'POST' -H 'Content-Type:application/json' -d @my-index-task.json OVERLORD_IP:8090/druid/indexer/v1/task
```

如果你单机运行所有东西，你可以使用localhost：

```bash
curl -X 'POST' -H 'Content-Type:application/json' -d @my-index-task.json localhost:8090/druid/indexer/v1/task
```

如果这个任务出问题了（如以状态FAILED完成），你可以访问[overlord console](http://localhost:8090/console.html)的"Task log"进行故障检测。

## 查询数据

你的数据应该在1分钟或者2分钟内是高可用的。你可以在[http://localhost:8081/#/](http://localhost:8081/#/)的Coordinator控制台 监视这个进程。

只要你的数据是高可用的，你就可以使用任何[支持的查询方法](../querying/querying.html)。

## 进一步了解

要了解批量加载数据的更多信息，请看[批量加载文档](../ingestion/batch-ingestion.html)。
