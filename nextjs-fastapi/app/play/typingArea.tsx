import { MouseEventHandler } from "react"

const TypingArea = ({
    typingText,
    timeLeft,
    progress,
} : {typingText:JSX.Element[],
    timeLeft:Number,
    progress:String,
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