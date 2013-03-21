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
var moment = require('moment');

/**
 *
 * @param options **Optional** If supplied must contain the following:
 *
 * - period {Number} representing the length of period.
 * - periodUnit {String} which can be either a day,month,year
 * - interval {Number} representing the length of the interval, this must be divisible into the period
 * - intervalUnit {String} which can be minute, day or month.
 * - label {String} **Optional** label for this bucket.
 *
 * @constructor
 */
function BucketCalculator(options) {
    if (typeof options != 'undefined') {
        this.setPeriod(options.period, options.periodUnit);
        this.setInterval(options.interval, options.intervalUnit);
        this.label = options.label || this.intervalDuration.humanize();
    }
};

BucketCalculator.prototype.setPeriod = function (period, periodUnit) {
    this.periodDuration = moment.duration(period, periodUnit);
}

/**
 *
 * @param interval {Number} representing the length of the interval, this must be divisible into the period
 * @param intervalUnit {String} which can be minute, day or month.
 * @param label {String} **Optional** label for this bucket.
 */
BucketCalculator.prototype.setInterval = function (interval, intervalUnit, label) {
    this.intervalDuration = moment.duration(interval, intervalUnit);
    this.label = label || this.intervalDuration.humanize();

    // validate the interval is a divisor of the period
    if ((this.periodDuration / this.intervalDuration) % 1 != 0) {
        throw Error('invalid interval, not a divisor of the configured period')
    }
};

BucketCalculator.prototype.intervalHumanize = function () {
    return this.intervalDuration.humanize();
};

BucketCalculator.prototype.calculateSync = function (date) {

    var parsedDate = moment(date)
        , remainderMillis = parsedDate % this.periodDuration
        , intervalIndex = Math.floor(remainderMillis / this.intervalDuration)
        , truncatedDateMillis = parsedDate - remainderMillis
        , truncatedDate = new Date(truncatedDateMillis).toISOString()
        , intervalMillis = (intervalIndex * this.intervalDuration)
        , intervalStartDate = new Date(truncatedDateMillis + intervalMillis).toISOString();

    return {
        truncatedDate: truncatedDate, intervalIndex: intervalIndex, intervalStartDate: intervalStartDate
    }

};

/**
 * Given a date and the configured period/interval calculate the interval index and interval start date/time.
 *
 * @param date {String}
 * @param callback {Function}
 */
BucketCalculator.prototype.calculate = function (date, callback) {

    var self = this;

    this._validate(function (err) {
        if (err) {
            callback(err, null);
            return;
        }

        self._calculateInterval(date, function (err, data) {

            var intervalMillis = (data.intervalIndex * self.intervalDuration)
                , intervalStartDate = new Date(data._truncatedDateMillis + intervalMillis).toISOString();

            callback(null, {
                truncatedDate: data.truncatedDate, intervalIndex: data.intervalIndex, intervalStartDate: intervalStartDate
            });

        });

    });
};

/**
 *
 * @param date {String}
 * @param callback {Function}
 * @private
 */
BucketCalculator.prototype._calculateInterval = function (date, callback) {

    var parsedDate = moment(date)
        , remainderMillis = parsedDate % this.periodDuration
        , intervalIndex = Math.floor(remainderMillis / this.intervalDuration)
        , truncatedDateMillis = parsedDate - remainderMillis
        , truncatedDate = new Date(truncatedDateMillis).toISOString();


    callback(null,
        { parsedDate: moment(date), _remainderMillis: remainderMillis, _truncatedDateMillis: truncatedDateMillis, intervalIndex: intervalIndex, truncatedDate: truncatedDate

        }
    )
}

/**
 *
 * @param callback {Function}
 * @private
 */
BucketCalculator.prototype._validate = function (callback) {
    if (!moment.isDuration(this.intervalDuration)) {
        callback('missing or invalid intervalDuration')
        return;
    }
    if (!moment.isDuration(this.periodDuration)) {
        callback('missing or invalid periodDuration')
        return;
    }
    callback(null);
};

module.exports = BucketCalculator;
