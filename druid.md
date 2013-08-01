---
title: What is Druid?
layout: docs
sectionid: druid
---

+-- {.span4 .bs-docs-sidebar}
|- [<i class="icon-chevron-right"> </i>What is Druid?](#whatis)
|- [<i class="icon-chevron-right"> </i>What does Real&sup2;time Mean?](#realrealtime)
|- [<i class="icon-chevron-right"> </i>Where Did Druid Come From?](#where)
|- [<i class="icon-chevron-right"> </i>What is Druid Used for?](#used)
|- [<i class="icon-chevron-right"> </i>Who is Using Druid?](#whois)
|{.nav .nav-list .bs-docs-sidenav .affix}

+-- {.span8}
|+-- {.text-item .indent}
||# What is Druid? {#whatis}
||### Druid is open source infrastructure for real&sup2;time exploratory analytics that supports fast ad-hoc queries on large-scale data sets.
||## Real-time Ingestion {#realtime}
||**Real-time data** Typical analytics databases ingest data via batches.  Ingesting an event at a time is often accompanied with transactional locks and other overhead that slows down the ingestion rate.  Druid's real-time nodes employ lock-free ingestion of append-only data sets to allow for simultaneous ingestion and querying of 10,000+ events per second.  Simply put, the latency between when an event happens and when it is visible is limited only by how quickly the event can be delivered to Druid.
|
|+-- {.text-item .indent}
||## Scalable {#scalable}
||**In-memory or on-disk.** Druid leverages the memory mapping capabilities of modern operating systems to allow for only relevant data to be loaded into memory while the rest can live on disk.  This means that if your performance requirements dictate that the data must be in memory, then you can configure each node to only accept an amount of data that is equivalent to the available memory and it will all be in-memory.  If you are ok with only having the working set in memory, each node can hold more than just the working set on a given machine and the requisite data will be swapped into memory on demand.  
||
||**Highly Available.** Scaling up or down, replicating nodes, or recovering from failure typically impacts availability and performance. Druid uses a distributed architecture that allows replication at the segment level – relieving the load on "hot segments." And, because of replication, Druid supports rolling deployments and restarts. Scale up or scale down just by adding or remove nodes, it's that easy and no data has to be re-processed or re-indexed, just re-replicated.
|
|+-- {.text-item .indent}
||## Real-time Queries {#hri}
||**Ad hoc, multi-dimensional filtering.** Druid maintains bitmap indexes compressed using [CONCISE](http://ricerca.mat.uniroma3.it/users/colanton/concise.html) to determine what data it has to look at before it ever starts looking at data.  This significantly speeds up ad hoc filtered queries, even allowing for fast OR queries which are traditionally slow.  All this [without a significant impact on data footprint](http://metamarkets.com/2012/druid-bitmap-compression/)  
||
||**Column-oriented for speed.** Data is laid out in columns so that scans are limited to the specific data being searched. [Compression decreases overall data footprint.]({% post_url 2011-05-20-druid-part-deux %})
|
|+-- {.text-item .indent}
||#What does Real&sup2;time mean? {#realrealtime}
||Real&sup2;time reflects the fact that Druid encompasses both of the common definitions of real-time in the data processing space.
||
||"Real-time queries" refers to responsive or interactive queries.  I.e. you have your data and want to be able to ask questions of the data quickly.
||
||"Real-time ingestion" refers to ingesting data and making it available for querying in real-time.  I.e. minimizing the latency between when an event occurs and when it is reflected in your query results.
|
|+-- {.text-item .indent}
||#Where did Druid Come From? {#where}
||Druid was created out of necessity by Metamarkets, a company focused on providing real-time interactive insight to the RTB (real time bidding) AdTech space with a full stack analytics service.  Metamarkets required a system that could ingest data in real-time, provide ad-hoc N-dimensional drill down and still provide sub-second responses.  As a hosted service, Metamarkets also required no downtime deployments, fault-tolerance and self-healing properties.
||
||Druid was [opened up]({% post_url 2012-10-24-introducing-druid %}) because Metamarkets is fully committed to the AdTech use case.  However, it was felt that Druid had more general applicability to other spaces and it was in Metamarket's best interests not to limit Druid's development solely to its own use cases.
|
|+-- {.text-item .indent}
||# What is Druid Used For? {#used}
||Druid is purpose built infrastructure that provides for exploration of very large quantities of data as it is ingested into the system.  It is currently used for dashboarding of ad impression streams and operational monitoring of systems.  If you have a dataset that is too large for your current infrastructure, your data has a timestamp associated with every event and you want to arbitrarily filter into the data with your queries, then Druid can probably provide value for whatever your use case is as well.
||
||## Immediate insight to large quantities of data:
||The low time latency between when data is ingested into Druid and when that data is reflected in queries allows users understand what is going on "right now" instead of a few minutes ago.
||
||## Deep, exploratory drill-down:
||Users value the ability to create many arbitrary filter dimensions without impacting performance, breaking scalability or cost viability (compute infrastructure). Ad hoc drill down on immediate and historical data allows users to query both "fresh", or immediately ingested data and historical data all at once.
|
|+-- {.text-item .indent}
||# Who is using Druid?{#whois}
||## Metamarkets
||Druid is the primary data store for Metamarkets’ full stack visual analytics service for the RTB (real time bidding) space. Ingesting over 30 billion events per day, Metamarkets is able to provide insight to its customers using complex ad-hoc queries at a 95th percentile query time of around 1 second.
||
||## Netflix
||Netflix engineers use Druid to aggregate multiple data streams, ingesting up to two terabytes per hour, with the ability to query data as its being ingested. They use Druid to pinpoint anomalies within their infrastructure, endpoint activity and content flow.
||
||## Madvertise  
||Madvertise uses Druid for real-time drill-down reporting. Madvertise is also contributing back to the community by creating and maintaining a ruby client library for interacting with Druid located at <http://github.com/madvertise/ruby-druid>.
|
