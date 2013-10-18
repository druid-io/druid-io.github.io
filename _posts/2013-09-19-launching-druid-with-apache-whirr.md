---
published: true
layout: post
author: Russell Jurney
---

Without Whirr, to launch a Druid cluster, you'd have to provision machines yourself, and then install each node type manually. This process is outlined [here](https://github.com/metamx/druid/wiki/Tutorial%3A-The-Druid-Cluster). With Whirr, you can boot a druid cluster by editing a simple configuration file and then issuing a single command!

## About Druid ##
Druid is a rockin' exploratory analytical data store capable of offering interactive query of big data in realtime - as data is ingested. Druid cost effectively drives 10's of billions of events per day for the [Metamarkets](http://www.metamarkets.com) platform, and Metamarkets is committed to building Druid in open source.

## About Apache Whirr ##
Apache Whirr is a set of libraries for running cloud services. It allows you to use simple commands to boot clusters of distributed systems for testing and experimentation. Apache Whirr makes booting clusters easy.

## Installing Whirr ##
Until Druid is part of an Apache release (a month or two from now) of Whirr, you'll need to clone the code from [https://github.com/rjurney/whirr/tree/trunk](https://github.com/rjurney/whirr/tree/trunk) and build Whirr.

    git clone git@github.com:rjurney/whirr.git
    cd whirr
    git checkout trunk
    mvn clean install -Dmaven.test.failure.ignore=true

## Configuring your Cloud Provider ##

You'll need to set these environment variables:

    export WHIRR_PROVIDER=aws-ec2
    export WHIRR_IDENTITY=$AWS_ACCESS_KEY_ID
    export WHIRR_CREDENTIAL=$AWS_SECRET_ACCESS_KEY

## build.properties ##

    cat recipes/druid.properties

Much of the configuration is self explanatory:

    # Change the cluster name here
    whirr.cluster-name=druid

    # Change the number of machines in the cluster here
    whirr.instance-templates=1 zookeeper+druid-mysql+druid-master+druid-broker+druid-compute+druid-realtime
    # whirr.instance-templates=3 zookeeper,1 druid-mysql,2 druid-realtime,2 druid-broker,2 druid-master,5 druid-compute

    # Which version of druid to load
    whirr.druid.version=0.5.54

    # S3 bucket to store segments in
    whirr.druid.pusher.s3.bucket=dummy_s3_bucket

    # The realtime.spec file to use to configure a realtime node
    # whirr.druid.realtime.spec.path=/path/to/druid/examples/config/realtime/realtime.spec


Note that you can change a cluster's configuration with the whirr.instance-templates parameter. This enables you to boot clusters large or small. Note that at least one zookeeper and druid-mysql nodes are required.

## Launching a Druid Cluster with Whirr ##

    bin/whirr launch-cluster --config recipes/druid.properties

When the cluster is ready, ssh instructions will print and we can connect and use the cluster. For more instructions on using a Druid cluster, see [here](https://github.com/metamx/druid/wiki/Querying-your-data). To destroy a cluster when we're done, run:


    bin/whirr destroy-cluster --config recipes/druid.properties


We hope Apache Whirr makes experimenting with Druid easier than ever!