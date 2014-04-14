---
title: Introduction to pydruid
published: true
author: Igal Levy
layout: post
tags: #druid #analytics #querying #python #pandas #scipi #matplotlib
---

We've already written about pairing [R with RDruid](http://druid.io/blog/2014/02/03/rdruid-and-twitterstream.html), but Python has powerful and free open-source analysis tools too. Collectively, these are often referred to as the [SciPy Stack](http://www.scipy.org/stackspec.html). To pair SciPy's analytic power with the advantages of querying time-series data in Druid, we created the pydruid connector. This allows Python users to query Druid&mdash;and export the results to useful formats&mdash;in a way that makes sense to them.

## Getting Started
pydruid should run with Python 2.x, and is known to run with Python 2.7.5.

Install pydruid in the same way as you'd install any other Python module on your system. The simplest way is:

```bash
pip install pydruid
```

You should also install Pandas to execute the simple examples below:

```bash
pip install pandas
```

When you import pydruid into your example, it will try to load Pandas as well.

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
Let's say we want to see the top few languages for Wikipedia articles, in terms of number of edits. This is the query we could post directly to Druid:

```json
{
  "queryType": "topN",
  "dataSource": "wikipedia",
  "dimension": "language",
  "threshold": 4,
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

**NOTE:** Due to limitations in the way the wikipedia example is set up, you may see a limited number of results appear.

Here's that same query in Python:

```python
from pydruid.client import *

query = PyDruid('http://localhost:8083', 'druid/v2/')

top_langs = query.topn(
    datasource = "wikipedia",
    granularity = "all",
    intervals = "2013-06-01T00:00/2020-01-01T00",
    dimension = "language",
    filter = Dimension("namespace") == "article",
    aggregations = {"edit_count": longsum("count")},
    metric = "edit_count",
    threshold = 4
)

print top_langs  # Do this if you want to see the raw JSON
```
Let's break this query down:

* query &ndash; The `query` object is instantiated with the location of the Druid realtime node. `query` exposes various querying methods, including `topn`.
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
from pydruid.client import *

from pylab import plt  # Need to have matplotlib installed

query = PyDruid('http://localhost:8083', 'druid/v2/')

top_langs = query.topn(
    datasource = "wikipedia",
    granularity = "all",
    intervals = "2013-06-01T00:00/2020-01-01T00",
    dimension = "language",
    filter = Dimension("namespace") == "article",
    aggregations = {"edit_count": longsum("count")},
    metric = "edit_count",
    threshold = 4
)

print top_langs  # Do this if you want to see the raw JSON

df = query.export_pandas() # Client will import Pandas, no need to do so separately.

df = df.drop('timestamp', axis=1)  # Don't need the timestamp column here

df.index = range(1, len(df)+1)  # Get a naturally numbered index

print df

df.plot(x='language', kind='bar')

plt.show()
```

Printing the results gives:

```
   edit_count language
1         834       en
2         256       de
3         185       fr
4          38       ja
```

The bar graph will look something like this:

<img src="{{ relative }}/img/wiki-edit-lang-plot.png" alt="Bar graph showing Wikipedia edits by language" title="Wikipedia Edits by Language" width="65%" height="auto">

If you were to repeat the query, you should see larger numbers under edit_count, since the Druid realtime node is continuing to ingest data from Wikipedia.

## Conclusions
In this blog, we showed how you can run ad-hoc queries against a data set that is being streamed into Druid. And while this is only a small example of pydruid and the power of Python, it serves as an effective introductory demonstration of the  benefits of pairing Druid's ability to make data available in real-time with SciPi's powerful analytics tools.

