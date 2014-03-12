
Druid is set up to ingest timeseries  data in real time, and one of the great things it's capable of is allowing immediate and speedy ad hoc queries of that data as it's ingested. But there may be situations where you might want to batch-ingest data, such as when you've got output from a database or are working with historical data from some other source. I ran into such a situation recently while I was looking at some streamflow data from USGS sensors.

## The Data
The USGS publishes water-related data from literally millions of sensors placed at waterways, lakes, beaches, and similar locations, and there are various ways to access that data. I wanted specific data for the [Napa River](https://en.wikipedia.org/wiki/Napa_River), and chose to use the [National Water Information System map](http://maps.waterdata.usgs.gov/mapper/index.html) to quickly locate the right USGS sensor.

Since I thought it would be interesting to bring that data into the [R statistical environment](http://www.r-project.org), I also chose to use a specific R package ("waterData") to grab the data I needed. 

1. Find a sensor ID (one way, use this map: http://maps.waterdata.usgs.gov/mapper/index.html). You can learn what type of data is available for the sensor and how much historical data is available.
2. Get the R package that can load USGS sensor data ("waterData").
3. Use that package's importDVs() function to download data from USGS.
For example:
> napa_flow <- importDVs("11458000", code="00060", stat="00003", sdate="1963-01-01", edate="2013-12-31")
where code specified the type of data desired (in this case, "Discharge, cubic feet per second" per day), stat is the type of statistic on the data (in this case, mean), start and end dates.
You can now run R functions on the data.
4. Write the data to a file:
> write.table(napa_flow, file="~/napa-flow.tsv", sep="\t", col.names = NA )
5. Start Zookeeper, MySQL, indexing service, coordinator, and historical node.
6. Massage the data as needed (remove header – but save, exclude unwanted columns – in R)
7. Create and submit the task.json, but check granularity (as wrong granularity for by-day data can lead to segment per day), probably should be monthly for daily data.
8. Go to the indexing service's console to see the segment created from the data. http://localhost:8087/console.html
9. Query the Druid cluster.
