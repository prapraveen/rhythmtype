"use client"
import { useState, useEffect } from "react"

import SpotifyWebPlayer from "react-spotify-web-playback"
import useUser from "../auth/useUser"

export default function SongPlayer({ trackUri, playing }: { trackUri:string, playing:boolean }) {
    const user: any = useUser()

    if (!user) {
      return <div>Loading user...</div>
    }
    
    return (
    <>
        <SpotifyWebPlayer 
        token={user["access_token"]}
        play={playing}
        //uris={trackUri ? ["trackUri"] : []}
        uris={trackUri ? [trackUri] : []}
        />
    </>
    
  )
}