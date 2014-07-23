---
title: Benchmarking Druid
layout: post
author: Xavier Léauté
published: true
---

We often get asked how fast Druid is. Despite having published some benchmark
numbers in [previous blog posts][scaling-druid], as well as in our [talks][],
until now, we have not actually published any data to back those claims up in in a
reproducible way. This post intends to address this and make it easier for
anyone to evaluate Druid and compare it to other systems out there.

Hopefully this blog post will help people get an idea of where Druid stands in
terms of query performance, how it performs under different scenarios, and what
the limiting factors may be under different configurations.

The objective of our benchmark is to showcase how Druid performs on the types
of workload it was designed for. We chose to benchmark Druid against MySQL
mainly because of its popularity, and to provide a point of comparison with
a storage engine that most users will be familiar with.

All the code to run the benchmarks as well as the [raw result data][results] are
available on GitHub in the [druid-benchmark][] repository.

> We would like to encourage our readers to run the benchmarks themselves and
> share results for different data stores and hardware setups, as well as any
> other optimizations that may prove valuable to the rest of the community or
> make this benchmark more representative.

## The Data

Our objective is to make this benchmark reproducible, so we want a data set
that is readily available or that could easily be re-generated. The [TPC-H
benchmark][] is commonly used to assess database performance, and the generated
data set can be of any size, which makes it attractive to understand how Druid
performs at various scales.

The majority of the data consists of time-based event records, which are
relatively simple to map to the Druid data model and also suits the type of
workload Druid was designed for.

The events in question span several years of daily data and include a varied set
of dimensions and metrics, including both very high cardinality and low
cardinality dimensions. For instance, the `l_partkey` column has 20,272,236
unique values, and `l_commitdate` has 2466 distinct dates in the 100GB dat
set.

The 1GB and 100GB data sets represent a total of 6,001,215 rows and 600,037,902
rows respectively.

## The Queries

Since Druid was built to solve a specific type of problem, we chose a set of
benchmarks typical of Druid's workload that covers the majority of queries we
observe in production. Why not use the TPC-H benchmark queries, you may ask?
Most of those queries do not directly apply to Druid, and we would have to
largely modify the queries or the data to fit the Druid model.

We put together three sets queries:

-  Simple `select count(*)` queries over very large time ranges, covering
   almost all the data set
-  Aggregate queries with one or several metrics, spanning the entire set of
   rows, as well subsets on both time ranges and filtered dimension values.
-  Top-N queries on both high and low cardinality dimensions, with various
   number of aggretions and filters.

The SQL equivalent of the Druid queries is shown below. Druid queries are
generated directly in our [benchmarking script][] using [RDruid][].

<script src="https://gist.github.com/xvrl/9552286.js?file=queries.sql"></script>

## Generating the data

We used the suite of [TPC-H tools][] suite of tools to generate two datasets, with
a target size of 1GB and 100GB respectively. The actual size of the resulting
table are 725MB and 74GB respectively, since we only generate the largest table
in the benchmark data set. The 100GB dataset is split into 1GB chunks to make
it easier to process.

All the generated data is available for download directly, so anyone can reproduce
our results, without having to go throught the trouble of compiling and running
the TPC-H tools.

<script src="https://gist.github.com/xvrl/9552286.js?file=download-data.sh"></script>

> If you would like to generate the datasets from scratch, or try out different
> sizes, download and compile the [TPC-H tools][], and use the `dbgen` tool to
> generate the `lineitem` table.
>
> ```sh
> ./dbgen -TL -s1         # 1GB
> ./dbgen -TL -s100 -C100 # 100GB / 100 chunks
> ```
>
> There is also a [`generate-data.sh`][generate-data.sh] script in our repository to help write
> compressed data directly when generating large data sets.


## Setup

### Druid Cluster

We are running the benchmark against Druid 0.6.62, which includes bug fixes for
some date parsing and case-sensitivity issues that cropped up while loading the
benchmark data.

Druid Compute nodes are running Amazon EC2 `m3.2xlarge` instances (8 cores, Intel Xeon
E5-2670 v2 @ 2.50GHz with 160GB SSD and 30GB of RAM) and broker nodes use
`c3.2xlarge` nodes (8 cores, Intel Xeon E5-2680 v2 @ 2.80GHz and 15GB of RAM).
Both run a standard Ubuntu 12.04.4 LTS and a 3.11 kernel.

For the 1GB data set, we run queries directly against a single compute node,
since the broker is unnecessary in that type of setup. For the 100GB data
set we first run against a single compute node and then scale out the
cluster to 6 compute nodes and issue queries against one broker node.

Compute nodes are configured with 8 processing threads (one per core), as
well as the default 1GB compute buffer, and 6GB of JVM heap. That leaves about
15GB of memory for memory mapping segment data, if we allow about 1GB for the
operating system and other overhead.

