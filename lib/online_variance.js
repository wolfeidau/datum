/*
 * datum
 * https://github.com/wolfeidau/datum
 *
 * Thanks to @rvagg for smashing this out in a matter of minutes after looking at the wikipedia page.
 *
 * http://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#On-line_algorithm
 *
 * Copyright (c) 2012 Mark Wolfe
 * Licensed under the MIT license.
 */

exports.update = function (accumulator, value) {
    accumulator.n++;
    var delta = value - accumulator.mean;
    accumulator.mean += delta / accumulator.n;
    accumulator.m2 += delta * (value - accumulator.mean);
};

exports.variance = function (accumulator) {
    return accumulator.m2 / (accumulator.n - 1)
};
