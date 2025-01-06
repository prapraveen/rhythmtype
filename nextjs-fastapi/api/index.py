from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from syrics.api import Spotify
from dotenv import load_dotenv
import time
import pprint
import pymongo
import requests
import base64
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from youtube_search import YoutubeSearch

load_dotenv()
db_url = os.getenv("DB_URL")
client_id = os.getenv("SPOTIFY_CLIENT_ID")
client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
SP_DC = os.getenv("SP_DC")

client = pymongo.MongoClient(db_url, connect=False)
db = client["rhythmtype"]

sp = Spotify(SP_DC)

### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"]
)

# Query song by id
# Query songs by name

def time_to_seconds(time_str):
    times = list(map(int, time_str.split(":")))
    if len(times) == 0:
        return 0
    if len(times) == 1:
        return times[0]
    if len(times) == 2:
        return 60 * times[0] + times[1]
    if len(times) == 3:
        return 3600 * times[0] + 60 * times[1] + times[0]

def get_spotify_bearer():
    headers = {"content-type": "application/x-www-form-urlencoded"}
    payload = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret}
    res = requests.post("https://accounts.spotify.com/api/token", headers=headers, data=payload)
    if not res or "error" in res.json():
        return None
    else:
        return res.json()["access_token"]

bearer_token = get_spotify_bearer()

def new_song_data(id: str):
    global bearer_token
    headers = {"Authorization": "Bearer " + bearer_token}
    res = requests.get("https://api.spotify.com/v1/tracks/"+id, headers=headers)
    if not res:
        return None
    elif "error" in res.json():
        if res.json()["error"]["status"] == 401:
            # get new bearer token and retry
            bearer_token = get_spotify_bearer()
            return new_song_data(id)
        else:
            return None
    name = res.json()["name"]
    artists = [i["name"] for i in res.json()["artists"]][:3]
    duration = res.json()["duration_ms"]
    return {"song_id": id, "name": name, "artists": artists, "duration": duration}

@app.get("/api/py/helloFastApi")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}

@app.get("/api/py/get-bearer-token")
def get_bearer_token():
    return bearer_token

@app.get("/api/py/get-song-data")
async def get_song_data(song_id: str):
    songs_col = db["song_data"]

    song = songs_col.find_one({"song_id": song_id}, {'_id': 0})

    if not song:
        # get lyrics
        new_song_lyrics = sp.get_lyrics(song_id)
        if not new_song_lyrics:
            return JSONResponse(status_code=404, content={"Error": True, "Message": "Song not found"})
        offset = 0
        new_song_lyrics = new_song_lyrics["lyrics"]["lines"]
        for lyric in new_song_lyrics:
            lyric["startTimeMs"] = str(int(lyric["startTimeMs"]) + offset)
        blank_lyrics = {"startTimeMs": "0",
                        "words": "♪",
                        "syllables": [],
                        "endTimeMs": "0"}
        new_song_lyrics.insert(0, blank_lyrics)
        new_song = new_song_data(song_id)
        new_song["lyrics"] = new_song_lyrics
        new_song["duration"] = str(int(new_song["duration"] + offset))

        # get youtube ID and time
        query = new_song["name"]
        for artist in new_song["artists"]:
            query += " " + artist
        yt_results = YoutubeSearch(query, max_results=1).to_dict()
        if not yt_results:
            return {"Error": True, "Message": "Music for song could not be found"}
        yt_id = yt_results[0]["id"]
        yt_time = yt_results[0]["duration"]
        new_song["yt_id"] = yt_id
        new_song["yt_time"] = time_to_seconds(yt_time) * 1000

        # getting # of characters
        chars = 0
        for lyric in new_song["lyrics"]:
            chars += len(lyric["words"].replace("♪", ""))
        new_song["num_chars"] = chars

        song = new_song
        songs_col.insert_one(song)

    song.pop("_id", None)
    return {"Error": False, "Content": song} if song else JSONResponse(status_code=404, content={"Error": True, "Message": "Song not found"})

@app.get("/api/py/get-song-title")
async def get_song_data_title(title: str):
    songs_col = db["song_data"]
    songs = songs_col.find({"name": {'$regex': f'^{title}$', "$options": 'i'}}, {'_id': 0})
    #return {"Error": False, "Content": song} if song else {"Error": True, "Message": "Song not found"}
    res = []
    for s in songs:
        res.append(s)
    return {"Error": False, "Content": res}


@app.get("/api/py/get-access-token")
def get_access_token(code: str):
    body = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": "http://localhost:3000/"
    }
    auth_header = base64.urlsafe_b64encode((client_id + ":" + client_secret).encode())
    headers = {
        "content-type": "application/x-www-form-urlencoded",
        "Authorization": 'Basic %s' % auth_header.decode('ascii')
    }
    res = requests.post("https://accounts.spotify.com/api/token", headers=headers, data=body).json()
    if "error" in res:
        return JSONResponse(status_code=400, content=res)
    
    user_headers = {"Authorization": "Bearer " + res["access_token"]}
    user_info = requests.get("https://api.spotify.com/v1/me", headers=user_headers).json()
    res["user_info"] = user_info
    res["expires_at"] = int(time.time() * 1000) + res["expires_in"] * 1000
    return res


    
    
"""
@app.get("/api/py/get-access-token")
def get_access_token(auth_code: str):
    response = requests.post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "authorization_code",
            "code": auth_code,
            "redirect_uri": "http://localhost:3000/play",
        },
        auth=(client_id, client_secret),
    )
    #return response.json()
    access_token = response.json()["access_token"]
    return {"Authorization": "Bearer " + access_token}
"""