import "./App.css";
import { io } from "socket.io-client";
import { useMemo, useState, useEffect, useRef } from "react";
import { apiConnector } from "./services/apiconnector";

function App() {
  const socket = useMemo(() => io("http://localhost:3000"), []);
  const [searchQuery, setSearchQuery] = useState("");
  const [trackList, setTrackList] = useState([]);
  const [songUrl, setSongUrl] = useState("");
  const audio = useRef();
  // const audioPlayer = useAudioPlayer();
  // const [chunks, setChunks] = useState([]);
  useEffect(() => {
    socket.on("connect", () => {
      console.log(socket.id);
    });

    // socket.once("songChunk", (chunk) => {
    //   setChunks([...chunks, chunk]);
    //   console.log("Inside songChunk")
    //   console.log("chunk", chunk)

    //   console.log("chunks", chunks)
    // })

    socket.on(
      "sendSong",
      (songurl) => {
        console.log("song recieved" + songurl);
        setSongUrl(songurl);
      },
      async () => {
        console.log("in ");
        await audio.current.play();
      }
    );

    return () => {
      socket.disconnect();
    };
  });

  // function handlePlay (){
  //   const blob = new Blob(chunks, {type: 'audio/mp3'});
  //   audioPlayer.play(blob);
  // }

  //socket events
  // const playSong = (songUrl) => {
  //   console.log("Inside playSong")
  //   socket.emit("playSong", songUrl);
  // }

  //state variables

  const searchHandler = async (search) => {
    const res = await apiConnector(
      "get",
      `https://spotify81.p.rapidapi.com/search?q=${search}&type=multi&offset=0&limit=10&numberOfTopResults=5`,
      null,
      {
        "X-RapidAPI-Key": "d56b1f2effmsh5f29610e2682c33p126cd8jsn6d4e17a18aa7",
        "X-RapidAPI-Host": "spotify81.p.rapidapi.com",
      },
      null
    );

    setTrackList(res.data.tracks);
    return res;
  };

  const getSong = async (id) => {
    const res = await apiConnector(
      "GET",
      `https://spotify81.p.rapidapi.com/download_track?q=${id}&onlyLinks=1`,
      null,
      {
        "X-RapidAPI-Key": "d56b1f2effmsh5f29610e2682c33p126cd8jsn6d4e17a18aa7",
        "X-RapidAPI-Host": "spotify81.p.rapidapi.com",
      }
    );
    console.log("Before event emit");
    await setSongUrl(res.data[0].url);
    socket.emit("playSong", songUrl);
    console.log("After event emit and before audio play");
    audio.current.play();
  };

  return (
    <>
      <div>Music streams</div>
      <div>
        <h2>type song name</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={() => searchHandler(searchQuery)}>Search</button>
        <div className="searchdiv">
          <h6>Search results</h6>
          <ul>
            {trackList.map((item, ind) => (
              <li key={ind} onClick={() => getSong(item.data.id)}>
                <img src={item.data.albumOfTrack.coverArt.sources[0].url} />
                {item.data.albumOfTrack.name}{" "}
              </li>
            ))}
          </ul>
        </div>

        <audio ref={audio} src={songUrl} controls />
      </div>
    </>
  );
}

export default App;
