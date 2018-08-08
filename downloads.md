---
title: Download
layout: simple_page
sectionid: download
---

## Stable Release

The current Druid stable release is tagged at {{ site.druid_stable_version }}.

<p>
<a class="large-button download" href="http://static.druid.io/artifacts/releases/druid-{{ site.druid_stable_version }}-bin.tar.gz" onclick="trackDownload('button', 'http://static.druid.io/artifacts/releases/druid-{{ site.druid_stable_version }}-bin.tar.gz');return false;"><span class="fa fa-download"></span> Download {{site.druid_stable_version}} Stable</a><br>
</p>

## Release candidate

The current Druid release candidate is tagged at {{ site.druid_rc_version }}.

## Get Started

To get started with Druid, visit the [quickstart](/docs/latest/tutorials/quickstart.html).

To learn more about releases, please visit the [versioning page](/docs/latest/development/versioning.html).

## Optional Dependencies

### Metadata store

Due to licensing, we've separated the MySQL metadata store extension from main Druid release.
If you are deploying a distributed cluster and would like to use the MySQL metadata store, please untar this tarball and follow [these steps](/docs/latest/operations/including-extensions).

MySQL metadata store extension: [mysql-metadata-storage-{{ site.druid_stable_version }}.tar.gz](http://static.druid.io/artifacts/releases/mysql-metadata-storage-{{ site.druid_stable_version }}.tar.gz)

Note that the PostgreSQL metadata store extension is included in the main Druid tarball.

### Tranquility

Tranquility is a library to load streaming data into Druid. It is commonly deployed as the final stage in a series of jobs in a stream processor such as Apache Flink or Kafka Streams.

Tranquility: [tranquility-distribution-{{ site.tranquility_stable_version }}.tgz](http://static.druid.io/tranquility/releases/tranquility-distribution-{{ site.tranquility_stable_version }}.tgz).
