---
title: 15 Minutes to Live Druid
layout: post
author: Jaypal Sethi
image: http://metamarkets.com/wp-content/uploads/2013/04/Druid-Cluster1.jpg
---

Big Data reflects today’s world where data generating events are measured in
the billions and business decisions based on insight derived from this data is
measured in seconds. There are few tools that provide deep insight into both
live and stationary data as business events are occurring; Druid was designed
specifically to serve this purpose.

If you’re not familiar with Druid, it’s a powerful, open source, real-time
analytics database designed to allow queries on large quantities of streaming
data – that means querying data as it’s being ingested into the system (see
previous [blog post](http://metamarkets.com/2012/metamarkets-open-sources-druid/).
Many databases claim they are real-time because they are
“real fast;” this usually works for smaller workloads or for customers with
infinite IT budgets. For companies like Netflix, whose engineers use Druid to
cull through [70 billion log events per day, ingesting over 2 TB per hour at
peak times](http://www.slideshare.net/g9yuayon/netflix-druidstrata2013)
(more on this in a later blog post), real-time means they have to
query data as it’s being ingested into the system.

Taking Druid a step further, the database provides benefits for both real-time
and non-real-time uses by allowing arbitrary drill-downs and n-dimensional
filtering without any impact on performance. Beyond being a key feature used by
[Metamarkets](http://www.metamarkets.com/) (average query times of less than
500 milliseconds), it’s also a valuable capability for Netflix, and a key use
case for the R community.

Outside of features and functionality, the value of so many successful open
source projects can be attributed to their user community. As a sponsor of this
project, one of our core goals here at Metamarkets is to support our growing
Druid Community. In fact, this blog post is a good example of responding to
community feedback to make Druid immediately accessible to users who want to
explore and become familiar with the database.

Today, we’re excited to announce a ready to run Druid Personal Demo Cluster
with a pre-loaded test workload: the Wikipedia edit stream. The DPDC (Druid
Personal Demo Cluster) is available via AWS as a StackTemplate and is free to
use and run; all that’s required is your own AWS account and 15 minutes.

The DPDC is designed to provide a small, but realistic and fully functional
Druid environment, allowing users to become familiar with a working example of
a Druid system, write queries and understand how to manage the environment. The
DPDC is also extensible; once users are familiar with Druid, we encourage them
to load their own data and to continue learning. While the DPDC is far from an
actual deployment, it’s designed to be an educational tool and an on-ramp
towards your own deployment.

The AWS (Amazon Web Services) [CloudFormation](http://aws.amazon.com/cloudformation/)
Template pulls together two Druid AMIs and creates a pre-configured Druid
Cluster preloaded with the Wikipedia edit stream, and a basic query interface
to help you become familiar with Druid capabilities like drill-downs on
arbitrary dimensions and filters.

What’s in this Druid Demo Cluster?

1. A single Master node is based on a preconfigured AWS AMI (Amazon Machine
Image) and also contains the Zookeeper broker, the Indexer, and a MySQL
instance which keeps track of system metadata. You can read more about Druid
architecture [here](https://github.com/metamx/druid/wiki/Design).

2. Three compute nodes based on another AWS AMI; these compute nodes, have been
pre-configured to work with the Master node and already contain the Wikipedia
edit stream data (no specific setup is required).  How to Get Started:

Our quick start guide is located on the Druid Github wiki:
<https://github.com/metamx/druid/wiki/Druid-Personal-Demo-Cluster>

For support, please join our mailing list (Google Groups):
<https://groups.google.com/d/forum/druid-development>. We welcome your feedback
and contributions as we consider adding more content for the DPDC.

Need more?

Try out our connectors – we recently open-sourced our RDruid connector and will
be holding a Druid Meetup where we’ll conduct a hands-on mini-lab to get
attendees working with Druid.

The community also contributed a Ruby client
(<https://github.com/madvertise/ruby-druid>) and is rumored to be working on
Python and SQL clients. And, a massive thanks to the team at
[SkilledAnalysts](http://skilledanalysts.com/) for their contributions to the
DPDC and their continued involvement in the Druid community.

Finally, if you’re looking for more information on Druid, you can find it on
our [technology page](http://metamarkets.com/product/technology/).

IMAGE: [PEDRO MIGUEL SOUSA](http://www.shutterstock.com/gallery-86570p1.html) / [SHUTTERSTOCK](http://www.shutterstock.com/)

