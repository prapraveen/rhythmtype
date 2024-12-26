"use client"

import { useState, useEffect, SyntheticEvent } from "react"
import './page.css'
import TypingArea from "./typingArea"
import SongPlayer from "./songPlayer"
import Login from "./Login"
import useAuth from "./useAuth"

const SpeedTypingGame = ({ code }: {code: string}) => {
    const accessToken = useAuth(code)

    const [songData, setSongData] = useState<any>(null)
    const [typingText, setTypingText] = useState<JSX.Element[]>([])
    const [inpFieldValue, setInpFieldValue] = useState('')
    const maxTime = 60
    const [timeLeft, setTimeLeft] = useState(maxTime)
    const [charIndex, setCharIndex] = useState(0)
    const [mistakes, setMistakes] = useState(0)
    const [isTyping, setIsTyping] = useState(false)
    const [lineIndex, setLineIndex] = useState(0)
    const [WPM, setWPM] = useState(0)
    const [CPM, setCPM] = useState(0)
    const [startTime, setStartTime] = useState(0)
    const [started, setStarted] = useState(false)
    const [time, setTime] = useState(0)

    

    const loadLine = () => {
        const inputField = document.getElementsByClassName('input-field')[0]
        document.addEventListener("keydown", () =>  (inputField as HTMLElement)?.focus())
        const content = Array.from((songData.Content.lyrics[lineIndex].words as String)).map((letter, index) =>
            (<span key={index}
                style={{color: (letter !== ' ') ? 'black' : 'transparent'}}
                className={`char ${index === 0 ? 'active' : ''}`}> 
                {(letter !== ' ') ? letter : '_'} 
            </span>))
        const characters = document.querySelectorAll('.char')
        characters.forEach(span => {
            span.classList.remove("correct")
            span.classList.remove("wrong")
            span.classList.remove("active")
        })
        setTypingText(content)
        
        
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        const characters = document.querySelectorAll('.char')
        if (event.key === "Backspace" && charIndex > 0 && 
            charIndex < characters.length && timeLeft > 0) {
                if (characters[charIndex - 1].classList.contains('correct')) {
                    characters[charIndex - 1].classList.remove('correct')
                }
                if (characters[charIndex - 1].classList.contains('wrong')) {
                    characters[charIndex - 1].classList.remove('wrong')
                    setMistakes(mistakes - 1)
                }
                characters[charIndex].classList.remove('active')
                characters[charIndex - 1].classList.add('active')
                setCharIndex(charIndex - 1)
                let cpm = (charIndex - mistakes - 1) * (60 / (maxTime - timeLeft))
                cpm = (cpm < 0 || !cpm || cpm === Infinity) ? 0 : cpm
                setCPM(parseInt(String(cpm), 10))
                let wpm = Math.round(((charIndex - mistakes) / 5) / (maxTime - timeLeft) * 60)
                wpm = (wpm < 0 || !wpm || wpm === Infinity) ? 0 : wpm
                setWPM(wpm)
            }
    }

    const initTyping = (event: any) => {
        const characters = document.querySelectorAll('.char')
        let typedChar = (event.target as HTMLTextAreaElement)?.value
        if (charIndex < characters.length && timeLeft > 0 && songData !== null) {
            let currentChar = (characters[charIndex] as HTMLElement)?.innerText;
            if (currentChar === '_') currentChar = ' '
            if (!isTyping) {
                setIsTyping(true)
            }
            if (typedChar === currentChar) {
                setCharIndex(charIndex + 1)
                if (charIndex < characters.length) {
                    if (charIndex + 1 < characters.length) {
                        characters[charIndex + 1].classList.add('active')
                    }
                    characters[charIndex].classList.add('correct')
                    characters[charIndex].classList.remove('active')
                }
            }
            else {
                setCharIndex(charIndex + 1);
                setMistakes(mistakes + 1)
                characters[charIndex].classList.remove('active')
                if (charIndex + 1 < characters.length) {
                    characters[charIndex + 1].classList.add('active')
                    characters[charIndex].classList.add('wrong')
                }
            }
            if (charIndex === characters.length - 1 && Date.now() - startTime > Number(songData.Content.duration)) {
                console.log("finished")
                setIsTyping(false)
            }

            let wpm = Math.round((charIndex - mistakes) / 5) / (maxTime - timeLeft) * 60
            wpm = (wpm < 0 || !wpm || wpm === Infinity) ? 0 : wpm
            setWPM(wpm)

            let cpm = (charIndex - mistakes) * (60 / (maxTime - timeLeft))
            cpm = (cpm < 0 || !cpm || cpm === Infinity) ? 0 : cpm
            setCPM(parseInt(String(cpm), 10))
        }
        else {
            setIsTyping(false)
        }
    }

    const resetGame = () => {
        setIsTyping(false)
        setTimeLeft(maxTime)
        setCharIndex(0)
        setMistakes(0)
        setTypingText([])
        setCPM(0)
        setWPM(0)
        const characters = document.querySelectorAll('.char')
        characters.forEach(span => {
            span.classList.remove("correct")
            span.classList.remove("wrong")
            span.classList.remove("active")
        })
        characters[0].classList.add("active")
    }

    //useEffect(() => {
    //    loadParagraph();
    //}, [])

    const fetchSong = async (url: String) => {
        const result = await fetch(`http://127.0.0.1:8000/api/py/get-song-url?url=${url}`)
        return result.json().then(json => {
            setSongData(json)
            console.log(json)
        })
    }

    const startGame = () => {
        setStarted(true)
        setStartTime(Date.now())
        loadLine()
        
    }

    useEffect(() => {
        if (songData !== null) {
            let interval = setInterval(() => {
                setTime(Date.now() - startTime)
                if ((Date.now() - startTime) >= songData.Content.duration) {
                    clearInterval(interval)
                    endGame()
                }
                else if (lineIndex < songData.Content.lyrics.length - 2) {
                    if ((Date.now() - startTime) >= Number(songData.Content.lyrics[lineIndex + 1].startTimeMs)) {
                        setLineIndex(lineIndex + 1)
                        setInpFieldValue('')
                        setCharIndex(0)
                        setIsTyping(false)
                        clearInterval(interval)
                    }
                }
            }, 10)
        }
        
    }, [startTime, lineIndex])

    useEffect(() => {
        if (songData !== null) {
            loadLine()           
        }
    }, [lineIndex])

    const endGame = () => {

    }

    
    useEffect(() => {
        let interval: NodeJS.Timeout | undefined
        if (isTyping && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1)
                let cpm = (charIndex - mistakes * (60 / (maxTime - timeLeft)))
                cpm = (cpm < 0 || !cpm || cpm === Infinity) ? 0 : cpm
                setCPM(parseInt(String(cpm), 10))
                let wpm = Math.round(((charIndex - mistakes) / 5) / (maxTime - timeLeft) * 60)
                wpm = (wpm < 0 || !wpm || wpm === Infinity) ? 0 : wpm
                setWPM(wpm)
            }, 1000)
        }
        else if (timeLeft === 0) {
            clearInterval(interval)
            setIsTyping(false)
        }
        return () => {
            clearInterval(interval)
        }
    }, [isTyping, timeLeft])
    

    return (
        <>
        <div className="song-search">
            <label form="song-url">Song URL</label>
            <input type="text" id="song-url"></input>
            <button className="bg-blue-400" onClick={() => {fetchSong(((document.getElementById("song-url") as HTMLInputElement).value))}}>Search</button>
        </div>
        {(songData && !songData.Error)? <>
            <div className="container">
            <input type="text"
            className="input-field"
            value={inpFieldValue}
            onChange={initTyping}
            onKeyDown={handleKeyDown}/>
            <TypingArea typingText={typingText}
            inpFieldValue={inpFieldValue}
            timeLeft={timeLeft}
            mistakes={mistakes}
            WPM={WPM}
            CPM={CPM}
            initTyping={initTyping}
            handleKeyDown={handleKeyDown}
            resetGame={resetGame}/>
            </div>
            <SongPlayer trackUri={(document.getElementById("song-url") as HTMLInputElement).value} />
        </> : <></>}
        <button onClick={startGame}>Start</button>
        <p>{time}</p>
        </>
        
    )
}

export default SpeedTypingGame