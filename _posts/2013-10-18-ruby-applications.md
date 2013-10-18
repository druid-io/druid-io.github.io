---
published: false
layout: post
---

In this post we will demonstrate building a Druid application in Ruby. Code for this example is available [on github](https://github.com/rjurney/druid-application-development).

## Webstream Example

To setup Druid's webstream example, grab the Druid tarball at [http://static.druid.io/artifacts/releases/druid-services-0.5.54-bin.tar.gz](http://static.druid.io/artifacts/releases/druid-services-0.5.54-bin.tar.gz)

	tar -zxvf druid-services-*-bin.tar.gz
    cd druid-services-0.5.54
    ./run_example_server.sh
    Enter webstream

## ruby-druid

The [ruby-druid project](https://github.com/madvertise/ruby-druid) from Madvertise provides Ruby connectivity with Druid. To install ruby-druid, you'll need to get the source:

	git clone git@github.com:madvertise/ruby-druid.git

Then use bundler to build ruby-druid:

	gem install bundler
    bundle install

Next you'll need to copy the file dot_driplrc_example to .dripl and edit this file to include this line:
    
	options :static_setup => { 'realtime/webstream' => 'http://localhost:8083/druid/v2/' }

To launch the repl, run:

	bundle exec bin/dripl

Now you can query the webstream example:

	long_sum(:added)[-7.days].granularity(:minute)

Or, to query in raw Ruby, run something like this:

	bundle exec irb

	client = Druid::Client.new('', {:static_setup => { 'realtime/webstream' => 'http://localhost:8083/druid/v2/' }})
	query = Druid::Query.new('realtime/webstream').double_sum(:rows).granularity(:minute)
	result = client.send(query)
	puts result
	["2013-10-03T23:29:00.000Z":{"rows"=>3124.0}, "2013-10-03T23:30:00.000Z":{"rows"=>73508.0}, "2013-10-03T23:31:00.000Z":{"rows"=>26791.0}, "2013-10-03T23:32:00.000Z":{"rows"=>29966.0}, "2013-10-03T23:33:00.000Z":{"rows"=>21450.0}]

Thats it! Simple enough. In our next post we'll look at building a full-blown web application over Druid.