---
title: "Scaling the Druid Data Store"
layout: post
author: Eric Tschetter
image: http://metamarkets.com/wp-content/uploads/2012/01/scaling2.jpg
---

> ###“Give me a lever long enough… and I shall move the world”
> — Archimedes

Parallelism is computing’s leverage, a force multiplier acting against the
weight of big data.  Cloud-hosted, horizontally scalable systems have the power
to move even planetary sized data sets with speed.

This blog post discusses our efforts to lift one such data set, achieving a
scan rate of 26 billions records per second, with our distributed, in-memory
data store called Druid.  Our main conclusions are:

Horizontally-scalable architectures are an ideal fit for the Cloud Our data
store’s performance scales up well to a 6TB in-memory cluster and degrades
gracefully under memory pressure The flexibility of a Cloud environment enables
pain-free tuning of cost versus performance Benchmarking our infrastructure
against a big data set in the wild provides validation of the power achievable
on a Cloud computing fabric of commodity hardware.

For those who are curious as to what our infrastructure powers, Metamarkets
offers a SaaS analytics solution to gaming, social, and digital media firms.  A
public example is our dashboard for exploring Wikipedia edits.

###I) The Data

We began our experiment with 6TB of uncompressed data, representing tens of
billions of fact rows, which we aimed to host and make fully explorable through
our dashboard.  By way of comparison, the Wikipedia edit feed we host consists
of 6GB of uncompressed data, representing ~36 million fact rows.

The first hurdle to overcome with a data set of this scale is co-locating the
data with the compute power.  Most of the trillions events we’ve analyzed on
our platform have been delivered over months of parallel, continuous feeds.  In
rare cases, we have had to transform the data locally and sneaker-net the disks
to our data center.  Pushing terabytes over a standard office uplink can take
weeks.

Once on the cloud, we performed some cardinality analysis to make sure we
understood the parameters of the data.  There were more than a dozen
dimensions, with cardinalities ranging from tens of millions, to hundreds of
thousands, all the way down to tens.  This kind of Zipfian distribution in
cardinalities is common in naturally occurring data.  We then computed four
metrics for each row (consisting of counts, sums, and averages) and loaded the
data up into Druid.

We sharded the data into chunks and then sub-sharded those chunks by the
dimension with cardinality >> 1M, creating thousands of shards of roughly 8M
fact rows apiece.

###II) The Cluster

We then spun up a cluster of compute nodes to load the data up and keep it in
memory for querying.  The cluster consisted of 100 nodes, each with 16 cores,
60GB of RAM, 10 GigE ethernet, and 1TB of disk space.  So, collectively the
cluster comprised 1600 cores, 6TB of RAM, fast ethernet and more than enough
disk space.

With this first cluster, we were successful in delivering an interactive
experience on our front-end dashboard, scanning billions of records per second,
as the benchmarks below attest.

During the course of our testing, we also reconfigured the cluster in multiple
different ways, switching from pure in memory to using memory mapping and
pulling back the number of servers to see how performance degrades as we
changed the ratio of data served to available RAM.

###III) The Benchmarks

First, we’ll provide some benchmarks for our 100-node configuration on simple
aggregation queries.  SQL is included to describe what the query is doing.

    Select count(*) from _table_ where timestamp >= ? and timestamp < ?

	cluster					cluster scan rate (rows/sec)	core scan rate
	15-core, 100 nodes, in-memory		26,610,386,635			17,740,258
	15-core,  75 nodes, mmap		25,224,873,928			22,422,110
	15-core,  50 nodes, mmap		20,387,152,160			27,182,870
	15-core,  25 nodes, mmap		11,910,388,894			31,761,037
	4-core,  131 nodes, in-memory		10,008,730,163			19,100,630
	4-core,  131 nodes, mmap		10,129,695,120			19,331,479
	4-core,   50 nodes, mmap		 6,626,570,688			33,132,853


    * The timestamp range encompasses all data.  
    * 15-core is a 16-core machine with 60GB RAM and 1TB of local disk. The
      machine was configured to only use 15
    * threads for processing queries.  
    * 4-core is a 4-core machine with 32GB RAM and 1TB of local disk.  
    * in-memory means that the machine was configured to load all data up
      into the Java heap and have it available for querying 
    * mmap means that the machine was configured to mmap the data instead
      of load it into the Java heap



    Select count(*), sum(metric1) from _table_ where timestamp >= ? and timestamp < ?

	cluster					cluster scan rate (rows/sec)	core scan rate
	15-core, 100 nodes, in-memory		16,223,081,703			10,815,388
	15-core,  75 nodes, mmap	 	 9,860,968,285			8,765,305
	15-core,  50 nodes, mmap	 	 8,093,611,909			10,791,483
	15-core,  25 nodes, mmap	 	 4,126,502,352			11,004,006
	4-core,  131 nodes, in-memory	 	 5,755,274,389			10,983,348
	4-core,  131 nodes, mmap	 	 5,032,185,657			9,603,408
	4-core,   50 nodes, mmap	 	 1,720,238,609			8,601,193


    Select count(*), sum(metric1), sum(metric2), sum(metric3), sum(metric4)
    where timestamp >= ? and timestamp < ? 

	cluster					cluster scan rate (rows/sec)	core scan rate
	15-core, 100 nodes, in-memory		7,591,604,822			5,061,070
	15-core,  75 nodes, mmap		4,319,179,995			3,839,271
	15-core,  50 nodes, mmap		3,406,554,102			4,542,072
	15-core,  25 nodes, mmap		1,826,451,888			4,870,538
	4-core,  131 nodes, in-memory		1,936,648,601			3,695,894
	4-core,  131 nodes, mmap		2,210,367,152			4,218,258
	4-core,   50 nodes, mmap		1,002,291,562			5,011,458


