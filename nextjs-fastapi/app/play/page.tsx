"use client"

import Login from './Login'
import './page.css'
import SpeedTypingGame from './typingGame'
import { useState } from 'react'

const code = new URLSearchParams(window.location.search).get("code")
// const code = ""

export default function Home() {
    console.log(new (Buffer.from as any)("abc").toString("base64"))
    return (
        <div className="App">
            {(code == null) ? <Login /> : <SpeedTypingGame code={code}/>
            }
        </div>
    )
}

