---
title: Frequently Asked Questions
subtitle: Don't see your question here? <a href='/community.html'>Ask us</a>
layout: simple_page
sectionid: faq
---

### Is Druid a data warehouse? When should I use Druid over Redshift/BigQuery?

Druid is not a true data warehouse.
Although Druid incorporates architecture ideas from data warehouses, such as column-oriented storage, it does not support the full set of features that standard data warehouses do, such as complex joins.
Data warehouses are optimized for supporting complex SQL queries where results may take minutes or hours to complete.
In exchange for the flexibility, data warehouses are rarely used to power interactive UIs.
Data warehouses further lack true streaming ingest capability, or strong multi-tenancy support (supporting queries from thousands of concurrent users).

Druid is optimized for sub-second queries to slice-and-dice, drill down, search, filter, and aggregate event streams.
Druid is commonly used to power interactive applications where performance, concurrency, and uptime are important.

Consider using Druid over a data warehouse if your use case involves powering an interactive application, where many users will be making concurrent queries for the data.
Consider using Druid if your data is primarily operational, where you will need to explain trends and patterns, or troubleshoot issues.


### Is Druid a SQL-on-Hadoop solution? When should I use Druid over Presto/Hive?

Druid supports SQL and can load data from Hadoop, but it is not considered a SQL-on-Hadoop system.
In most SQL-on-Hadoop solutions, compute and storage are separated systems.
By contrast, in Druid, compute and storage are colocated to maximize performance.

The use cases of SQL-on-Hadoop solutions are identical to traditional data warehouses, and the previous section on Druid vs data warehouses still holds true.


### Is Druid a log aggregation/log search system? When should I use Druid over Elastic/Splunk?

Druid uses inverted indexes (in particular, compressed bitmaps) for fast searching and filtering, but it is not generally considered a search system.
While Druid contains many features commonly found in search systems, such as the ability to stream in structured and semi-structured data and the ability to search and filter the data, Druid isn’t commonly used to ingest text logs and run full text search queries over the text logs.
However, Druid is often used to ingest and analyze semi-structured data such as JSON.

Druid at its core is an analytics engine and as such, it can support numerical aggregations, groupBys (including multi-dimensional groupBys), and other analytic workloads faster and more efficiently than search systems.


### Is Druid a timeseries database? When should I use Druid over InfluxDB/OpenTSDB/Prometheus?

Druid is an analytics engine, but it does share some characteristics with timeseries databases.
Like in timeseries databases, Druid is optimized for data where a timestamp is present.
Druid partitions data by time, and queries that include a time filter will be significantly faster than those that do not.
Aggregating metrics and filtering on dimensions (which are roughly equivalent to TSDBs' tags) is very fast when a time filter is present.


### How is Druid deployed?

Druid can be deployed on commodity hardware in any *NIX based environment.
A Druid cluster consists of several different processes, each designed to do a small set of things very well (ingestion, querying, coordination, etc).
Many of these processes can be co-located and deployed together on the same hardware as described [here](/docs/latest/tutorials/quickstart.html).


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
