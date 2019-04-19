---
title: Download
layout: simple_page
sectionid: download
canonical: 'http://druid.io/downloads.html'
---

## Stable release

The current Apache Druid (incubating) stable release is {{ site.druid_stable_version }}.

<p>
<a class="large-button download" href="https://www.apache.org/dyn/closer.cgi?path=/incubator/druid/{{ site.druid_stable_version }}/apache-druid-{{ site.druid_stable_version }}-bin.tar.gz" download onclick="trackDownload('button', 'https://www.apache.org/dyn/closer.cgi?path=/incubator/druid/{{ site.druid_stable_version }}/apache-druid-{{ site.druid_stable_version }}-bin.tar.gz');"><span class="fa fa-download"></span> Download {{site.druid_stable_version}} release</a><br>
</p>

* Release date: April 9, 2019
* Binary download: [apache-druid-{{ site.druid_stable_version }}-bin.tar.gz](https://www.apache.org/dyn/closer.cgi?path=/incubator/druid/{{ site.druid_stable_version }}/apache-druid-{{ site.druid_stable_version }}-bin.tar.gz)
* Source download: [apache-druid-{{ site.druid_stable_version }}-src.tar.gz](https://www.apache.org/dyn/closer.cgi?path=/incubator/druid/{{ site.druid_stable_version }}/apache-druid-{{ site.druid_stable_version }}-src.tar.gz)
* Release notes: [0.14.0](https://github.com/apache/incubator-druid/issues/7126)

## Older releases

{% for druid_older_version in site.druid_older_versions %}
#### {{ druid_older_version }}

* Release date: Dec. 18, 2018
* Binary download: [apache-druid-{{ druid_older_version }}-bin.tar.gz](https://www.apache.org/dyn/closer.cgi?path=/incubator/druid/{{ druid_older_version }}/apache-druid-{{ druid_older_version }}-bin.tar.gz)
* Source download: [apache-druid-{{ druid_older_version }}-src.tar.gz](https://www.apache.org/dyn/closer.cgi?path=/incubator/druid/{{ druid_older_version }}/apache-druid-{{ druid_older_version }}-src.tar.gz)
* Release notes: [0.13.0](https://github.com/apache/incubator-druid/issues/6442)
{% endfor %}

To learn more about releases, please visit the [versioning page](/docs/latest/development/versioning.html).

## Get started

To get started with Druid, visit the [quickstart](/docs/latest/tutorials/index.html).

## Optional dependencies

### MySQL JDBC Driver

Due to licensing considerations, the MySQL metadata store extension does not include the required MySQL JDBC driver which
must be downloaded separately. Please see the [documentation](/docs/latest/development/extensions-core/mysql.html) for instructions on how to include this library.

### Tranquility

Tranquility is a library to load streaming data into Druid. It is commonly deployed as the final stage in a series of jobs in a stream processor such as Apache Flink or Kafka Streams.

The latest version of Tranquility is available here: [tranquility-distribution-{{ site.tranquility_stable_version }}.tgz](http://static.druid.io/tranquility/releases/tranquility-distribution-{{ site.tranquility_stable_version }}.tgz).

Note that Tranquility is not required in order to load streaming data: you can also use Druid's [Kafka indexing service](/docs/latest/development/extensions-core/kafka-ingestion.html) to load directly from Kafka.

## Release candidates

Release candidates are announced on the [Druid dev mailing list](https://lists.apache.org/list.html?dev@druid.apache.org).

If you are interested in being notified of upcoming release candidates and being involved in the dev community (e.g. validating and approving RC builds), you can subscribe to the list by emailing: **dev-subscribe@druid.apache.org**

Previous discussions are available in the [Apache Mail Archives](https://lists.apache.org/list.html?dev@druid.apache.org).
