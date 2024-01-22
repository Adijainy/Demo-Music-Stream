const express = require('express');
const app = express();


const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});

const ss = require('socket.io-stream');

const CHUNK_SIZE = 4096; // Adjust as needed

server.listen(3000, () =>{
    console.log('Server listening on port 3000');
});

io.on('connection', (socket) => {
    console.log('Client connected : ' + socket.id);
});
