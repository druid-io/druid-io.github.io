---
published: false
layout: post
---

In this post, we'll look at building Druid Applications in the [R language](http://www.r-project.org/). RDruid is a Druid library for R, available here: [https://github.com/metamx/RDruid](https://github.com/metamx/RDruid) 



To install RDruid and the other dependencies for this tutorial, simply run these commands in R:

	install.packages("devtools")
	library(devtools)
 
	install.packages(c("shiny", "ggplot2"))
	install_github("RDruid", "metamx")

Lets query Druid and make a simple chart:

	library(RDruid)
    library(ggplot2)
    
    url <- druid.url(host="localhost", port="8083")
    datasource <- "wikipedia"
    timespan <- interval(ymd(20130101), ymd(20200101))

    tsdata <- druid.query.timeseries(url=url, dataSource=datasource,
                            intervals = timespan,
                            aggregations = sum(metric("count")),
                            granularity = granularity("PT1M")
    )
    
	print(ggplot(data=tsdata, aes_string(x="timestamp", y="rows")) + geom_line())
    
    

