// Load modules
const chai = require('chai');

var dates = require('../../lib/dates');

var expect = chai.expect;

var dt1 = '2013-03-11T06:11:30.685Z';
var dt2 = '2013-03-11T06:21:30.685Z';
var dt3 = '2013-03-11T06:31:30.685Z';
var dt4 = '2013-03-11T06:51:30.685Z';

describe('Dates', function () {

    it('should return the correct slice index for a given period', function () {
        expect(dates.getPeriodIndex(dt1, 15, 'minutes')).to.eql(0);
        expect(dates.getPeriodIndex(dt2, 15, 'minutes')).to.eql(1);
        expect(dates.getPeriodIndex(dt3, 15, 'minutes')).to.eql(2);
        expect(dates.getPeriodIndex(dt4, 15, 'minutes')).to.eql(3);

    })

    it('should proxy duration functions similar to moment.js', function () {
        expect(dates.duration(15, 'minutes').minutes()).to.eql(15);
    })

    it('should calculate the number of intervals in a given period', function () {
        var interval15mins = dates.duration(15, 'minutes')
            , period1month = dates.duration(1, 'day')
            , count = dates.getCountOfIntervalsInPeriod(interval15mins, period1month);

        expect(count).to.eql(96);
    })

    it('should generate a period interval calculator function', function(){

        var dayIntervalCalculator = dates.getIntervalCountCalculator(dates.duration(1, 'day'));

        expect(dayIntervalCalculator(dates.duration(15, 'minutes'))).to.eql(96);

    })

})