---
---

## Getting Started
  * [Concepts](/docs/0.9.1-rc1/design/)
  * [Quickstart](/docs/0.9.1-rc1/tutorials/quickstart.html)
  * [Loading Data](/docs/0.9.1-rc1/tutorials/ingestion.html)
    * [Loading from Files](/docs/0.9.1-rc1/tutorials/tutorial-batch.html)
    * [Loading from Streams](/docs/0.9.1-rc1/tutorials/tutorial-streams.html)
    * [Loading from Kafka](/docs/0.9.1-rc1/tutorials/tutorial-kafka.html)
  * [Clustering](/docs/0.9.1-rc1/tutorials/cluster.html)

## Data Ingestion
  * [Data Formats](/docs/0.9.1-rc1/ingestion/data-formats.html)
  * [Data Schema](/docs/0.9.1-rc1/ingestion/index.html)
  * [Schema Design](/docs/0.9.1-rc1/ingestion/schema-design.html)
  * [Schema Changes](/docs/0.9.1-rc1/ingestion/schema-changes.html)
  * [Batch File Ingestion](/docs/0.9.1-rc1/ingestion/batch-ingestion.html)
  * [Stream Ingestion](/docs/0.9.1-rc1/ingestion/stream-ingestion.html)
    * [Stream Push](/docs/0.9.1-rc1/ingestion/stream-push.html)
    * [Stream Pull](/docs/0.9.1-rc1/ingestion/stream-pull.html)
  * [Updating Existing Data](/docs/0.9.1-rc1/ingestion/update-existing-data.html)
  * [FAQ](/docs/0.9.1-rc1/ingestion/faq.html)

## Querying
  * [Overview](/docs/0.9.1-rc1/querying/querying.html)
  * [Timeseries](/docs/0.9.1-rc1/querying/timeseriesquery.html)
  * [TopN](/docs/0.9.1-rc1/querying/topnquery.html)
  * [GroupBy](/docs/0.9.1-rc1/querying/groupbyquery.html)
  * [Time Boundary](/docs/0.9.1-rc1/querying/timeboundaryquery.html)
  * [Segment Metadata](/docs/0.9.1-rc1/querying/segmentmetadataquery.html)
  * [DataSource Metadata](/docs/0.9.1-rc1/querying/datasourcemetadataquery.html)
  * [Search](/docs/0.9.1-rc1/querying/searchquery.html)
  * [Select](/docs/0.9.1-rc1/querying/select-query.html)
  * Components
    * [Datasources](/docs/0.9.1-rc1/querying/datasource.html)
    * [Filters](/docs/0.9.1-rc1/querying/filters.html)
    * [Aggregations](/docs/0.9.1-rc1/querying/aggregations.html)
    * [Post Aggregations](/docs/0.9.1-rc1/querying/post-aggregations.html)
    * [Granularities](/docs/0.9.1-rc1/querying/granularities.html)
    * [DimensionSpecs](/docs/0.9.1-rc1/querying/dimensionspecs.html)
    * [Context](/docs/0.9.1-rc1/querying/query-context.html)
  * [Multi-value dimensions](/docs/0.9.1-rc1/querying/multi-value-dimensions.html)
  * [SQL](/docs/0.9.1-rc1/querying/sql.html)
  * [Joins](/docs/0.9.1-rc1/querying/joins.html)
  * [Multitenancy](/docs/0.9.1-rc1/querying/multitenancy.html)
  * [Caching](/docs/0.9.1-rc1/querying/caching.html)

## Design
  * [Overview](/docs/0.9.1-rc1/design/design.html)
  * Storage
    * [Segments](/docs/0.9.1-rc1/design/segments.html)
  * Node Types
    * [Historical](/docs/0.9.1-rc1/design/historical.html)
    * [Broker](/docs/0.9.1-rc1/design/broker.html)
    * [Coordinator](/docs/0.9.1-rc1/design/coordinator.html)
    * [Indexing Service](/docs/0.9.1-rc1/design/indexing-service.html)
    * [Realtime](/docs/0.9.1-rc1/design/realtime.html)
  * Dependencies
    * [Deep Storage](/docs/0.9.1-rc1/dependencies/deep-storage.html)
    * [Metadata Storage](/docs/0.9.1-rc1/dependencies/metadata-storage.html)
    * [ZooKeeper](/docs/0.9.1-rc1/dependencies/zookeeper.html)

## Operations
  * [Good Practices](/docs/0.9.1-rc1/operations/recommendations.html)
  * [Including Extensions](/docs/0.9.1-rc1/operations/including-extensions.html)
  * [Data Retention](/docs/0.9.1-rc1/operations/rule-configuration.html)
  * [Metrics and Monitoring](/docs/0.9.1-rc1/operations/metrics.html)
  * [Alerts](/docs/0.9.1-rc1/operations/alerts.html)
  * [Updating the Cluster](/docs/0.9.1-rc1/operations/rolling-updates.html)
  * [Different Hadoop Versions](/docs/0.9.1-rc1/operations/other-hadoop.html)
  * [Performance FAQ](/docs/0.9.1-rc1/operations/performance-faq.html)

## Configuration
  * [Common Configuration](/docs/0.9.1-rc1/configuration/index.html)
  * [Indexing Service](/docs/0.9.1-rc1/configuration/indexing-service.html)
  * [Coordinator](/docs/0.9.1-rc1/configuration/coordinator.html)
  * [Historical](/docs/0.9.1-rc1/configuration/historical.html)
  * [Broker](/docs/0.9.1-rc1/configuration/broker.html)
  * [Realtime](/docs/0.9.1-rc1/configuration/realtime.html)
  * [Configuring Logging](/docs/0.9.1-rc1/configuration/logging.html)
  * [Production Cluster Configuration](/docs/0.9.1-rc1/configuration/production-cluster.html)
  * [Production Hadoop Configuration](/docs/0.9.1-rc1/configuration/hadoop.html)
  * [Production Zookeeper Configuration](/docs/0.9.1-rc1/configuration/zookeeper.html)

## Development
  * [Overview](/docs/0.9.1-rc1/development/overview.html)
  * [Libraries](/docs/0.9.1-rc1/development/libraries.html)  
  * [Extensions](/docs/0.9.1-rc1/development/extensions.html)
  * [Build From Source](/docs/0.9.1-rc1/development/build.html)
  * [Versioning](/docs/0.9.1-rc1/development/versioning.html)
  * [Integration](/docs/0.9.1-rc1/development/integrating-druid-with-other-technologies.html)
  * Experimental Features
    * [Overview](/docs/0.9.1-rc1/development/experimental.html)
    * [Approximate Histograms and Quantiles](/docs/0.9.1-rc1/development/extensions-core/approximate-histograms.html)
    * [Datasketches](/docs/0.9.1-rc1/development/extensions-core/datasketches-aggregators.html)       
    * [Geographic Queries](/docs/0.9.1-rc1/development/geo.html)
    * [Router](/docs/0.9.1-rc1/development/router.html)
    * [Kafka Indexing Service](/docs/0.9.1-rc1/development/extensions-core/kafka-ingestion.html)


## Misc
  * [Papers & Talks](/docs/0.9.1-rc1/misc/papers-and-talks.html)
  * [Thanks](/thanks.html)
