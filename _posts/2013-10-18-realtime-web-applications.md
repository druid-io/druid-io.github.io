---
published: false
layout: post
---

In this post, we will cover the creation of web applications with realtime visualizations using Druid, Ruby/Python and D3.js. Complete code in Ruby and Python for this example is available at [https://github.com/rjurney/druid-application-development](https://github.com/rjurney/druid-application-development).

For more information on the Ruby and Python Druid clients, see here and here. For more information on starting a Druid realtime node, see here.

## Web App in Python

Our Python controller is simple enough. One route serves our HTML/CSS/Javascript, and another serves JSON to our chart.

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
	
