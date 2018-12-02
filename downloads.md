---
title: Download
layout: simple_page
sectionid: download
canonical: 'http://druid.io/downloads.html'
---

## Stable release

The current Druid stable release is {{ site.druid_stable_version }}. This version is recommended for production use.

<p>
<a class="large-button download" href="http://static.druid.io/artifacts/releases/druid-{{ site.druid_stable_version }}-bin.tar.gz" onclick="trackDownload('button', 'http://static.druid.io/artifacts/releases/druid-{{ site.druid_stable_version }}-bin.tar.gz');return false;"><span class="fa fa-download"></span> Download {{site.druid_stable_version}} release</a><br>
</p>

{% if site.druid_rc_version != site.druid_stable_version %}
## Release candidate

The current Druid release candidate is {{ site.druid_rc_version }}.
<p>
<a class="large-button download" href="http://static.druid.io/artifacts/releases/druid-{{ site.druid_rc_version }}-bin.tar.gz" onclick="trackDownload('button', 'http://static.druid.io/artifacts/releases/druid-{{ site.druid_rc_version }}-bin.tar.gz');return false;"><span class="fa fa-download"></span> Download {{site.druid_rc_version}} release candidate</a><br>
</p>

{% else %}
There are no release candidates at this time.

{% endif %}

## Get started

To get started with Druid, visit the [quickstart](/docs/latest/tutorials/quickstart.html).

To learn more about releases, please visit the [versioning page](/docs/latest/development/versioning.html).

## Optional dependencies

### MySQL metadata store

Due to licensing considerations, we've separated the MySQL [metadata store](/docs/latest/dependencies/metadata-storage) extension from main Druid release.
If you are deploying a distributed cluster and would like to use the MySQL metadata store, please untar this tarball and follow [these steps](/docs/latest/operations/including-extensions).

MySQL metadata store extension: [mysql-metadata-storage-{{ site.druid_stable_version }}.tar.gz](http://static.druid.io/artifacts/releases/mysql-metadata-storage-{{ site.druid_stable_version }}.tar.gz)

Note that other metadata store extensions, including PostgreSQL, are included in the main Druid tarball and do not require separate downloads.

### Tranquility

Tranquility is a library to load streaming data into Druid. It is commonly deployed as the final stage in a series of jobs in a stream processor such as Apache Flink or Kafka Streams.

Tranquility: [tranquility-distribution-{{ site.tranquility_stable_version }}.tgz](http://static.druid.io/tranquility/releases/tranquility-distribution-{{ site.tranquility_stable_version }}.tgz).

Note that Tranquility is not required in order to load streaming data: you can also use Druid's [Kafka indexing service](/docs/latest/development/extensions-core/kafka-ingestion.html) to load directly from Kafka.
