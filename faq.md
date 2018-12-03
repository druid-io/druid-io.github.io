---
title: Frequently Asked Questions
subtitle: Don't see your question here? <a href='/community'>Ask us</a>
layout: simple_page
sectionid: faq
---

### Is Druid a data warehouse? When should I use Druid over Redshift/BigQuery?

Druid is a new type of data store and isn’t a traditional data warehouse.
Although Druid incorporates architecture ideas from data warehouses such as
column-oriented storage, Druid also incorporates designs from search systems
and timeseries databases. Druid's architecture is designed to handle many use
cases that traditional data warehouses cannot.

Druid offers the following advantages over traditional data warehouses:

* Low latency streaming ingest, and direct integration with messages buses such as
Apache Kafka.
* Time-based partitioning, which enables performant time-based
queries.
* Fast search and filter, for fast ad-hoc slice and dice.
* Minimal schema design, and native support for semi-structured and nested data.

Consider using Druid over a data warehouse if you have streaming data, and
require low-latency ingest as well as low-latency queries. Also consider Druid
if you need ad-hoc analytics. Druid is great for slice and dice and drill
downs. Druid is also often used over a data warehouse to power interactive
applications, where support for high concurrency queries is required.

### Is Druid a SQL-on-Hadoop solution? When should I use Druid over Presto/Hive/Snowflake?

Druid supports SQL and can load data from Hadoop, but is not a SQL-on-Hadoop
system. Modern SQL-on-Hadoop solutions are used for the same use cases as data
warehouses, except they are designed for architectures where compute and
storage are separated systems, and data is loaded from storage into the compute
layer as needed by queries.

The previous section on Druid vs data warehouses also applies to Druid versus
SQL-on-Hadoop solutions.

### Is Druid a log aggregation/log search system? When should I use Druid over Elastic/Splunk?

Druid uses inverted indexes (in particular, compressed bitmaps) for fast searching and filtering, but it is not generally considered a search system.
While Druid contains many features commonly found in search systems, such as the ability to stream in structured and semi-structured data and the ability to search and filter the data, Druid isn’t commonly used to ingest text logs and run full text search queries over the text logs.
However, Druid is often used to ingest and analyze semi-structured data such as JSON.

Druid at its core is an analytics engine and as such, it can support numerical aggregations, groupBys (including multi-dimensional groupBys), and other analytic workloads faster and more efficiently than search systems.

### Is Druid a timeseries database? When should I use Druid over InfluxDB/OpenTSDB/Prometheus?

Druid does share some characteristics with timeseries databases, but also
combines ideas from analytic databases and search systems.  Like in timeseries
databases, Druid is optimized for data where a timestamp is present.  Druid
partitions data by time, and queries that include a time filter will be
significantly faster than those that do not.  Aggregating metrics and filtering
on dimensions (which are roughly equivalent to TSDBs' tags) are also very fast when a
time filter is present.  However, because Druid incorporates many architectural designs
from analytics databases and search systems, it can significantly
outperformance TSDBs when grouping, searching, and filtering on tags that are
not time, or when computing complex metrics such as histograms and quantiles.


### How is Druid deployed?

Druid can be deployed on commodity hardware in any *NIX based environment.
A Druid cluster consists of several different processes, each designed to do a small set of things very well (ingestion, querying, coordination, etc).
Many of these processes can be co-located and deployed together on the same hardware as described [here](/docs/latest/tutorials/quickstart).

Druid was initially created in the cloud, and runs well in AWS, GCP, Azure, and other cloud environments.


### Where does Druid fit in my existing Hadoop-based data stack?

Druid typically connects to a source of raw data such as a message bus such as Apache Kafka, or a filesystem such as HDFS.
Druid ingests an optimized, column-oriented, indexed copy of your data and serves analytics workloads on top of it.

A common streaming data oriented setup involving Druid looks like this:
Raw data → Kafka → Stream processor (optional, typically for ETL) → Kafka (optional) → Druid → Application/user

A common batch/static file oriented setup involving Druid looks like this:
Raw data → Kafka (optional) → HDFS → ETL process (optional) → Druid → Application/user

The same Druid cluster can serve both the streaming and batch path.


### Is Druid in-memory?

The earliest iterations of Druid didn’t allow for data to be paged in from and out to disk, so we often called it an “in-memory” system.
However, we very quickly realized that RAM hasn’t become cheap enough to actually store all data in RAM and sell a product at a price-point that customers are willing to pay.
Over the last few years, we have leveraged memory-mapping to allow us to page data between disk and memory and extend the amount of data a single node can load up to the size of its disks.

That said, as we made the shift, we didn’t want to compromise on the ability to configure the system to run such that everything is essentially in memory.
To this end, individual Historical nodes can be configured with the maximum amount of data they should be given.
Couple that with the Coordinator’s ability to assign data blocks to different “tiers” based on differing query requirements and Druid essentially becomes a system that can be configured across the whole spectrum of performance requirements.
Configuration can be such that all data can be in memory and processed, it can be such that data is heavily over-committed compared to the amount of memory available, and it can also be that the most recent month of data is in memory, while everything else is over-committed.
