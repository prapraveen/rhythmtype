import { useEffect, useRef } from "react"
import "./login.css"
import useUser from "../auth/useUser"

const scope = "streaming user-read-email user-read-private user-library-read user-library-modify user-read-playback-state user-modify-playback-state"
const AUTH_URL = 'https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: "8a0c38ad76f44094bf02f0e841ab37c8",
      scope: scope,
      redirect_uri: "http://localhost:3000/"}).toString()

export default function Login() {
    const user = useUser()
    const effectRan = useRef(false)
  
    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get("code")

        if ((!user || user == "loading") && !effectRan.current) {
            if (code) {
                fetch(`http://127.0.0.1:8000/api/py/get-access-token?code=${code}`)
                .then(res => res.json())
                .then(data => {
                    if (data) {
                        if (data.error) {
                            console.log(data.error)
                        }
                        else {
                            window.localStorage.setItem("user", JSON.stringify(data))
                            window.location.reload()
                        }
                    }
                    
                })
            }
            
        }
        effectRan.current = true;
    }, [])
  return (
    <div className="text-center login-text text-3xl font-semibold mt-10 bg-white p-5 px-8 rounded-full font-mono">
      <a href={AUTH_URL}>Login With Spotify to Begin</a>
    </div>
  )
}
