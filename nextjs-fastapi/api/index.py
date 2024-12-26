from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from lrcparser import *
import os
from syrics.api import Spotify
from dotenv import load_dotenv
import time
import pprint
import pymongo
import requests
import base64

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
        return {"Error": True, "Message": "Invalid URL"}
    else:
        song_id = song_id[1].split("?si=")[0]
    song = songs_col.find_one({"song_id": song_id}, {'_id': 0})

    if not song:
        new_song_lyrics = sp.get_lyrics(song_id)
        if not new_song_lyrics:
            return {"Error": True, "Message": "Song does not exist."}
        new_song_lyrics = new_song_lyrics["lyrics"]["lines"]
        new_song = new_song_data(song_id)
        new_song["lyrics"] = new_song_lyrics
        song = new_song
        songs_col.insert_one(song)

    song.pop("_id", None)
    return {"Error": False, "Content": song} if song else {"Error": True, "Message": "Song not found"}

@app.get("/api/py/get-song-title")
async def get_song_data_title(title: str):
    songs_col = db["song_data"]
    songs = songs_col.find({"name": {'$regex': f'^{title}$', "$options": 'i'}}, {'_id': 0})
    #return {"Error": False, "Content": song} if song else {"Error": True, "Message": "Song not found"}
    res = []
    for s in songs:
        res.append(s)
    return {"Error": False, "Content": res}

@app.get("/api/py/spotify-callback")
def get_access_token(req: Request):
    params = req.query_params
    if "error" in params:
        return {"Error": True, "Message": "Could not authenticate with Spotify"}
    body = {
        "grant_type": "authorization_code",
        "code": params["code"],
        "redirect_uri": "http://localhost:3000/play"
    }
    headers = {
        "content-type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + base64.b64encode((client_id + ":" + client_secret).encode("utf-8")).decode("utf-8")
    }
    res = requests.post("https://accounts.spotify.com/api/token", headers=headers, data=body).json()
    return res
    return {
        "Error": False,
        "access_token": res["access_token"],
        "expires_in": res["expires_in"],
    }