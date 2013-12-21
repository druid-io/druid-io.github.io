# Speedy Analytics: Combining the Druid Database with the R programming Language

What if you could combine a statistical analysis language with the power of an analytics database for instant insights into realtime data? You'd be able to draw analytical conclusions from data streams at the speed of now. That's what combining the power of a [Druid database](http://druid.io) with the prowess of [R](http://www.r-project.org) can do.

In this blog, we'll look at how to analyze real live Twitter data using nothing more than your computer, an Internet connection, and OSS applications. Better yet, instead of setting up a complicated cluster to run all this, we'll achieve our goal with *only one* node.

## What You'll Need

You'll need the following:

* The Druid Twitter Example 
    This is available in a JAR file ([druid-services-0.5.6-SNAPSHOT](http://static.druid.io/artifacts/releases/druid-services-0.5.6-SNAPSHOT-bin.tar.gz)) and is described in an [earlier blog post](http://druid.io/blog/2013/08/06/twitter-tutorial.html) on the Twitter example. This is the [Druid Realtime server]( that will consume the Twitter data.

* The [R application](http://www.r-project.org/) for your platform. 

* The [RStudio](http://www.rstudio.com/) IDE (recommended).
    RStudio is what we used. We'll fetch and load RDruid and other dependencies in RStudio.
    
* A Twitter Account
    How you'll get streaming Twitter data.
    

## Set Up Druid and the Twitterstream

First download and unpack druid-services-0.5.6-SNAPSHOT. Let's call it its root directory $DRUID_HOME.

Next, register with the Twitter API. Log in at the [Twitter developer's site](https://dev.twitter.com/apps/new) and fill out the form for creating an application, using any website and callback URL. Make note of the credentials that are then generated. You can enter them when prompted by the Druid startup script, or save them in a `twitter4j.properties` (nicer if you ever restart the server). If using a properties file, save it under `$DRUID_HOME/examples/twitter`. The file should look like this:

~~~
oauth.consumerKey=yourTwitterConsumerKey
oauth.consumerSecret=yourTwitterConsumerSecret
oauth.accessToken=yourTwitterAccessToken
oauth.accessTokenSecret=yourTwitterAccessTokenSecret
~~~

Now start the server with `$DRUID_HOME/run_example_server.sh`. When prompted, you'll choose the "twitter" example. If you're using the properties file, the server should start right up. Otherwise, you'll have the answer the prompts with the credentials you obtained from Twitter. See the [original post about the Twitter example](http://druid.io/blog/2013/08/06/twitter-tutorial.html) for what to look for in stdout after a successful start.

## Set Up RStudio

