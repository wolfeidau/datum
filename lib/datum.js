/*
 * datum
 * https://github.com/wolfeidau/datum
 *
 * Copyright (c) 2012 Mark Wolfe
 * Licensed under the MIT license.
 */
var levelup = require('levelup');
var onlineVariance = require('./online_variance');
var BucketCalculator = require('./bucket_calculator');

var LevelMapMerge = require('level-map-merge');
var SubLevel = require('level-sublevel');

var defaultOptions = {debug: false, store: './datum_store'};

var internal = {};

function Datum(options) {
    this.options = mergeOptions(defaultOptions, options);
    this.db = SubLevel(levelup(this.options.store));
    this.metrics = this.db.sublevel('metrics');
    this.views = this.db.sublevel('views');
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

    var bc1min = new BucketCalculator({period: 1, periodUnit: 'day', interval: 1, intervalUnit: 'minutes'})
        , bc5min = new BucketCalculator({period: 1, periodUnit: 'day', interval: 5, intervalUnit: 'minutes'})
        , bc1hr = new BucketCalculator({period: 1, periodUnit: 'day', interval: 1, intervalUnit: 'hour'});

    this.mapDb = LevelMapMerge(
        this.metrics //the store for raw data
        , this.views // the store for aggregated data in the form of views
        , function (key, value, emit) {
            // perform some mapping.
            var obj;

//            console.log('parse', 'value', value);

            if (typeof value == 'object') {
                obj = value;
            } else {
                obj = JSON.parse(value);
            }

            //key may be an array of strings.
            //value must be a string or buffer.
            internal.debugLog('map', [key, value]);

            emit([obj.host, obj.metric, bc1min.calculateSync(obj.date).intervalStartDate, '1min'], '' + obj.value);
            emit([obj.host, obj.metric , bc5min.calculateSync(obj.date).intervalStartDate, '5min'], '' + obj.value);
            emit([obj.host, obj.metric , bc1hr.calculateSync(obj.date).intervalStartDate, '1hr'], '' + obj.value);

        }
        ,function (acc, value, key) {

            var bucket = key.join('!');
            var accumulator;

            if (!acc.hasOwnProperty('n')) {
                accumulator = {n: 0, mean: 0, m2: 0};
            } else {
                accumulator = acc;
            }

            onlineVariance.update(accumulator, Number(value));

            console.log('accumulator', bucket, accumulator);

            return accumulator;

        }
    ).start();

    this.mapDb.on('merge', function () {
        //console.log('merged');
    })

}

Datum.prototype._writeValues = function (values, callback) {

    var writeCount = 0,
        writeStream = this.metrics.createWriteStream()
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