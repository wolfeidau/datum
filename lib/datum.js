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

    var accumlationPeriod = 'minute'
        , leveldb = SubLevel(this.db);

    this.mapReduceByMinute =
        mapreduce(
            leveldb, //the parent db
            accumlationPeriod,  //name.
            function (key, value, emit) {

                //console.log('map', key, value);

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
                //emit(key, value)
                //key may be an array of strings.
                //value must be a string or buffer.
                console.log('map', key, require('util').inspect(), require('util').inspect(emit))
                emit(['mean' + obj.metric + obj.date.substr(0, 16)], '' + obj.value);
            },
            function (acc, value, key) {
                //reduce little into big
                //must return a string or buffer.
                console.log('reduce', key, require('util').inspect(value), require('util').inspect(acc));
                onlineVariance.update(acc, Number(value))
                return acc;
            },
            //pass in the initial value for the reduce.
            //*must* be a string or buffer.
            {n: 0, mean: 0, m2: 0}
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
        writeStream.write({key: key, value: JSON.stringify(value)});
        writeCount++;
    }, this);

    writeStream.end();
};

module.exports = Datum;