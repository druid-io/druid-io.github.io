---
title: Meet the Druid and Find Out Why We Set Him Free
layout: post
author: Steve Harris
image: http://metamarkets.com/wp-content/uploads/2013/04/wordle_from_open_source_book-4f737c9-intro.jpg
---

Before jumping straight into why [Metamarkets](http://metamarkets.com/) open
sourced [Druid](https://github.com/metamx/druid/wiki), I thought I would give a
brief dive into what Druid is and how it came about. For more details, check
out the [Druid white paper](http://static.druid.io/docs/druid.pdf).

### Introduction

We are lucky to be developing software in a period of extreme innovation.
Fifteen years ago, if a developer or ops person went into his or her boss’s
office and suggested using a non-relational/non-SQL/non-ACID/non-Oracle
approach to storing data, they would pretty much get sent on their way. All
problems at all companies were believed to be solved just fine using relational
databases.

Skip forward a few years and the scale, latency and uptime requirements of the
Internet really started hitting the
[Googles](http://research.google.com/archive/spanner.html) and
[Amazons](http://www.read.seas.harvard.edu/~kohler/class/cs239-w08/decandia07dynamo.pdf)
of the world. It was quickly realized that some compromises needed to be made
to manage the challenging data issues they were having in a cost-effective way.
It was also finally acknowledged that different use cases might benefit from
different solutions.

Druid was born out of this era of data stores, purpose-built for a specific set
of trade-offs and use cases. We believe that taking part in and keeping pace
with this period of innovation requires more than a company. It requires a
community.

### So What Are Druid's Core Values?

Druid was built as an analytics data store for Metamarkets’ as-it-happens,
interactive SaaS platform targeted at the online advertising industry. It
fundamentally needs to ingest tens of billions of events per day per customer
and provide sub-second, interactive, slicing and dicing on arbitrary queries.
It has to do this in an efficient and cost effective way.

Values:
- 24x7x365x10 (Hours/days, days/a week, days/year, years)
- User speed responses (millis not micros) on arbitrary analytics queries
- Billions of events per day per customer as they happen (fast append)
- Cost-effective data management
- Linear scale-out
- Predictable responses
- Community/Adoption wins

Non-Values:
- Not a key-value store
- Not focused on fast update or delete

We looked at a lot of options and many of them had some of these properties but none had all.

### Cost Is No Joke

When looking at the success of data management platforms like Hadoop, it is
important not to underestimate how important cost is. While Hadoop is powerful,
it was certainly true that other platforms were managing huge amounts of data
before its existence. One of Hadoop’s fundamental innovations was being able to
manage that data for a much lower cost per gigabyte compared to existing
solutions. This was achieved by a combination of the hardware it could run on,
the flexible programming model, and of course, the fact that it’s open source
and can be used for free.

Druid also takes the value proposition of cost seriously. It compresses rolled
up data to use as little CPU and storage space as it can. It also runs well on
commodity boxes and is open source. The combination of these two factors make
it a cost effective solution to user time querying of 100s of terabytes of
data. This makes the difficult and expensive practical.

### Druid Today?

Druid has been in production living up to its core values at Metamarkets for a
few years now. Since going open source, we’ve had the pleasure of seeing
adoption in a number of different organizations and for different use cases.
Not least of which culminated in co-presenting on [how Netflix engineers use
Druid](http://www.youtube.com/watch?v=Dlqj34l2upk) at Strata in February, 2013.
It has proven to be an excellent platform, processing 10s of billions of
events/day, storing 100s of TB of data, and providing fast, predictable
arbitrary querying.

So why did we open source it?

### Why OSS?

I'm glad you asked. It might seem counter intuitive to open source something so
valuable. We feel like we have some good reasoning.

- While we have some very specific use cases for Druid, we felt like it was
  broadly applicable. Opening it up helps us learn what those other use cases
  are.
- Having others put pressure on it from other verticals is an excellent way to
  keep the data store ahead of our needs. Since the platform is so important to
  us, we want to make sure it has momentum and life.
- We hope that by open sourcing it, we will get outside contributions both in
  code and ideas.

Druid is a very important piece of the Metamarkets platform. That said, it will
always be cheaper and easier for people to use the Metamarkets SaaS solution
rather than building and managing a cluster oneself. However, for those who
have use cases not directly covered by what Metamarkets offers, open source
Druid helps users create software that can leverage the power of a real-time,
scalable analytics-oriented data store.  Looking for more Druid information?
[Learn more about our core technology](http://metamarkets.com/product/technology/).

[PHOTOGRAPH BY NICOLE C. ENGARD](http://www.flickr.com/photos/nengard/5755231610/)
