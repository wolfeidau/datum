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

        it('should calculate the correct index, truncated date and interval start date, for the configured periods', function (done) {

            bucketCalculator.calculate(dt1, function(err, data){
                expect(data.intervalIndex).to.eql(24);
                expect(data.truncatedDate).to.eql('2013-03-11T00:00:00.000Z');
                expect(data.intervalStartDate).to.eql('2013-03-11T06:00:00.000Z')

                done();
            });

        });


        it('should calculate the correct index for the configured periods', function (done) {

            bucketCalculator._calculateInterval(dt1, function (err, data) {
                expect(data.intervalIndex).to.eql(24);
                expect(data.truncatedDate).to.eql('2013-03-11T00:00:00.000Z');

                bucketCalculator._calculateInterval(dt2, function (err, data) {

                    expect(data.intervalIndex).to.eql(25);
                    expect(data.truncatedDate).to.eql('2013-03-11T00:00:00.000Z');

                    done();
                });
            });

        });

    });

});