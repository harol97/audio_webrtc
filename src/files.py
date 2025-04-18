from typing import Literal

MethodType = Literal["listening", "speaking", "reading"]

files: dict[MethodType, str] = {
    "listening": "cuento.txt",
    "speaking": "cuento.txt",
    "reading": "reading.txt",
}
