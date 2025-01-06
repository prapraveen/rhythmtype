"use client"

import { useState, useEffect } from "react"
import './page.css'
import TypingArea from "./typingArea"

const SpeedTypingGame = ({ songData }: { songData: any}) => {

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
    const [finished, setFinished] = useState(false)
    const [charsTyped, setCharsTyped] = useState(0)

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
        
        
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        const characters = document.querySelectorAll('.char')
        if (event.key === "Backspace" && charIndex > 0 && 
            charIndex <= characters.length && timeLeft > 0) {
                if (characters[charIndex - 1].classList.contains('correct')) {
                    characters[charIndex - 1].classList.remove('correct')
                    setCharsTyped(charsTyped - 1)
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
                    setCharsTyped(charsTyped + 1)
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


    const startGame = () => {
        setStarted(true)
        setStartTime(Date.now() + 500)
        loadLine()
        
    }

    useEffect(() => {
        if (songData !== null) {
            let interval = setInterval(() => {
                setTime(Date.now() - startTime)
                if ((Date.now() - startTime) >= songData.Content.duration) {
                    clearInterval(interval)
                    setFinished(true)
                    endGame()
                }
                else if (lineIndex < songData.Content.lyrics.length - 2) {
                    if ((Date.now() - startTime) >= Number(songData.Content.lyrics[lineIndex + 1].startTimeMs)) {
                        const missedChars = typingText.length - charIndex;
                        console.log('Missed chars:', missedChars)
                        console.log('New total mistakes should be:', mistakes + missedChars)
                        setMistakes(prev => prev + missedChars)
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
        console.log('charIndex updated:', charIndex)
    }, [charIndex])

    useEffect(() => {
        if (songData !== null) {
            loadLine()           
        }
    }, [lineIndex])

    const endGame = () => {
        document.removeEventListener("keydown", focus)
        console.log("ended")
    }

    
    useEffect(() => {
        let interval: NodeJS.Timeout | undefined
        if (isTyping && (maxTime - time) > 0) {
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
        <div className="play-container w-1/2 py-60">
        
            <div className="typing-container w-fit">
                <input type="text"
                className="input-field"
                value={inpFieldValue}
                onChange={initTyping}
                onKeyDown={handleKeyDown}/>
                <TypingArea typingText={typingText}
                timeLeft={Math.round((endTime - time) / 1000)}
                progress={`${charsTyped}/${songData["Content"]["num_chars"]}`}
                />
            </div>
            {(started && (Date.now() - startTime) < songData.Content.duration && (Date.now() - startTime) < songData["Content"]["yt_time"]) ? 
            <iframe width="0" height="0" src={`//www.youtube.com/embed/${songData["Content"]["yt_id"]}?autoplay=1&loop=1&playlist=${songData["Content"]["yt_id"]}`} allowFullScreen /> :
            <></>}
            <div className="buttons flex flex-row justify-between">
                <button className="btn" onClick={startGame}>Start</button>
                <button className="btn" onClick={() => console.log("clicked")}>Reset</button>
            </div>
        </div>
        
    )
}

//             <SongPlayer trackUri={urlToUri((document.getElementById("song-url") as HTMLInputElement).value)} playing={started}/>
export default SpeedTypingGame