---
title: Real Real-Time. For Real.
layout: post
author: Eric Tschetter
image: http://metamarkets.com/wp-content/uploads/2013/05/Clocks.jpg
---

_Danny Yuan, Cloud System Architect at Netflix, and I recently co-presented at
the Strata Conference in Santa Clara. [The
presentation](http://www.youtube.com/watch?v=Dlqj34l2upk) discussed how Netflix
engineers leverage [Druid](http://metamarkets.com/product/technology/),
Metamarkets’ open-source, distributed, real-time, analytical data store, to
ingest 150,000 events per second (billions per day), equating to about 500MB/s
of data at peak (terabytes per hour) while still maintaining real-time,
exploratory querying capabilities. Before and after the presentation, we had
some interesting chats with conference attendees. One common theme from those
discussions was curiosity around the definition of “real-time” in the real
world and how Netflix could possibly achieve it at those volumes. This post is
a summary of the learnings from those conversations and a response to some of
those questions._

### What is Real-time?

Real-time has become a heavily overloaded term so it is important to properly
define it. I will limit our discussion of the term to its usage in the data
space as it takes on different meanings in other arenas. In the data space, it
is now commonly used to refer to one of two kinds of latency: query latency and
data ingestion latency.

Query latency is the rate of return of queries. It assumes a static data set
and refers to the speed at which you can ask questions of that data set. Right
now, the vast majority of “real-time” systems are co-opting the word real-time
to refer to “fast query latency.” I do not agree with this definition of
“real-time” and prefer “interactive queries,” but it is the most prevalent use
of real-time and thus is worth noting.

Data ingestion latency is the amount of time it takes for an event to be
reflected in your query results. An example of this would be the amount of time
it takes from when someone visits your website to when you can run a query that
tells you about that person’s activity on your site. When that latency is close
to a few seconds, you feel like you are seeing what is going on right now or
that you are seeing things in “real-time.” This is what I believe most people
assume when they hear about “real-time data.” However, rapid data ingestion
latency is the lesser used definition due to of the lack of infrastructure to
support it at scale (tens of billions of events/terabytes of data per day),
while the infrastructure to support fast query latencies is easier to create
and readily available.

### What’s Considered Real-Time?

Okay, now that we have a definition of real-time and that definition depends on
latency, there’s the remaining question of which latencies are good enough to
earn the “real-time” moniker. The truth is that it’s up to interpretation. The
key point is that the people who see the output of the queries feel like they
are looking at what is going on “right now.” I don’t have any
scientifically-driven methods of understanding where this boundary is, but I do
have experience from interacting with customers at Metamarkets.

Conclusions first, descriptions second. To be considered real-time, query
latency must be below 5 seconds and data ingestion latency must be below 15
seconds.

### Why Druid?

Of course, in my infinite bias, I’m going to tell you about how Druid is able
to handle data ingestion latencies in the sub-15 second range. If I didn’t tell
you about that, then the blog post would be quite pointless. If you are
interested in how Druid is able to handle the query latency side of the
endeavor, please [watch the video](http://www.youtube.com/watch?v=eCbXoGSyHbg)
from my October talk at Strata NY. I will continue with a discussion of the
data ingestion side of the story.

### How does Druid do it?

If you want to deeply understand Druid, then a great place to start is its
[whitepaper](http://static.druid.io/docs/druid.pdf)
but we will provide a brief overview here of how the real-time ingestion piece
achieves its goals. Druid handles real-time data ingestion by having a separate
node type: the descriptively-named “real-time” node. Real-time nodes
encapsulate the functionality to ingest and query data streams. Therefore, data
indexed via these nodes is immediately available for querying. Typically, for
data durability purposes, a message bus such as
[Kafka](http://kafka.apache.org/) sits between the event creation point and the
real-time node.

The purpose of the message bus is to act as a buffer for incoming events. In an
event stream, the message bus maintains offsets indicating the point a
real-time node has read up to. Then, the real-time nodes can update these
offsets periodically.

Real-time nodes pull data in from the message bus and buffer it in indexes that
do not hit disk. To minimize the impact of losing a node, the nodes will
persist their indexes to disk either periodically or after some maximum size
threshold is reached. After each persist, a real-time node updates the message
bus, informing it of everything it has consumed so far (this is done by
“committing the offset” in Kafka). If a real-time node fails and recovers, it
can simply reload any indexes that were persisted to disk and continue reading
the message bus from the point the last offset was committed.

Real-time nodes expose a consolidated view of the current and updated buffer
and of all of the indexes persisted to disk. This allows for a consistent view
of the data on the query side, while still allowing us to incrementally append
data. On a periodic basis, the nodes will schedule a background task that takes
all of the persisted indexes of a data source, merges them together to build a
segment and uploads it to deep storage. It then signals for the historical
compute nodes to begin serving the segment. Once the compute nodes load up the
data and start serving requests against it, the real-time node no longer needs
to maintain its older data. The real-time nodes then clean up the older segment
of data and begin work on their new segment(s). The intricate and ongoing
sequence of ingest, persist, merge, and handoff is completely fluid. The people
querying the system are unaware of what is going on behind the scenes and they
simply have a system that works.

### TL;DR, but yet you somehow made it to the end of the post:

A deep understanding of the problem, specifically the end-user’s expectations
and how that will affect their interactions, is key to designing a
technological solution to a problem. When dealing with transparency and
analytical needs for large quantities of data, the big questions around user
experience that must be answered are how soon data needs to be available and
how quickly queries need to return.

Hopefully this blog helped clarify the considerations around these two key
components and how infrastructure can be developed to handle it.

Lastly, the shameless plug for Druid: you should use Druid.

Druid is open source, you can download it and run it on your own infrastructure
for your own problems. If you are interested in learning more about Druid or
trying it out, the code is available on
[GitHub](https://github.com/metamx/druid) and our [wiki with documentation is
available here](https://github.com/metamx/druid/wiki). Finally, to complete
the link soup at the bottom of our post,
[here] is our introductory
presentation at Strata](http://www.youtube.com/watch?v=eCbXoGSyHbg) and [here
is our most recent Strata talk](http://www.youtube.com/watch?v=Dlqj34l2upk) with Danny about real-time in Santa Clara.

[Clocks photograph by Image Club Graphics via Sean
Turvey](http://www.flickr.com/photos/74586726@N00/4176786834/)
