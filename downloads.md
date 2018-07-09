---
title: Download
layout: simple_page
sectionid: download
---

## Stable Release
The current Druid stable release is tagged at 0.12.1.

<p>
<a class="large-button download" href="http://static.druid.io/artifacts/releases/druid-{{ site.druid_stable_version }}-bin.tar.gz" onclick="trackDownload('button', 'http://static.druid.io/artifacts/releases/druid-{{ site.druid_stable_version }}-bin.tar.gz');return false;"><span class="fa fa-download"></span> Download {{site.druid_stable_version}} Stable</a><br>
</p>

## Get Started

To get started with Druid, visit the [quickstart](/docs/latest/tutorials/quickstart.html).

To learn more about releases, please visit the [versioning page](/docs/latest/development/versioning.html).

## Optional Dependencies

### Metadata store
Due to licensing, we've separated the metadata store extension from main Druid release. If you are deploying a distributed cluster and would like to use an external metadata store, please untar these tarball and follow [these steps](/docs/latest/operations/including-extensions.html).

MySQL metadata store extension: [mysql-metadata-storage-0.12.1.tar.gz](http://static.druid.io/artifacts/releases/mysql-metadata-storage-0.12.1.tar.gz)

PostgreSQL metadata store extension: [postgres-metadata-storage-0.12.1.tar.gz](http://static.druid.io/artifacts/releases/postgres-metadata-storage-0.12.1.tar.gz)

### Tranquility
Tranquility is a library to load streaming data into Druid. It is commonly deployed as the final stage in a series of jobs in a stream processor such as Apache Flink or Kafka Streams.

Tranquility: [tranquility-distribution-0.8.2.tgz.](http://static.druid.io/tranquility/releases/tranquility-distribution-0.8.2.tgz)
