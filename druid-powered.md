---
title: Powered by Druid
subtitle: <a href="https://github.com/druid-io/druid-io.github.io/blob/master/druid-powered.md">Add Your Company</a>
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

## Cisco

Cisco uses Druid to power a real-time analytics platform for network flow data.

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

## Italiaonline

Italiaonline exploits Druid for Internet trends and analytics management inside its new [Data-Driven Contents Management System](http://www.italiaonline.it/en/supereva-a-new-online-publishing-experience/).
Italiaonline is the first Italian internet company, with the two most visited web portals, Libero and Virgilio, and the most used email service of the country @libero.it. Italiaonline features 16.8 million unique users per month&ast;, 4.8 billion impressions per month&ast;&ast;,  10.2 million active email accounts&ast;&ast; and a 58% active reach&ast;.

*&ast; Source: Audiweb View, powered by Nielsen, TDA 2H 2015; &ast;&ast; Internal data, December 2015*

## Jolata

Jolata leverages Druid as the analytics data store for the realtime network perfomance managment platform. Injesting over 35 billion events per day, Jolata calculates a billion metrics every minute to visualize precise network metrics in real-time, and enable operators to quickly drill down and perform root cause analysis.

* [Realtime Analytics Powered by Druid](https://www.linkedin.com/pulse/realtime-analytics-powered-druid-kiran-patchigolla)

## LDMobile

LDMobile is a mobile DSP for the RTB. We use Druid to aggregate some metrics in order to propose to our customers a real-time dashboard showing performance indicators of their campaigns.

## LifeBuzz

LifeBuzz is a popular web property that serves tens of millions of pageviews per day. We use Druid for all our advanced analytics needs, including in-house analysis and professional realtime analytics for our sponsored media partners.

## LiquidM

LiquidM uses Druid for real-time drill-down reporting. LiquidM is also contributing back to the community by creating and maintaining a ruby client library for interacting with Druid located at <http://github.com/liquidm/ruby-druid>.

* [Reporting at LiquidM](http://liquidm.com/reporting-at-liquidm/)

## Metamarkets

Druid is the primary data store for Metamarkets’ full stack visual analytics
service for the RTB (real time bidding) space. Ingesting over 30 billion events
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

## Redborder

redBorder is an open source, scale out, cybersecurity analytics platform based on Druid. We hope its full-blown web interface, dashboard and report systems, and ready-to-use real-time pipeline foster other Druid users to create a strong community around it. To see more, please visit redborder.org 

## Sina Weibo

Weibo UVE(Unified Value Evaluation) team of Advertising Platform is using Druid as the realtime analysis tool of the data insight system, which processing billions events everyday.

## SK Telecom

SK Telecom is the leading telecommunication and platform solution company. Druid enable us to discover the business insight interactively from telecommunication, manufacturing big data.

## Skyport Systems

Skyport Systems provides zero-effort, low-touch secure servers that help organizations to rapidly deploy and compartmentalize security-critical workloads. We use Druid as part of our analytics backend to provide real-time insight to our customers about their workload behavior.

## Smyte

Smyte provides an API and UI for detecting and blocking bad actors on the internet. Druid powers the analytics portion of our user interface providing insight into what users are doing on the website, and specifically which features are unique between different sets of users.

## Streamlyzer

Streamlyzer uses Druid as a next generation online video analytics for online video companies or publishers. Streamlyzer is gathering information from real end-users of our customers and provides visualized real-time analytics in dashboard showing how video contents are delivered and how end-users are experiencing the streaming service.

## Time Warner Cable

TWC uses Druid for exploratory analytics.

## TripleLift

TripleLift uses Druid to provide insights into performance aspects of its native programmatic exchange for sales/business development opportunities, and to provide reporting used by advertisers and publishers.

##VideoAmp

At VideoAmp, Druid is a key component of our Big Data stack. It powers our real-time video advertising analytics at low granularity and huge scale. Druid has helped us minimized the time between event, insight and action.

## Vigiglobe

Vigiglobe turns the noise of Social Media into real-time Smart Content. To this end, Druid enables us to maintain high request throughput coupled with huge data absorption capacity.

## ViralGains

ViralGains uses Druid for real-time analysis of millions of viral video views, shares, and conversations.

## Xiaomi

Xiaomi uses Druid as an analytics tool to analyze online advertising data.

## Yahoo

Yahoo uses Druid to power various customer-facing audience and advertising analytics products.

* [Complementing Hadoop at Yahoo: Interactive Analytics with Druid](http://yahooeng.tumblr.com/post/125287346011/complementing-hadoop-at-yahoo-interactive)

## YeahMobi

YeahMobi uses Druid to power a dashboard used for ad-tech analytics such as impression and conversion tracking, unique IP statistics, and aggregating metrics such as costs and revenues.

## Youku Tudou

Youku Tudou employs Druid for real-time advertising analysis of huge volumes of data.

<hr/>

[Add Your Company](https://github.com/druid-io/druid-io.github.io/blob/master/druid-powered.md)
