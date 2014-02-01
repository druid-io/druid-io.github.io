# Realtime Analytics: Combining the Druid Database with the R Programming Language

What if you could combine a statistical analysis language with the power of an analytics database for instant insights into realtime data? You'd be able to draw conclusions from analyzing data streams at the speed of now. That's what combining the prowess of a [Druid database](http://druid.io) with the power of [R](http://www.r-project.org) can do.

In this blog, we'll look at how to bring streamed realtime data into R using nothing more than a laptop, an Internet connection, and open-source applications. And we'll do it with *only one* Druid node.

## What You'll Need

You'll need the [Druid Database](http://static.druid.io/artifacts/releases/druid-services-0.6.52-bin.tar.gz)) and unpack it.

Get [R application](http://www.r-project.org/) for your platform.
We also recommend using [RStudio](http://www.rstudio.com/) as the R IDE, which is what we used to run R.
    
You'll also need a free Twitter account to be able to get a sample of streamed Twitter data.
    

## Set Up the Twitterstream

First, register with the Twitter API. Log in at the [Twitter developer's site](https://dev.twitter.com/apps/new) (you can use your normal Twitter credentials) and fill out the form for creating an application; use any website and callback URL to complete the form. 

Make note of the API credentials that are then generated. Later you'll need to enter them when prompted by the Twitter-example startup script, or save them in a `twitter4j.properties` file (nicer if you ever restart the server). If using a properties file, save it under `$DRUID_HOME/examples/twitter`. The file should contains the following (using your real keys):

~~~
oauth.consumerKey=<yourTwitterConsumerKey>
oauth.consumerSecret=<yourTwitterConsumerSecret>
oauth.accessToken=<yourTwitterAccessToken>
oauth.accessTokenSecret=<yourTwitterAccessTokenSecret>
~~~


## Start Up the Realtime Node

From the Druid home directory, start the Druid Realtime node:

    $DRUID_HOME/run_example_server.sh
    
When prompted, you'll choose the "twitter" example. If you're using the properties file, the server should start right up. Otherwise, you'll have to answer the prompts with the credentials you obtained from Twitter. 

After the Realtime node starts successfully, you should see "Connected_to_Twitter" printed, as well as messages similar to the following:

    2014-01-13 19:35:59,646 INFO [chief-twitterstream] druid.examples.twitter.TwitterSpritzerFirehoseFactory - nextRow() has returned 1,000 InputRows

This indicates that the Druid Realtime node is ingesting tweets in realtime.


## Set Up R

Install and load the following packages:

~~~
install.packages("devtools")
install.packages("ggplot2")

library("devtools")

install_github("RDruid", "metamx")

library(RDruid)
library(ggplot2)
~~~

Now tell RDruid where to find the Realtime node:

```
druid <- druid.url("localhost:8083")
```

## Querying the Realtime Node

[Druid queries](http://druid.io/docs/latest/Tutorial:-All-About-Queries.html) are in the format of JSON objects, but in R they'll have a different format. Let's look at this with a simple query that will give the time range of the Twitter data currently in our Druid node:

```
> druid.query.timeBoundary(druid, dataSource="twitterstream", intervals=interval(ymd(20140101), ymd(20141231)), verbose="true")
```

Let's break this query down:

* `druid.query.timeBoundary` &ndash; The RDruid query that finds the earliest and latest timestamps on data in Druid, within a specified interval.
* `druid` and `dataSource` &ndash; Specify the location of the Druid node and the name of the Twitter data stream.
* `intervals` &ndash; The interval we're looking in. Our choice is more than wide enough to encompass any data we've received from Twitter.
* `verbose` &ndash; The response should also print the JSON object that is posted to the Realtime node, that node's HTTP response, and possibly other information besides the actual response to the query.

By making this a verbose query, we can take a look at the JSON object that RDruid creates from our R query and will post to the Druid node:

{
	"dataSource" : "twitterstream",
	"intervals" : [
		"2014-01-01T00:00:00.000+00:00/2014-12-31T00:00:00.000+00:00"
	],
	"queryType" : "timeBoundary"
}

This is the type of query that Druid can understand. Now let's look at the rest of the post and response:

```
* Adding handle: conn: 0x7fa1eb723800
* Adding handle: send: 0
* Adding handle: recv: 0
* Curl_addHandleToPipeline: length: 1
* - Conn 2 (0x7fa1eb723800) send_pipe: 1, recv_pipe: 0
* About to connect() to localhost port 8083 (#2)
*   Trying ::1...
* Connected to localhost (::1) port 8083 (#2)
> POST /druid/v2/ HTTP/1.1
Host: localhost:8083
Accept: */*
Accept-Encoding: gzip
Content-Type: application/json
Content-Length: 151

* upload completely sent off: 151 out of 151 bytes
< HTTP/1.1 200 OK
< Content-Type: application/x-javascript
< Transfer-Encoding: chunked
* Server Jetty(8.1.11.v20130520) is not blacklisted
< Server: Jetty(8.1.11.v20130520)
< 
* Connection #2 to host localhost left intact
                  minTime                   maxTime 
"2014-01-25 00:52:00 UTC" "2014-01-25 01:35:00 UTC" 
```

At the very end comes the response to our query, a minTime and maxTime, the boundaries to our data set.

### More Complex Queries
Now lets look at some real Twitter data. Say we are interested in the number of tweets per language during that time period. We need to do an aggregation via a groupBy query (see RDruid help in RStudio):

```
druid.query.groupBy(druid, dataSource="twitterstream", 
                    interval(ymd("2014-01-01"), ymd("2015-01-01")), 
                    granularity=granularity("P1D"), 
                    aggregations = (tweets = sum(metric("tweets"))), 
                    dimensions = "lang", 
                    verbose="true")
```

We see some new arguments in this query:

* `granularity` &ndash; This sets the time period for each aggregation (in ISO 8601). Since all our data is in one day and we don't care about breaking down by hour or minute, we choose per-day granularity.
* `aggregations` &ndash; This is where we specify and name the metrics that we're interesting in summing up. We wants tweets, and it just so happens that this metric is named "tweets" as it's mapped from the twitter API, so we'll keep that name as the column head for our output.
* `dimension` &ndash; Here's the actual type of data we're interesting in. Tweets are identified by language in their metadata (using ISO 639 language codes). We use the name of the dimension, "lang," to slice the data along language.

Here's the actual output:

```
{
	"intervals" : [
		"2014-01-01T00:00:00.000+00:00/2015-01-01T00:00:00.000+00:00"
	],
	"aggregations" : [
		{
			"type" : "doubleSum",
			"name" : "tweets",
			"fieldName" : "tweets"
		}
	],
	"dataSource" : "twitterstream",
	"filter" : null,
	"having" : null,
	"granularity" : {
		"type" : "period",
		"period" : "P1D",
		"origin" : null,
		"timeZone" : null
	},
	"dimensions" : [
		"lang"
	],
	"postAggregations" : null,
	"limitSpec" : null,
	"queryType" : "groupBy",
	"context" : null
}
* Adding handle: conn: 0x7fa1eb767600
* Adding handle: send: 0
* Adding handle: recv: 0
* Curl_addHandleToPipeline: length: 1
* - Conn 3 (0x7fa1eb767600) send_pipe: 1, recv_pipe: 0
* About to connect() to localhost port 8083 (#3)
*   Trying ::1...
* Connected to localhost (::1) port 8083 (#3)
> POST /druid/v2/ HTTP/1.1
Host: localhost:8083
Accept: */*
Accept-Encoding: gzip
Content-Type: application/json
Content-Length: 489

* upload completely sent off: 489 out of 489 bytes
< HTTP/1.1 200 OK
< Content-Type: application/x-javascript
< Transfer-Encoding: chunked
* Server Jetty(8.1.11.v20130520) is not blacklisted
< Server: Jetty(8.1.11.v20130520)
< 
* Connection #3 to host localhost left intact
    timestamp tweets  lang
1  2014-01-25   6476    ar
2  2014-01-25      1    bg
3  2014-01-25     22    ca
4  2014-01-25     10    cs
5  2014-01-25     21    da
6  2014-01-25    311    de
7  2014-01-25     23    el
8  2014-01-25  74842    en
9  2014-01-25     20 en-GB
10 2014-01-25    690 en-gb
11 2014-01-25  22920    es
12 2014-01-25      2    eu
13 2014-01-25      2    fa
14 2014-01-25     10    fi
15 2014-01-25     36   fil
16 2014-01-25   1521    fr
17 2014-01-25      9    gl
18 2014-01-25     15    he
19 2014-01-25      1    hi
20 2014-01-25      5    hu
21 2014-01-25   3809    id
22 2014-01-25      4    in
23 2014-01-25    256    it
24 2014-01-25  19748    ja
25 2014-01-25   1079    ko
26 2014-01-25      1    ms
27 2014-01-25     19   msa
28 2014-01-25    243    nl
29 2014-01-25     24    no
30 2014-01-25    113    pl
31 2014-01-25  12707    pt
32 2014-01-25      3    ro
33 2014-01-25   1606    ru
34 2014-01-25      1    sr
35 2014-01-25     76    sv
36 2014-01-25    532    th
37 2014-01-25   1415    tr
38 2014-01-25     30    uk
39 2014-01-25      6 xx-lc
40 2014-01-25      1 zh-CN
41 2014-01-25     30 zh-cn
42 2014-01-25     34 zh-tw
```

This gives an idea of what languages dominate Twitter (at least for the given time range), but it might be nice to see a visual representation. You can use the ggplot2 `geom_bar` function to create a basic bar chart of the data. First, send the query above to a dataframe using the query, called `tweet_langs` in this example, then subset it to take languages with more than a thousand tweets:

    major_tweet_langs <- subset(tweet_langs, tweets > 1000)

Then create the chart:

    ggplot(major_tweet_langs, aes(x=lang, y=tweets)) + geom_bar(stat="identity")

You can refine to this query with more aggregations and post aggregations (math within the results). For example, to find out how many rows in Druid the data for each of those languages takes, use:

```
druid.query.groupBy(druid, dataSource="twitterstream", 
                    interval(ymd("2014-01-01"), ymd("2015-01-01")), 
                    granularity=granularity("all"), 
                    aggregations = list(rows = druid.count(), 
                                        tweets = sum(metric("tweets"))), 
                    dimensions = "lang", 
                    verbose="true")
```

How do you find out what metrics and dimensions are available? You can find the metrics in `$DRUID_HOME/examples/twitter/twitter_realtime.spec`. The dimensions are not as apparent. There's an easy way to query for them from a certain type of Druid node, but not from a Realtime node, which leaves the less-appetizing approach of digging through [code](https://github.com/metamx/druid/blob/druid-0.5.x/examples/src/main/java/druid/examples/twitter/TwitterSpritzerFirehoseFactory.java). To allow for further experimentation, we list some here:

* "first_hashtag"
* "user_time_zone"
* "user_location"
* "is_retweet"
* "is_viral"

Some interesting analyses on current events could be done using these dimensions and metrics. For example, you could filter on specific hashtags for events that happen to be spiking at the time:

```
druid.query.groupBy(druid, dataSource="twitterstream", 
                interval(ymd("2014-01-01"), ymd("2015-01-01")), 
                granularity=granularity("P1D"), 
                aggregations = (tweets = sum(metric("tweets"))), 
                filter =
                    dimension("first_hashtag") %~% "academyawards" |
                    dimension("first_hashtag") %~% "oscars",
                dimensions   = list("first_hashtag"))
```

See the [RDruid wiki](https://github.com/metamx/RDruid/wiki/Examples) for more examples.