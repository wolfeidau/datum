// Load modules
const fs = require('fs')
    , path = require('path')
    , rimraf = require('rimraf')
    , sinon = require('sinon')
    , chai = require('chai');

var Datum = require('../../lib/datum');

var series = require('./fixture.json');

var expect = chai.expect;

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

            datum.save(series, function (err, writeCount) {

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

            var callback = sinon.spy();

            datum.enableMapReduce();

            datum.save(series, function (err, writeCount) {
                expect(writeCount).to.eql(series.length);
                expect(err).to.not.exist;

//                console.log('writeCount', writeCount);

                datum.mapDb.on('merge', function(){
                    callback();

//                    console.log('called', callback.callCount);

                    if (callback.callCount == 33){

                        done();
                    }
                });

            });

        });

    });

});