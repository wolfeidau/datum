// Load modules
const expect = require('chai').expect
    , onlineVariance = require('../../lib/online_variance');

var valueArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

describe('Online Variance', function () {

    it('should correctly calculate the mean', function () {
        var accumulator = {n: 0, mean: 0, m2: 0};

        valueArray.forEach(function (value) {
            onlineVariance.update(accumulator, value);
        });
        expect(accumulator.mean).is.eql(5.5);
    })

});