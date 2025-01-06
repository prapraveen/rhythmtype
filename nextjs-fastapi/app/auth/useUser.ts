import { useState, useRef, useEffect } from "react"

const useUser = () => {
    const [user, setUser] = useState<any>("loading")
    const effectRan = useRef(false)

    useEffect(() => {
        // const code = new URLSearchParams(window.location.search).get("code")

        if (!effectRan.current) {
            effectRan.current = true
            const currUser = window.localStorage.getItem("user")
            if (currUser) {
                let data = JSON.parse(currUser)
                if (Date.now() > data["expires_at"]) {
                    const url = "https://accounts.spotify.com/api/token"
                    const payload = {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                          },
                        body: new URLSearchParams({
                        grant_type: 'refresh_token',
                        refresh_token: data["refresh_token"],
                        }),
                    }
                    fetch(url, payload)
                    .then(res => res.json())
                    .then(new_data => {
                        data["access_token"] = new_data["access_token"]
                        data["refresh_token"] = new_data["refresh_token"]
                        data["expires_at"] = Date.now() + new_data["expires_in"] * 1000
                        window.localStorage.setItem("user", JSON.stringify(data))
                    })
                }
                setUser(data)
            }
            else {
                setUser(null)
            }
        }
            
    }, [])

    return user
}

export default useUser