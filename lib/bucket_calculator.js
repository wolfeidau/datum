var moment = require('moment');
/*
 *
 * - periodUnit which can be either a day,month,year
 * - interval which can must be divisible into the period
 * - intervalUnit which can be minute, day or month.
 *
 */


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
}

BucketCalculator.prototype.setPeriod = function (period, periodUnit) {
    this.periodDuration = moment.duration(period, periodUnit);
}

BucketCalculator.prototype.setInterval = function (interval, intervalUnit) {
    this.intervalDuration = moment.duration(interval, intervalUnit);

    // validate the interval is a divisor of the period
    if ((this.periodDuration / this.intervalDuration) % 1 != 0) {
        throw Error('invalid interval, not a divisor of the configured period')
    }
}

BucketCalculator.prototype.truncateDateByPeriod = function (date) {

    // are we configured
    this._validateConfigured();

    // parse the date and calculate the remainder
    var parsedDate = moment(date)
        , remainder = moment(date) % this.periodDuration;

    return new Date(parsedDate - remainder).toISOString();
}

BucketCalculator.prototype.calculateIntervalStartDateByIndex = function (date, index) {

    // are we configured
    this._validateConfigured();

    // parse the date and calculate the remainder
    var parsedDate = moment(date)
        , remainder = moment(date) % this.periodDuration
        , truncatedDateMillis = parsedDate - remainder;

    return new Date(truncatedDateMillis + (index * this.intervalDuration)).toISOString();
}

BucketCalculator.prototype.calculateIntervalIndex = function (date) {

    // are we configured
    this._validateConfigured();

    // calculate the milliseconds after applying the duration as a modulus
    var remainder = moment(date) % this.periodDuration;

    return Math.floor(remainder / this.intervalDuration);
}

BucketCalculator.prototype._validateConfigured = function () {
    if (!moment.isDuration(this.intervalDuration)) {
        throw Error('missing or invalid intervalDuration')
    }
    if (!moment.isDuration(this.periodDuration)) {
        throw Error('missing or invalid intervalDuration')
    }
}

module.exports = BucketCalculator;
