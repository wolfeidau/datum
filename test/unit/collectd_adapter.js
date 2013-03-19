// Load modules
const chai = require('chai');

var collectdAdapter = require('../../lib/collectd_adapter');

var expect = chai.expect;


describe('CollectdAdapter' +
    '', function () {

    describe('transformer', function () {

        it('should build a valid key', function (done) {

            collectdAdapter._buildKey({
                "values": [0, 0],
                "dstypes": ["derive", "derive"],
                "dsnames": ["rx", "tx"],
                "time": 1363421496.642,
                "interval": 10.000,
                "host": "trogdor.fritz.box",
                "plugin": "interface",
                "plugin_instance": "stf0",
                "type": "if_errors",
                "type_instance": ""
            }, function (err, keys) {
                expect(err).is.null;
                expect(keys.pop()).is.eql('interface.stf0.if_errors.tx');
                expect(keys.pop()).is.eql('interface.stf0.if_errors.rx');
                done();
            });

        });

        it('should accept an array of metrics from collectd', function (done) {

            var collectdData = require('./dump.json');

            collectdAdapter.buildEntries(collectdData, function (err, entries, count) {
                //console.log(JSON.stringify(entries));
                expect(err).is.null;
                expect(count).is.eql(18);
                done();
            });

        });
    });
});
