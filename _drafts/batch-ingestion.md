---
title: Batch-Loading Sensor Data into Druid
published: false
layout: post 
author: Igal Levy
tags: #sensors #usgs #druid #analytics #querying #bigdata, #datastore
---

Sensors are everywhere these days, and that means sensor data is big data. Ingesting and analyzing sensor data at speed is an interesting problem, especially when scale is desired. In this post, we'll access some real-world sensor data, and show how Druid can be used to store that data and make it available for immediate querying.

## Finding Sensor Data
The United States Geological Survey (USGS) has millions of sensors for all types of physical and natural phenomena, many of which concern water. If you live anywhere where water is a concern, which is pretty much everywhere (considering that both too little or too much H<sub>2</sub>O can be an issue), this is interesting data. You can learn about USGS sensors in a variety of ways, one of which is an [interactive map](http://maps.waterdata.usgs.gov/mapper/index.html).

We used this map to get the sensor info for the Napa River in Napa County, California.

<img src="img/map-usgs-napa.png"  alt"USGS map showing Napa River sensor location and information" title="USGS Napa River Sensor Information" style="width: 700px; height: 374px">

We decided to first import the data into [R (the statistical programming language)](http://www.r-project.org/) for two reasons:

* The R package `waterData` from USGS. This package allows us to retrieve and analyze hydrologic data from USGS. We can then export that data from within the R environment, then set up Druid to ingest it.
* The R package `RDruid` which we've [blogged about before](2014-2-3-rdruid-and-twitterstream.html). This package allows us to query Druid from within the R environment.

## Extracting the Streamflow Data
In R, load the waterData package, then run `importDVs()`:

```r
> install.packages("waterData")
...
> library(waterData)
...
> napa_flow <- importDVs("11458000", code="00060", stat="00003", sdate="1963-01-01", edate="2013-12-31")
```
The last line uses the function `waterData.importDVs()` to get sensor (or "streamgage") data directly from the USGS datasource. This function has the following arguments:

* staid, or site identification number, which is entered as a string due to the fact that some IDs have leading 0s. This value was obtained from the interactive map discussed above.
* code, which specifies the type of sensor data we're interested in (if available). Our chosen code specifies measurement of discharge, in cubic feet per second. You can learn about codes at the [USGS Water Resources site](http://nwis.waterdata.usgs.gov/usa/nwis/pmcodes).
* stat, which specifies the type of statistic we're looking for&mdash;in this case, the mean daily flow (mean is the default statistic). The USGS provides [a page summarizing various types of codes and parameters](http://help.waterdata.usgs.gov/codes-and-parameters).
* start and end dates. 

The information on the specific site and sensor should provide information on the type of data available and the start-end dates for the full historical record.

You can now analyse and visualize the streamflow data. For example, we ran:

```r
> myWater.plot <- plotParam(napa_flow)
> print(myWater.plot)
```

to get:

![map-usgs-napa.png]

Reflected in the flow of the Napa River, you can see the severe drought California experienced in the late 1970s, the very wet years that followed, a less severe drought beginning in the late 1980s, and the beginning of the current drought.

## Transforming the Data for Druid
We first want to have a look at the content of the data frame:

```r
> head(napa_flow)
     staid val      dates qualcode
1 11458000  90 1963-01-01        A
2 11458000  87 1963-01-02        A
3 11458000  85 1963-01-03        A
4 11458000  80 1963-01-04        A
5 11458000  76 1963-01-05        A
6 11458000  75 1963-01-06        A
```

We don't have any use for the qualcode (the [Daily Value Qualification Code](http://help.waterdata.usgs.gov/codes-and-parameters/daily-value-qualification-code-dv_rmk_cd)), column:

```r
> napa_flow_subset <- napa_flow[,c(1:3)]
```

It may look like we also don't need the staid column, either, since it's all the same sensor ID. However, we'll keep it because at some later time we may want similar data from other sensors.

Now we can export the data to a file, removing the header and row names:

```r
write.table(napa_flow_subset, file="~/napa-flow.tsv", sep="\t", col.names = F, row.names = F)
```

And here's our file:

```bash
$ head ~/napa-flow.tsv 
"11458000"	90	1963-01-01
"11458000"	87	1963-01-02
"11458000"	85	1963-01-03
"11458000"	80	1963-01-04
"11458000"	76	1963-01-05
"11458000"	75	1963-01-06
"11458000"	73	1963-01-07
"11458000"	71	1963-01-08
"11458000"	65	1963-01-09
"11458000"	59	1963-01-10
```

## Loading the Data into Druid
Loading the data into Druid involves setting up Druid's indexing service to ingest the data into the Druid cluster, where specialized nodes will manage it.

### Configure the Indexing Task
Druid has an indexing service that can load data. Since there's a relatively small amount of data to ingest, we're going to use the [basic Druid indexing service](http://druid.io/docs/latest/Batch-ingestion.html) to ingest it. (Another option to ingest data uses a Hadoop cluster and is set up in a similar way, but that is more than we need for this job.) We must create a task (in JSON format) that specifies the work the indexing service will do:

```json
{
  "type" : "index",
  "dataSource" : "usgs",
  "granularitySpec" : {
    "type" : "uniform",
    "gran" : "MONTH",
    "intervals" : [ "1963-01-01/2013-12-31" ]
  },
  "aggregators" : [{
     "type" : "count",
     "name" : "count"
    }, {
     "type" : "doubleSum",
     "name" : "avgFlowCuFtsec",
     "fieldName" : "val"
  }],
  "firehose" : {
    "type" : "local",
    "baseDir" : "examples/usgs/",
    "filter" : "napa-flow-subset.tsv",
    "parser" : {
      "timestampSpec" : {
        "column" : "dates"
      },
      "data" : {
        "type" : "tsv",
        "columns" : ["staid","val","dates"],
        "dimensions" : ["staid","val"]
      }
    }
  }
}
``` 

The taks is saved to a file, `usgs_index_task.json`. Note a few things about this task:

* granularitySpec sets [segment](http://druid.io/docs/latest/Concepts-and-Terminology.html) granularity to MONTH, rather than using the default DAY, even though each row of our data is a daily reading. We do this to avoid having Druid create a segment per row of data. That's a lot of extra work (note the interval is "1963-01-01/2013-12-31"), and we simply don't need that much granularity to make sense of this data for a broad view. Setting the granularity to MONTH causes Druid to roll up data into monthly segments that each provide a monthly average of the flow value.

    A different granularity setting for the data itself ([indexGranularity](http://druid.io/docs/latest/Tasks.html)) controls how the data is rolled up before it is chunked into segments. This granularity, which defaults to "MINUTE", won't affect our data, which consists of daily values.
* We specify aggregators that Druid will use as *metrics* to summarize the data. "count" is a built-in metric that counts the raw number of rows on ingestion, and the Druid rows (after rollups) after processing. We've added a metric to summarize "val" from our water data.
* The firehose section specifies out data source, which in this case is a file. If our data existed in multiple files, we could have set "filter" to "*.tsv".
* We have to specify the timestamp column so Druid knows.
* We also specify the format of the data ("tsv"), what the columns are, and which to treat as dimensions. Dimensions are the values that describe our data.

## Start a Druid Cluster and Post the Task
Before submitting this task, we must start a small Druid cluster consisting of the indexing service, a Coordinator node, and a Historical node. Instructions on how to set up and start a Druid cluster are in the [Druid documentation](http://druid.io/docs/latest/Tutorial:-Loading-Your-Data-Part-1.html).

Once the cluster is ready, the task is submitted to the indexer's REST service (showing the relative path to the task file):

```bash
$ curl -X 'POST' -H 'Content-Type:application/json' -d @examples/usgs/usgs_index_task.json localhost:8087/druid/indexer/v1/task
```

## Verify Success
If the task is accepted, a message similar to the following should appear almost immediately:

    {"task":"index_usgs_2014-03-06T22:12:38.803Z"}

The indexing service (or "overlord") should log a message similar to the following:

    2014-03-06 22:13:14,495 INFO [pool-6-thread-1] io.druid.indexing.overlord.TaskQueue - Task SUCCESS: IndexTask{id=index_usgs_2014-03-06T22:12:38.803Z, type=index, dataSource=usgs} (30974 run duration)

This shows that the data is in Druid. You'll see messages in the other nodes' logs concerning the "usgs" data. We can further verify this by going to the overlord's console (http://&lt;host>:8087/console.html) to view information about the task, and the Coordinator's console (http://&lt;host>:8082) to view metadata about the individual segments.

We can also verify the data by querying Druid. Here's a simple time-boundary query:

```json
{
    "queryType": "timeBoundary", 
    "dataSource": "usgs"
}
```

Saved in a file called `tb-query.body`, it can then be submitted to Druid:

```bash
$ curl -X POST 'http://localhost:8081/druid/v2/?pretty' -H 'content-type: application/json' -d @examples/usgs/tb-query.body
```

The response should be:

```json
[ {
  "timestamp" : "1963-01-01T00:00:00.000Z",
  "result" : {
    "minTime" : "1963-01-01T00:00:00.000Z",
    "maxTime" : "2013-12-31T00:00:00.000Z"
  }
} ]
```

You can learn about submitting more complex queries in the [Druid documentation](http://druid.io/docs/latest/Tutorial:-All-About-Queries.html).
 
## What to Try Next: Something More Akin to a Production System
For the purposes of demonstration, we've cobbled together a simple system for manually fetching, mutating, loading, analyzing, storing, and then querying (for yet more analysis) data. But this would hardly be anyone's idea of a production system.

The USGS has REST-friendly services for accessing various realtime and historical data, including [water data](http://waterservices.usgs.gov/rest/IV-Service.html). We could conceivably set up a data ingestion stack that fetches that data, feeds it to a messaging queue (e.g., Apache Kafka) and then process it and moves it on to Druid via a specialized framework (e.g., Apache Storm). Then we could query the system to generate both realtime statuses of various water-related conditions (e.g., change in pollutant levels, flood potential, etc.) as well as visualizations for historical comparison.