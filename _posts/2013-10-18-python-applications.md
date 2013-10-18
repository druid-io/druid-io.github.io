---
published: false
layout: post
---

In this post we will demonstrate building a Druid application in Python. Code for this example is available [on github](https://github.com/rjurney/druid-application-development).

## Webstream Example

To setup Druid's webstream example, grab the Druid tarball at [http://static.druid.io/artifacts/releases/druid-services-0.5.54-bin.tar.gz](http://static.druid.io/artifacts/releases/druid-services-0.5.54-bin.tar.gz)

	tar -zxvf druid-services-*-bin.tar.gz
    cd druid-services-0.5.54
    ./run_example_server.sh
    Enter webstream

## Installing pyDruid

Druid's python library is called pyDruid, and can be installed via:

	pip install pydruid

The source to pydruid is available on github: [https://github.com/metamx/pydruid](https://github.com/metamx/pydruid)

## Working with pyDruid

A simple example of querying Druid with pyDruid looks like this:

	#!/usr/bin/env python

	from pydruid.client import *

	# Druid Config
	endpoint = 'druid/v2/?pretty'
	demo_bard_url =  'http://localhost:8083'
	dataSource = 'webstream'
	intervals = ["2013-01-01/p1y"]

	query = pyDruid(demo_bard_url, endpoint)

	counts = query.timeseries(dataSource = dataSource, 
	              granularity = "minute", 
	              intervals = intervals, 
	              aggregations = {"count" : doubleSum("rows")}
	              )

	print counts
    
Which results in this:

	[{'timestamp': '2013-09-30T23:31:00.000Z', 'result': {'count': 0.0}}, {'timestamp': '2013-09-30T23:32:00.000Z', 'result': {'count': 0.0}}, {'timestamp': '2013-09-30T23:33:00.000Z', 'result': {'count': 0.0}}, {'timestamp': '2013-09-30T23:34:00.000Z', 'result': {'count': 0.0}}]

## Conclusion

In our next post, we'll build a full-blown Druid Python web application!

