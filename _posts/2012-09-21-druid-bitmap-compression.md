---
published: true
title: "Maximum Performance with Minimum Storage: Data Compression in Druid"
layout: post
author: Fangjin Yang
image: "http://metamarkets.com/wp-content/uploads/2012/09/Computer_Chip-470x3401-470x288.jpeg"
tags: "algorithms, druid, technology"
---

The Metamarkets solution allows for arbitrary exploration of massive data sets. Powered by Druid, our in-house distributed data store and processor, users can filter time series and top list queries based on Boolean expressions of dimension values. Given that some of our dataset dimensions contain millions of unique values, the subset of things that may match a particular filter expression may be quite large. To design for these challenges, we needed a fast and accurate (not a fast and approximate) solution, and we once again found ourselves buried under a stack of papers, looking for an answer.

##From Justin Bieber to Ones and Zeros

To better understand how Druid stores dimension values, consider the following data set:
<table border="1" cellspacing="0" cellpadding="5px">
<tbody>
<tr>
<td valign="top" width="104">Timestamp</td>
<td valign="top" width="68">Publisher</td>
<td valign="top" width="52">Advertiser</td>
<td valign="top" width="49">Gender</td>
<td valign="top" width="50">Country</td>
<td valign="top" width="52">Impressions</td>
<td valign="top" width="48">Clicks</td>
<td valign="top" width="50">Revenue</td>
</tr>
<tr>
<td valign="top" width="104">
<pre>2011-01-01T01:00:00Z</pre>
</td>
<td valign="top" width="68">
<pre>bieberfever.com</pre>
</td>
<td valign="top" width="52">
<pre>google.com</pre>
</td>
<td valign="top" width="49">
<pre>Male</pre>
</td>
<td valign="top" width="50">
<pre>USA</pre>
</td>
<td valign="top" width="52">
<pre>1800</pre>
</td>
<td valign="top" width="48">
<pre>25</pre>
</td>
<td valign="top" width="50">
<pre>15.70</pre>
</td>
</tr>
<tr>
<td valign="top" width="104">
<pre>2011-01-01T01:00:00Z</pre>
</td>
<td valign="top" width="68">
<pre>bieberfever.com</pre>
</td>
<td valign="top" width="52">
<pre>google.com</pre>
</td>
<td valign="top" width="49">
<pre>Male</pre>
</td>
<td valign="top" width="50">
<pre>USA</pre>
</td>
<td valign="top" width="52">
<pre>2912</pre>
</td>
<td valign="top" width="48">
<pre>42</pre>
</td>
<td valign="top" width="50">
<pre>29.18</pre>
</td>
</tr>
<tr>
<td valign="top" width="104">
<pre>2011-01-01T02:00:00Z</pre>
</td>
<td valign="top" width="68">
<pre>ultratrimfast.com</pre>
</td>
<td valign="top" width="52">
<pre>google.com</pre>
</td>
<td valign="top" width="49">
<pre>Male</pre>
</td>
<td valign="top" width="50">
<pre>USA</pre>
</td>
<td valign="top" width="52">
<pre>1953</pre>
</td>
<td valign="top" width="48">
<pre>17</pre>
</td>
<td valign="top" width="50">
<pre>17.31</pre>
</td>
</tr>
<tr>
<td valign="top" width="104">
<pre>2011-01-01T02:00:00Z</pre>
</td>
<td valign="top" width="68">
<pre>ultratrimfast.com</pre>
</td>
<td valign="top" width="52">
<pre>google.com</pre>
</td>
<td valign="top" width="49">
<pre>Male</pre>
</td>
<td valign="top" width="50">
<pre>USA</pre>
</td>
<td valign="top" width="52">
<pre>3194</pre>
</td>
<td valign="top" width="48">
<pre>170</pre>
</td>
<td valign="top" width="50">
<pre>34.01</pre>
</td>
</tr>
</tbody>
</table>

Consider the publisher dimension (column) in the table above. For each unique publisher, we can form some representation indicating in which table rows a particular publisher is seen. We can store this information in a binary array where the array indices represent our rows. If a particular publisher is seen in a certain row, that array index is marked as ‘1’. For example:

Bieberfever.com -> `[1, 2]` -> `[1][1][0][0]`

Ultratrimfast.com -> `[3, 4]` -> `[0][0][1][1]`

