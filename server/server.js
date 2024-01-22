const express = require('express');
const ss = require('socket.io-stream');
const app = express();

const CHUNK_SIZE = 4096; // Adjust as needed

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});

io.on('connection', (socket) => {
    console.log('Client connected : ' + socket.id);
    socket.on('playSong' , audioURL =>{
        console.log("Playing song : " + audioURL);
    })
});



server.listen(3000, () =>{
    console.log('Server listening on port 3000');
});


