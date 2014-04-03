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

