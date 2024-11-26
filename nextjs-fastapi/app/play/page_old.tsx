"use client"
import { useState } from "react"
import "./page.css"

export default function Main() {
    let p1 = "this is an example of a passage"
    const p_arr : string[] = p1.split('').slice()
    let p_spans = p_arr.map((letter) => <span>{letter}</span>)
    let cursor = <div className="cursor"></div>
    p_spans = p_spans.reduce((acc, x) => {
        return acc.concat([cursor, x])
    }, [] as any);

    const [passage, setPassage] = useState<any[]>(p_spans)
    console.log(p_spans)
    return <>
        <div className="inline">
            <ul className="inline">
                {p_spans.map((e, i) => <li className="inline" key={i}>{e}</li>)}
            </ul>
        </div>
        <div className="cursor"></div>
    </>
}