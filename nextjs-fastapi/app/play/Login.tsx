const scope = "streaming user-read-email user-read-private user-library-read user-library-modify user-read-playback-state user-modify-playback-state"
const AUTH_URL = 'https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: "8a0c38ad76f44094bf02f0e841ab37c8",
      scope: scope,
      redirect_uri: "http://localhost:3000/play"}).toString()

export default function Login() {
  return (
    <div>
      <a href={AUTH_URL}>Login With Spotify</a>
    </div>
  )
}
