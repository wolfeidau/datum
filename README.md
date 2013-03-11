# datum

Datum is a javascript module which stores and time series datum, with basic down sampling.


# Time Series Data

The aim of this module is to enable management of time series data in a key value store. It will include methods for
storing, retrieving based on a key and a date, along with methods for down sampling this data based on a unit of time.

Initially this will be loosely based on some of the awesome work done in graphite.

The key is composed of two parts being:

* the "metric", this is the hostname, subsystem/metric
* the date stamp for that value

Example below.

```
com.acmeCorp.instance01.jvm.memory.garbageCollections_2011-10-05T14:48:00.000Z
```

The value is stored as a JSON document (this may change) within the key value store. Each value has a type, this enables
the library to select a down sampling strategy (at the moment only one).

NOTE: Input data at the moment is data coming out of collectd.

# Project Status

Currently this project is in the very early stages and could only be considered an experiment, I may just end up using
Graphite, that said I do plan to finish the storage part sooner rather than later.

# API Example

## Create a metric store.

Given a metric store some information, being type and frequency, not these can use global defaults.

INSERT SAMPLE

## Put

Given an array of attributes for the key store the given value.

INSERT SAMPLE

## Retrieve a Range of Values.

Given a metric and date range, retrieve an array of values.

INSERT SAMPLE