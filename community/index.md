---
title: Druid Community
sectionid: community
layout: simple_page
---

## Community

Most discussion about Druid happens over email and GitHub.

The Druid community is in the process of migrating to Apache by way of the Apache Incubator. As we proceed
along this path, our site will move from http://druid.io/ to https://druid.apache.org/, and our mailing lists
and Git repositories will be migrated as well.

* **User mailing list** [druid-user@googlegroups.com](https://groups.google.com/forum/#!forum/druid-user) for general discussion
* **Development mailing list** [dev@druid.apache.org](https://lists.apache.org/list.html?dev@druid.apache.org) for discussion about project development
* **GitHub** [druid-io/druid](https://github.com/apache/druid) issues and pull requests (watch to subscribe)
* **Meetups** [Druid meetups](https://www.meetup.com/topics/apache-druid/) for different meetup groups around the world.
* **IRC** `#druid-dev` on irc.freenode.net

## Getting help

The best place to get a wide variety of help about Druid is on the Druid user
group [druid-user@googlegroups.com](https://groups.google.com/forum/#!forum/druid-user). You can also report issues and bugs on
the [Github development page](https://github.com/apache/druid).

Third party companies also provide commercial support and services for Druid, including:

* [Imply](https://imply.io/)

## Contributing

Druid is a community-led project and we are delighted to receive contributions
of anything from minor fixes to big new features.

### What to work on

If you have an itch to scratch, then by all means do that! Fixing bugs you run
into, or adding features you need, are both immensely helpful.

If you're looking for some starter projects, we maintain a [list of issues](https://github.com/apache/incubator-druid/issues?q=is%3Aopen+is%3Aissue+label%3A%22Difficulty+-+Easy%22) suitable
for new developers.

There are plenty of ways to help outside writing Druid code. *Code review of pull requests*
(even if you are not a committer), feature suggestions, reporting bugs, [documentation](/docs/{{ site.druid_stable_version }}/)
and usability feedback all matter immensely. Another big way to help is
through [client libraries](/docs/latest/development/libraries.html), which are
avaialble in a variety of languages. If you develop a new one, we'll be happy
to include it in the list.

### Getting your changes accepted

Patches to Druid are done through GitHub pull requests.

Pull requests require one approval (+1) from an established committer on code and text (for documentation) levels. The
exception is major architectural changes or API changes, and/or changes to

 - HTTP requests and responses (e. g. a new HTTP endpoint)
 - [Interfaces for extensions](/docs/latest/development/modules.html)
 - Server configuration (e. g. altering the behavior of a config property)
 - Emitted metrics
 - Other major changes, judged by the discretion of Druid committers

warrant additional design and compatibility review. Such pull requests require design approvals from three different
committers (one of them could also be the author of the pull request). For those, it can help to discuss things
on the Druid development list [dev@druid.apache.org](https://lists.apache.org/list.html?dev@druid.apache.org) or a github issue beforehand.

In general please follow the [contributing guidelines](https://github.com/apache/incubator-druid/blob/master/CONTRIBUTING.md)
when sending in pull requests. This will help review proceed as quickly as
possible.

For code contributions, we require that you agree to a Contributor License
Agreement (CLA) before we can accept your code. You can find our CLA on and
sign it directly on our [CLA page](/community/cla.html)

### Committers

Committers are collectively responsible for Druid's technical management. This involves
setting the direction of the project, contributing code, and reviewing code contributed
by others.

You don't need to be a committer to contribute- pull requests are welcome from anyone.

| Name                                                  | Organization                                       |
| ----------------------------------------------------- | -------------------------------------------------- |
| [Benedict Jin](https://github.com/asdf2014)           | [Alibaba](https://www.alibaba.com/)                |
| [Charles Allen](https://github.com/drcrallen)         | [Snap](https://www.snap.com/en-US/)                |
| [Clint Wylie](https://github.com/clintropolis)        | [Imply](https://imply.io/)                         |
| [David Lim](https://github.com/dclim)                 | [Imply](https://imply.io/)                         |
| [Daoyue Gao](https://github.com/gaodayue)             | [Meituan](http://www.meituan.com/)                 |
| [Dylan Wylie](https://github.com/Dylan1312)           | [SpotX](https://www.spotx.tv/)                     |
| [Egor Rashin](https://github.com/egor-ryashin)        | [Snap](https://www.snap.com/en-US/)                |
| [Eric Tschetter](https://github.com/cheddar)          | [Splunk](https://www.splunk.com/)                  |
| [Fangjin Yang](https://github.com/fjy)                | [Imply](https://imply.io/)                         |
| [Gian Merlino](https://github.com/gianm)              | [Imply](https://imply.io/)                         |
| [Himanshu Gupta](https://github.com/himanshug)        | [Splunk](https://www.splunk.com/)                  |
| [Jihoon Son](https://github.com/jihoonson)            | [Imply](https://imply.io/)                         |
| [Jonathan Wei](https://github.com/jon-wei)            | [Imply](https://imply.io/)                         |
| [Julian Hyde](https://github.com/julianhyde)          | [Looker](https://looker.com/)                      |
| [Jun Rao](https://github.com/junrao)                  | [Confluent](https://www.confluent.io/)             |
| [Kaijian Ding](https://github.com/kaijianding)        | [Alibaba](https://www.alibaba.com/)                |
| [Kurt Young](https://github.com/kurtyoung)            | [Alibaba](https://www.alibaba.com/)                |
| [Lijin Bin](https://github.com/binlijin)              | [Alibaba](https://www.alibaba.com/)                |
| [Maxime Beauchemin](https://github.com/mistercrunch)  | [Lyft](http://lyft.com/)                           |
| [Mingming Qiu](https://github.com/QiuMM)              | [Bytedance](https://bytedance.com/)                |
| [Mohamed Slim Bouguerra](https://github.com/b-slim)   | [Hortonworks](https://hortonworks.com/)            |
| [Navis Ryu](https://github.com/navis)                 | [SK Telecom](https://www.sktelecom.com/index.html) |
| [Niketh Sabbineni](https://github.com/niketh)         | [Oath](https://www.oath.com/)                      |
| [Nishant Bangarwa](https://github.com/nishantmonu51)  | [Hortonworks](https://hortonworks.com/)            |
| [Parag Jain](https://github.com/pjain1)               | [Lyft](http://lyft.com/)                           |
| [P. Taylor Goetz](https://github.com/ptgoetz)         | [EPAM](https://www.epam.com/)                      |
| [Roman Leventov](https://github.com/leventov)         | [Snap](https://www.snap.com/en-US/)                |
| [Surekha Saharan](https://github.com/surekhasaharan)  | [Imply](https://imply.io/)                         |
| [Xavier Léauté](https://github.com/xvrl)              | [Confluent](https://www.confluent.io/)             |
| [Xinyu Zhang](https://github.com/zhangxinyu1)         | [Qihoo 360](https://www.360.cn/)                   |

### Becoming a committer

If you'd like to become a committer, that's great! Please contact one of the
existing committers for a walk through the process. Basically, what we're
looking for is an interest in ongoing contributions to Druid.

### General committer guidelines
If you are an official Druid committer then congratulations! You are part of a fantastic group of people. Here are some guidelines to follow to help ensure the Druid project continues to grow and improve:

1. You can merge your own pull request if it fits the rest of the criteria. A common thing to see is "+1 after travis" from other committers.
1. A pull request should have at least one +1 from a committer who is not the author, on the "code/textual" level of review.
1. Pull requests which have just one +1 from a committer couldn't be merged earlier than after 3 working days since PR submission.
1. A pull request with just one +1 could be merged only by (or in coordination with) the committer who provided the review. Because the reviewer may think that the PR is complex or risky enough that needs another pair of eyes to look at it. If this is the case, the first reviewer should indicate this in the PR approval message.
1. If a pull request has two or more +1's from committers who are not the author, it could be merged immediately and by any committer. But still, enough time since the PR submission should pass to give folks a reasonable chance to indicate a desire to comment on the pull request. AKA: don't merge a pull request that was submitted Friday evening until at least 1~2 regular work days have passed. Use good judgement here.
1. Major architectural and backwards incompatible changes, or changes which have long-term maintainance consequences (see examples in [the "Getting your changes accepted" section above](#getting-your-changes-accepted)), should have at least three +1's from committers, on the "design" level of review. One approval could be from the author of the PR. The first committer who indicates that a PR needs design review should add the `Design Review` tag to such a pull request.
1. Travis-CI should pass or have some **very** good reason why it won't pass for a pull request.
1. You reasonably believe that all comments have been addressed.
1. You are expected to be the champion for your own pull requests.
1. Being a champion on a pull request can be a significant undertaking depending on the size of the code change and what parts of the code it touches. It may require communicating with other developers, reconciling differences, organizing community feedback, and/or following up with people who have commented in a pull request to ensure comments have been addressed.
1. Sometimes code is presented as a work-in-progress or as a point of discussion. Use the `WIP` or `Discuss` tags on a pull request in such a case.
1. If a pull request you are championing is taking longer than expected to merge, be sure to raise the issue in the developer sync.
1. Limit the number of pull requests you are championing at the same time.
1. Prioritize code reviews to look at pull requests that are blockers for the next release (see the Milestone marker on the pull request)
1. Help serve as champion for pull requests that originate from new committers.
1. If you feel a pull request is required for the next release, mark it as such in the Milestone of the pull request.
1. Do not comment on a pull request unless you are willing to follow up on the edits.
1. Give priority to getting older pull requests merged. (Either as their champion or as an active commenter)
1. And most importantly.. the PMC desires to ensure a positive and effective developer experience! If you find that things are not functioning to your expectations, pleaes raise the issue.

Remember, we all want to see this project thrive!

## Governance

The PMC (Project Management Committee) is responsible for the administrative
aspects of the Druid project. The responsibilities of the PMC include:

- Approving releases
- Nominating new committers
- Maintaining the project's shared resources, including the github account,
  mailing lists, websites, social media channels, etc.
- Maintaining guidelines for the project

