---
published: false
layout: post
---

In this post, we will cover the creation of web applications with realtime visualizations using Druid, Ruby/Python and D3.js. Complete code in Ruby and Python for this example is available at [https://github.com/rjurney/druid-application-development](https://github.com/rjurney/druid-application-development).

For more information on the Ruby and Python Druid clients, see here and here. For more information on starting a Druid realtime node, see here.

![Druid Explorer Chart](/_images/druid_explorer_chart.png)

## Web App in Python/Flask/pyDruid

Our Python [Flask](http://flask.pocoo.org/) application is simple enough. One route serves our HTML/CSS/Javascript, and another serves JSON to our chart. The fetch_data method runs our Druid query via the [pyDruid package](https://github.com/metamx/pydruid).

	from flask import Flask, render_template
	import json
	import re
	from pydruid.client import *

	# Setup Flask
	app = Flask(__name__)

	# Druid Config
	endpoint = 'druid/v2/?pretty'
	demo_bard_url =  'http://localhost:8083'
	dataSource = 'webstream'

	# Boot a Druid 
	query = pyDruid(demo_bard_url, endpoint)
	
	# Display our HTML Template
	@app.route("/time_series")
	def time_series():
	    return render_template('index.html')
	
	# Fetch our data from Druid
	def fetch_data(start_iso_date, end_iso_date):
	    intervals = [start_iso_date + "/" + end_iso_date]
	    counts = query.timeseries(dataSource = dataSource, 
	    	                      granularity = "second", 
	    						  intervals = intervals, 
	    						  aggregations = {"count" : doubleSum("rows")}
	    					     )				     
	    json_data = json.dumps(counts)
	    return json_data
	
	# Deliver data in JSON to our chart
	@app.route("/time_series_data/<start_iso_date>/<end_iso_date>")
	def time_series_data(start_iso_date, end_iso_date):
	    return fetch_data(start_iso_date, end_iso_date)
	
	if __name__ == "__main__":
	    app.run(debug=True)

## Web App in Ruby/Sinatra/ruby-druid

Our Ruby application using Sinatra and ruby-druid is similar. First we setup some Sinatra configuration variables, and then repeat the work above:

	# index.rb
	require 'sinatra'
	require 'druid'
	require 'json'
	
	set :public_folder, File.dirname(__FILE__) + '/static'
	set :views, 'templates'
	
	client = Druid::Client.new('', {:static_setup => { 'realtime/webstream' => 'http://localhost:8083/druid/v2/' }})

	def fetch_data(client, start_iso_date, end_iso_date)
	  query = Druid::Query.new('realtime/webstream').time_series().double_sum(:rows).granularity(:second).interval(start_iso_date, end_iso_date)
	  result = client.send(query)
	  counts = result.map {|r| {'timestamp' => r.timestamp, 'result' => r.row}}
	  json = JSON.generate(counts)
	end

	get '/time_series' do
	  erb :index
	end
	
	get '/time_series_data/:start_iso_date/:end_iso_date' do |start_iso_date, end_iso_date|
	  fetch_data(client, start_iso_date, end_iso_date)
	end

## Javascript - D3.js

The meat of our appliation is in Javascript, using the [d3.js](http://d3js.org/) library. The complete code is [here](https://github.com/rjurney/druid-application-development/blob/master/python/templates/index.html) and a working JSFiddle is [here](http://jsfiddle.net/CBsgU/). Commented code highlights are below:

	// Made possible only with help from Vadim Ogeivetsky
	var data = [];
    var maxDataPoints = 20; // Max number of points to keep in the graph
    var nextData = data;
    var dataToShow = [];
    setInterval(function() { 
        data = nextData;

        // Skip when nothing more to show
        if (dataToShow.length == 0) return;

        // Take on datum from the new data and add it to the data
        // (pretend like the data is arriving one at a time)
        data.push(dataToShow.shift());

        // once we get too many things in data, remove some
        // use nextData to train the scales but use the untrimmed data
        // for rendering so that it looks smooth
        nextData = data.length > maxDataPoints ? data.slice(data.length - maxDataPoints) : data;

        // can not show area unless we gave min 2 points
        if (data.length < 2) return;

        // This is a key step that needs to be done because of the 
        // paculiarity of area / line charts
        // (they have one element that represnts N data points - unlike a bar chart) 
        // reaply the old area function (with the old scale) to the new data
        dPath.attr("d", area(data))        

        // Update the scale domains
        x.domain(d3.extent(nextData, function(d) { return d.date; }));
        y.domain([0, d3.max(nextData, function(d) { return d.close; })]);

        // reaply the axis selection (now that the scales have been updated)
        // yay for transition!
        xAxisSel.transition().duration(900).call(xAxis);        
        yAxisSel.transition().duration(900).call(yAxis);

        // reaply the updated area function to animate the area 
        dPath.transition().duration(900).attr("d", area(data))

    }, 1000);

    function convert(ds) { 
        return ds.map(function(d) {   
            return {
                date: new Date(d['timestamp']),
                close: d['result']['count']
            }
        });
    }

    lastQueryTime = new Date(Date.now() - 60 * 1000) // start from one minute ago
    lastQueryTime.setUTCMilliseconds(0)
    function doQuery() {
        now = new Date()
        now.setUTCMilliseconds(0)
        console.log('query!')
        druidQuery(lastQueryTime, now, function(err, results) {
            // add results to the data to be shown
            lastQueryTime = now
            dataToShow = dataToShow.concat(convert(results)) 
            console.log('dataToShow length', dataToShow.length)
        })
    }
    doQuery()
    setInterval(doQuery, 10000)

This chart highlights Druid's dual-realtime abilities: rapidly consuming and querying large streams, and we hope it helps illustrate how to use Druid with realtime visualizations!