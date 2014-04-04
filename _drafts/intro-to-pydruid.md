---
title: "Introduction to pydruid"
author: IGAL LEVY
layout: post
---

We've already written about pairing [R with DRuid](http://druid.io/blog/2014/02/03/rdruid-and-twitterstream.html), but Python has powerful and free open-source analysis tools too. Collectively, these are often referred to as the [SciPy Stack](http://www.scipy.org/stackspec.html). To pair SciPy's analytic power with the advantages of querying time-series data in Druid, we created the pydruid connector. This allows Python users to query Druid&mdash;and export the results to useful formats&mdash;in a way that makes sense to them.

## Getting Started
pydruid should run with Python 2.x, and is known to run with Python 2.7.5.

Install pydruid in the same way as you'd install any other Python module on your system. The simplest way is:

```bash
pip install pydruid
```

You should also install Pandas to execute the simple examples below.:

```bash
pip install pandas
```

## Run the Druid Wikipedia Example
[Download Druid](http://druid.io/downloads.html) and unpack Druid. If you are not familiar with Druid, see this [introductory tutorial](http://druid.io/docs/latest/Tutorial:-A-First-Look-at-Druid.html).

From the Druid home directory, start the Druid Realtime node:

```bash
$DRUID_HOME/run_example_server.sh
```

When prompted, choose the "wikipedia" example. After the Druid realtime node is done starting up, messages should appear that start with the following:

    2014-04-03 18:01:32,852 INFO [wikipedia-incremental-persist] ...
    
These messages confirm that the realtime node is ingesting data from the Wikipedia edit stream, and that data can be queried.

## Write, Execute, and Submit a pydruid Query
Let's say we want to see what Wikipedia articles in our data set had the most edits, by language. This is how we'd query Druid directly:

```json
{
  "queryType": "topN",
  "dataSource": "wikipedia",
  "dimension": "language",
  "threshold": 10,
  "metric": "edit_count",
  "granularity": "all",
  "filter": {
     "type": "selector",
     "dimension": "namespace",
     "value": "article"
  },
  "aggregations": [
    {
      "type": "longSum",
      "name": "edit_count",
      "fieldName": "count"
    }
  ],
  "intervals":["2013-06-01T00:00/2020-01-01T00"]
}
```

The results should appear similar to the following:

```json
[ {
  "timestamp" : "2014-04-03T17:59:00.000Z",
  "result" : [ {
    "language" : "en",
    "edit_count" : 4726
  }, {
    "language" : "fr",
    "edit_count" : 1273
  }, {
    "language" : "de",
    "edit_count" : 857
  }, {
    "language" : "ja",
    "edit_count" : 176
  } ]
} ]
```

Here's that same query in Python:

```python
import pydruid.client

query = pydruid.client.PyDruid('http://localhost:8083', 'druid/v2/')

top_langs = query.topn(
    datasource = "wikipedia",
    granularity = "all",
    intervals = "2013-06-01T00:00/2020-01-01T00",
    dimension = "language",
    filter = pydruid.client.Dimension("namespace") == "article",
    aggregations = {"edit_count": pydruid.client.longsum("count")},
    metric = "edit_count",
    threshold = 10
)
```
Let's break this query down:

* query &ndash; The `query` object is instantiated with the location of the Druid realtime node. `qeury` has a type, which is set to `topn` in the next line.
* datasource &ndash; This identifies the datasource. If Druid were ingesting from more than one datasource, this ID would identify the one we want.
* granularity &ndash; The rollup granularity, which could be set to a specific value such as `minute` or `hour`. We want to see the sum count across the entire interval, and so we choose `all`.
* intervals &ndash; The interval of time we're interested in. The value given is extended beyond our actual endpoints to make sure we cover all of the data.
* dimension &ndash; The dimension we're interested in, which happens to be language. Language is an attribute of the [Wikipedia recent-changes feed's metadata](http://meta.wikimedia.org/wiki/IRC/Channels#Raw_feeds).
* filter &ndash; Filters are used to specify a selector. In this case, we're selecting pages that have a namespace dimension with the value `article` (therefore excluding edits to Wikipedia pages that aren't articles).
* aggregations &ndash; We're interested in obtaining the total count of edited pages, per the language dimension, and we map it to a type of aggregation available in pydruid (longsum). We also rename this `count` metric to `edit_count`.
* metric &ndash; Names the metric to sort on.
* threshold &ndash; Sets the maximum number of aggregated results to return.

See the [pydruid documentation](https://pythonhosted.org/pydruid/) for more information about queries.

## Bringing the Data Into Pandas
Now that Druid is returning data, we'll pass that data to a Pandas dataframe, which allows us to analyze and visualize it:

```python
import pydruid.client

query = pydruid.client.PyDruid('http://localhost:8083', 'druid/v2/')

top_langs = query.topn(
    datasource = "wikipedia",
    granularity = "all",
    intervals = "2013-06-01T00:00/2020-01-01T00",
    dimension = "language",
    filter = pydruid.client.Dimension("namespace") == "article",
    aggregations = {"edit_count": pydruid.client.longsum("count")},
    metric = "edit_count",
    threshold = 10
)

df = query.export_pandas()

df = df.drop('timestamp', axis=1)  # Don't need the timestamp column here

df.index = range(1, len(df)+1)  # Get a naturally numbered index

print df
```

Printing the results gives:

```
   edit_count language
1        4726       en
2        1273       fr
3         857       de
4         176       ja
```

WHY ONLY 4? WHY ARE RESULTS SAME EVERY TIME? NUMBERS SHOULD CHANGE?

Cover getting started with PyDruid same way as for RDruid. Something like:
1. Install PyDruid and Pandas.
2. Set up druid realtime node with twitter example
3. Create a TopN query (add comments later):
import pydruid.client
query = pydruid.client.PyDruid('http://localhost:8083', 'druid/v2/')
top_langs = query.topn(
datasource = "twitterstream",
granularity = "all",
intervals = "2014-01-01/2015-01-01",
dimension = "lang",
aggregations =
{"tweets": pydruid.client.doublesum("tweets")}
,
metric = "tweets",
threshold = 10
)
df = query.export_pandas()
df = df.drop('timestamp', axis=1)
df.index = range(1, len(df)+1)
print df

