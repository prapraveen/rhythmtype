import { useState, useRef, useEffect } from "react"

const useUser = () => {
    const [user, setUser] = useState<any>("loading")
    const effectRan = useRef(false)

    

    useEffect(() => {
        // const code = new URLSearchParams(window.location.search).get("code")
        const getToken = async () => {
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
                            client_id: "8a0c38ad76f44094bf02f0e841ab37c8"
                            }),
                        }
                        const body = await fetch(url, payload)
                        const response = await body.json()
                        data["access_token"] = response.accessToken
                        if (response.refresh_token) {
                            data["access_token"] = response.refreshToken
                        }
                        setUser(data)
                        localStorage.setItem("user", JSON.stringify(data))
                        
                        
                    }
                    setUser(data)
                }
                else {
                    setUser(null)
                }
            }
        }

        getToken()
    }, [])

    return user
}

export default useUser