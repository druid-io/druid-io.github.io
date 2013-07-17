---
title: Real&sup2;time Exploratory Analytics Layer
layout: default
id: home
---

+-- {.row-fluid}
|+-- {.span10 .offset1}
||+-- {.index-content}
|||Druid is open source infrastructure for Real&sup2;time Exploratory Analytics Layers. The system uses a distributed, shared-nothing architecture designed for real-time data ingestion. It leverages column-orientation and advanced indexing structures to allow for the arbitrary exploration of billion-row tables with sub-second latencies. 

+-- {.row-fluid .third}
|+-- {.span4 .third-item}
||[![meaningless markety image](img/realtime.jpg)](druid.html#realtime)
||[Real-time Ingestion](druid.html#realtime)
||Query data as it’s being read into Druid for insights into both immediate and historical data seamlessly.
|
|+-- {.span4 .third-item}
||[![meaningless markety image](img/scalable.jpg)](druid.html#scalable)
||[Scalable](druid.html#scalable)
||Scalable and available; consistent and predictable performance over large data sets.  Scale up to increase computation power, scale down to save on costs.
|
|+-- {.span4 .third-item}
||[![meaningless markety image](img/responsive.jpg)](druid.html#hri)
||[Real-time Queries](druid.html#hri)
||Ad-hoc slice-n-dice over N-dimensional data with consistent, fast response times.

+-- {.row-fluid .index-page}
|+-- {.span6 .content}
||## Querying is easy:
||+-- {.grey-box}
|||    {
|||      "queryType":"timeseries",
|||      "dataSource":"twitterstream",
|||      "intervals":["2013-07-20/2013-07-21"],
|||      "granularity":"hour",
|||      "aggregations":[
|||          { "type":"count", "name":"rows"},
|||          { "type":"doubleSum", "fieldName":"tweets", "name":"tweets"}
|||      ]
|||    }
|
|+-- {.span4 .offset1 .content}
||##Get Started
||[Tutorial](https://github.com/metamx/druid/wiki/Tutorial) - Setup a toy example and expand
