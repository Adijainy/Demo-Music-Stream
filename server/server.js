const express = require("express");
const { Transform } = require("stream");
const axios = require("axios");
const Lame = require("node-lame").Lame;

const app = express();
const CHUNK_SIZE = 17096; // Adjust as needed
const server = require("http").createServer(app);
server.listen(3000, () => {
  console.log("Server listening on port 3000");
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

//socket connections
io.on("connection", (socket) => {
  console.log("Client connected : " + socket.id);
  socket.on('playSong', (songUrl) => {
    console.log("Playing song : " + songUrl);
    //downloadAndEncode(songUrl);
    downloadAndStream(songUrl);
  });
});


const downloadAndEncode = async (url) => {
  try {
    const response = await axios.get(url, { responseType: "stream" });
    const readableStream = response.data;
  
    const encoder = new Lame({ // Encode input to MP3
      bitDepth: 16, // Adjust encoding parameters as needed
      sampleRate: 44100,
      channels: 2,
    }).setFile("./output.mp3");

    const writableStream = readableStream.pipe(encoder);

    writableStream.on("data", (chunk) => {
      const timestamp = Date.now(); // Use server-side timestamp
      //io.emitTo("lobby", "songChunk", chunk, timestamp);
      console.log("Sent chunk at timestamp", timestamp);
    });

    writableStream.on("finish", () => {
      console.log("Audio encoding finished");
    });
  } catch (error) {
    console.error("Error downloading or encoding audio:", error);
    // Handle errors appropriately
  }
};



const downloadAndStream = async (url) => {
  try {
    const response = await axios.get(url, { responseType: "stream" });
    const readableStream = response.data;

    const writableStream = new Transform({
      transform(chunk, encoding, callback) {
        const chunks = [];
        let remaining = chunk;
        while (remaining.length > CHUNK_SIZE) {
          chunks.push(remaining.slice(0, CHUNK_SIZE));
          remaining = remaining.slice(CHUNK_SIZE);
        }
        chunks.push(remaining);
        chunks.forEach((chunk) => callback(null, chunk));
      },
    });

    readableStream.pipe(writableStream);

    writableStream.on("data", (chunk) => {
      //const timestamp = audioContext.currentTime; // Assuming you have an AudioContext for synchronization
      //io.emitTo("lobby", "songChunk", chunk, timestamp);
      //io.emit('songChunk', chunk);
      console.log("Sent chunk", chunk);
    });
  } catch (error) {
    console.error("Error downloading or streaming audio:", error);
    // Handle errors appropriately
  }
};
