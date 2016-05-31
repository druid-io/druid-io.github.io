---
layout: doc_page
---

# 集群

Druid可以用来部署到可扩展和容错的集群。

在这篇文档中，我们将建立一个简单的集群并讨论它如何进一步通过配置来满足你的需求。这个简单的集群由可扩展和容错的多个服务器作为Historicals和MiddleManagers，并且由一台协调服务器来作为Coordinator和Overlord进程的主机。在实际应用中，我们也建议在容错服务器中部署Coordinators和Overlords。

## 选择硬件

Coordinator和Overlord进程可以都部署在一台服务器上，负责处理元数据和集群协调需求。
像AWS [m3.xlarge](https://aws.amazon.com/ec2/instance-types/#M3) 就足够满足大多数集群。硬件配置：

- 4 vCPUs
- 15 GB RAM
- 80 GB SSD storage

Historicals和 MiddleManagers可以都部署在一台服务器上，用来处理集群中的实际数据。 这些服务器得益于CPU、RAM和SSD。像AWS [r3.2xlarge](https://aws.amazon.com/ec2/instance-types/#r3)就是一个好的开始。 硬件配置：

- 8 vCPUs
- 61 GB RAM
- 160 GB SSD storage

Druid的Brokers节点接受查询并将它们分发到剩下的集群。这些服务器得益于CPU和RAM，并且也能够部署在AWS [r3.2xlarge](https://aws.amazon.com/ec2/instance-types/#r3)。硬件配置如下：

- 8 vCPUs
- 61 GB RAM
- 160 GB SSD storage

在运行着Broker节点的服务器上，你可以考虑把任何开源的UI和查询库部署在同一台上面。

超大集群应该考虑选择更大的服务器。

## 选择操作系统

我们建议使用你最喜爱的Linux发行版本。你也需要：

  * Java 7 及以上

操作系统的包管理器应该能够给Java提供帮助。如果基于Ubuntu的操作系统没有最近的Java版本，WebUpd8提供[为这些操作系统准备的包](http://www.webupd8.org/2012/09/install-oracle-java-8-in-ubuntu-via-ppa.html)。

## 下载发行版本

首先，下载并解压文件。 最好先在单独一台机器上做，当你编辑完配置文件后，就可以复制修改过的套件到所有服务器中。

```bash
curl -O http://static.druid.io/artifacts/releases/druid-0.9.0-bin.tar.gz
tar -xzf druid-0.9.0-bin.tar.gz
cd druid-0.9.0
```

在这个包中，你将看到：


* `LICENSE` - 许可证文件。
* `bin/` - [单机快速开始](quickstart.html)的相关脚本。
* `conf/*` - 建立集群的模板配置。
* `conf-quickstart/*` - configurations for the [单机快速开始]的配置(quickstart.html)。
* `extensions/*` - 所在Druid的扩展。
* `hadoop-dependencies/*` - Druid与Hadoop依赖关系。
* `lib/*` - Druid核心包含的所有软件包。
* `quickstart/*` - [单机快速开始](quickstart.html)的相关文件。

我们将编辑 `conf/`中的文件来启动服务。

## 配置deep storage

Druid依赖分布式文件系统或者大对象（blob）仓库用来数据存储。最常用的deep storage接口服务是AWS的S3和Hadoop的HDFS。

### S3

在`conf/druid/_common/common.runtime.properties`,

- 设置 `druid.extensions.loadList=["druid-s3-extensions"]`.

- 在"Deep Storage"和"Indexing service logs"条件下，把local storage配置注释掉。

- 为"Deep Storage"和"Indexing service logs"的"S3"部分取消注释并配置适当的值。

之后，你会得到如下的配置：

```
druid.extensions.loadList=["druid-s3-extensions"]

#druid.storage.type=local
#druid.storage.storageDirectory=var/druid/segments

druid.storage.type=s3
druid.storage.bucket=your-bucket
druid.storage.baseKey=druid/segments
druid.s3.accessKey=...
druid.s3.secretKey=...

#druid.indexer.logs.type=file
#druid.indexer.logs.directory=var/druid/indexing-logs

druid.indexer.logs.type=s3
druid.indexer.logs.s3Bucket=your-bucket
druid.indexer.logs.s3Prefix=druid/indexing-logs
```

### HDFS

在`conf/druid/_common/common.runtime.properties`,

- 设置`druid.extensions.loadList=["io.druid.extensions:druid-hdfs-storage"]`.

- 在"Deep Storage"和"Indexing service logs"条件下，把local storage配置注释掉。

- 为"Deep Storage"和"Indexing service logs"的"HDFS"部分取消注释并配置适当的值。

之后，你会得到如下的配置：

```
druid.extensions.loadList=["druid-hdfs-storage"]

#druid.storage.type=local
#druid.storage.storageDirectory=var/druid/segments

druid.storage.type=hdfs
druid.storage.storageDirectory=/druid/segments

#druid.indexer.logs.type=file
#druid.indexer.logs.directory=var/druid/indexing-logs

druid.indexer.logs.type=hdfs
druid.indexer.logs.directory=/druid/indexing-logs
```

同样，

- 把Hadoop配置的XML文件 (core-site.xml, hdfs-site.xml, yarn-site.xml,
mapred-site.xml) 放到Druid节点的classpath中。你可以复制它们到`conf/druid/_common/`。

## 配置Tranquility Server (可选的)

数据流可以通过简单的Tranquility Server支持的HTTP API发送到Druid。如果你使用这项功能，你需要 [配置Tranquility Server](../ingestion/stream-ingestion.html#server)。

## 配置Tranquility Kafka (可选的)

Druid可以通过Tranquility Kafka从Kafka消费数据流。如果你使用这项功能，你需要
[配置Tranquility Kafka](../ingestion/stream-ingestion.html#kafka)。

## 配置连接到Hadoop (可选的)

如果你从Hadoop集群加载数据，你需要配置Druid知道你的集群：

-  在 `conf/middleManager/runtime.properties`中，更新`druid.indexer.task.hadoopWorkingPath`为索引过程中用于临时文件需要的HDFS的路径。
`druid.indexer.task.hadoopWorkingPath=/tmp/druid-indexing`是普遍选择。

- 把Hadoop配置XML文件 (core-site.xml, hdfs-site.xml, yarn-site.xml,
mapred-site.xml)放到Druid节点的classpath中。你可以通过复制它们
`conf/druid/_common/core-site.xml`, `conf/druid/_common/hdfs-site.xml`, 等方式。

我们注意到，为了从Hadoop加载数据，你不需要使用HDFS Deep Storage。例如，如果你的集群在Amazon Web Services上运行，当你使用Hadoop或者Elastic MapReduce加载数据，我们建议使用S3作为Deep Storage。

获取更多信息，请看[batch ingestion](../ingestion/batch-ingestion.html)。

## 配置Druid coordination地址

在简单集群中，你将在同一台服务器部署1个Druid Coordinator、1个Druid Overlord、1个ZooKeeper实例和1个嵌入Derby的元数据仓库。

在`conf/druid/_common/common.runtime.properties`，用运行ZK实例机器的IP地址替换"zk.host.ip"：

- `druid.zk.service.host`

在`conf/_common/common.runtime.properties`， 用元数据仓库服务器的IP替换
"metadata.store.ip":

- `druid.metadata.storage.connector.connectURI`
- `druid.metadata.storage.connector.host`

<div class="note caution">
在实际应用中，我们建议使用2台服务器，分别都运行1个Druid Coordinator和1个Druid Overlord。我们同时建议在专用服务器上运行ZooKeeper集群，[元数据仓库](http://druid.io/docs/latest/dependencies/metadata-storage.html) 如 MySQL 和PostgreSQL也需要在专用服务器上运行。
</div>

## 协调用作查询服务的Druid进程

Druid的Historicals和MiddleManagers可以部署在同一台服务器上。 这两个Druid进程得益于所在服务器的协调。 如果你运行Tranquility Server或者Kafka，你也可以将Tranquility部署在这台服务器上。
如果你使用[r3.2xlarge](https://aws.amazon.com/ec2/instance-types/#r3)
EC2实例或者相似硬件，发行版中的配置将是很合适的。

如果你使用不同硬件，我们建议调整配置文件来适应你的硬件。常用的配置调整如下：

- `-Xmx` 和 `-Xms`
- `druid.server.http.numThreads`
- `druid.processing.buffer.sizeBytes`
- `druid.processing.numThreads`
- `druid.query.groupBy.maxIntermediateRows`
- `druid.query.groupBy.maxResults`
- Historical节点的`druid.server.maxSize` 和 `druid.segmentCache.locations`
- MiddleManagers的`druid.worker.capacity` 

<div class="note info">
保持 -XX:MaxDirectMemory >= numThreads*sizeBytes, 否则Druid将启动失败。
</div>

所有可能配置选项的完整描述请参照Druid[配置文档](../configuration/index.html)。

## 协调Druid Brokers

Druid的Brokers也是得益所在服务器的协调。如果你使用[r3.2xlarge](https://aws.amazon.com/ec2/instance-types/#r3) EC2实例或者相似硬件，发行版中的配置将是很合适的。

如果你使用不同硬件，我们建议调整配置文件来适应你的硬件。常用的配置调整如下：

- `-Xmx` 和 `-Xms`
- `druid.server.http.numThreads`
- `druid.cache.sizeInBytes`
- `druid.processing.buffer.sizeBytes`
- `druid.processing.numThreads`
- `druid.query.groupBy.maxIntermediateRows`
- `druid.query.groupBy.maxResults`

<div class="note caution">
保持 -XX:MaxDirectMemory >= numThreads*sizeBytes，否则Druid将启动失败。
</div>

所有可能配置选项的完整描述请参照Druid[配置文档](../configuration/index.html)。

## 启动Coordinator、Overlord、Zookeeper和 metadata store

复制Druid发行版和你编辑过的配置文件到你的协调服务器。如果你已经在本地编辑过配置，你可以使用 *rsync* 来复制它们：

```bash
rsync -az druid-0.9.0/ COORDINATION_SERVER:druid-0.9.0/
```

登录你的协调服务器并安装Zookeeper：

```bash
curl http://www.gtlib.gatech.edu/pub/apache/zookeeper/zookeeper-3.4.6/zookeeper-3.4.6.tar.gz -o zookeeper-3.4.6.tar.gz
tar -xzf zookeeper-3.4.6.tar.gz
cd zookeeper-3.4.6
cp conf/zoo_sample.cfg conf/zoo.cfg
./bin/zkServer.sh start
```

<div class="note caution">
在实际应用中，我们也建议使用专用服务器来运行ZooKeeper集群。
</div>

在你的协调服务器上， *cd* 到发行版本并启动协调服务（你应当在不同的窗口做，或者输出日志文件）：

```bash
java `cat conf/druid/coordinator/jvm.config | xargs` -cp conf/druid/_common:conf/druid/coordinator:lib/* io.druid.cli.Main server coordinator
java `cat conf/druid/overlord/jvm.config | xargs` -cp conf/druid/_common:conf/druid/overlord:lib/* io.druid.cli.Main server overlord
```

当每个服务启动时，你可以看到一条它们的消息日志打印了出来。你可以在`var/log/druid` 目录使用其它终端查看任何服务的详细日志。

## 启动Historicals和MiddleManagers

复制Druid发行版本和你编辑过的配置文件到用于Historicals和MiddleManagers的服务器。

在每一台服务器上， *cd* 到发行版本并且运行以下命令启动数据服务器：

```bash
java `cat conf/druid/historical/jvm.config | xargs` -cp conf/druid/_common:conf/druid/historical:lib/* io.druid.cli.Main server historical
java `cat conf/druid/middleManager/jvm.config | xargs` -cp conf/druid/_common:conf/druid/middleManager:lib/* io.druid.cli.Main server middleManager
```

根据需求，你可以添加更多的服务器用作Druid的Historicals和 MiddleManagers。

<div class="note info">
作为复杂数据源分配需要的集群，你可以分离 Historicals和MiddleManagers，并且分离组件。这也允许你利用Druid内置的MiddleManager AutoScaling功能。
</div>

如果你使用Kafka或者通过HTTP推送数据流的方式，你也可以在MiddleManagers和Historicals的所在的服务器上启动Tranquility Server。对于大规模应用，MiddleManagers和 Tranquility Server始终可以部署在一起。如果你在流处理器运行Tranquility（非服务），你可以将Tranquility和流处理器放到一起，并且不需要Tranquility Server。

```bash
curl -O http://static.druid.io/tranquility/releases/tranquility-distribution-0.7.4.tgz
tar -xzf tranquility-distribution-0.7.4.tgz
cd tranquility-distribution-0.7.4
bin/tranquility <server or kafka> -configFile <path_to_druid_distro>/conf/tranquility/<server or kafka>.json
```

## 启动Druid Broker

复制Druid发行版本和你编辑过的配置文件到用于Druid Brokers的服务器。

在每一台机器上， *cd* 到发行版本并运行以下命令启动1个Broker（你可能想输出日志文件）：

```bash
java `cat conf/druid/broker/jvm.config | xargs` -cp conf/druid/_common:conf/druid/broker:lib/* io.druid.cli.Main server broker
```

根据加载的查询需要，你可以增加更多的Brokers。

## 加载数据

恭喜，现在你拥有了1个Druid集群！下一步将是学习推荐的方式来加载数据到基于用例的Druid。了解更多[加载数据](ingestion.html)。
