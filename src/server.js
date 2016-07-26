'use strict';

var ecstatic = require('ecstatic');
var server = require('http').createServer(
    ecstatic({ root: __dirname, handleError: false })
);
var p2p = require('socket.io-p2p-server').Server;
var io = require('socket.io')(server);

server.listen(3030, function () {
    console.log('Listening on 3030');
});

io.use(p2p);

io.on('connection', function(socket){
    console.log('A client is connected!');
    socket.emit('ready', 'Ready...');

    socket.on('peer-msg', function(data) {
        console.log('Message from peer: %s', data);
        socket.emit('peer-msg', data);
    })
});
