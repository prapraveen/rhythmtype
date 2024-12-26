import { useState } from "react"

export default function useAuth(code: string) {
    const [accessToken, setAccessToken] = useState()
    const [refreshToken, setRefreshToken] = useState()
    const [expiresIn, setExpiresIn] = useState()
    return (
        <div>
      
        </div>
    )
}
