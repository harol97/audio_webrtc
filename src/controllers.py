import os
from typing import Annotated
from uuid import uuid4

from fastapi import BackgroundTasks, Body, Depends, Form, status
from fastapi.responses import RedirectResponse
from openai import OpenAI
from pydantic_extra_types.color import Color

from src.analyzer import Analyzer
from src.information import Sender
from src.setting import SettingDepends

from .dtos import (
    AnalyzeBody,
    ContactBody,
    OfferBody,
    OfferResponse,
    OpinionForm,
    ResultItem,
)
from .files import MethodType, files
from .transformers import transformers
from .web_rtc import create_session


async def unpause(user_id: Annotated[str, Body()]):
    obj = transformers.get(user_id)
    if not obj:
        return ""
    obj.unpause()
    return ""


async def sentences(method: MethodType):
    with open(files[method], "r") as f:
        return f.readlines()


async def audio(sentence: Annotated[str, Body()]):
    name_song = "static/" + str(uuid4()) + ".mp3"
    os.system(f'edge-tts --text "{sentence}" --write-media {name_song}')
    return "/" + name_song


async def delete_song(filename: Annotated[str, Body()]):
    os.remove("static/" + filename)
    return {}


async def offer(body: OfferBody):
    session = await create_session(
        body.sdp, body.session_type, body.samplerate, body.use_filter, body.user_id
    )
    return OfferResponse(sdp=session.sdp, session_type=session.type)


async def analyze_paragraph(body: AnalyzeBody, setting: SettingDepends):
    if body.method == "reading":
        client = OpenAI(api_key=setting.openai_key)
        result = client.responses.create(
            model="gpt-4o",
            instructions="developer",
            input=setting.input_openai.format(body.actual, body.expected),
        ).output_text
        return [ResultItem(text=result, color=Color("#FF0000"))]
    string = []
    string.append(ResultItem(text="\nEvaluating phrase:", color=Color("#000000")))
    string.append(
        ResultItem(text=f"\nPronounced phrase: {body.actual}", color=Color("#000000"))
    )
    string.append(
        ResultItem(text=f"\nExpected phrase: {body.expected}", color=Color("#000000"))
    )
    analyzer = Analyzer()
    expected_phonemes = analyzer.get_phonemes_from_speak(body.expected)
    actual_phonemes = analyzer.get_phonemes_from_speak(body.actual)

    string.append(
        ResultItem(
            text=f"\nExpected phonemes: {'.'.join(expected_phonemes)}",
            color=Color("#000000"),
        )
    )
    string.append(
        ResultItem(
            text=f"\nDetected phonemes: {'.'.join(actual_phonemes)}\n",
            color=Color("#000000"),
        )
    )

    result_log, phonetic_score = analyzer.compare_phonemes(
        expected_phonemes, actual_phonemes
    )
    string.extend(result_log)
    string.append(
        ResultItem(
            text=f"\n\nPronunciation accuracy: {phonetic_score:.2f}\n",
            color=Color("#000000"),
        )
    )
    return string


def post_contact(
    body: Annotated[ContactBody, Form()],
    sender: Annotated[Sender, Depends()],
    background_tasks: BackgroundTasks,
):
    message_as_list = ["<html>"]
    message_as_list.append("<body>")
    message_as_list.append("<table>")
    message_as_list.append("<thead>")
    message_as_list.append("<th>Name</th>")
    message_as_list.append("<th>LastName</th>")
    message_as_list.append("<th>Email</th>")
    message_as_list.append("<th>Observation</th>")
    message_as_list.append("</thead>")
    message_as_list.append("</tbody><tr>")

    for value in body.model_dump().values():
        message_as_list.append(f"<td>{value}</td>")

    message_as_list.append("</tr></tbody>")

    background_tasks.add_task(sender.send, "".join(message_as_list))
    return RedirectResponse("/", status.HTTP_302_FOUND)


def post_opinion(
    body: Annotated[OpinionForm, Form()],
    sender: Annotated[Sender, Depends()],
    background_tasks: BackgroundTasks,
):
    body_as_dict = body.model_dump()

    message_as_list = ["<html>"]
    message_as_list.append("<body>")
    message_as_list.append("<table>")
    message_as_list.append("<thead>")
    for key in body_as_dict.keys():
        message_as_list.append(f"<th>{key}</th>")
    message_as_list.append("</thead>")
    message_as_list.append("</tbody><tr>")

    for value in body_as_dict.values():
        message_as_list.append(f"<td>{value}</td>")

    message_as_list.append("</tr></tbody>")

    background_tasks.add_task(sender.send, "".join(message_as_list), "OPINION")
    return RedirectResponse("/", status.HTTP_302_FOUND)
