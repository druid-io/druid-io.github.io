---
title: "Introduction to pydruid"
author: IGAL LEVY
layout: post
---

Python has powerful free open-source data-analysis tools that can rival the best, including [R](http://www.r-project.org). Collectively, these tools are often referred to as the [SciPy Stack](http://www.scipy.org/stackspec.html). 
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

