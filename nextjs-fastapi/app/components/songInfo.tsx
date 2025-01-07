export default function SongInfo({ songData }: { songData:any}) {
    return <>
        <div className="flex items-center text-white p-2 rounded-t-xl" style={{background: "rgb(219, 127, 142)"}}>
            <img src={songData["Content"]["image"]["url"]} style={{height: "64px", width: "64px"}} />
                <div className="text-left px-4">
                    <h1 className="text-white text-3xl">{songData["Content"]["name"]}</h1>
                    <h1 className="text-xl">{songData["Content"]["artists"]}</h1>
                </div>
        </div>
    </>
}