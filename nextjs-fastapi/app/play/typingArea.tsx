import { MouseEventHandler } from "react"

const TypingArea = ({
    typingText,
    timeLeft,
    progress,
    prevText,
    nextText
} : {typingText:JSX.Element[],
    timeLeft:number,
    progress:string,
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
            <div className="buttons flex flex-row justify-between p-3 pr-5 text-black">
                    <div className="time">
                        <p>Time Left:</p>
                        <span>
                            <b>{(timeLeft >= 0) ? String(timeLeft) : "-"}</b>
                        </span>
                        
                    </div>
                    <div className="Progress text-right">
                        <p>Progress:</p>
                        <span><b id="progress-text">{progress}</b></span>
                    </div>
            </div>
        </div>
    )
}

export default TypingArea