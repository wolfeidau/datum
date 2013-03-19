/*
 * datum
 * https://github.com/wolfeidau/datum
 *
 * Copyright (c) 2012 Mark Wolfe
 * Licensed under the MIT license.
 */

var http = require('http');
var fs = require('fs');
var util = require('util');
var Datum = require('./datum');
var collectdAdapter = require('./collectd_adapter');


exports.createServer = function (options) {

    var datum = new Datum(options);

    datum.enableMapReduce();

    return http.createServer(function (req, res) {
        console.log('headers: ' + util.inspect(req.headers));

        var resultCode = 200;

        req.on('data',function (chunk) {

            if (req.headers['content-type'] == 'application/json') {
                //console.log('BODY: ' + chunk);

                var collectdData = [];

                try {
                    collectdData = JSON.parse(chunk);
                } catch (e) {
                    resultCode = 500;
                    return;
                }

                collectdAdapter.buildEntries(collectdData, function (err, entries, count) {
                    console.log('parsed', count);
                    datum.save(entries, function (err, writeCount) {
                        if (err) {
                            resultCode = 500;
                        } else {
                            console.log('wrote', writeCount);
                        }
                    });
                })
            }

        }).on('end', function () {
                res.writeHead(resultCode, {'Content-Type': 'text/plain'});
                res.end();
            });
    });

};