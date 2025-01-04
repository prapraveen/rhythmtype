

export default function TrackSearchResult({ track }: {track:any}) {
    return <>
        <div className="flex p-2 items-center bg-white">
            <img src={track.albumUrl} style={{height: "64px", width: "64px"}} />
            <div className="text-left px-4">
                <h1 className="text-black text-3xl">{track.title}</h1>
                <h1 className="text-xl">{track.artist}</h1>
            </div>
        </div>
    </>
}