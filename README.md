# miner-rpc

This is a simple Node.js module that talks to the
[CGMiner](https://github.com/ckolivas/cgminer/blob/master/API-README)
and
[BFGMiner](https://github.com/luke-jr/BFGMiner/blob/BFGMiner/README.RPC)
RPC APIs.

## Installation

Make sure your miner is running with the `--api-listen` option and (if needed)
an appropriate `--api-allow` option, then:

- In your project folder:

  ```
  npm install miner-rpc
  ```

- System-wide, using the command-line script:

  ```
  sudo npm install -g miner-rpc
  miner-rpc localhost devs
  ```

## Usage

`host`, `port`, and `params` are optional.  `host` defaults to **localhost**,
`port` defaults to **4028**, and `params` is empty by default.

```js
var rpc = require('miner-rpc');

var client = rpc.client(host, port);

client.get(cmd, params, function(err, data, raw) {
    // err  : the error that occurred, if any
    // data : the sanitized response from the miner, with a '_status' property
    // raw  : the raw response from the miner
});
```

## Examples

```js
client.get('devs', function(err, data) {
    // data contains a list of devices active in the miner
});

client.get('coin', function(err, data) {
    // data contains some information about the currency being mined, including
    // the network difficulty
});

client.get('pgaset', '0,fan,80', function(err, data) {
    // Tries to set device 0 fan to 80%.  If access to privileged commands is
    // denied, err will be set; otherwise, data will be the status object
    // returned from the miner.
});
```

See the
[CGMiner RPC API Readme](https://github.com/ckolivas/cgminer/blob/master/API-README)
or the
[BFGMiner RPC API Readme](https://github.com/luke-jr/BFGMiner/blob/BFGMiner/README.RPC)
for more example commands.