In the example above bieberfever.com is seen in rows 1 and 2. This mapping of dimension values to row indices forms an [inverted index](http://en.wikipedia.org/wiki/Inverted_index) and is in fact how we store dimension information in Druid. If we want to know which rows contain bieberfever.com OR ultratrimfast.com, we can OR together the bieberfever.com and ultratrimfast.com arrays.

`[0][1][0][1] OR [1][0][1][0] = [1][1][1][1]`

This idea forms the basis of how to perform Boolean operations on large bitmap sets. A challenge still remains in that if each array consisted of millions or billions of entries and if we had to OR together millions of such arrays, performance can potentially become a major issue. Thankfully for us, most bitmap indices are either very sparse or very dense, which is something that can be leveraged for compression.

Bit arrays, or bitmaps, are frequently employed in areas such as data warehousing and data mining to significantly reduce storage costs. Bitmap compression algorithms are a well-defined area of research and often utilize run-length encoding. Well known algorithms include Byte-aligned Bitmap Code, Word-Aligned Hybrid (WAH) code, and Partitioned Word-Aligned Hybrid (PWAH) compression.

##A Concise Solution

Most word-aligned run-length encoding algorithms represent long sequences of ones and zeros in a single word. The word contains the length of the sequence and some information about whether it is a one fill or a zero fill. Sequences that contain a mixture of 0 and 1 bits are stored in 32 bit blocks known as literals. An example of word-aligned hybrid compression is shown below:

Given a bitstream: `[10110...1][000...010][010...011]`

There are three separate 32 bit sequences in the bitstream.

1. `[1]0110...1` - 31 "dirty" bits (a literal)

2. `[00]0...010` - 31 x 2 zeros (a sequence of zeros)

3. `[01]0...011` - 31 x 3 ones (a sequences of ones)

[Concise](http://ricerca.mat.uniroma3.it/users/colanton/docs/concise.pdf) bitmap compression introduces the concept of a mixed fill, where fills and literals can be represented in a single word. The author of the original Concise paper claims that Concise outperforms WAH by reducing the size of the compressed bitmaps by up to 50%. For mixed fill sequences, the first 2 bits indicate the type of fill (0 or 1). The next 5 bits can be used to indicate the position where bits flip from 0 to 1 or vice versa. An example of the Concise representation for the integer set {3, 5, 31-93, 1,024, 1,028, 1,040,187,422} is shown below:

1. `[1]0...101000`

2. `[01][00000]0...01`

3. `[00][00001]0...11101`

4. `[1]0...100010`

5. `[00][00000]1...1011101`

6. `[1]10...0`

##Efficiency at Scale

Although Concise compression can greatly reduce the size of resulting bitmaps, we still have the problem of performing efficient Boolean operations on top of a large number of Concise sets. Luckily, Concise sets share a very important property with other bitmap compression schemes: they can be operated on in their compressed form.  The Boolean operations we care about are AND, OR, and NOT. The NOT operation is the most straightforward to implement. Literals are directly complemented and fills of zeros and ones are inverted. ANDing and ORing sets prove to be more challenging.

Consider ORing two sets where one set is a long sequence of ones and the other set contains a shorter sequence of ones, a sequence of zeros, and some literals. If the sequence of ones in the first set is sufficiently long enough to encompass the second set, we don’t need to care about the second set at all (yay for Boolean logic!). Hence, when ORing sets, sequences of ones always have priority over sequences of zeros and literals. Similarly, a sequence of zeros can be ignored; the sequence contributes nothing to the overall Boolean logic. Extending this idea further with <em>n</em> sets, we can examine the first starting word of every set and determine if a one fill exists. If so, we can find the longest one fill and advance all the sets forward past this one fill. At this new stopping point, we repeat the search for the longest one fill. If no such fill exists, we search for all literals at that position, OR the literals together, and continue advancing forward. The same idea applies for ANDing sets, except now sequences of zeros have the highest priority. This pseudo-algorithm, combined with some additional logic to address mixed fills, was found to be sufficient to address our performance requirements.

##Results

The following results were generated on a cc2.8xlarge system with a single thread, 2G heap, 512m young gen, and a forced GC between each run. The data set is a single day's worth of data collected from the [Twitter garden hose](https://dev.twitter.com/docs/streaming-apis/streams/public) data stream. The data set contains 2, 272, 295 rows. The table below demonstrates a size comparison between Concise compressed sets and regular integer arrays for different dimensions.
<table border="1" cellspacing="0" cellpadding="5px">
<tbody>
<tr>
<td valign="top" width="106">Dimension</td>
<td valign="top" width="93">Cardinality</td>
<td valign="top" width="94">Concise compressed size (bytes)</td>
<td valign="top" width="92">Integer array size (bytes)</td>
<td valign="top" width="94">Concise size as a % of integer array size</td>
</tr>
<tr>
<td valign="top" width="106">Has_mention</td>
<td valign="top" width="93">2</td>
<td valign="top" width="94">586,400</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">6.451627</td>
</tr>
<tr>
<td valign="top" width="106">Has_links</td>
<td valign="top" width="93">2</td>
<td valign="top" width="94">580,872</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">6.390808</td>
</tr>
<tr>
<td valign="top" width="106">Has_geo</td>
<td valign="top" width="93">2</td>
<td valign="top" width="94">144,004</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">1.584345</td>
</tr>
<tr>
<td valign="top" width="106">Is_retweet</td>
<td valign="top" width="93">2</td>
<td valign="top" width="94">584,592</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">6.431735</td>
</tr>
<tr>
<td valign="top" width="106">Is_viral</td>
<td valign="top" width="93">2</td>
<td valign="top" width="94">358,380</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">3.942930</td>
</tr>
<tr>
<td valign="top" width="106">User_lang</td>
<td valign="top" width="93">21</td>
<td valign="top" width="94">1,414,000</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">15.556959</td>
</tr>
<tr>
<td valign="top" width="106">User_time_zone</td>
<td valign="top" width="93">142</td>
<td valign="top" width="94">3,876,244</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">42.646795</td>
</tr>
<tr>
<td valign="top" width="106">URL_domain</td>
<td valign="top" width="93">31,165</td>
<td valign="top" width="94">1,562,428</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">17.189978</td>
</tr>
<tr>
<td valign="top" width="106">First_hashtag</td>
<td valign="top" width="93">100,728</td>
<td valign="top" width="94">1,837,144</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">20.212428</td>
</tr>
<tr>
<td valign="top" width="106">Rt_name</td>
<td valign="top" width="93">182,704</td>
<td valign="top" width="94">2,235,288</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">24.592846</td>
</tr>
<tr>
<td valign="top" width="106">Reply_to_name</td>
<td valign="top" width="93">620,421</td>
<td valign="top" width="94">5,673,504</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">62.420416</td>
</tr>
<tr>
<td valign="top" width="106">User_location</td>
<td valign="top" width="93">637,774</td>
<td valign="top" width="94">9,511,844</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">104.650188</td>
</tr>
<tr>
<td valign="top" width="106">User_mention_name</td>
<td valign="top" width="93">923,842</td>
<td valign="top" width="94">9,086,416</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">99.969590</td>
</tr>
<tr>
<td valign="top" width="106">User_name</td>
<td valign="top" width="93">1,784,369</td>
<td valign="top" width="94">16,000,028</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">176.033790</td>
</tr>
</tbody>
</table>

Total concise compressed size = 53, 451, 144 bytes

Total integer array size = 127, 248, 520 bytes

Overall, Concise compressed sets are about 42.005317% less than integer arrays.

We also resorted the rows of the data set to maximize compression to see how the results would be affected.

<table border="1" cellspacing="0" cellpadding="5px">
<tbody>
<tr>
<td valign="top" width="106">Dimension</td>
<td valign="top" width="93">Cardinality</td>
<td valign="top" width="94">Concise compressed size (bytes)</td>
<td valign="top" width="92">Integer array size (bytes)</td>
<td valign="top" width="94">Concise size as a % of integer array size</td>
</tr>
<tr>
<td valign="top" width="106">Has_mention</td>
<td valign="top" width="93">2</td>
<td valign="top" width="94">744</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">0.008186</td>
</tr>
<tr>
<td valign="top" width="106">Has_links</td>
<td valign="top" width="93">2</td>
<td valign="top" width="94">1,504</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">0.016547</td>
</tr>
<tr>
<td valign="top" width="106">Has_geo</td>
<td valign="top" width="93">2</td>
<td valign="top" width="94">2,840</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">0.031246</td>
</tr>
<tr>
<td valign="top" width="106">Is_retweet</td>
<td valign="top" width="93">2</td>
<td valign="top" width="94">1,616</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">0.017779</td>
</tr>
<tr>
<td valign="top" width="106">Is_viral</td>
<td valign="top" width="93">2</td>
<td valign="top" width="94">1,488</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">0.016371</td>
</tr>
<tr>
<td valign="top" width="106">User_lang</td>
<td valign="top" width="93">21</td>
<td valign="top" width="94">38,416</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">0.422656</td>
</tr>
<tr>
<td valign="top" width="106">User_time_zone</td>
<td valign="top" width="93">142</td>
<td valign="top" width="94">319,644</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">3.516753</td>
</tr>
<tr>
<td valign="top" width="106">URL_domain</td>
<td valign="top" width="93">31,165</td>
<td valign="top" width="94">700,752</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">7.709738</td>
</tr>
<tr>
<td valign="top" width="106">First_hashtag</td>
<td valign="top" width="93">100,728</td>
<td valign="top" width="94">1,505,292</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">16.561362</td>
</tr>
<tr>
<td valign="top" width="106">Rt_name</td>
<td valign="top" width="93">182,704</td>
<td valign="top" width="94">1,874,180</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">20.619902</td>
</tr>
<tr>
<td valign="top" width="106">Reply_to_name</td>
<td valign="top" width="93">620,421</td>
<td valign="top" width="94">5,404,108</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">59.456497</td>
</tr>
<tr>
<td valign="top" width="106">User_location</td>
<td valign="top" width="93">637,774</td>
<td valign="top" width="94">9,091,016</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">100.075340</td>
</tr>
<tr>
<td valign="top" width="106">User_mention_name</td>
<td valign="top" width="93">923,842</td>
<td valign="top" width="94">8,686,384</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">95.568401</td>
</tr>
<tr>
<td valign="top" width="106">User_name</td>
<td valign="top" width="93">1,784,369</td>
<td valign="top" width="94">16,204,900</td>
<td valign="top" width="92">9,089,180</td>
<td valign="top" width="94">178.287810</td>
</tr>
</tbody>
</table>

Total concise compressed size = 43,832,884 bytes

Total integer array size = 127, 248, 520 bytes

What is interesting to note is that after sorting, global compression only increased minimally. The total Concise set size to total integer array size is 34.448031%.

To understand the performance implications of using Concise sets versus integer arrays, we choose several dimensions from our data set with varying cardinalities and generated Concise sets for every dimension value of every selected dimension. The histograms below indicate the size distribution of the generated Concise sets for a given dimension. Each test run randomly picked a given number of Concise sets and performed Boolean operations with them.  Integer array representations of these Concise sets were then created and the same Boolean operations were run on the integer arrays. There were 100 runs per test case and the average run time required to perform a Boolean operation is shown for each dimension in the first of two tables below. The second table shows the performance results when the sets used in the Boolean operation alway include the largest (size) set of the dimension.

###Dimension: User_time_zone

Cardinality: 142

![user_time_zone](/http://metamarkets.com/wp-content/uploads/2012/09/user_time_zone1-1024x768.png)

<table border="1" cellspacing="0" cellpadding="5px">
<tbody>
<tr>
<td valign="top" width="96">Number of filter elements</td>
<td valign="top" width="96">OR operation with Concise set (ms)</td>
<td valign="top" width="96">OR operation with integer arrays (ms)</td>
<td valign="top" width="96">AND operations with Concise set (ms)</td>
<td valign="top" width="96">AND operation with integer arrays (ms)</td>
</tr>
<tr>
<td valign="top" width="96">10</td>
<td valign="top" width="96">31</td>
<td valign="top" width="96">20</td>
<td valign="top" width="96">1</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">25</td>
<td valign="top" width="96">66</td>
<td valign="top" width="96">53</td>
<td valign="top" width="96">2</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">50</td>
<td valign="top" width="96">159</td>
<td valign="top" width="96">153</td>
<td valign="top" width="96">4</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">100</td>
<td valign="top" width="96">339</td>
<td valign="top" width="96">322</td>
<td valign="top" width="96">7</td>
<td valign="top" width="96">0</td>
</tr>
</tbody>
</table>

Always including the largest Concise set of the dimension:

<table border="1" cellspacing="0" cellpadding="5px">
<tbody>
<tr>
<td valign="top" width="96">Number of filter elements</td>
<td valign="top" width="96">OR operation with Concise set (ms)</td>
<td valign="top" width="96">OR operation with integer arrays (ms)</td>
<td valign="top" width="96">AND operations with Concise set (ms)</td>
<td valign="top" width="96">AND operation with integer arrays (ms)</td>
</tr>
<tr>
<td valign="top" width="96">10</td>
<td valign="top" width="96">44</td>
<td valign="top" width="96">77</td>
<td valign="top" width="96">1</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">25</td>
<td valign="top" width="96">92</td>
<td valign="top" width="96">141</td>
<td valign="top" width="96">2</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">50</td>
<td valign="top" width="96">184</td>
<td valign="top" width="96">223</td>
<td valign="top" width="96">4</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">100</td>
<td valign="top" width="96">398</td>
<td valign="top" width="96">419</td>
<td valign="top" width="96">8</td>
<td valign="top" width="96">0</td>
</tr>
</tbody>
</table>
&nbsp;

###Dimension: URL_domain

Cardinality: 31,165

![url_domain](/http://metamarkets.com/wp-content/uploads/2012/09/url_domain-1024x768.png)

<table border="1" cellspacing="0" cellpadding="5px">
<tbody>
<tr>
<td valign="top" width="96">Number of filter elements</td>
<td valign="top" width="96">OR operation with Concise set (ms)</td>
<td valign="top" width="96">OR operation with integer arrays (ms)</td>
<td valign="top" width="96">AND operations with Concise set (ms)</td>
<td valign="top" width="96">AND operation with integer arrays (ms)</td>
</tr>
<tr>
<td valign="top" width="96">10</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">25</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">2</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">50</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">100</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">1,000</td>
<td valign="top" width="96">8</td>
<td valign="top" width="96">24</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">1</td>
</tr>
<tr>
<td valign="top" width="96">5,000</td>
<td valign="top" width="96">54</td>
<td valign="top" width="96">132</td>
<td valign="top" width="96">3</td>
<td valign="top" width="96">57</td>
</tr>
<tr>
<td valign="top" width="96">10,000</td>
<td valign="top" width="96">111</td>
<td valign="top" width="96">286</td>
<td valign="top" width="96">8</td>
<td valign="top" width="96">284</td>
</tr>
<tr>
<td valign="top" width="96">25,000</td>
<td valign="top" width="96">348</td>
<td valign="top" width="96">779</td>
<td valign="top" width="96">22</td>
<td valign="top" width="96">1,925</td>
</tr>
</tbody>
</table>

Always including the largest Concise set of the dimension:

<table border="1" cellspacing="0" cellpadding="5px">
<tbody>
<tr>
<td valign="top" width="96">Number of filter elements</td>
<td valign="top" width="96">OR operation with Concise set (ms)</td>
<td valign="top" width="96">OR operation with integer arrays (ms)</td>
<td valign="top" width="96">AND operations with Concise set (ms)</td>
<td valign="top" width="96">AND operation with integer arrays (ms)</td>
</tr>
<tr>
<td valign="top" width="96">10</td>
<td valign="top" width="96">14</td>
<td valign="top" width="96">172</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">25</td>
<td valign="top" width="96">17</td>
<td valign="top" width="96">242</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">50</td>
<td valign="top" width="96">19</td>
<td valign="top" width="96">298</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">100</td>
<td valign="top" width="96">22</td>
<td valign="top" width="96">356</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">1,000</td>
<td valign="top" width="96">35</td>
<td valign="top" width="96">569</td>
<td valign="top" width="96">1</td>
<td valign="top" width="96">1</td>
</tr>
<tr>
<td valign="top" width="96">5,000</td>
<td valign="top" width="96">89</td>
<td valign="top" width="96">865</td>
<td valign="top" width="96">4</td>
<td valign="top" width="96">59</td>
</tr>
<tr>
<td valign="top" width="96">10,000</td>
<td valign="top" width="96">158</td>
<td valign="top" width="96">1,050</td>
<td valign="top" width="96">9</td>
<td valign="top" width="96">289</td>
</tr>
<tr>
<td valign="top" width="96">25,000</td>
<td valign="top" width="96">382</td>
<td valign="top" width="96">1,618</td>
<td valign="top" width="96">21</td>
<td valign="top" width="96">1,949</td>
</tr>
</tbody>
</table>

###Dimension: RT_name

Cardinality: 182,704

![rt_name](/http://metamarkets.com/wp-content/uploads/2012/09/rt_name1-1024x768.png)

<table border="1" cellspacing="0" cellpadding="5px">
<tbody>
<tr>
<td valign="top" width="96">Number of filter elements</td>
<td valign="top" width="96">OR operation with Concise set (ms)</td>
<td valign="top" width="96">OR operation with integer arrays (ms)</td>
<td valign="top" width="96">AND operations with Concise set (ms)</td>
<td valign="top" width="96">AND operation with integer arrays (ms)</td>
</tr>
<tr>
<td valign="top" width="96">10</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">25</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">50</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">100</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">1,000</td>
<td valign="top" width="96">1</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">1</td>
</tr>
<tr>
<td valign="top" width="96">5,000</td>
<td valign="top" width="96">11</td>
<td valign="top" width="96">31</td>
<td valign="top" width="96">3</td>
<td valign="top" width="96">57</td>
</tr>
<tr>
<td valign="top" width="96">10,000</td>
<td valign="top" width="96">25</td>
<td valign="top" width="96">68</td>
<td valign="top" width="96">7</td>
<td valign="top" width="96">284</td>
</tr>
<tr>
<td valign="top" width="96">25,000</td>
<td valign="top" width="96">98</td>
<td valign="top" width="96">118</td>
<td valign="top" width="96">20</td>
<td valign="top" width="96">1,925</td>
</tr>
<tr>
<td valign="top" width="96">50,000</td>
<td valign="top" width="96">224</td>
<td valign="top" width="96">292</td>
<td valign="top" width="96">-</td>
<td valign="top" width="96">-</td>
</tr>
<tr>
<td valign="top" width="96">100,000</td>
<td valign="top" width="96">521</td>
<td valign="top" width="96">727</td>
<td valign="top" width="96">-</td>
<td valign="top" width="96">-</td>
</tr>
</tbody>
</table>

**Note:** for AND operations on 50,000+ items, our implementation of the array based approach produced StackOverflow exceptions.  Instead of changing the implementation to something that didn't, we just decided not to do comparisons beyond that point.

Always including the largest Concise set of the dimension:

<table border="1" cellspacing="0" cellpadding="5px">
<tbody>
<tr>
<td valign="top" width="96">Number of filter elements</td>
<td valign="top" width="96">OR operation with Concise set (ms)</td>
<td valign="top" width="96">OR operation with integer arrays (ms)</td>
<td valign="top" width="96">AND operations with Concise set (ms)</td>
<td valign="top" width="96">AND operation with integer arrays (ms)</td>
</tr>
<tr>
<td valign="top" width="96">10</td>
<td valign="top" width="96">14</td>
<td valign="top" width="96">168</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">25</td>
<td valign="top" width="96">16</td>
<td valign="top" width="96">236</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">50</td>
<td valign="top" width="96">18</td>
<td valign="top" width="96">289</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">100</td>
<td valign="top" width="96">20</td>
<td valign="top" width="96">348</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">1,000</td>
<td valign="top" width="96">29</td>
<td valign="top" width="96">551</td>
<td valign="top" width="96">1</td>
<td valign="top" width="96">1</td>
</tr>
<tr>
<td valign="top" width="96">5,000</td>
<td valign="top" width="96">44</td>
<td valign="top" width="96">712</td>
<td valign="top" width="96">4</td>
<td valign="top" width="96">59</td>
</tr>
<tr>
<td valign="top" width="96">10,000</td>
<td valign="top" width="96">69</td>
<td valign="top" width="96">817</td>
<td valign="top" width="96">8</td>
<td valign="top" width="96">289</td>
</tr>
<tr>
<td valign="top" width="96">25,000</td>
<td valign="top" width="96">161</td>
<td valign="top" width="96">986</td>
<td valign="top" width="96">20</td>
<td valign="top" width="96">1,949</td>
</tr>
<tr>
<td valign="top" width="96">50,000</td>
<td valign="top" width="96">303</td>
<td valign="top" width="96">1,182</td>
<td valign="top" width="96">-</td>
<td valign="top" width="96">-</td>
</tr>
</tbody>
</table>

###Dimension: User_location

Cardinality: 637,774

![user_location](/http://metamarkets.com/wp-content/uploads/2012/09/user_location-1024x768.png)

<table border="1" cellspacing="0" cellpadding="5px">
<tbody>
<tr>
<td valign="top" width="96">Number of filter elements</td>
<td valign="top" width="96">OR operation with Concise set (ms)</td>
<td valign="top" width="96">OR operation with integer arrays (ms)</td>
<td valign="top" width="96">AND operations with Concise set (ms)</td>
<td valign="top" width="96">AND operation with integer arrays (ms)</td>
</tr>
<tr>
<td valign="top" width="96">10</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">25</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">50</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">100</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">1,000</td>
<td valign="top" width="96">2</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">1</td>
</tr>
<tr>
<td valign="top" width="96">5,000</td>
<td valign="top" width="96">15</td>
<td valign="top" width="96">7</td>
<td valign="top" width="96">3</td>
<td valign="top" width="96">57</td>
</tr>
<tr>
<td valign="top" width="96">10,000</td>
<td valign="top" width="96">34</td>
<td valign="top" width="96">16</td>
<td valign="top" width="96">8</td>
<td valign="top" width="96">284</td>
</tr>
<tr>
<td valign="top" width="96">25,000</td>
<td valign="top" width="96">138</td>
<td valign="top" width="96">54</td>
<td valign="top" width="96">21</td>
<td valign="top" width="96">1,927</td>
</tr>
<tr>
<td valign="top" width="96">50,000</td>
<td valign="top" width="96">298</td>
<td valign="top" width="96">128</td>
<td valign="top" width="96">-</td>
<td valign="top" width="96">-</td>
</tr>
<tr>
<td valign="top" width="96">100,000</td>
<td valign="top" width="96">650</td>
<td valign="top" width="96">271</td>
<td valign="top" width="96">-</td>
<td valign="top" width="96">-</td>
</tr>
<tr>
<td valign="top" width="96">250,000</td>
<td valign="top" width="96">1,695</td>
<td valign="top" width="96">881</td>
<td valign="top" width="96">-</td>
<td valign="top" width="96">-</td>
</tr>
<tr>
<td valign="top" width="96">500,000</td>
<td valign="top" width="96">3,433</td>
<td valign="top" width="96">2,311</td>
<td valign="top" width="96">-</td>
<td valign="top" width="96">-</td>
</tr>
</tbody>
</table>

Always including the largest Concise set of the dimension:
<table border="1" cellspacing="0" cellpadding="5px">
<tbody>
<tr>
<td valign="top" width="96">Number of filter elements</td>
<td valign="top" width="96">OR operation with Concise set (ms)</td>
<td valign="top" width="96">OR operation with integer arrays (ms)</td>
<td valign="top" width="96">AND operations with Concise set (ms)</td>
<td valign="top" width="96">AND operation with integer arrays (ms)</td>
</tr>
<tr>
<td valign="top" width="96">10</td>
<td valign="top" width="96">14</td>
<td valign="top" width="96">47</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">25</td>
<td valign="top" width="96">16</td>
<td valign="top" width="96">67</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">50</td>
<td valign="top" width="96">18</td>
<td valign="top" width="96">80</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">100</td>
<td valign="top" width="96">20</td>
<td valign="top" width="96">97</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">1,000</td>
<td valign="top" width="96">29</td>
<td valign="top" width="96">153</td>
<td valign="top" width="96">1</td>
<td valign="top" width="96">1</td>
</tr>
<tr>
<td valign="top" width="96">5,000</td>
<td valign="top" width="96">48</td>
<td valign="top" width="96">206</td>
<td valign="top" width="96">4</td>
<td valign="top" width="96">59</td>
</tr>
<tr>
<td valign="top" width="96">10,000</td>
<td valign="top" width="96">81</td>
<td valign="top" width="96">233</td>
<td valign="top" width="96">9</td>
<td valign="top" width="96">290</td>
</tr>
<tr>
<td valign="top" width="96">25,000</td>
<td valign="top" width="96">190</td>
<td valign="top" width="96">294</td>
<td valign="top" width="96">21</td>
<td valign="top" width="96">1,958</td>
</tr>
<tr>
<td valign="top" width="96">50,000</td>
<td valign="top" width="96">359</td>
<td valign="top" width="96">378</td>
<td valign="top" width="96">-</td>
<td valign="top" width="96">-</td>
</tr>
</tbody>
</table>
&nbsp;

###Dimension: User_name

Cardinality: 1,784,369

![user_name](/http://metamarkets.com/wp-content/uploads/2012/09/user_name-1024x768.png)

<table border="1" cellspacing="0" cellpadding="5px">
<tbody>
<tr>
<td valign="top" width="96">Number of filter elements</td>
<td valign="top" width="96">OR operation with Concise set (ms)</td>
<td valign="top" width="96">OR operation with integer arrays (ms)</td>
<td valign="top" width="96">AND operations with Concise set (ms)</td>
<td valign="top" width="96">AND operation with integer arrays (ms)</td>
</tr>
<tr>
<td valign="top" width="96">10</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">25</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">50</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">100</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">1,000</td>
<td valign="top" width="96">1</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">1</td>
</tr>
<tr>
<td valign="top" width="96">5,000</td>
<td valign="top" width="96">7</td>
<td valign="top" width="96">2</td>
<td valign="top" width="96">3</td>
<td valign="top" width="96">57</td>
</tr>
<tr>
<td valign="top" width="96">10,000</td>
<td valign="top" width="96">17</td>
<td valign="top" width="96">6</td>
<td valign="top" width="96">7</td>
<td valign="top" width="96">283</td>
</tr>
<tr>
<td valign="top" width="96">25,000</td>
<td valign="top" width="96">74</td>
<td valign="top" width="96">19</td>
<td valign="top" width="96">21</td>
<td valign="top" width="96">1,928</td>
</tr>
<tr>
<td valign="top" width="96">50,000</td>
<td valign="top" width="96">177</td>
<td valign="top" width="96">45</td>
<td valign="top" width="96">-</td>
<td valign="top" width="96">-</td>
</tr>
<tr>
<td valign="top" width="96">100,000</td>
<td valign="top" width="96">440</td>
<td valign="top" width="96">108</td>
<td valign="top" width="96">-</td>
<td valign="top" width="96">-</td>
</tr>
<tr>
<td valign="top" width="96">250,000</td>
<td valign="top" width="96">1,225</td>
<td valign="top" width="96">379</td>
<td valign="top" width="96">-</td>
<td valign="top" width="96">-</td>
</tr>
<tr>
<td valign="top" width="96">500,000</td>
<td valign="top" width="96">2,504</td>
<td valign="top" width="96">978</td>
<td valign="top" width="96">-</td>
<td valign="top" width="96">-</td>
</tr>
<tr>
<td valign="top" width="96">1,000,000</td>
<td valign="top" width="96">5,076</td>
<td valign="top" width="96">2,460</td>
<td valign="top" width="96">-</td>
<td valign="top" width="96">-</td>
</tr>
<tr>
<td valign="top" width="96">1,250,000</td>
<td valign="top" width="96">6,331</td>
<td valign="top" width="96">3,265</td>
<td valign="top" width="96">-</td>
<td valign="top" width="96">-</td>
</tr>
<tr>
<td valign="top" width="96">1,500,000</td>
<td valign="top" width="96">7,622</td>
<td valign="top" width="96">4,036</td>
<td valign="top" width="96">-</td>
<td valign="top" width="96">-</td>
</tr>
<tr>
<td valign="top" width="96">1,750,000</td>
<td valign="top" width="96">8,911</td>
<td valign="top" width="96">4,982</td>
<td valign="top" width="96">-</td>
<td valign="top" width="96">-</td>
</tr>
</tbody>
</table>

Always including the largest Concise set of the dimension:
<table border="1" cellspacing="0" cellpadding="5px">
<tbody>
<tr>
<td valign="top" width="96">Number of filter elements</td>
<td valign="top" width="96">OR operation with Concise set (ms)</td>
<td valign="top" width="96">OR operation with integer arrays (ms)</td>
<td valign="top" width="96">AND operations with Concise set (ms)</td>
<td valign="top" width="96">AND operation with integer arrays (ms)</td>
</tr>
<tr>
<td valign="top" width="96">10</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">25</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">50</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">100</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
</tr>
<tr>
<td valign="top" width="96">1,000</td>
<td valign="top" width="96">1</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">0</td>
<td valign="top" width="96">1</td>
</tr>
<tr>
<td valign="top" width="96">5,000</td>
<td valign="top" width="96">8</td>
<td valign="top" width="96">2</td>
<td valign="top" width="96">3</td>
<td valign="top" width="96">59</td>
</tr>
<tr>
<td valign="top" width="96">10,000</td>
<td valign="top" width="96">22</td>
<td valign="top" width="96">6</td>
<td valign="top" width="96">7</td>
<td valign="top" width="96">289</td>
</tr>
<tr>
<td valign="top" width="96">25,000</td>
<td valign="top" width="96">77</td>
<td valign="top" width="96">19</td>
<td valign="top" width="96">21</td>
<td valign="top" width="96">1,954</td>
</tr>
<tr>
<td valign="top" width="96">50,000</td>
<td valign="top" width="96">196</td>
<td valign="top" width="96">45</td>
<td valign="top" width="96">-</td>
<td valign="top" width="96">-</td>
</tr>
</tbody>
</table>