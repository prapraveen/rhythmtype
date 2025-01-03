"use client"

import "./home.css"
import SongSearch from "./components/songSearch"
import useUser from "./auth/useUser"
import Login from "./play/Login"

export default function Home() {
  const user = useUser()
  return (
  <div className="container fixed inset-0 overflow-auto w-full">
    <div className="title site-banner-title text-center my-40 font-mono text-9xl font-semibold">
      <h1> RhythmType </h1>
    </div>
    {(!user) ? <Login /> : <SongSearch />}
  </div>
  )
}
