---
title: Real Real-Time. For Real.
layout: post
author: Eric Tschetter
---

_Danny Yuan, Cloud System Architect at Netflix, and I recently co-presented at the Strata Conference in Santa Clara. The presentation discussed how Netflix engineers leverage Druid, Metamarkets’ open-source, distributed, real-time, analytical data store, to ingest 150,000 events per second (billions per day), equating to about 500MB/s of data at peak (terabytes per hour) while still maintaining real-time, exploratory querying capabilities. Before and after the presentation, we had some interesting chats with conference attendees. One common theme from those discussions was curiosity around the definition of “real-time” in the real world and how Netflix could possibly achieve it at those volumes. This post is a summary of the learnings from those conversations and a response to some of those questions._

### What is Real-time?

Real-time has become a heavily overloaded term so it is important to properly define it. I will limit our discussion of the term to its usage in the data space as it takes on different meanings in other arenas. In the data space, it is now commonly used to refer to one of two kinds of latency: query latency and data ingestion latency.

Query latency is the rate of return of queries. It assumes a static data set and refers to the speed at which you can ask questions of that data set. Right now, the vast majority of “real-time” systems are co-opting the word real-time to refer to “fast query latency.” I do not agree with this definition of “real-time” and prefer “interactive queries,” but it is the most prevalent use of real-time and thus is worth noting.

Data ingestion latency is the amount of time it takes for an event to be reflected in your query results. An example of this would be the amount of time it takes from when someone visits your website to when you can run a query that tells you about that person’s activity on your site. When that latency is close to a few seconds, you feel like you are seeing what is going on right now or that you are seeing things in “real-time.” This is what I believe most people assume when they hear about “real-time data.” However, rapid data ingestion latency is the lesser used definition due to of the lack of infrastructure to support it at scale (tens of billions of events/terabytes of data per day), while the infrastructure to support fast query latencies is easier to create and readily available.

### What’s Considered Real-Time?

Okay, now that we have a definition of real-time and that definition depends on latency, there’s the remaining question of which latencies are good enough to earn the “real-time” moniker. The truth is that it’s up to interpretation. The key point is that the people who see the output of the queries feel like they are looking at what is going on “right now.” I don’t have any scientifically-driven methods of understanding where this boundary is, but I do have experience from interacting with customers at Metamarkets.

Conclusions first, descriptions second. To be considered real-time, query latency must be below 5 seconds and data ingestion latency must be below 15 seconds.
