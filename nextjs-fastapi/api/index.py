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
    artists = [i["name"] for i in res.json()["artists"]]
    duration = res.json()["duration_ms"]
    return {"song_id": id, "name": name, "artists": artists, "duration": duration}

@app.get("/api/py/helloFastApi")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}

@app.get("/api/py/get-bearer-token")
def get_bearer_token():
    return bearer_token

@app.get("/api/py/get-song-url")
async def get_song_data(url: str):
    songs_col = db["song_data"]
    song_id = url.split("open.spotify.com/track/")
    if len(song_id) < 2:
        return JSONResponse(status_code=403, content={"Error": True, "Message": "Invalid URL"})
    else:
        song_id = song_id[1].split("?si=")[0]
    song = songs_col.find_one({"song_id": song_id}, {'_id': 0})

    if not song:
        new_song_lyrics = sp.get_lyrics(song_id)
        if not new_song_lyrics:
            return JSONResponse(status_code=404, content={"Error": True, "Message": "Song not found"})
        offset = 150
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
        "redirect_uri": "http://localhost:3000/play"
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