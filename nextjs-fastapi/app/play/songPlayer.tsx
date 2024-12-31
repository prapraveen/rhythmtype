"use client"
import { useState, useEffect } from "react"

import SpotifyWebPlayer from "react-spotify-web-playback"

export default function SongPlayer({ trackUri, accessToken, playing }: { trackUri:string, accessToken:string, playing:boolean }) {
    const [play, setPlay] = useState(true)
    useEffect(() => {
      if (playing) {
        setPlay(true)
      }
      else {
        setPlay(false)
      }
    }, [])
    return (
    <>
        <SpotifyWebPlayer 
        token={accessToken}
        play={playing}
        //uris={trackUri ? ["trackUri"] : []}
        uris={trackUri ? [trackUri] : []}
        />
    </>
    
  )
}