Broker nodes are configured with 12GB of JVM heap, and query chunking has been
disabled. This ensures queries do not get split up into sequential queries
and always run fully parallelized.

> Note: Interval chunking is turned on by default to prevent long interval
> queries from taking up all compute resources at once. By default the maximum
> interval that a single chunk can span is set to 1 month, which works well
> for most production data sets Druid is being used for.
> 
> Interval chunking can be disabled by setting `druid.query.chunkPeriod` and
> `druid.query.topN.chunkPeriod` to a very large value compared to the time
> range of the data (in this case we used `P10Y`).

Besides those settings, no other particular performance optimizations have been
made, and segment replication has been turned off in the datasource [load
rules][load-rules].

Complete [Druid and JVM configuration parameters][configs] are published in our
[repository][druid-benchmark].

### MySQL

Our MySQL setup is an Amazon RDS instance (version 5.6.13) running on the same
instance type as Druid compute nodes (`m3.2xlarge`) using the MyISAM engine.

We used the default Amazon settings, although we experimented with enabling
memory mapping (`myisam_use_mmap`). However, this appeared to degrade
performance significantly, so our results are with memory mapping turned off.

> Note: We also ran some test against the InnoDB engine, but it appeared to be
> quite a bit slower when compared to MyISAM. This was the case for all the
> benchmark queries except for the `count_star_interval` query, even when
> setting `innodb_buffer_pool_size` to very large values.

## Loading the data
### Druid

We use the [Druid indexing service][druid-indexing-service] configured to use
an Amazon EMR Hadoop cluster to load the data and create the necessary Druid
segments. The data is being loaded off of S3, so you will have to adjust the
input paths in the [task descriptor files][lineitem.task.json] to point to your
own hadoop input path, as well as provide your own hadoop coordinates artifact.

<script src="https://gist.github.com/xvrl/9552286.js?file=load-druid.sh"></script>

For the larger data set we configure the [hadoop index task][index-task] to
create monthly segments, each of which is sharded into partitions of at most
5,000,000 rows if necessary.  We chose those settings in order to achieve
similar segment sizes for both data sets, thus giving us roughly constant
segment scan time which gives us good scaling properties and makes comparison
easier.

The resulting Druid segments consist of:

-  a single 589MB segment for the 1GB data set,
-  161 segments totaling 83.4GB (average segment size of 530MB) for the 100GB
   data set.

In our case the indexing service took about 25 minutes per segment for both
datasets.  The additional sharding step for the larger data set only adds a few
minutes, so with the right amount of Hadoop resources, loading could take as
little as half an hour.

# MySQL

Loading the data into MySQL is fairly simple using the client's local file
option.  Assuming the `tpch` database already exists on the server, the
following command creates the necessary table, indices, loads the data and
optimizes the table. Keep in mind you will first need to uncompress the data
files prior to loading them.

<script src="https://gist.github.com/xvrl/9552286.js?file=load-mysql.sh"></script>

Loading the data itself is relatively fast, but it may take several hours to
create the necessary indices and optimizing the table on the larger data set.
In our case it took several attempts to complete the indexing and table
optimization steps.

## Running the Benchmarks
### Druid
Running the Druid benchmark requires [R][], as well as a couple of packages,
including [`RDruid`][RDruid], `microbenchmark`, as well as `ggplot2` if you would
like to generate the plots.

<script src="https://gist.github.com/xvrl/9552286.js?file=benchmark-druid.sh"></script>

### MySQL
The SQL queries for the benchmark are stored in the `queries-mysql.sql` file, and we provide a convenient script to run all or part of the benchmark.

<script src="https://gist.github.com/xvrl/9552286.js?file=benchmark-mysql.sh"></script>

## Benchmark Results
### 1GB data set
In a single node configuration, with a single segment, Druid will only use a
single processing thread, so neither MySQL nor Druid benefit from more than one
core in this case.

![](/assets/druid-benchmark-1gb-median.png)

We see that Druid performs almost all the queries in less than one second and
is anywhere between 2x and 15x faster than vanilla MySQL. On `select count(*)`
queries it achieves scan rates of 53,539,211 rows/second, and 36,246,533
rows/second for aggregate `select sum(float)` queries.

Since Druid uses column-oriented storage, it performs better on queries using
fewer columns, and as more columns become part of the query it is expected to
lose some of its advantage compared to row-oriented storage engines.

```
# 1GB data set
# median query times (seconds) over 100 runs

                query     druid mysql
  count_star_interval 0.1112114 1.770
              sum_all 0.6074772 2.400
       sum_all_filter 0.5058156 2.415
         sum_all_year 0.6100049 3.440
            sum_price 0.1655666 2.070
   top_100_commitdate 0.4150540 3.880
        top_100_parts 0.5897905 3.850
top_100_parts_details 1.3785018 4.540
 top_100_parts_filter 0.7332013 3.550
```

