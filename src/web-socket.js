'use strict';

var P2P = require('socket.io-p2p');
var io = require('socket.io-client');

function WebSocket() {
    var opts = {
        autoUpgrade: false,
        peerOpts: {numClients: 10}
    };

    var socket = io.connect('http://localhost:3030');
    var p2p = new P2P(socket, opts);
    p2p.usePeerConnection = true;

    p2p.on('ready', function(data){
        console.log(data);
    });

    return p2p;
}

module.exports = WebSocket;
