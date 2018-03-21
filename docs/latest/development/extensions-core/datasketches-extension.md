---
layout: doc_page
---

## DataSketches extension

Druid aggregators based on [datasketches](http://datasketches.github.io/) library.  Sketches are data structures implementing approximate streaming mergeable algorithms. Sketches can be ingested from the outside of Druid or built from raw data at ingestion time. Sketches can be stored in Druid segments as additive metrics.

To use the datasketch aggregators, make sure you [include](../../operations/including-extensions.html) the extension in your config file:

```
druid.extensions.loadList=["druid-datasketches"]
```

The following modules are available:

1. [Theta sketch module] (datasketches-theta.html)
2. [Quantiles sketch module] (datasketches-quantiles.html)
3. [Tuple sketch module] (datasketches-tuple.html)
