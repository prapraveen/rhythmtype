import { MouseEventHandler } from "react"

const TypingArea = ({
    typingText,
    inpFieldValue,
    timeLeft,
    mistakes,
    WPM,
    CPM,
    initTyping,
    handleKeyDown,
    resetGame,
} : {typingText:JSX.Element[],
    inpFieldValue:String,
    timeLeft:Number,
    mistakes:Number,
    WPM:Number,
    CPM:Number,
    initTyping:any,
    handleKeyDown:any,
    resetGame:MouseEventHandler
}) => {
    return (
        <div className="section">
            <div className="section1">
                <p id="paragraph">{typingText}</p>
            </div>
            <div className="section2">
                <ul className="resultDetails">
                    <li className="time">
                        <p>Time Left:</p>
                        <span>
                            <b>{String(timeLeft)}</b>
                        </span>
                    </li>
                    <li className="mistake">
                        <p>Mistakes:</p>
                        <span>{String(mistakes)}</span>
                    </li>
                    <li className="wpm">
                        <p>WPM:</p>
                        <span>{String(Math.floor(Number(WPM)))}</span>
                    </li>
                    <li className="cpm">
                        <p>CPM:</p>
                        <span>{String(CPM)}</span>
                    </li>
                </ul>
                <button onClick={resetGame} className="btn">
                    Try Again
                </button>
            </div>
        </div>
    )
}

export default TypingArea