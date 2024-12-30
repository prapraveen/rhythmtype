"use client"

import Login from './Login'
import './page.css'
import SpeedTypingGame from './typingGame'
import { useState, useEffect, useRef } from 'react'

const code = new URLSearchParams(window.location.search).get("code")
// const code = ""

export default function Home() {
    const [accessToken, setAccessToken] = useState("")
    const effectRan = useRef(false)

    useEffect(() => {
        if (!effectRan.current && accessToken == "") {
            fetch(`http://127.0.0.1:8000/api/py/get-access-token/?code=${code}`)
            .then(res => res.json())
            .then(token => {
                if (token) {
                    if (token.Error == true) {
                        setAccessToken("")
                    }
                    else {
                        setAccessToken(token["Content"]["access_token"])
                        console.log(token)
                    }
                }
                
            })
        }
        effectRan.current = true;
    }, [])

    return (
        <div className="App">
            {(code == null) ? <Login /> : <SpeedTypingGame code={accessToken}/>
            }
        </div>
    )
}

