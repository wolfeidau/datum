/*
 * datum
 * https://github.com/wolfeidau/datum
 *
 * Copyright (c) 2012 Mark Wolfe
 * Licensed under the MIT license.
 */
var levelup = require('levelup');
var mapreduce = require('map-reduce');
var OnlineVariance = require('./online_variance')

var defaultOptions = {debug: false, store: './datum_store'};

function Datum(options) {
    this.options = mergeOptions(defaultOptions, options);
    this.db = levelup(this.options.store);
};

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
};

Datum.prototype.save = function (values, callback) {

    // TODO validate the array

    this._writeValues(values, callback);
}

Datum.prototype.enableMapReduceByMinute = function () {

    var accumlationPeriod = 'minute',
        onlineVariance = new OnlineVariance();

    this.mapReduceByMinute =
        mapreduce(
            this.db, //the parent db
            accumlationPeriod,  //name.
            function (key, value, emit) {
                //perform some mapping.
                var obj = JSON.parse(value);
                //emit(key, value)
                //key may be an array of strings.
                //value must be a string or buffer.
                emit(['all', obj.group], '' + obj.lines.length);
            },
            function (accumulator, value, key) {
                //reduce little into big
                //must return a string or buffer.
                return '' + (Number(accumulator) + Number(value));
            },
            //pass in the initial value for the reduce.
            //*must* be a string or buffer.
            JSON.stringify(onlineVariance)
        );


};


Datum.prototype._writeValues = function (values, callback) {

    var writeCount = 0,
        writeStream = this.db.createWriteStream()
            .on('error', function (err) {
                callback(null, err);
            })
            .on('close', function () {
                callback(writeCount);
            });

    values.forEach(function (value) {
        var key = [value.host, value.metric].join('.') + '_' + value.date;
        if (this.options.debug) console.log("key", key);
        writeStream.write({key: key, value: value});
        writeCount++;
    }, this);

    writeStream.end();
};


module.exports = Datum;