import { MouseEventHandler } from "react"

const TypingArea = ({
    typingText,
    timeLeft,
    progress,
    prevText,
    nextText
} : {typingText:JSX.Element[],
    timeLeft:Number,
    progress:String,
    prevText:JSX.Element[],
    nextText:JSX.Element[]
}) => {
    return (
        <div className="section">
            <div className="section1">
                <div className="text-container">
                    <div className="prev-text-container">
                        {prevText}
                    </div>
                    <div className="current-text">
                    {typingText}
                    </div>
                    {nextText}
                </div>
            </div>
            <div className="section2">
                <ul className="resultDetails">
                    <li className="time">
                        <p>Time Left:</p>
                        <span>
                            <b>{String(timeLeft)}</b>
                        </span>
                    </li>
                    <li className="Progress">
                        <p>Progress:</p>
                        <span>{progress}</span>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default TypingArea