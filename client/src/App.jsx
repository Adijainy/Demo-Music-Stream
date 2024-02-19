import "./App.css";
import { io } from "socket.io-client";
import { useMemo, useState, useEffect } from "react";
import { apiConnector } from "./services/apiconnector";
import {useAudioPlayer} from 'react-use-audio-player'
function App() {
  const socket = useMemo(() => io("http://localhost:3000"), []);
  const audioPlayer = useAudioPlayer();
  const [chunks, setChunks] = useState([]);
  useEffect(() => {
    socket.on("connect", () => {
      console.log(socket.id);
    });

    socket.once("songChunk", (chunk) => {
      setChunks([...chunks, chunk]);
      console.log("Inside songChunk")
      console.log("chunk", chunk)
      
      console.log("chunks", chunks)
    })

    

    return () => {
      socket.disconnect();
    };
  });

  function handlePlay (){
    const blob = new Blob(chunks, {type: 'audio/mp3'});
    audioPlayer.play(blob);
  }

  //socket events
  // const playSong = (songUrl) => {
  //   console.log("Inside playSong")
  //   socket.emit("playSong", songUrl);
  // }

  //state variables
  const [searchQuery, setSearchQuery] = useState("");
  const [trackList, setTrackList] = useState([]);

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



  const getSong = async(id) => {
    const res = await apiConnector('GET', `https://spotify81.p.rapidapi.com/download_track?q=${id}&onlyLinks=1`, null, {
      'X-RapidAPI-Key': 'd56b1f2effmsh5f29610e2682c33p126cd8jsn6d4e17a18aa7',
      'X-RapidAPI-Host': 'spotify81.p.rapidapi.com'
    });
    console.log("Before event emit")
    // playSong(res.data[0].url);
    socket.emit("playSong", res.data[0].url);
    console.log("After event emit")
  }
  

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


        <button onClick={() => handlePlay()}>Play song</button>
      </div>
    </>
  );
}

export default App;
