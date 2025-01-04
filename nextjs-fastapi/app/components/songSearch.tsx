"use client"

import { useState, useEffect } from "react"
import "./songSearch.css"
import SpotifyWebApi from "spotify-web-api-node"
import useUser from "../auth/useUser"
import { setServers } from "dns"
import TrackSearchResult from "./trackSearchResult"

const spotifyApi = new SpotifyWebApi({
    clientId: "8a0c38ad76f44094bf02f0e841ab37c8"
})

export default function SongSearch() {
    const user = useUser()
    const [search, setSearch] = useState("")
    const [searchResults, setSearchResults] = useState<any>([])
    const [accessToken, setAccessToken] = useState<null | string>(null)
    console.log(searchResults)

    useEffect(() => {
        if (!user || user == "loading") return
        setAccessToken(user["access_token"])
    }, [user])

    useEffect(() => {
        if (accessToken) {
            spotifyApi.setAccessToken(accessToken)
        }
    }, [accessToken])



    useEffect(() => {
        if (!user || user == "loading") return
        let cancel = false
        if (search == "") {
            setSearchResults([])
            return
        }
        spotifyApi.searchTracks(search).then(res => {
            if (cancel) return
            setSearchResults(res?.body.tracks?.items.map(track => {
                const smallestAlbumImage = track.album.images.reduce((smallest, image) => {
                    if ((image.height as number) < (smallest.height as number)) return image
                    return smallest
                }, track.album.images[0])
                return {
                    artist: track.artists[0].name,
                    title: track.name,
                    uri: track.uri,
                    id: track.id,
                    albumUrl: smallestAlbumImage.url
                }
            }))
        })

        return () => {cancel = true}
    }, [search])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    return <>
        <div className="container text-center text-4xl w-1/3 gap-0">
            <input type="text" 
                className="font-mono p-3 px-4 rounded-2xl text-center bg-white text-black w-full" style={(searchResults.length > 0) ? {borderRadius: "1rem 1rem 0rem 0rem"} : {}}
                id="search" 
                placeholder="Search for Songs" 
                onChange={handleChange}
            />
            {/*<button className="search-button font-mono p-3 px-4 rounded-2xl bg-white text-white" onClick={makeSearch}>Search</button> */}
            <div className="results bg-white py-0" style={{maxHeight: "40vh", overflowY: "scroll"}}>
                {searchResults.map((track: any) => {
                    return <TrackSearchResult track={track} key={track.uri} />
                })}
            </div>
            
        </div>
        
    </>
}