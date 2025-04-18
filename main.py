from fastapi import FastAPI
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from socketio import ASGIApp

from src.controllers import (
    analyze_paragraph,
    audio,
    delete_song,
    offer,
    post_contact,
    post_opinion,
    sentences,
    unpause,
)
from src.custom_socketio import sio
from src.dtos import ResultItem
from src.templates import contact, index, opinion, tester, tutorial

socketio_app = ASGIApp(sio)


app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/socket.io", socketio_app, name="socket.io")

app.add_api_route("/unpause", unpause, methods=["PATCH"], response_model=str)
app.add_api_route("/sentences", sentences, methods=["GET"], response_model=list[str])
app.add_api_route("/sentences/audios", audio, methods=["POST"], response_model=str)
app.add_api_route("/sentences/audios", delete_song, methods=["DELETE"])
app.add_api_route("/offer", offer, methods=["POST"])
app.add_api_route(
    "/analyzers", analyze_paragraph, methods=["POST"], response_model=list[ResultItem]
)
app.add_api_route(
    "/contact", post_contact, methods=["POST"], response_class=RedirectResponse
)

app.add_api_route(
    "/opinion", post_opinion, methods=["POST"], response_class=RedirectResponse
)

app.add_api_route("/", index, methods=["GET"], response_class=HTMLResponse)
app.add_api_route("/tester", tester, methods=["GET"], response_class=HTMLResponse)
app.add_api_route("/tutorial", tutorial, methods=["GET"], response_class=HTMLResponse)
app.add_api_route("/contact", contact, methods=["GET"], response_class=HTMLResponse)
app.add_api_route("/opinion", opinion, methods=["GET"], response_class=HTMLResponse)
