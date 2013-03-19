/*
 * datum
 *
 * This module does calculations relating to enable division of a time period into intervals and enable generation of keys
 * for the map reduce based on it.
 *
 * https://github.com/wolfeidau/datum
 *
 * Copyright (c) 2012 Mark Wolfe
 * Licensed under the MIT license.
 */

/**
 * converts the JSON posts made by collectd to a format which will be stored by datum.
 *
 * @param collectdData
 * @param callback
 */
exports.buildEntries = function (collectdData, callback) {

    var count = 0
        , convertedData = [];

    collectdData.forEach(function (entry) {

        buildKey(entry, function (err, keys) {
            if (err) {
                callback(err);
            }

            var index = 0;

            keys.forEach(function (key) {

                var date = isoDateFromUnix(entry.time);

                convertedData.push({
                    host: entry.host, metric: key, date: date, type: entry.dstypes[index], value: entry.values[index]
                });
                index++;
            });

        });
        count++;
    });

    callback(null, convertedData, count);
};

/**
 * converts attributes in a collectd into one or more keys.s
 *
 * @type {Function}
 * @private
 */
exports._buildKey = buildKey = function (entry, callback) {
    var keys = [];
    entry.dsnames.forEach(function (name) {
        keys.push(
            [entry.plugin, entry.plugin_instance, entry.type_instance, entry.type, name].filter(function (element) {
                return element != ""
            }).join('.')
        );
    });

    callback(null, keys);
};

/**
 * converts the times included in collectd metrics to an iso timestamp
 *
 * @type {Function}
 * @private
 */
exports._isoDateFromUnix = isoDateFromUnix = function (time) {
    return new Date(time * 1000).toISOString()
};
