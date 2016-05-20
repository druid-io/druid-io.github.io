---
layout: doc_page
---

# Druid快速入门

此文主要讲述的内容包括: 下载Druid, 单机环境下安装, 加载一些数据, 并查询这些数据。

## 先决条件

你需要准备好以下环境:

  * Java 7 以上
  * Linux, Mac OS X, 或者其他Unix系的操作系统 (不支持Windows)
  * 8G 以上内存
  * 2核以上cpu

在Mac OS X 系统上, 你可以使用 [Oracle's JDK 8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) 。

在Linux 系统上, 你可以很轻松的获取Java。如果你的操作系统是Ubuntu,
你可以通过 [安装包](http://www.webupd8.org/2012/09/install-oracle-java-8-in-ubuntu-via-ppa.html) 来升级一个新版本的Java环境。

## 开始入门

可以用下面命令行的方式来安装Druid:

```bash
curl -O http://static.druid.io/artifacts/releases/druid-0.9.0-bin.tar.gz
tar -xzf druid-0.9.0-bin.tar.gz
cd druid-0.9.0
```

你可以看到以下目录:

* `LICENSE` - 许可文件。
* `bin/` - 用于快速启动的脚本。
* `conf/*` - 以集群方式启动的配置模板。
* `conf-quickstart/*` - 快速启动的配置文件。
* `extensions/*` - 所有Druid的扩展概念。
* `hadoop-dependencies/*` - Druid的hadoop依赖
* `lib/*` - Druid核心功能所需的包。
* `quickstart/*` - 用于快速启动的文件。

## 启动Zookeeper

目前,Druid需要依赖 [Apache ZooKeeper](http://zookeeper.apache.org/) 进行分布式协调。你需要下载核运行Zookeeper。

```bash
curl http://www.gtlib.gatech.edu/pub/apache/zookeeper/zookeeper-3.4.6/zookeeper-3.4.6.tar.gz -o zookeeper-3.4.6.tar.gz
tar -xzf zookeeper-3.4.6.tar.gz
cd zookeeper-3.4.6
cp conf/zoo_sample.cfg conf/zoo.cfg
./bin/zkServer.sh start
```

## 启动Druid的服务

Zookeeper成功启动后, 回到druid-0.9.0目录, 执行:

```bash
bin/init
```

如此, 可以创建一些Druid所需的初始化目录。 然后, 你就可以在不同的终端窗口启动Druid相关的服务进程。
这些命令可以在同一个节点启动。在大型的分布式集群中, Druid的进程也可以很好的在同一个节点协同运行。

```bash
java `cat conf-quickstart/druid/historical/jvm.config | xargs` -cp conf-quickstart/druid/_common:conf-quickstart/druid/historical:lib/* io.druid.cli.Main server historical
java `cat conf-quickstart/druid/broker/jvm.config | xargs` -cp conf-quickstart/druid/_common:conf-quickstart/druid/broker:lib/* io.druid.cli.Main server broker
java `cat conf-quickstart/druid/coordinator/jvm.config | xargs` -cp conf-quickstart/druid/_common:conf-quickstart/druid/coordinator:lib/* io.druid.cli.Main server coordinator
java `cat conf-quickstart/druid/overlord/jvm.config | xargs` -cp conf-quickstart/druid/_common:conf-quickstart/druid/overlord:lib/* io.druid.cli.Main server overlord
java `cat conf-quickstart/druid/middleManager/jvm.config | xargs` -cp conf-quickstart/druid/_common:conf-quickstart/druid/middleManager:lib/* io.druid.cli.Main server middleManager
```

每个任务启动后, 你都应该可以看到打印出来都日志信息。

如果你想停止服务, CTRL-C可以退出正在运行的进程。如果你想在停止服务后重新清理, 删除 `var` 目录,然后重新运行 `init` 脚本。

当所有当服务都启动后, 你就可以开始加载数据了。

## 批量加载数据

为了便于你能很好的开始加载数据, 我们从维基百科2015年9月12日的修改日志中抽取了一个样本数据。

<div class="note info">
该部分主要让你了解怎么批量加载数据, 你也可以直接跳过该部分, 而去了解怎么
<a href="quickstart.html#load-streaming-data">加载实时流数据</a>
Druid流的方式加载数据几乎可以做到在事件加载的同时就可查。
</div>

维基百科抽样的数据集中的 [dimensions](https://en.wikipedia.org/wiki/Dimension_%28data_warehouse%29) (可以过滤和拆分的属性) ,
排除time外,还有:

  * channel
  * cityName
  * comment
  * countryIsoCode
  * countryName
  * isAnonymous
  * isMinor
  * isNew
  * isRobot
  * isUnpatrolled
  * metroCode
  * namespace
  * page
  * regionIsoCode
  * regionName
  * user

在维基百科抽样的数据集中 [measures](https://en.wikipedia.org/wiki/Measure_%28data_warehouse%29),
或者在Druid中可以叫做 *metrics* (可以聚合的值)的有:

  * count
  * added
  * deleted
  * delta
  * user_unique

你可以提交一个*ingestion task*, 并指定数据文件的位置, 来把数据加载到Druid。
在我们的目录中已经包含了一个可以加载 `wikiticker-2015-09-12-sampled.json`的任务。
你可以在一个新的终端界面中, 在druid-0.9.0目录提交这个任务:

```bash
curl -X 'POST' -H 'Content-Type:application/json' -d @quickstart/wikiticker-index.json localhost:8090/druid/indexer/v1/task
```

如果任务成功, 你可以看到打印出的任务ID:

```bash
{"task":"index_hadoop_wikipedia_2013-10-09T21:30:32.802Z"}
```

你可以去overlord控制台页面来查看任务的状态:
[http://localhost:8090/console.html](http://localhost:8090/console.html).
你可以周期性的刷新页面, 当任务成功后, 你可以看到这个任务的状态是"SUCCESS"。

任务完成一两分钟后, 数据将会被historical节点加载并可查询。 你可以在coordinator的控制台监控到加载数据到进程,
如果数据源 "wikiticker" 前面有一个蓝色到圆圈, 说明 "完全可用": [http://localhost:8081/#/](http://localhost:8081/#/)。

一旦数据完全可用, 你就可以立马查询&mdash; 想具体了解, 可以直接跳到 [数据查询](#数据查询)。或者继续 [加载数据](#load-your-own-data)
Once the data is fully available, you can immediately query it&mdash; to see how, skip to the [Query
data](#query-data) section below. Or, continue to the [Load your own data](#load-your-own-data)
section if you'd like to load a different dataset.

## Load streaming data

To load streaming data, we are going to push events into Druid
over a simple HTTP API. We will do this use [Tranquility], a high level data producer
library for Druid.

To download Tranquility, issue the following commands in your terminal:

```bash
curl -O http://static.druid.io/tranquility/releases/tranquility-distribution-0.7.4.tgz
tar -xzf tranquility-distribution-0.7.4.tgz
cd tranquility-distribution-0.7.4
```

We've included a configuration file in `conf-quickstart/tranquility/server.json` as part of the Druid distribution
for a *metrics* datasource. We're going to start the Tranquility server process, which can be used to push events
directly to Druid.

``` bash
bin/tranquility server -configFile <path_to_druid_distro>/conf-quickstart/tranquility/server.json
```

<div class="note info">
This section shows you how to load data using Tranquility Server, but Druid also supports a wide
variety of <a href="../ingestion/stream-ingestion.html#stream-push">other streaming ingestion options</a>, including from
popular streaming systems like Kafka, Storm, Samza, and Spark Streaming.
</div>

The [dimensions](https://en.wikipedia.org/wiki/Dimension_%28data_warehouse%29) (attributes you can
filter and split on) for this datasource are flexible. It's configured for *schemaless dimensions*,
meaning it will accept any field in your JSON input as a dimension.

The metrics (also called
[measures](https://en.wikipedia.org/wiki/Measure_%28data_warehouse%29); values
you can aggregate) in this datasource are:

  * count
  * value_sum (derived from `value` in the input)
  * value_min (derived from `value` in the input)
  * value_max (derived from `value` in the input)

We've included a script that can generate some random sample metrics to load into this datasource.
To use it, simply run in your Druid distribution repository:

```bash
bin/generate-example-metrics | curl -XPOST -H'Content-Type: application/json' --data-binary @- http://localhost:8200/v1/post/metrics
```

Which will print something like:

```
{"result":{"received":25,"sent":25}}
```

This indicates that the HTTP server received 25 events from you, and sent 25 to Druid. Note that
this may take a few seconds to finish the first time you run it, as Druid resources must be
allocated to the ingestion task. Subsequent POSTs should complete quickly.

Once the data is sent to Druid, you can immediately [query it](#query-data).

## Query data

### Direct Druid queries

Druid supports a rich [family of JSON-based
queries](../querying/querying.html). We've included an example topN query
in `quickstart/wikiticker-top-pages.json` that will find the most-edited articles in this dataset:

```bash
curl -L -H'Content-Type: application/json' -XPOST --data-binary @quickstart/wikiticker-top-pages.json http://localhost:8082/druid/v2/?pretty
```

## Visualizing data

Druid is ideal for power user-facing analytic applications. There are a number of different open source applications to
visualize and explore data in Druid. We recommend trying [Pivot](https://github.com/implydata/pivot),
[Caravel](https://github.com/airbnb/caravel), or [Metabase](https://github.com/metabase/metabase) to start
visualizing the data you just ingested.

If you installed Pivot for example, you should be able to view your data in your browser at [localhost:9090](http://localhost:9090/).

### SQL and other query libraries

There are many more query tools for Druid than we've included here, including SQL
engines, and libraries for various languages like Python and Ruby. Please see [the list of
libraries](../development/libraries.html) for more information.

## Clustered setup

This quickstart sets you up with all services running on a single machine. The next step is to [load
your own data](ingestion.html). Or, you can skip ahead to [running a distributed cluster](cluster.html).
