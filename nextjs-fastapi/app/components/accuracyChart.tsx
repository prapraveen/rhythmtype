"use client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

const exampleData = [
{time: '0', accuracy: 1, lyric: 'Are you sick of me?'}
,{time: '10680', accuracy: 0.6666666666666666, lyric: 'Would you like to be?'}
,{time: '15210', accuracy: 1, lyric: "I'm trying to tell you something"}
,{time: '18040', accuracy: 0.9655172413793104, lyric: 'Something that I already said'}
,{time: '26070', accuracy: 1, lyric: 'You like a pretty boy'}
,{time: '28610', accuracy: 1, lyric: 'With a pretty voice'}
,{time: '33560', accuracy: 0.9714285714285714, lyric: 'Who is trying to sell you something'}
,{time: '36170', accuracy: 1, lyric: 'Something that you already have'}
,{time: '39750', accuracy: 0.9464285714285714, lyric: "But if you're too drunk to drive, and the music is right"}
,{time: '45710', accuracy: 0.5434782608695652, lyric: 'She might let you stay, but just for the night'}
,{time: '51070', accuracy: 0.5882352941176471, lyric: 'And if she grabs for your hand, and drags you along'}
,{time: '55020', accuracy: 0.7142857142857143, lyric: 'She might want a kiss before the end of this song'}

]

const CustomTooltip = ({ active, payload, label }: {active:any, payload:any, label:any}) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip bg-white p-2 text-sm">
                <p className="label">{`time: ${label}s`}</p>
                <p className="intro">{`acc: ${payload[0].value * 100}%`}</p>
            </div>
        )
    }
}

const AccuracyChart = ({ data }: { data:any }) => {
    return (
        <div className="line-chart-container text-black">
            <LineChart width={500} height={300} data={data}>
            <YAxis type="number" domain={[0, 1]}/>
            <XAxis dataKey="time"/>
            <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />}/>
            <Line type="monotone" dataKey="accuracy" stroke="#8884d8"></Line>
        </LineChart>
        </div>
        

    )
}

export default AccuracyChart