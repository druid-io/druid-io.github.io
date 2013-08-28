---
published: false
layout: post
---

## A New Post\n\nEnter text in [Markdown](http://daringfireball.net/projects/markdown/). Use the toolbar above, or click the **?** button for formatting help.
## About Druid ##
Druid is a rockin' analytical data store capable of interactively querying big data as it updates in realtime. Druid drives the Metamarkets platform and Metamarkets is committed to developing Druid in open source.

Druid is available [here](https://github.com/metamx/druid).

## Introduction ##

In our last post, we got a realtime node working with example Twitter data. Now it's time to load our own data to see how Druid performs. Druid can ingest data in three ways: via Kafka and a realtime node, via the indexing service, and via the Hadoop batch loader. Data is ingested in realtime using a [Firehose](https://github.com/metamx/druid/wiki/Firehose). In this post we'll outline how to ingest data from Kafka in realtime using the Kafka Firehose.

## Create Config Directories ##
Each type of node needs its own config file and directory, so create these subdirectories under the druid directory.

```bash
mkdir config
mkdir config/realtime
```

## Loading Data with Kafka ##

[KafkaFirehoseFactory](https://github.com/metamx/druid/blob/master/realtime/src/main/java/com/metamx/druid/realtime/firehose/KafkaFirehoseFactory.java) is how druid communicates with Kafka. Using this Firehose with the right configuration, we can import data into Druid in realtime without writing any code. To load data to a realtime node via Kafka, we'll first need to initialize Zookeeper and Kafka, and then configure and initialize a Realtime node.

### Booting Kafka ###

Instructions for booting a Zookeeper and then Kafka cluster are available [here](http://kafka.apache.org/07/quickstart.html).

1. Download Apache Kafka 0.7.2 from [http://static.druid.io/artifacts/kafka-0.7.2-incubating-bin.tar.gz](http://static.druid.io/artifacts/kafka-0.7.2-incubating-bin.tar.gz)
```bash
wget http://static.druid.io/artifacts/kafka-0.7.2-incubating-bin.tar.gz
tar -xvzf kafka-0.7.2-incubating-bin.tgz
cd kafka-0.7.2-incubating-bin
```
2. Boot Zookeeper and Kafka
```bash
cat config/zookeeper.properties
bin/zookeeper-server-start.sh config/zookeeper.properties
# in a new console
bin/kafka-server-start.sh config/server.properties
```
3. In a new console, launch the kafka console producer (so you can type in JSON kafka messages in a bit)
```bash
bin/kafka-console-producer.sh --zookeeper localhost:2181 --topic druidtest
```
### Launching a Realtime Node

1. Create a valid configuration file similar to this called config/realtime/runtime.properties:

```bash
druid.host=127.0.0.1
druid.port=8080

com.metamx.emitter.logging=true

druid.processing.formatString=processing_%s
druid.processing.numThreads=1
druid.processing.buffer.sizeBytes=10000000

druid.service=example

druid.request.logging.dir=/tmp/example/log
druid.realtime.specFile=realtime.spec
com.metamx.emitter.logging=true
com.metamx.emitter.logging.level=info

com.metamx.aws.accessKey=dummy_access_key
com.metamx.aws.secretKey=dummy_secret_key
druid.pusher.s3.bucket=dummy_s3_bucket

druid.zk.service.host=localhost
druid.server.maxSize=300000000000
druid.zk.paths.base=/druid
druid.database.segmentTable=prod_segments
druid.database.user=user
druid.database.password=diurd
druid.database.connectURI=
druid.host=127.0.0.1:8080
```

2. Create a valid realtime configuration file similar to this called realtime.spec:

```json
[{
  "schema" : { "dataSource":"druidtest",
               "aggregators":[ {"type":"count", "name":"impressions"},
                                  {"type":"doubleSum","name":"wp","fieldName":"wp"}],
               "indexGranularity":"minute",
           "shardSpec" : { "type": "none" } },
  "config" : { "maxRowsInMemory" : 500000,
               "intermediatePersistPeriod" : "PT10m" },
  "firehose" : { "type" : "kafka-0.7.2",
                 "consumerProps" : { "zk.connect" : "localhost:2181",
                                     "zk.connectiontimeout.ms" : "15000",
                                     "zk.sessiontimeout.ms" : "15000",
                                     "zk.synctime.ms" : "5000",
                                     "groupid" : "topic-pixel-local",
                                     "fetch.size" : "1048586",
                                     "autooffset.reset" : "largest",
                                     "autocommit.enable" : "false" },
                 "feed" : "druidtest",
                 "parser" : { "timestampSpec" : { "column" : "utcdt", "format" : "iso" },
                              "data" : { "format" : "json" },
                              "dimensionExclusions" : ["wp"] } },
  "plumber" : { "type" : "realtime",
                "windowPeriod" : "PT10m",
                "segmentGranularity":"hour",
                "basePersistDirectory" : "/tmp/realtime/basePersist",
                "rejectionPolicy": {"type": "messageTime"} }

}]
```

3. Launch the realtime node
```bash
java -Xmx256m -Duser.timezone=UTC -Dfile.encoding=UTF-8 \
-Ddruid.realtime.specFile=realtime.spec \
-classpath services/target/druid-services-0.5.6-SNAPSHOT-selfcontained.jar:config/realtime \
com.metamx.druid.realtime.RealtimeMain
```
4. Paste data into the Kafka console producer
```json
{"utcdt": "2010-01-01T01:01:01", "wp": 1000, "gender": "male", "age": 100}
{"utcdt": "2010-01-01T01:01:02", "wp": 2000, "gender": "female", "age": 50}
{"utcdt": "2010-01-01T01:01:03", "wp": 3000, "gender": "male", "age": 20}
{"utcdt": "2010-01-01T01:01:04", "wp": 4000, "gender": "female", "age": 30}
{"utcdt": "2010-01-01T01:01:05", "wp": 5000, "gender": "male", "age": 40}
```
5. Watch the events as they are ingested by Druid's realtime node
```bash
...
2013-06-17 21:41:55,569 INFO [Global--0] com.metamx.emitter.core.LoggingEmitter - Event [{"feed":"metrics","timestamp":"2013-06-17T21:41:55.569Z","service":"example","host":"127.0.0.1","metric":"events/processed","value":5,"user2":"druidtest"}]
...
```
6. In a new console, edit a file called query.body:
```json
{
    "queryType": "groupBy",
    "dataSource": "druidtest",
    "granularity": "all",
    "dimensions": [],
    "aggregations": [
        { "type": "count", "name": "rows" },
        {"type": "longSum", "name": "imps", "fieldName": "impressions"},
        {"type": "doubleSum", "name": "wp", "fieldName": "wp"}
    ],
    "intervals": ["2010-01-01T00:00/2020-01-01T00"]
}
```
7. Submit the query via curl
```bash
curl -X POST "http://localhost:8080/druid/v2/?pretty" \
-H 'content-type: application/json' -d @query.body
```
8. View Result!
```json
[ {
  "timestamp" : "2010-01-01T01:01:00.000Z",
  "result" : {
    "imps" : 20,
    "wp" : 60000.0,
    "rows" : 5
  }
} ]
```
Congratulations, you've queried the data we just loaded! In our next post, we'll move on to Querying our Data.