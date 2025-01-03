"use client"

import useUser from '../auth/useUser'
import Login from './Login'
import './page.css'
import SpeedTypingGame from './typingGame'
import { useState, useEffect, useRef } from 'react'

// const code = ""

export default function Home() {
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
        <div className="App">
            {(!user) ? <Login /> : <SpeedTypingGame />
            }
        </div>
    )
}

