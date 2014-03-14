#!/usr/bin/env node

var rpc = require('../index');

var node = process.argv[0],
    exec = process.argv[1],
    args = process.argv.slice(2),
    opts = {};

for (var i = 0; i < args.length; i++) {
    if (args[i] == '-r' || args[i] == '--raw') {
        opts.raw = true;
    } else if (!opts.host && !opts.port) {
        var pieces = args[i].split(':');
        opts.host = pieces[0];
        opts.port = pieces[1];
    } else if (!opts.cmd) {
        opts.cmd = args[i];
    } else if (!opts.params) {
        opts.params = args[i];
    } else {
        opts.params += ',' + args[i];
    }
}

if (!opts.cmd) {
    console.error(
        'Usage: %s %s [-r|--raw] host[:port] cmd [params]',
        node, exec);
    process.exit(1);
}

var client = rpc.client(opts.host, opts.port);

client.get(opts.cmd, opts.params, function(err, data, raw) {
    if (err) {
        if (err.response) {
            console.log(err.response);
        }
        console.error(err.message);
        process.exit(1);
    } else if (opts.raw) {
        console.log(raw);
    } else {
        console.log(data);
    }
});
