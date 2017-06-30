---
title: Powered by Druid
subtitle: <a href="https://github.com/druid-io/druid-io.github.io/blob/src/druid-powered.md">Add Your Company</a>
layout: simple_page
---

There are numerous companies of various sizes in production with Druid. This list is incomplete and we hope to add everyone's use cases in the near future.

## Airbnb

Druid powers slice and dice analytics on both historical and realtime-time metrics. It significantly reduces latency of analytic queries and help people to get insights more interactively.

## Alibaba

At Alibaba Search Group, we use Druid for real-time analytics of users' interaction with its popular e-commerce site.

## Appsflyer

Druid is the major player in the real-time analytics pipeline at Appsflyer, and it serves as customer facing analytics database for dashboard reporting.

## Archive-It.org

Druid is used to power dynamic analytics and charting in Archive-It Reports. Reports help Archive-It partners understand what content they captured, why some content did not get captured, and assists with quality assurance and crawl scoping to ensure they are building the highest quality collections.

## Atomx

Atomx is a new media exchange that connects networks, DSPs, SSPs, and other parties. Atomx uses Druid for it's advanced realtime reporting system. Using the Google Cloud modifications Atomx contributed to Druid, it can easily scale Druid with the fast growing platform.

## Bannerflow

[Bannerflow](https://www.bannerflow.com) is the leading display ad production platform. We use Druid to power our customer facing analytics system and for internal reporting, monitoring and ad-hoc data exploration.

## Billy Mobile

Billy Mobile is a mobile advertising platform, excelling in the performance-based optimisation segment. We use Druid to power our real-time analytics dashboards, in which our publishers, advertisers and staff can get insights on how their campaigns, offers and traffic are performing, with sub-second query time and minute granularity . We are using a lambda-architecture aproach, ingesting the traffic in real time with Tranquility and Storm, and a batch layer via a tight integration with Hive and Hadoop, our Master Data Set. This way we can provide crucial fast access to data, while making sure to have the right numbers.

## Branch

Branch uses Druid as their trusted analytics engine to power all of their data analysis needs. This ranges from the user-facing Branch Dashboard analytics that our partners rely on to gain insight into the performance of their links; to the data-driven business decisions that we need to make internally to build a sustainable business.

## Cisco

Cisco uses Druid to power a real-time analytics platform for network flow data.

* [Under the hood of Cisco’s Tetration Analytics platform](http://www.networkworld.com/article/3086250/cisco-subnet/under-the-hood-of-cisco-s-tetration-analytics-platform.html)

## Criteo

Criteo is using druid to provide its customers with user-centric analytics & reporting. 
With more than 1 billion unique users reached per month, 3 billion ads displayed per day, and a 70% growth in 2014, Criteo's previous stack was hard pressed keeping with the load. Replacing it with druid helped us achieved linear scalability while letting our customers explore their data in new and interactive ways.

* [Real Time Metrics on Tracker Calls](http://labs.criteo.com/2016/02/real-time-metrics-on-tracker-calls/)

## Condé Nast

Condé Nast uses Druid to track billions of events across our two dozen brands, both in real time and historically. Druid helps power dashboards, site performance trackers, and many other internal applications.

## Didi Chuxing

Didi Chuxing is the world’s largest mobile transportation platform, offering a full range of commuting options to 400 cities in China.
Didi uses Druid as a core component of our real-time bigdata processing pipeline. Druid powers Didi's real-time monitor system which has hundreds of key business metrics. We are deep impressed by Druid's fast aggregations and sub-second OLAP queries. With Druid, we can get insights from data in real-time.


## DripStat

DripStat uses Druid as a timeseries database to power the DripStat GUI. DripStat ingests transactional data for Java, Scala, and Groovy applications into Druid.

## Easemob

Easemob Technologies, Inc. is the leading provider of open IM platform, cloud computing customer services. We enable PaaS services for Instant Messaging and SaaS services for Mobile Customer Service.

## eBay

eBay uses Druid to aggregate multiple data streams for real-time user behavior analytics by ingesting up at a very high rate(over 100,000 events/sec), with the ability to query or aggregate data by any random combination of dimensions, and support over 100 concurrent queries without impacting ingest rate and query latencies.

* [Druid and Pulsar](http://blog.csdn.net/ebay/article/details/50205611)
* [embedded-druid: Leveraging Druid Capabilities in Stand-alone Applications](http://www.ebaytechblog.com/2016/02/05/embedded-druid-leveraging-druid-capabilities-in-stand-alone-applications/)

## GumGum

Druid powers a dashboard used internally to visualize real-time analytics on GumGum's Real Time Bidding platform. GumGum runs Druid on Amazon EC2 and can ingest up to 300,000 events per second at peak time.

* [Lambda Architecture with Druid at GumGum](http://whynosql.com/2015/11/06/lambda-architecture-with-druid-at-gumgum/)

## Hulu

At Hulu, we use Druid to power our analytics platform that enables us to interactively deep dive into the behaviors of our users and applications in real-time.

## Imply

Imply uses Druid to power public demos and to power our internal monitoring and metrics.

* [Pivot: An Open Source Data Exploration UI for Druid](http://imply.io/post/2015/10/26/hello-pivot.html)
* [A Tour Through the "Big Data" Zoo](http://imply.io/post/2015/11/04/big-data-zoo.html)
* [Architecting Distributed Databases for Failure](http://imply.io/post/2015/12/10/failure.html)
* [Building a Streaming Analytics Stack with Apache Kafka and Druid](http://www.confluent.io/blog/building-a-streaming-analytics-stack-with-apache-kafka-and-druid) 
* [Compressing Longs in Druid](https://imply.io/post/2016/12/07/compressing-longs.html) 

## Inmobi

Inmobi is a mobile advertising and discovery platform. We use Druid majorly for internal realtime reporting and analysis. We also use Caravel backed by Druid, which allows users to build interactive dashboards. Apart from that, we use Druid as a Datastore for faster ingestion of large amount of data and to query this data at sub second latencies. 

## Interactive Intelligence

At ININ we're using Druid within a Lambda architecture to drive cloud based call center analytics. Many of our realtime dashboards, downloadable reports, and public APIs utilize Druid on the backend. 

## Italiaonline

Italiaonline exploits Druid for Internet trends and analytics management inside its new [Data-Driven Contents Management System](http://www.italiaonline.it/en/supereva-a-new-online-publishing-experience/).
Italiaonline is the first Italian internet company, with the two most visited web portals, Libero and Virgilio, and the most used email service of the country @libero.it. Italiaonline features 16.8 million unique users per month&ast;, 4.8 billion impressions per month&ast;&ast;,  10.2 million active email accounts&ast;&ast; and a 58% active reach&ast;.

*&ast; Source: Audiweb View, powered by Nielsen, TDA 2H 2015; &ast;&ast; Internal data, December 2015*

## Jolata

Jolata leverages Druid as the analytics data store for the realtime network perfomance managment platform. Injesting over 35 billion events per day, Jolata calculates a billion metrics every minute to visualize precise network metrics in real-time, and enable operators to quickly drill down and perform root cause analysis.

* [Realtime Analytics Powered by Druid](https://www.linkedin.com/pulse/realtime-analytics-powered-druid-kiran-patchigolla)

## KT NexR

KT NexR is the leading provider of the data analytics platform. We use Druid as a real-time analysis tool to help our customers to analyze multidimensional data in interactive ways.

## LDMobile

LDMobile is a mobile DSP for the RTB. We use Druid to aggregate some metrics in order to propose to our customers a real-time dashboard showing performance indicators of their campaigns.

## LifeBuzz

LifeBuzz is a popular web property that serves tens of millions of pageviews per day. We use Druid for all our advanced analytics needs, including in-house analysis and professional realtime analytics for our sponsored media partners.

## LiquidM

LiquidM uses Druid for real-time drill-down reporting. LiquidM is also contributing back to the community by creating and maintaining a ruby client library for interacting with Druid located at <http://github.com/liquidm/ruby-druid>.

* [Reporting at LiquidM](http://liquidm.com/reporting-at-liquidm/)

## Marchex

Marchex uses Druid to provide data for Marchex Call Analytics' new customer facing Speech Analytics dashboards.
Druid's fast aggregation is critical for providing deep insights into call performance for its customers, 
enabling them to spot trends and improve performance of both marketing campaigns and call centers.

## Metamarkets

Druid is the primary data store for Metamarkets' full stack visual analytics
service for the RTB (real time bidding) space. Ingesting over 200 billion events
per day, Metamarkets is able to provide insight to its customers using complex
ad-hoc queries at a 95th percentile query time of around 1 second.

## Monetate

Druid is a critical component in Monetate's personalization platform, where it 
acts as the serving layer of a lambda architecture.  As such, Druid powers 
numerous real-time dashboards that provide marketers valuable insights into
campaign performance and customer behavior.

* [Gone Monetate : Personalizing Marketing at 100K events/second](http://brianoneill.blogspot.com/2015/09/gone-monetate-personalizing-marketing.html)
* [Druid : Vagrant Up (and Tranquility!)](http://brianoneill.blogspot.com/2015/09/druid-vagrant-up-and-tranquility.html)
* [Kinesis -> Druid : Options Analysis (to Push? to Pull? to Firehose? to Nay Nay?)](http://brianoneill.blogspot.com/2015/09/kinesis-druid-options-analysis-to-push.html)

## N3twork

N3TWORK uses Druid for real-time analysis of its Internet of Interests social
entertainment network. It uses Druid analytics both to optimize user
experiences and to guide the evolution of its product.

## Netflix

Netflix engineers use Druid to aggregate multiple data streams, ingesting up to
two terabytes per hour, with the ability to query data as its being ingested.
They use Druid to pinpoint anomalies within their infrastructure, endpoint
activity and content flow.

* [Announcing Suro: Backbone of Netflix's Data Pipeline](http://techblog.netflix.com/2013/12/announcing-suro-backbone-of-netflixs.html)

## Netsil

Netsil is an observability and analytics company for modern cloud applications. The Netsil Application Operations Center (AOC) uses Druid for real-time queries on sharded data along with support for dynamic and multi-valued attributes. The AOC processes live service interactions in large-scale production applications and also stores massive amounts of historical metrics data. Druid was able to support these and several other AOC requirements allowing the AOC to be scalable and fault-tolerant.

You can learn more about the AOC at http://netsil.com/download/

* [A Comparison of Time Series Databases and Netsil’s Use of Druid](https://blog.netsil.com/a-comparison-of-time-series-databases-and-netsils-use-of-druid-db805d471206)

## Nielsen (Nielsen Marketing Cloud)

Nielsen Marketing Cloud uses Druid as it's core real-time analytics tool to help its clients monitor, test and improve its audience targeting capabilities.  With Druid, Nielsen provides its clients with in-depth consumer insights leveraging world-class Nielsen audience data. 

## OneAPM

OneAPM <http://oneapm.com> is an IT service compmay focusing on Application Performance Management (APM). In OneAPM, Druid is used to power clients' interactive queries on performance data collected from their applications in realtime.

## Optimizely

Optimizely uses Druid to power the results dashboard for Optimizely Personalization. Druid enables Optimizely to provide our customers with in-depth, customizable metrics in real time, allowing them to monitor, test and improve their Personalization campaigns with greater ease and flexibility than before.

* [Slicing and dicing data with druid](https://medium.com/engineers-optimizely/slicing-and-dicing-data-with-druid-f61cca8a63d2)
* [The anatomy of a Druid segment file](https://medium.com/engineers-optimizely/the-anatomy-of-a-druid-segment-file-bed89a93af1e)

## Paypal

The Druid production deployment at PayPal processes a very large volume of data
and is used for internal exploratory analytics by business analytic teams. Here
is what they have to say:

> Around early Feb, 2014, the Paypal Tracking Platform team, lead by Suresh Kumar, stumbled upon an article talking about a new
> upcoming kid in Real Time Analytics world. After first glance it seemed just like any other
> new cool looking technology. But after reading little deeper into the papers(they had
> referred) and few blogs, it was clear it is different. The fundamental approach to query
> the data itself looked very different and refreshing.
>
> Coincidently, at the same time, the team was struggling to create a very high volume real-time data
> query system. We had already explored Drill, Hive, Cassandra, TSDB, Shark etc.
> Dating back at least a year, none of these technologies were fulfilling our low latency needs for very high
> volumes of data.
>
> So, as an option we started the Druid prototype and within couple of weeks it was looking like
> a very promising alternate. Very soon with great help from Core Druid development team
> our prototype was doing great.
>
> We then started the prototype with large 7-10 billion records and see the response time for
> query. It was quite amazing.
>
> Today our Druid implementation in PayPal processes a very large volume of Data and is
> used for our internal exploratory analytics by business analytic teams.
>
> The thing we liked the most was amazing support provided by core Druid team. I have never
> seen a Open Source Community providing such a very high level of responsiveness for ANY
> issue related to Druid setup and tuning.

## PubNative

PubNative uses Druid for its real-time reports and analysis of millions of daily ad views, clicks, conversions and other events. 

## Raygun

Raygun is a full stack software intelligence platform that monitors your applications for errors, crashes and performance issues. They use Druid to complete complex queries with large data sets. Having seen similar stories from others, including those who invested in other technologies such as the Hadoop ecosystem or key-value stores, Raygun began researching other more purpose-built analytics databases. Druid happens to be the one they settled on, as it offers several nice properties one wants in an analytics database.

* [Using the Druid GroupBy V2 engine for real-time analytics](https://raygun.com/blog/2016/12/druid-groupby-v2-engine/)

## Redborder

redBorder is an open source, scale out, cybersecurity analytics platform based on Druid. We hope its full-blown web interface, dashboard and report systems, and ready-to-use real-time pipeline foster other Druid users to create a strong community around it. To see more, please visit redborder.org 

## Retargetly

Retargetly is a Data Management Platform that enables publishers and advertisers to manage their first party user data, mix it with second and third party data from others providers and activate it into advertising campaigns (direct, programmatic, etc.). Druid enables us to show real time audience insights. It also provides a lot of flexibility on ad-hoc queries with low latency. We provide default graphs and metrics to our clients but they also have the possibility to make their own interactive queries on real-time.

## Sift Science

Sift Science provides an online trust platform that online businesses use to prevent fraud and abuse. We use Druid as a tool to gain real-time insights about our data and machine learning models.

## Sina Weibo

Weibo UVE(Unified Value Evaluation) team of Advertising Platform is using Druid as the realtime analysis tool of the data insight system, which processing billions events everyday.

## SK Telecom

SK Telecom is the leading telecommunication and platform solution company. Druid enable us to discover the business insight interactively from telecommunication, manufacturing big data.

## Skyport Systems

Skyport Systems provides zero-effort, low-touch secure servers that help organizations to rapidly deploy and compartmentalize security-critical workloads. We use Druid as part of our analytics backend to provide real-time insight to our customers about their workload behavior.

## Smart Bid

Smart Bid is a unique marketing solution platform empowering advertising teams.
A one-stop shop taking advantage of proprietary technology to analyze and reach the right audience with the right creative at the right time. We use Druid to gain real-time insights on real time bidding using our machine learning algorithms.

## Smyte

Smyte provides an API and UI for detecting and blocking bad actors on the internet. Druid powers the analytics portion of our user interface providing insight into what users are doing on the website, and specifically which features are unique between different sets of users.

## Streamlyzer

Streamlyzer uses Druid as a next generation online video analytics for online video companies or publishers. Streamlyzer is gathering information from real end-users of our customers and provides visualized real-time analytics in dashboard showing how video contents are delivered and how end-users are experiencing the streaming service.

## Sugo

Sugo is a company that focus on realtime multi-dimension analytics and mining on big data. We build our platform based on Druid, and developed our own extensions to make it more powerful.

## Tencent

Tencent SCRM product use Druid for customer behavior analysis.

## Time Warner Cable

TWC uses Druid for exploratory analytics.

## TripleLift

TripleLift uses Druid to provide insights into performance aspects of its native programmatic exchange for sales/business development opportunities, and to provide reporting used by advertisers and publishers.

## VideoAmp

At VideoAmp, Druid is a key component of our Big Data stack. It powers our real-time video advertising analytics at low granularity and huge scale. Druid has helped us minimized the time between event, insight and action.

## Vigiglobe

Vigiglobe turns the noise of Social Media into real-time Smart Content. To this end, Druid enables us to maintain high request throughput coupled with huge data absorption capacity.

## ViralGains

ViralGains uses Druid for real-time analysis of millions of viral video views, shares, and conversations.

## Virool

Druid powers Virool’s real time analytics of over 1 billion raw events per day. We query this data to gain a deep understanding of all of our inventory sources, from exchanges to direct partners, everything is available with lightning fast query times. Druid puts the power and flexibility of big data in each of our Viroolian’s hands.

## Wikimedia Foundation

We're serving pageview data via Druid and Pivot.  Our internal customers are loving it and we're working on allowing public access to sanitized data, both editing and pageview.  We like Druid because it's open source, the folks that work on it have built a good community, and it's about five times faster than Hive for us right now, without any tuning or optimization (and the Hadoop cluster is beefier than the Druid one), just dumped lots of data into it and Pivot was immediately useful to our analysts.  We wrote a [puppet](https://github.com/wikimedia/operations-puppet/tree/production/modules/druid) module that others might find helpful.

## Xiaomi

Xiaomi uses Druid as an analytics tool to analyze online advertising data.

## Yahoo

Yahoo uses Druid to power various customer-facing audience and advertising analytics products.

* [Complementing Hadoop at Yahoo: Interactive Analytics with Druid](http://yahooeng.tumblr.com/post/125287346011/complementing-hadoop-at-yahoo-interactive)
* [Combining Druid and DataSketches for Real-time, Robust Behavioral Analytics](https://yahooeng.tumblr.com/post/147711922956/combining-druid-and-datasketches-for-real-time)

## YeahMobi

YeahMobi uses Druid to power a dashboard used for ad-tech analytics such as impression and conversion tracking, unique IP statistics, and aggregating metrics such as costs and revenues.

## Youku Tudou

Youku Tudou employs Druid for real-time advertising analysis of huge volumes of data.

## ZeroX

[ZeroX](https://zero-x.co/) is a data analytics company that provides cloud hosted and privately managed Druid clusters.

* [Shaman: A Druid Manager for the Cloud](https://shaman-ui.zero-x.co/#/docs/getting-started)
* [Interactive Bid Requests w/ Apache Druid](https://blog.zero-x.co/2017/06/05/interactive-bid-requests-apache-druid.html)
* [Programmatic Conversion Funnels w/ Apache Druid](https://blog.zero-x.co/2017/06/09/programmatic-conversion-funnels-apache-druid.html)

## Zhihu

[Zhihu](https://www.zhihu.com/) is a Chinese question-and-answer website. In Zhihu, Druid is used to power clients' interactive queries, data reports, A/B testing and performance monitoring. Almost 1T per day data is ingested into druid cluster, and we are strongly depending on thetaSketch aggregator for computing cardinality and retention, looking forward to more improvement on DataSketch.

<hr/>

[Add Your Company](https://github.com/druid-io/druid-io.github.io/blob/src/druid-powered.md)
