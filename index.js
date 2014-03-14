var net = require('net');

var commandAlwaysArray = {
    pools      : true,
    devs       : true,
    edevs      : true,
    procs      : true,
    notify     : true,
    devdetails : true,
    stats      : true,
    estats     : true
};

function MinerRPCClient(host, port) {
    var self = this;

    self.host = host || 'localhost';
    self.port = port || 4028;
}

MinerRPCClient.prototype.get = function(cmd, params, cb) {
    var self = this;

    if (/\+/.test(cmd)) {
        // Responses for multiple commands at once are more complicated.
        cb(new Error(
            'Sending multiple commands to miners is not supported.'));
        return;
    }

    if (typeof params == 'function') {
        cb = params;
        params = undefined;
    }

    var response  = '',
        connected = false,
        error     = null,
        command   = {
            command : cmd
        },
        client = net.connect({
            host : self.host,
            port : self.port
        });

    if (typeof params != 'undefined') {
        command.parameter = params;
    }

    client.on('error', function(err) {
        cb(new Error(
            'Failed to connect to miner program: ' + err.message));
        cb = function() { };
    });

    client.on('connect', function() {
        client.write(JSON.stringify(command));
        connected = true;
    });

    client.on('data', function(data) {
        response += data.toString();
    });

    client.on('end', function() {
        if (!connected) {
            cb(new Error('Failed to connect to miner program.'));
            return;
        }

        function fail(msg) {
            var err = new Error(msg);
            err.response = response;
            cb(err);
        }

        try {
            response = JSON.parse(response.replace('\x00', ''));
        } catch (err) {
            fail('Bad JSON response from miner: ' + err.message);
            return;
        }

        var status = response.STATUS;
        if (status && status.length == 1) {
            status = status[0];
        } else {
            fail('Invalid STATUS in response from miner.');
            return;
        }

        if (status.STATUS == 'E' || status.STATUS == 'F') {
            fail('Miner error: ' + status.Msg);
            return;
        }

        var key = null;
        Object.keys(response).forEach(function(k) {
            if (k != 'STATUS' && k != 'id') {
                key = k;
            }
        });

        var data = response[key];
        if (data) {
            if (data.length == 1 && !commandAlwaysArray[cmd]) {
                data = data[0];
            }
        } else {
            data = status;
        }
        data._status = status;

        cb(null, data, response);
    });
};

exports.client = function(host, port) {
    return new MinerRPCClient(host, port);
};
