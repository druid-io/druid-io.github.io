---
title: Meet the Druid and Find Out Why We Set Him Free
layout: post
author: Steve Harris
image: http://metamarkets.com/wp-content/uploads/2013/04/wordle_from_open_source_book-4f737c9-intro.jpg
---

Before jumping straight into why Metamarkets open sourced Druid, I thought I would give a brief dive into what Druid is and how it came about.

_For more details, check out the [Druid white paper](http://static.druid.io/docs/druid.pdf)._

### Introduction

We are lucky to be developing software in a period of extreme innovation. Fifteen years ago, if a developer or ops person went into his or her boss’s office and suggested using a non-relational/non-SQL/non-ACID/non-Oracle approach to storing data, they would pretty much get sent on their way. All problems at all companies were believed to be solved just fine using relational databases.

Skip forward a few years and the scale, latency and uptime requirements of the Internet really started hitting the Googles and Amazons of the world. It was quickly realized that some compromises needed to be made to manage the challenging data issues they were having in a cost-effective way. It was also finally acknowledged that different use cases might benefit from different solutions.

Druid was born out of this era of data stores, purpose-built for a specific set of trade-offs and use cases. We believe that taking part in and keeping pace with this period of innovation requires more than a company. It requires a community.

### So What Are Druid’s Core Values?
								
Druid was built as an analytics data store for Metamarkets’ as-it-happens, interactive SaaS platform targeted at the online advertising industry. It fundamentally needs to ingest tens of billions of events per day per customer and provide sub-second, interactive, slicing and dicing on arbitrary queries. It has to do this in an efficient and cost effective way.

Values:

- 24x7x365x10 (Hours/days, days/a week, days/year, years)
- User speed responses (millis not micros) on arbitrary analytics queries
- Billions of events per day per customer as they happen (fast append)
- Cost-effective data management
- Linear scale-out
- Predictable responses
- Community/Adoption wins

