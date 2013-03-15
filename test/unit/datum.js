// Load modules
const fs = require('fs')
    , path = require('path')
    , rimraf = require('rimraf')
    , sinon = require('sinon')
    , sinonChai = require("sinon-chai")
    , expect = require('chai').expect;

var Datum = require('../../lib/datum');

var series = require('./fixture.json');

var tempPath = './temp';

describe('Datum', function () {

    before(function (done) {
        rimraf(tempPath, function () {
            fs.mkdir(tempPath, function () {
                done();
            })
        })
    })

    describe('options', function () {


        it('should have default options when not supplied', function () {
            var datum = new Datum();
            expect(datum.options.debug).to.eql(false);
            expect(datum.options.store).to.eql('./datum_store');
        });

        it('should accept and apply options', function () {
            var dataPath = path.join(tempPath, 'datum_store2');
            var datum = new Datum({debug: true, store: dataPath});
            expect(datum.options.debug).to.eql(true);
            expect(datum.options.store).to.eql(dataPath);
        });

    });

    describe('datum', function () {

        var datum;

        before(function () {
            datum = new Datum({/*debug: true, */store: path.join(tempPath, 'datum_store3')});
        })

        it('should enable saving of time a series of metrics', function (done) {

            datum.save(series, function (writeCount, err) {

                expect(writeCount).to.eql(series.length);

                expect(err).to.not.exist;

                done();
            });

        });

    });

    describe('datum', function () {

        var datum;

        before(function () {
            datum = new Datum({/*debug: true, */store: path.join(tempPath, 'datum_store4')});
        })
        it('should peform a map reduce on the inserted keys', function (done) {

            var listener = sinon.spy();

            sinon.log = function (message) {
                console.log(message);
            };

            datum.enableMapReduceByMinute();

            datum.save(series, function (writeCount, err) {

                expect(writeCount).to.eql(series.length);
                expect(err).to.not.exist;

                datum.mapReduceByMinute.on('reduce', listener);

                expect(listener.calledWith('interface.en0.if.octets.rx2013-03-11T06:11',
                    '{"n":5,"mean":120.2,"m2":20546.8}')).to.be.ok
                expect(listener.calledWith('interface.en0.if.octets.rx2013-03-11T06:12',
                    '{"n":6,"mean":125.16666666666667,"m2":78384.83333333333}')).to.be.ok

                done();
            });

        });

    });

});