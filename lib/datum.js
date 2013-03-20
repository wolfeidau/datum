/*
 * datum
 * https://github.com/wolfeidau/datum
 *
 * Copyright (c) 2012 Mark Wolfe
 * Licensed under the MIT license.
 */
var levelup = require('levelup');
var mapreduce = require('map-reduce');
var onlineVariance = require('./online_variance');
var SubLevel = require('level-sublevel');
var BucketCalculator = require('./bucket_calculator');

var defaultOptions = {debug: false, store: './datum_store'};

var internal = {};

function Datum(options) {
    this.options = mergeOptions(defaultOptions, options);
    this.db = levelup(this.options.store);
}

function mergeOptions(defaults, options) {

    if (typeof options === 'undefined') {
        return defaults;
    }

    Object.getOwnPropertyNames(defaults).forEach(function (k) {
        if (!options.hasOwnProperty(k)) {
            options[k] = defaults[k];
        }
    });

    return options;
}

Datum.prototype.save = function (values, callback) {

    // TODO validate the array

    this._writeValues(values, callback);
}

Datum.prototype.enableMapReduce = function () {

    this.leveldb = SubLevel(this.db)
        , bc1min = new BucketCalculator({period: 1, periodUnit: 'day', interval: 1, intervalUnit: 'minutes'})
        , bc5min = new BucketCalculator({period: 1, periodUnit: 'day', interval: 5, intervalUnit: 'minutes'})
        , bc1hr = new BucketCalculator({period: 1, periodUnit: 'day', interval: 1, intervalUnit: 'hour'});

    this.metricsMapReduce =
        mapreduce(
            this.leveldb, //the parent db
            'metrics',  //name.
            function (key, value, emit) {
                // perform some mapping.
                /*
                 {
                 "host": "trogdor.fritz.box",
                 "metric": "interface.en0.if.octets.rx",
                 "date": "2013-03-11T06:11:10.681Z",
                 "type": "derive",
                 "interval": "10",
                 "value": 2002876
                 }
                 */
                var obj = JSON.parse(value);
                //key may be an array of strings.
                //value must be a string or buffer.
                internal.debugLog('map', [key, value]);
                bc1min.calculate(obj.date, function (err, data) {
                    emit([obj.host, obj.metric, data.intervalStartDate, '1min'], '' + obj.value);
                });
                bc5min.calculate(obj.date, function (err, data) {
                    emit([obj.host, obj.metric , data.intervalStartDate, '5min'], '' + obj.value);
                });
                bc1hr.calculate(obj.date, function (err, data) {
                    emit([obj.host, obj.metric , data.intervalStartDate, '1hr'], '' + obj.value);
                });
            },
            function (acc, value) {

                //console.log('reduce', 'acc', require('util').inspect(acc));
                //console.log('reduce', 'value', require('util').inspect(value));

                if (isNaN(Number(value))) {
                    //console.log('reduce', 'NaN', 'null');
                    return null;
                }

                if (typeof value == 'undefined') {
                    //console.log('reduce', 'null');
                    return null;
                }

                //reduce little into big
                //must return a string or buffer.
                var accumulator;
                if (typeof acc == 'undefined') {
                    accumulator = {n: 0, mean: 0, m2: 0};
                } else {
                    accumulator = JSON.parse(acc);
                }
                internal.debugLog('reduce', [acc, value]);
                onlineVariance.update(accumulator, Number(value));
                return JSON.stringify(accumulator);
            }
        );

}

Datum.prototype._writeValues = function (values, callback) {

    var writeCount = 0,
        writeStream = this.db.createWriteStream()
            .on('error', function (err) {
                callback(err);
            })
            .on('close', function () {
                callback(null, writeCount);
            });

    values.forEach(function (value) {
        var key = [value.host, value.metric].join('.') + '_' + value.date;
        if (this.options.debug) console.log("key", key);
        writeStream.write({key: key, value: JSON.stringify(value)});
        writeCount++;
    }, this);

    writeStream.end();
};

internal.debugLog = function (event, data) {
    if (this.debug) {
        console.log(event, require('util').inspect(data))
    }
}

module.exports = Datum;