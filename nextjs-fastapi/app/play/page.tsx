"use client"

import { useRouter } from 'next/navigation'
import useUser from '../auth/useUser'
import Login from './Login'
import './page.css'
import SpeedTypingGame from './typingGame'
import { useState, useEffect, useRef } from 'react'

// const code = ""

export default function Home() {
    const [songData, setSongData] = useState(null)
    const router = useRouter()
    

    useEffect(() => {
        const songId = new URLSearchParams(window.location.search).get("id")
        if (!songId) router.push("/")
        const fetchData = async () => {
            try {
                const res = (await fetch(`http://127.0.0.1:8000/api/py/get-song-data?song_id=${songId}`)).json()
                .then(json => {
                    if (!json.Error) setSongData(json)
                })
                
            }
            catch (e) {
                console.log(e)
            }
        }
        fetchData()
    }, [])


    return (
        <div className="App">
            {(songData) ? <SpeedTypingGame songData={songData}/> :
            <h2>Loading...</h2>}
        </div>
    )
}

