---
published: false
---


In this post, we'll look at building Druid Applications in the [R language](http://www.r-project.org/). RDruid is a Druid library for R, available here: [https://github.com/metamx/RDruid](https://github.com/metamx/RDruid) 

To setup Druid's webstream example, grab the Druid tarball at [http://static.druid.io/artifacts/releases/druid-services-0.5.54-bin.tar.gz](http://static.druid.io/artifacts/releases/druid-services-0.5.54-bin.tar.gz)

	tar -zxvf druid-services-*-bin.tar.gz
    cd druid-services-0.5.54
    ./run_example_server.sh
    Enter webstream

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
    
Which results in:

![Druid GGPlot Time Series](/_posts/r_druid_ggplot.png)
  
A more complicated Shiny web application is available on [github here](https://github.com/rjurney/druid-application-development/tree/master/R).