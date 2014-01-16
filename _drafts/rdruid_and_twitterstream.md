# Realtime Analytics: Combining the Druid Database with the R Programming Language

What if you could combine a statistical analysis language with the power of an analytics database for instant insights into realtime data? You'd be able to draw conclusions from analyzing data streams at the speed of now. That's what combining the prowess of a [Druid database](http://druid.io) with the power of [R](http://www.r-project.org) can do.

In this blog, we'll look at how to analyze real live Twitter data using nothing more than a laptop, an Internet connection, and OSS applications. Better yet, instead of setting up a complicated cluster to run all this, we'll achieve our goal with *only one* node.

## What You'll Need

You'll need the following:

* The Druid Twitter Example 
    This is available in a JAR file ([druid-services-0.5.6-SNAPSHOT](http://static.druid.io/artifacts/releases/druid-services-0.5.6-SNAPSHOT-bin.tar.gz)) and is described in an [earlier blog post](http://druid.io/blog/2013/08/06/twitter-tutorial.html) on the Twitter example. It contains everything we'll need to run Druid&mdash;or one realtime node to be precise. We'll go over how to set it up.
    
* The [R application](http://www.r-project.org/) for your platform. 

* The [RStudio](http://www.rstudio.com/) IDE (recommended).
    RStudio is what we used. Much nicer to work with than the R console or command line.
    
* A Twitter Account (you don't have one?!)
    This is how you'll get a sample of streamed Twitter data.
    

## Set Up the Twitterstream

First, register with the Twitter API. Log in at the [Twitter developer's site](https://dev.twitter.com/apps/new) and fill out the form for creating an application; use any website and callback URL to complete the form. 

Make note of the credentials that are then generated. You can enter them when prompted by the Twitter-example startup script, or save them in a `twitter4j.properties` (nicer if you ever restart the server). If using a properties file, save it under `$DRUID_HOME/examples/twitter`. The file should contains this (with your real keys):

~~~
oauth.consumerKey=<yourTwitterConsumerKey>
oauth.consumerSecret=<yourTwitterConsumerSecret>
oauth.accessToken=<yourTwitterAccessToken>
oauth.accessTokenSecret=<yourTwitterAccessTokenSecret>
~~~


## Start Up the Realtime Node

First, download and unpack [`druid-services-0.5.6-SNAPSHOT`](http://static.druid.io/artifacts/releases/druid-services-0.5.6-SNAPSHOT-bin.tar.gz).

Now start the server with `$DRUID_HOME/run_example_server.sh`. When prompted, you'll choose the "twitter" example. If you're using the properties file, the server should start right up. Otherwise, you'll have to answer the prompts with the credentials you obtained from Twitter. 

Once the Realtime node successfully, you'll see "Connected_to_Twitter" printed, as well as messages similar to the following:

    2014-01-13 19:35:59,646 INFO [chief-twitterstream] druid.examples.twitter.TwitterSpritzerFirehoseFactory - nextRow() has returned 1,000 InputRows

See the [original post about the Twitter example](http://druid.io/blog/2013/08/06/twitter-tutorial.html) for more info on what to look for in stdout after a successful start.

If the Twitter example is running, you now have a Druid Realtime node ingesting Twitter data in ... real time.


## Set Up in RStudio

After you get RStudio running, install and load the following packages:

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
druid <- druid.url("localhost:8080")
```

## Querying the Realtime Node

[Druid queries](http://druid.io/docs/latest/Tutorial:-All-About-Queries.html are in the format of JSON objects, but in R they'll have a different format. Let's look at this with a simple query that will give the time range of the Twitter data currently in our Druid node:

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

* About to connect() to localhost port 8080 (#0)
*   Trying ::1...
* connected
* Connected to localhost (::1) port 8080 (#0)
> POST /druid/v2/ HTTP/1.1
Host: localhost:8080
Accept: */*
Accept-Encoding: gzip
Content-Type: application/json
Content-Length: 151

* upload completely sent off: 151 out of 151 bytes
< HTTP/1.1 200 OK
< Content-Type: application/x-javascript
< Transfer-Encoding: chunked
< Server: Jetty(6.1.x)
< 
* Connection #0 to host localhost left intact
* Closing connection #0
                  minTime                   maxTime 
"2014-01-13 19:35:00 UTC" "2014-01-13 19:39:00 UTC" 
```

At the very end, we get a minTime and maxTime, the boundaries to our data set.

Now lets say we are interested the number of tweets per language during that time period. We need to do an aggregation via a groupBy query (see RDruid help in RStudio):

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
* About to connect() to localhost port 8080 (#0)
*   Trying ::1...
* connected
* Connected to localhost (::1) port 8080 (#0)
> POST /druid/v2/ HTTP/1.1
Host: localhost:8080
Accept: */*
Accept-Encoding: gzip
Content-Type: application/json
Content-Length: 489

* upload completely sent off: 489 out of 489 bytes
< HTTP/1.1 200 OK
< Content-Type: application/x-javascript
< Transfer-Encoding: chunked
< Server: Jetty(6.1.x)
< 
* Connection #0 to host localhost left intact
* Closing connection #0
    timestamp tweets    lang
1  2014-01-13  10005      ar
2  2014-01-13    151      ca
3  2014-01-13     37      cs
4  2014-01-13     96      da
5  2014-01-13   1264      de
6  2014-01-13    111      el
7  2014-01-13  72293      en
8  2014-01-13      1   en-AU
9  2014-01-13     28   en-GB
10 2014-01-13   1309   en-gb
11 2014-01-13  29054      es
12 2014-01-13      2   es-MX
13 2014-01-13     21      eu
14 2014-01-13     20      fa
15 2014-01-13     96      fi
16 2014-01-13      2     fil
17 2014-01-13   9624      fr
18 2014-01-13     30      gl
19 2014-01-13    108      he
20 2014-01-13      1      hi
21 2014-01-13     76      hu
22 2014-01-13   1256      id
23 2014-01-13      1      in
24 2014-01-13   1998      it
25 2014-01-13   5942      ja
26 2014-01-13    420      ko
27 2014-01-13      1      lt
28 2014-01-13      1      ms
29 2014-01-13      7     msa
30 2014-01-13      3      nb
31 2014-01-13   1889      nl
32 2014-01-13    106      no
33 2014-01-13    453      pl
34 2014-01-13   9960      pt
35 2014-01-13      8      ro
36 2014-01-13   3139      ru
37 2014-01-13    432      sv
38 2014-01-13     94      th
39 2014-01-13   9497      tr
40 2014-01-13     32      uk
41 2014-01-13      1      ur
42 2014-01-13     15   xx-lc
43 2014-01-13      1   zh-CN
44 2014-01-13      1 zh-Hans
45 2014-01-13     43   zh-cn
46 2014-01-13     13   zh-tw
```
You can refine to this query with more aggregations and post aggregations (math within the results). For example, to find out how many rows in Druid the data for each of those languages takes, we'd use:

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

## Conclusion: This Is Only the End of the Beginning
We've done something interesting with one Druid node and a little bit of realtime data. But essentially, this small example is a microcosm of a fully fledged Druid cluster ingesting terabytes of data that can be immediately queried and examined. 