from logging import error

from aiortc import (
    MediaStreamTrack,
    RTCPeerConnection,
    RTCSessionDescription,
)
from aiortc.codecs.g711 import AudioResampler
from aiortc.contrib.media import MediaRelay
from aiortc.mediastreams import AudioStreamTrack
from av.audio.frame import AudioFrame
from vosk import KaldiRecognizer, Model

from src.custom_filter import CustomFilter
from src.transformers import transformers

from .custom_socketio import sio


class AudioTransformTrack(AudioStreamTrack):
    """
    A video stream track that transforms frames from an another track.
    """

    kind = "audio"

    def __init__(
        self,
        peerConnection: RTCPeerConnection,
        recognizer: KaldiRecognizer,
        samplerate: int,
        track: MediaStreamTrack | None = None,
        custom_filter: CustomFilter | None = None,
    ):
        super().__init__()
        self.track = track
        self.peerConnection = peerConnection
        self.recognizer = recognizer
        self.custom_filter = custom_filter
        self.resampler = AudioResampler(format="s16", layout="mono", rate=samplerate)
        self.ispause = True

    async def recv(self):
        if not self.track:
            raise Exception("track is empty")
        data = await self.track.recv()
        if not isinstance(data, AudioFrame):
            raise Exception("Is not AudioFrame")
        data = self.resampler.resample(data)[0]
        try:
            sample = data.to_ndarray()
            if self.custom_filter:
                sample = self.custom_filter.apply_filter(sample)
            if not self.ispause and self.recognizer.AcceptWaveform(sample.tobytes()):
                self.pause()
                self.peerConnection.emit("on_silence")
                self.recognizer.Reset()

        except Exception as e:
            error(e)
        return data

    def pause(self):
        self.ispause = True

    def unpause(self):
        self.ispause = False


async def create_session(
    sdp: str,
    session_type: str,
    samplerate: int,
    use_filter: bool,
    user_id: str,
    model_name: str,
):
    relay = MediaRelay()
    offer = RTCSessionDescription(sdp=sdp, type=session_type)
    pc = RTCPeerConnection()
    recognizer = KaldiRecognizer(Model(model_name), samplerate)
    custom_filter = CustomFilter(samplerate) if use_filter else None

    def ontrack(track):
        audio_media = AudioTransformTrack(
            pc,
            recognizer,
            samplerate,
            custom_filter=custom_filter,
            track=relay.subscribe(track),
        )
        transformers[user_id] = audio_media
        pc.addTrack(audio_media)

    async def on_silence():
        await sio.emit("silence", "", to=user_id)

    async def on_state():
        if pc.connectionState == "closed":
            await sio.close_room(user_id)
            del transformers[user_id]

    pc.on("track", ontrack)
    pc.on("on_silence", on_silence)
    pc.on("connectionstatechange", on_state)

    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    if answer:
        await pc.setLocalDescription(answer)
    return pc.localDescription
