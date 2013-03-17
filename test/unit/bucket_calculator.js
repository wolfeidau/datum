// Load modules
const chai = require('chai');

var BucketCalculator = require('../../lib/bucket_calculator');

var expect = chai.expect;

var dt1 = '2013-03-11T06:11:30.685Z';
var dt2 = '2013-03-11T06:21:30.685Z';
var dt3 = '2013-03-11T06:31:30.685Z';
var dt4 = '2013-03-11T06:51:30.685Z';

describe('BucketCalculator', function () {

    describe('constructor', function () {
        it('should accept and configure using valid options', function () {
            var bucketCalculator = new BucketCalculator({
                period: 1, periodUnit: 'day', interval: 15, intervalUnit: 'minutes'
            });

            expect(bucketCalculator).to.be.defined;

        });
    });

    describe('configure', function () {

        it('should accept valid configuration params', function () {
            var bucketCalculator = new BucketCalculator();
            bucketCalculator.setPeriod(1, 'day');
            bucketCalculator.setInterval(15, 'minutes');
        });

    });


    describe('calculation', function () {

        var bucketCalculator;

        before(function () {
            bucketCalculator = new BucketCalculator();
            bucketCalculator.setPeriod(1, 'day');
            bucketCalculator.setInterval(15, 'minutes');
        });

        it('should return a date truncated based on the period', function () {
            expect(bucketCalculator.truncateDateByPeriod(dt1)).to.eql('2013-03-11T00:00:00.000Z')
        });

        it('should calculate the correct index for the configured period', function () {

            expect(bucketCalculator.calculateIntervalIndex(dt1)).to.eql(24);
            expect(bucketCalculator.calculateIntervalIndex(dt2)).to.eql(25);
            expect(bucketCalculator.calculateIntervalIndex(dt3)).to.eql(26);
            expect(bucketCalculator.calculateIntervalIndex(dt4)).to.eql(27);

        });

        it('should calculate the start date of an interval when given a date and an interval index', function(){

            expect(bucketCalculator.calculateIntervalStartDateByIndex(dt1, 0)).to.eql('2013-03-11T00:00:00.000Z')
            expect(bucketCalculator.calculateIntervalStartDateByIndex(dt1, 95)).to.eql('2013-03-11T23:45:00.000Z')

        });

    });

});