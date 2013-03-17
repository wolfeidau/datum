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
 * - period number representing the length of period.
 * - periodUnit which can be either a day,month,year
 * - interval number representing the length of the interval, this must be divisible into the period
 * - intervalUnit which can be minute, day or month.
 *
 * @constructor
 */
function BucketCalculator(options) {
    if (typeof options != 'undefined') {
        this.setPeriod(options.period, options.periodUnit);
        this.setInterval(options.interval, options.intervalUnit);
        // are we configured
        this._validateConfigured();
    }
};

BucketCalculator.prototype.setPeriod = function (period, periodUnit) {
    this.periodDuration = moment.duration(period, periodUnit);
}

BucketCalculator.prototype.setInterval = function (interval, intervalUnit) {
    this.intervalDuration = moment.duration(interval, intervalUnit);

    // validate the interval is a divisor of the period
    if ((this.periodDuration / this.intervalDuration) % 1 != 0) {
        throw Error('invalid interval, not a divisor of the configured period')
    }
};

BucketCalculator.prototype.intervalHumanize = function () {
    return this.intervalDuration.humanize();
};

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
                truncatedDate: data.truncatedDate
                , intervalIndex: data.intervalIndex
                , intervalStartDate: intervalStartDate
            });

        });

    });
};

BucketCalculator.prototype._calculateInterval = function (date, callback) {

    var parsedDate = moment(date)
        , remainderMillis = parsedDate % this.periodDuration
        , intervalIndex = Math.floor(remainderMillis / this.intervalDuration)
        , truncatedDateMillis = parsedDate - remainderMillis
        , truncatedDate = new Date(truncatedDateMillis).toISOString();


    callback(null,
        { parsedDate: moment(date)
            , _remainderMillis: remainderMillis
            , _truncatedDateMillis: truncatedDateMillis
            , intervalIndex: intervalIndex
            , truncatedDate: truncatedDate

        }
    )
}

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

BucketCalculator.prototype._validateConfigured = function () {
    if (!moment.isDuration(this.intervalDuration)) {
        throw Error('missing or invalid intervalDuration')
    }
    if (!moment.isDuration(this.periodDuration)) {
        throw Error('missing or invalid periodDuration')
    }
};

module.exports = BucketCalculator;
