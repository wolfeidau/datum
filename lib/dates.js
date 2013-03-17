var moment = require('moment');


module.exports.getPeriodIndex = function(date, period, unit){

    var periodValue = moment(date)[unit]();

    return Math.floor(periodValue / period);
}

module.exports.getRoundedDecimal = function(date, period, unit){

    var periodValue = moment(date)[unit]();

    return Math.floor(periodValue / period);
}

module.exports.duration = function(){
    return moment.duration.apply(this, Array.prototype.slice.call(arguments));
}

module.exports.getCountOfIntervalsInPeriod = function(intervalDuration, periodDuration){
    return periodDuration / intervalDuration;
}

module.exports.getIntervalCountCalculator = function(periodDuration){
    return function(intervalDuration){
        return this.getCountOfIntervalsInPeriod(intervalDuration, periodDuration);
    }.bind(this);
}