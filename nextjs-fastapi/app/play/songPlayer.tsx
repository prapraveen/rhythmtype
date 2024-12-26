"use client"
import { useState, useEffect } from "react"

import SpotifyWebPlayer from "react-spotify-web-playback"

export default function SongPlayer({ trackUri }: { trackUri:string }) {
    const [accessToken, setAccessToken] = useState("")
    useEffect(() => {
        fetch(`http://127.0.0.1:8000/api/py/get-access-token`)
        .then(res => res.json())
        .then(token => setAccessToken(token))
    })
    return (
    <>
        <SpotifyWebPlayer 
        token={accessToken}
        showSaveIcon
        //uris={trackUri ? ["trackUri"] : []}
        uris={["https://open.spotify.com/track/2OqnARPTauGuGFQN1CnEro?si=51118d1d04464667"]}
        />
    </>
    
  )
}