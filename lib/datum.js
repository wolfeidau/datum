/*
 * datum
 * https://github.com/wolfeidau/ofuda
 *
 * Copyright (c) 2012 Mark Wolfe
 * Licensed under the MIT license.
 */
var levelup = require('levelup');

var defaultOptions = {debug: false, store: './datum_store'};

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

    this._save(values, callback);
}

Datum.prototype._save = function (values, callback) {
    var writeCount = 0,
        writeStream = this.db.createWriteStream()
        .on('error', function (err) {
            callback(null, err);
        })
        .on('close', function () {
            callback(writeCount);
        });

    values.forEach(function(value){
        writeStream.write({key: value.key, value: value});
        writeCount++;
    }, this);


    writeStream.end()
}


module.exports = Datum;