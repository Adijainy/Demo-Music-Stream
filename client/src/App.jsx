import './App.css'
import { io } from "socket.io-client"
import {useMemo, useState, useEffect} from 'react';
import { apiConnector } from './services/apiconnector';
function App() {
  const socket = useMemo(()=>
    io('http://localhost:3000')
  ,[])

  useEffect(() => {
    socket.on("connect", () => {
      console.log(socket.id);
    });

    return ()=>{
      socket.disconnect();
    }

  });

  const [searchQuery, setSearchQuery] = useState('');

  const searchHandler = async(search) => {
    const res = await apiConnector('get',`https://spotify81.p.rapidapi.com/search?q=${search}&type=multi&offset=0&limit=10&numberOfTopResults=5`,null, {
      'X-RapidAPI-Key': 'd56b1f2effmsh5f29610e2682c33p126cd8jsn6d4e17a18aa7',
      'X-RapidAPI-Host': 'spotify81.p.rapidapi.com'
    }, null);

    console.log(res);
  }

  
  return (
    <>
      <div>Music streams</div>
      <div>
        <h2>type song name</h2>
        <input 
        type="text" 
        value={searchQuery}
        onChange={(e)=>setSearchQuery(e.target.value)}
        />
        <button onClick={() => searchHandler(searchQuery)}>Search</button>
      </div>
    </>
  )
}

export default App;