### 100GB data set on a single node
For the much larger data set, on a single node, Druid can take advantage of all
8 cores, parallelizing workload across multiple segments at once. Since only
about 15GB of RAM is available for segment data, not all of it can be paged into
memory at once, especially when querying multiple columns at a time. Segments 
will get paged in and out by the operating system, and having SSD storage in this
case significantly helps to reduce the amount of time spent paging data in.

Druid really shines at this scale, even on a single node. The comparison may be
a little unfair, since MySQL can only take advantage of a single core per
query, but even considering that, Druid is still between 45x and 145x faster.

Compared to the 1GB data set, a simple `select sum(float)` query takes only 26
times as long, even though we have 100 times the number of rows.

The most expensive type of queries for Druid are Top-N queries over very high
cardinality dimensions (exceeding 20 million for the `top_x_parts` queries).
Those types of queries may require multiple passes over the data in case
compute buffers are not large enough to hold all the results.

MySQL essentially becomes unusable for interactive queries at this scale. Most
queries take at least 10 minutes to complete, while more expensive ones can
take several hours.

![](/assets/druid-benchmark-100gb-median.png)

```
# 100GB data set (single node)
# median query times (seconds) - 20 runs Druid, 3-5 runs MySQL

                query          druid    mysql 
  count_star_interval       2.632399   177.95 
              sum_all      14.503592   663.93 
       sum_all_filter      10.202358   590.96 
         sum_all_year      14.481295   673.97 
            sum_price       4.240469   624.21 
   top_100_commitdate       7.402270   706.64 
        top_100_parts     113.565130  9961.12 
top_100_parts_details     181.108950 12173.46 
 top_100_parts_filter      57.717676  5516.37 
```

# Scaling up Druid

Druid makes it very straightforward to scale the cluster and take advantage of
additional nodes. Simply firing up more compute nodes will trigger the
coordinator to redistribute the data among the additional nodes, and within a
few minutes, the workload will be distributed, without requiring any downtime.

We see that Druid scales almost linearly for queries that involve mainly column
scans, with queries performing 5x to 6x faster than on a single core.

For Top-N queries the speedup is less, between 4x and 5x, which is expected,
since a fair amount of merging work has to be done at the broker level to merge
results for those type of queries on high-cardinality dimensions.

![](/assets/druid-benchmark-scaling.png)

```
# median query times (seconds) over 20 runs

                query druid (1 node) druid (6 nodes)
  count_star_interval       2.632399       0.4061503
              sum_all      14.503592       2.2583412
       sum_all_filter      10.202358       1.9062494
         sum_all_year      14.481295       2.2554939
            sum_price       4.240469       0.6515721
   top_100_commitdate       7.402270       1.4426543
        top_100_parts     113.565130      22.9146193
top_100_parts_details     181.108950      32.9310563
 top_100_parts_filter      57.717676      14.3942355
```

## Conclusions and future work

In publishing a reproducible benchmark, as well as our data and methodology, we
hope we gave more tangible evidence of Druid's performance characteristics, as
well as a reference comparison with a more familiar database. We hope the
community will contribute benchmarks for other data stores in the future.

Unsurprisingly, a conventional data store such as MySQL quickly breaks down at
the scale of data that is increasingly becoming the norm these days.  Druid was
designed to solve a specific set of problems where other generic solutions stop
working.

We have shown that Druid performs well whether in single or multi-node
configurations and is able to take full advantage of modern hardware with many
cores and large amounts of memory. Its ability to quickly scale horizontally
allows to adapt to various workloads, with query performance scaling almost
linearly for typical production workloads.

That being said, Druid still requires a fair amount of knowledge to choose
optimal configuration settings and pick good segment size/sharding properties.
We are planning to write a blog post dedicated to performance tuning where we
will address those questions more directly.

[generate-data.sh]: https://github.com/druid-io/druid-benchmark/blob/master/generate-data.sh
[benchmarking script]: https://github.com/druid-io/druid-benchmark/blob/master/benchmark-druid.R
[lineitem.task.json]: https://github.com/druid-io/druid-benchmark/blob/master/lineitem.task.json
[scaling-druid]: /blog/2012/01/19/scaling-the-druid-data-store.html
[talks]: https://speakerdeck.com/druidio/
[druid-benchmark]: https://github.com/druid-io/druid-benchmark
[configs]: https://github.com/druid-io/druid-benchmark/tree/master/config
[results]: https://github.com/druid-io/druid-benchmark/tree/master/results
[TPC-H benchmark]: http://www.tpc.org/tpch/
[TPC-H tools]: http://www.tpc.org/tpch/spec/tpch_2_16_1.zip
[RDruid]: https://github.com/metamx/RDruid/
[druid-indexing-service]: /docs/latest/Indexing-Service.html
[R]: http://cran.rstudio.com/
[load-rules]: /docs/latest/Rule-Configuration.html
[index-task]: http://druid.io/docs/latest/Tasks.html


