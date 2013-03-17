#!/usr/bin/env node

var optimist = require('optimist');
var pkgInfo = require('../package.json');
var fs = require('fs');
var levelup = require('levelup')

var argv = optimist
    .alias('d', 'data')
    .describe('d', 'Data directory path')
    .argv;

if (argv.h) {
    console.log(optimist.help());
    process.exit(0);
}

if (argv.v) {
    console.log(pkgInfo.name, pkgInfo.version);
    process.exit(0);
}

if (argv.dump) {
    if (!argv.d) {
        optimist.showHelp();
        console.error("Missing data directory path");
        process.exit(0);
    }

    fs.stat(argv.d, function (err, stats) {

        if(err){
            console.error(err);
            process.exit(0);
        }

        if(!stats.isDirectory()){
            console.error("Data directory path not found.");
            process.exit(0);
        }

        var db = levelup(argv.d);

        db.createReadStream()
            .on('data', function (data) {
                console.log(data.key, '=', data.value)
            })
            .on('error', function (err) {
                console.log('Oh my!', err)
            })
            .on('close', function () {
                console.log('Stream closed')
            })
            .on('end', function () {
                console.log('Stream end')
            });

    });
}

