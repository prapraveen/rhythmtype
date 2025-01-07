import { useRouter } from "next/navigation"

export default function TrackSearchResult({ track }: {track:any}) {
    const router = useRouter()

    const handlePlay = (e: any) => {
        e.preventDefault()
        router.push(`/play/?id=${track.id}`)
    }

    return <>
        <div className="flex p-2 items-center bg-white"
            style={{cursor: "pointer"}}
            onClick={handlePlay}>
            <img src={track.albumUrl} style={{height: "64px", width: "64px"}} />
            <div className="text-left px-4">
                <h1 className="text-black text-3xl">{track.title}</h1>
                <h1 className="text-xl">{track.artist}</h1>
            </div>
        </div>
    </>
}