The first query is just a count and we see the best performance out of our
system with it, achieving scan rates of 33M rows/second/core.  At first glance
it looks like fewer nodes might actually be outperforming more nodes in the
rows/sec/core metric, but that’s just because 100 nodes is overprovisioned for
the data set.  Druid’s concurrency model is based on shards, one thread will
scan one shard.  If a node has 15 cores, for example, and handles a query that
requires scanning 16 shards, if we assume each shard takes 1 second to process
the total time to finish the query will be 2 seconds (1 second for the first 15
shards and 1 second for the 16th shard), decreasing the global scan rate
because there are actually a number of cores that are idle.

As we move on to include more aggregations we see performance degrade. This is
because of the column-oriented storage format Druid employs. For the `count *`
queries, it only has to check the timestamp column to satisfy the where clause.
As we add metrics, it has to also load those metric values and scan over them,
increasing the amount of memory scanned.  Next, we’ll do a top 100 query on our
high cardinality dimension:


	Select high_card_dimension, count(*) AS cnt from _table_ where timestamp >= ? 
	and timestamp < ? group by high_card_dimension order by cnt limit 100;

	cluster					cluster scan rate (rows/sec)	core scan rate
	15-core, 100 nodes, in-memory		10,241,183,745			6,827,456
	15-core,  75 nodes, mmap	 	 4,891,097,559			4,347,642
	15-core,  50 nodes, mmap	 	 3,616,707,511			4,822,277
	15-core,  25 nodes, mmap	 	 1,665,053,263			4,440,142
	4-core,  131 nodes, in-memory	 	 4,388,159,569			8,374,350
	4-core,  131 nodes, mmap	 	 2,444,344,232			4,664,779
	4-core,   50 nodes, mmap	 	 1,215,737,558			6,078,688
	

    Select high_card_dimension, count(*), sum(metric1) AS cnt from _table_
    where timestamp >= ? and timestamp < ? group by high_card_dimension order by
    cnt limit 100;

	cluster					cluster scan rate (rows/sec)	core scan rate
	15-core, 100 nodes, in-memory		7,309,984,688			4,873,323
	15-core,  75 nodes, mmap		3,333,628,777			2,963,226
	15-core,  50 nodes, mmap		2,555,300,237			3,407,067
	15-core,  25 nodes, mmap		1,384,674,717			3,692,466
	4-core,  131 nodes, in-memory		3,237,907,984			6,179,214
	4-core,  131 nodes, mmap		1,740,481,380			3,321,529
	4-core,   50 nodes, mmap	  	  863,170,420			4,315,852


    	
	Select high_card_dimension, count(*), sum(imetric1), sum(metric2),
	sum(metric3), sum(metric4) AS cnt from _table_ where timestamp >= ? and
	timestamp < ? group by high_card_dimension order by cnt limit 100;

	cluster					cluster scan rate (rows/sec)	core scan rate
	15-core, 100 nodes, in-memory		4,064,424,274			2,709,616
	15-core,  75 nodes, mmap		2,014,067,386			1,790,282
	15-core,  50 nodes, mmap		1,499,452,617			1,999,270
	15-core,  25 nodes, mmap	  	  810,143,518			2,160,383
	4-core,  131 nodes, in-memory		1,670,214,695			3,187,433
	4-core,  131 nodes, mmap		1,116,635,690			2,130,984
	4-core,   50 nodes, mmap	  	  531,389,163			2,656,946

Here we see the superior performance of the in-memory representation when doing
top lists versus when doing simple time-based aggregations.  This is an
implementation detail, but it’s largely because of the differences in accessing
simple in-memory pointers, versus scanning and seeking through a flattened data
structure (even though it is already largely paged into memory).

###IV) Conclusions

Our conclusions are three-fold.  First, we demonstrate that is possible to
provide real-time, fully interactive exploration of 6TB of data with a
distributed, cloud-hosted commodity hardware.

Second, we highlight the flexibility offered by the cloud.  Letting us stick to
our core engineering competencies and having someone else deal with the
overhead of running an actual data center is huge.  The fact that we were able
to spin up 100 machines, run our benchmarks, kill 25, wait a bit, run
benchmarks, kill another 25, wait a bit, run benchmarks, rinse and repeat was
just awesome.

Finally, designing an architecture that horizontally scales for performance
opens up a set of nobs of cost versus performance.  If we can tolerate response
times of 10 seconds instead of 1 second, we can pay less for our processing.
If we can tolerate response times of 1 minute, we pay even less.  Conversely,
if we need answers in milliseconds, this is achievable at a higher price point.

V) Using Druid

We currently offer Druid as a hosted service, but are exploring steps to open
up the platform to a developer community.  If you would like to explore either
using our hosted service or being part of a developer community, please drop us
a note.


