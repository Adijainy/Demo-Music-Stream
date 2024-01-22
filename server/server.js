const express = require("express");
const ss = require("socket.io-stream");
const axios = require("axios");
const app = express();
const CHUNK_SIZE = 4096; // Adjust as needed
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
  const stream = ss.createStream();
  console.log("Client connected : " + socket.id);
  socket.on("playSong", (audioURL) => {
    console.log("Playing song : " + audioURL);
    fetchAndStream(audioURL, stream);
  });
});

async function fetchAndStream(audioUrl, stream) {
  try {
    const response = await axios.get(audioUrl, { responseType: "stream" }); // Specify stream response type

    if (response.status === 200) {
      response.data
        .pipe(chunkAudio(CHUNK_SIZE)) // pipe stream directly
        .on("data", (chunk) => {
          const timestamp = audioContext.currentTime; // Use server-side audio context for timestamps
          stream.emit("songChunk", chunk, timestamp); // Emitting chunk and timestamp on event "songchunk"
        })
        .pipe(stream);
    } else {
      console.error(`Error fetching audio: ${response.status}`);
      io.emit("error", `Error fetching audio`);
    }
  } catch (error) {
    console.error(error);
    io.emit("error", error);
  }
}

//chunk audio function
function chunkAudio(chunkSize) {
  return new TransformStream({
    transform(chunk, controller) {
      const chunks = [];
      let remaining = chunk;
      while (remaining.length > chunkSize) {
        chunks.push(remaining.slice(0, chunkSize));
        remaining = remaining.slice(chunkSize);
      }
      chunks.push(remaining);
      chunks.forEach((chunk) => controller.push(chunk));
    },
  });
}
