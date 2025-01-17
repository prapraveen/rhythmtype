"use client"

import { useState, useEffect, useRef } from "react"
import './page.css'
import TypingArea from "./typingArea"
import { useRouter } from "next/navigation"
import SongInfo from "../components/songInfo"
import LineChartComponent from "../components/accuracyChart"
import AccuracyChart from "../components/accuracyChart"
import PastResultsChart from "../components/pastResultsChart"

const SpeedTypingGame = ({ songData }: { songData: any}) => {
    const router = useRouter()

    const [typingText, setTypingText] = useState<JSX.Element[]>([])
    const [inpFieldValue, setInpFieldValue] = useState('')
    const maxTime = songData["Content"]["duration"]
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
    const [finished, setFinished] = useState(false)
    const charsTyped = useRef(0)
    const [prevText, setPrevText] = useState<JSX.Element[]>([])
    const [nextText, setNextText] = useState<JSX.Element[]>([])
    const [accuracyList, setAccuracyList] = useState<any>([])
    const marginalCharsTyped = useRef(0)
    const [resultsHistory, setResultsHistory] = useState<any>([])
    const scoreSubmitted = useRef(false)

    const endTime = songData["Content"]["duration"]
    

    const focus = () => {
        const inputField = document.getElementsByClassName('input-field')[0];
        (inputField as HTMLElement)?.focus()
    }

    const splitString = (lyric: string) => {
        let res = []
        const splitLyric = lyric.split(" ")
        for (let i = 0; i < splitLyric.length; i++) {
            res.push(splitLyric[i])
            res.push(" ")
        }
        res.pop()
        return res
    }

    const loadLine = () => {
        document.addEventListener("keydown", focus)
        const characters = document.querySelectorAll('.char')
        characters.forEach(span => {
            span.classList.remove("correct")
            span.classList.remove("wrong")
            span.classList.remove("active")
            
        })

        const content = splitString((songData.Content.lyrics[lineIndex].words as string)).map((word, index) =>
            (<div key={index}>
                {Array.from(word).map((letter, charIndex) => (
                    <span key={charIndex}
                    style={{color: (letter !== ' ') ? 'black' : 'transparent'}}
                    className={`char ${(charIndex === 0 && index === 0) ? 'active' : ''}`}> 
                    {(letter !== ' ') ? letter : '_'} 
                    </span>
                ))}
            </div>))
        
        setTypingText(content)

        const prevContent = songData["Content"]["lyrics"].slice(lineIndex - 1, lineIndex).map((lyric: any, index: number) => (
            (<p key={index} className="prev-text" >{lyric["words"]}</p>)
        ))
        setPrevText(prevContent)
        const nextContent = songData["Content"]["lyrics"].slice(lineIndex + 1).map((lyric: any, index: number) => (
            (<p key={index} >{lyric["words"]}</p>)
        ))
        setNextText(nextContent)

        
        
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        const characters = document.querySelectorAll('.char')
        if (event.key === "Backspace" && charIndex > 0 && 
            charIndex <= characters.length && timeLeft > 0) {
                if (characters[charIndex - 1].classList.contains('correct')) {
                    characters[charIndex - 1].classList.remove('correct')
                    charsTyped.current -= 1
                    marginalCharsTyped.current -= 1
                }
                if (characters[charIndex - 1].classList.contains('wrong')) {
                    characters[charIndex - 1].classList.remove('wrong')
                    setMistakes(mistakes - 1)
                }
                if (charIndex < characters.length) {
                    characters[charIndex].classList.remove('active')
                }
                characters[charIndex - 1].classList.add('active')
                setCharIndex(charIndex - 1)
                let cpm = (charIndex - mistakes - 1) * (60 / ((endTime - time) / 1000))
                cpm = (cpm < 0 || !cpm || cpm === Infinity) ? 0 : cpm
                setCPM(parseInt(String(cpm), 10))
                let wpm = Math.round(((charIndex - mistakes) / 5) / ((endTime - time) / 1000) * 60)
                wpm = (wpm < 0 || !wpm || wpm === Infinity) ? 0 : wpm
                setWPM(wpm)
            }
    }

    const initTyping = (event: any) => {
        const characters = document.querySelectorAll('.char')
        let typedChar = (event.target as HTMLTextAreaElement)?.value
        if (charIndex < characters.length && time < endTime && songData !== null) {
            let currentChar = (characters[charIndex] as HTMLElement)?.innerText;
            if (currentChar === "♪") return
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
                    charsTyped.current += 1
                    marginalCharsTyped.current += 1
                    characters[charIndex].classList.remove('active')
                }
            }
            else {
                setCharIndex(charIndex + 1);
                setMistakes(mistakes + 1)
                if (charIndex < characters.length) {
                    if (charIndex + 1 < characters.length) {
                        characters[charIndex + 1].classList.add('active')
                    }
                    characters[charIndex].classList.add('wrong')
                    characters[charIndex].classList.remove('active')
                }
                
            }
            

            let wpm = Math.round((charIndex - mistakes) / 5) / ((endTime - time) / 1000) * 60
            wpm = (wpm < 0 || !wpm || wpm === Infinity) ? 0 : wpm
            setWPM(wpm)

            let cpm = (charIndex - mistakes) * (60 / ((endTime - time) / 1000))
            cpm = (cpm < 0 || !cpm || cpm === Infinity) ? 0 : cpm
            setCPM(parseInt(String(cpm), 10))
        }
        if (charIndex === characters.length - 1 && Date.now() - startTime > Number(songData.Content.duration)) {
            setIsTyping(false)
        }
    }

    const resetGame = () => {
        setTypingText([])
        setInpFieldValue("")
        setTimeLeft(maxTime)
        setCharIndex
        setMistakes(0)
        setIsTyping(false)
        setLineIndex(0)
        setWPM(0)
        setCPM(0)
        setStartTime(0)
        setStarted(false)
        setTime(0)
        setFinished(false)
        charsTyped.current = 0
        setNextText([])
        const characters = document.querySelectorAll('.char')
        characters.forEach(span => {
            span.classList.remove("correct")
            span.classList.remove("wrong")
            span.classList.remove("active")
        })
    }

    //useEffect(() => {
    //    loadParagraph();
    //}, [])


    const startGame = () => {
        setStarted(true)
        setStartTime(Date.now() + 500)
        loadLine()
        
    }

    useEffect(() => {
        if (songData !== null) {
            let interval = setInterval(() => {
                setTime(Date.now() - startTime)
                if ((Date.now() - startTime) >= songData.Content.duration ) {
                    clearInterval(interval)
                    if (charsTyped.current > 0) {
                        endGame()
                    }

                }
                else if (lineIndex < songData.Content.lyrics.length - 2) {
                    if ((Date.now() - startTime) >= Number(songData.Content.lyrics[lineIndex + 1].startTimeMs)) {
                        const length = songData["Content"]["lyrics"][lineIndex]["words"].length
                        const marginalAccuracy = Math.floor(marginalCharsTyped.current / length * 100) / 100
                        const accuracyCopy = accuracyList.slice()
                        if (lineIndex > 0 && songData["Content"]["lyrics"][lineIndex]["words"] !== "♪") {
                            accuracyCopy.push({time: Math.floor(songData["Content"]["lyrics"][lineIndex - 1]["startTimeMs"] / 1000), 
                                accuracy: marginalAccuracy, 
                                lyric: songData["Content"]["lyrics"][lineIndex]["words"],
                                charsTyped: marginalCharsTyped.current
                            })  
                        }
                        marginalCharsTyped.current = 0
                        setAccuracyList(accuracyCopy)
                        setLineIndex(prev => prev + 1)
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
        const length = songData["Content"]["lyrics"][lineIndex]["words"].length
        const marginalAccuracy = Math.floor(marginalCharsTyped.current / length * 100) / 100
        const accuracyCopy = accuracyList.slice()
        if (lineIndex > 0 && songData["Content"]["lyrics"][lineIndex]["words"] !== "♪") {
            accuracyCopy.push({time: Math.floor(songData["Content"]["lyrics"][lineIndex - 1]["startTimeMs"] / 1000), 
                accuracy: marginalAccuracy, 
                lyric: songData["Content"]["lyrics"][lineIndex]["words"],
                charsTyped: marginalCharsTyped.current})
        }
        setAccuracyList(accuracyCopy)
        document.removeEventListener("keydown", focus)
        if (!scoreSubmitted.current) {
            let accuracy = accuracyCopy.reduce((acc: number, cur: any) => (acc + cur["charsTyped"]), 0) /
                            accuracyCopy.reduce((acc: number, cur: any) => (acc + cur["lyric"].length), 0)
            accuracy = Math.floor(accuracy * 10000) / 10000
            const requestOptions = {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({song_id: songData["Content"]["song_id"], 
                    user_id: JSON.parse(window.localStorage.getItem("user") as string)["user_info"]["id"],
                    accuracy: accuracy})
            }
            console.log(charsTyped.current)
            fetch("http://127.0.0.1:8000/api/py/submit-score", requestOptions)
                .then(res => res.json())
                .then(data => setResultsHistory(data))
            scoreSubmitted.current = true
        }
        setFinished(true)
    }

    useEffect(() => {
        console.log(accuracyList)
    }, [accuracyList])
    
    useEffect(() => {
        let interval: NodeJS.Timeout | undefined
        if (isTyping && (time - startTime) < maxTime) {
            interval = setInterval(() => {
                //setTimeLeft(Math.floor((endTime - time) / 1000))
                let cpm = (charIndex - mistakes * (60 / ((endTime - time) / 1000)))
                cpm = (cpm < 0 || !cpm || cpm === Infinity) ? 0 : cpm
                setCPM(parseInt(String(cpm), 10))
                let wpm = Math.round(((charIndex - mistakes) / 5) / ((endTime - time) / 1000) * 60)
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
        <> {!finished ?
        <div className="play-container w-1/2 pt-40">
            <SongInfo songData={songData}/>
            <div className="typing-container w-full">
                <input type="text"
                className="input-field"
                value={inpFieldValue}
                onChange={initTyping}
                onKeyDown={handleKeyDown}/>
                <TypingArea typingText={typingText}
                timeLeft={Math.round((endTime - time) / 1000)}
                progress={`${charsTyped.current}/${songData["Content"]["num_chars"]}`}
                prevText={prevText}
                nextText={nextText}
                />
            </div>
            {(started && (Date.now() - startTime) < songData.Content.duration && (Date.now() - startTime) < songData["Content"]["yt_time"]) ? 
            <iframe width="0" height="0" src={`//www.youtube.com/embed/${songData["Content"]["yt_id"]}?autoplay=1&loop=1&playlist=${songData["Content"]["yt_id"]}`} allowFullScreen /> :
            <></>}
            <div className="buttons flex justify-center">
                {(!started) ? 
                    <button className="text-4xl p-4 m-2 text-white px-10 rounded-3xl" style={{background: "rgb(0, 78, 100)"}} onClick={startGame}>
                        Start
                    </button> : 
                    <button className="text-4xl p-4 m-2 text-white px-10 rounded-3xl" style={{background: "rgb(0, 78, 100)"}} 
                        onClick={() => window.location.reload()}
                    >
                        Reset
                    </button>
                }
            </div>
        </div>
        :
        <>
        <div className="results mt-40 text-center p-10 rounded-2xl" style={{background: "rgb(253, 251, 216)"}}>
            <h1 className="text-8xl mb-8" style={{color: "rgb(0, 78, 100)"}}>Results</h1>
            <h2 className="text-4xl mb-12" style={{color: "rgb(0, 78, 100)"}}>
                Score: {Math.floor(10000 * accuracyList.reduce((acc: number, cur: any) => (acc + cur["charsTyped"]), 0) /
                            accuracyList.reduce((acc: number, cur: any) => (acc + cur["lyric"].length), 0)) / 100}%
            </h2>
            <div className="charts flex flex-row justify-between">
                <div className="accuracy-chart-container flex flex-col" style={{color: "rgb(97, 64, 100)"}}>
                    <h1 className="text-3xl pb-6">This Attempt</h1>
                    <AccuracyChart data={accuracyList} />
                </div>
                <div className="historical-chart-container" style={{color: "rgb(97, 64, 100)"}}>
                    <h1 className="text-3xl pb-6">Past Attempts</h1>
                    <PastResultsChart data={resultsHistory} />
                </div>
            </div>
        </div>
        <button className="text-4xl p-4 m-2 text-white px-10 rounded-3xl" style={{background: "rgb(0, 78, 100)"}} 
                        onClick={() => window.location.reload()}
        >
            Play Again
        </button>
        </>
        }
        </>
        
    )
}

//<SongPlayer trackUri={urlToUri((document.getElementById("song-url") as HTMLInputElement).value)} playing={started}/>
export default SpeedTypingGame