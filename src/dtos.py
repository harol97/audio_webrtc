from typing import Annotated

from pydantic import BaseModel, EmailStr, Field, field_serializer
from pydantic_extra_types.color import Color

from src.files import MethodType


class OfferBody(BaseModel):
    sdp: str
    session_type: Annotated[str, Field(alias="type")]
    samplerate: int
    use_filter: Annotated[bool, Field(alias="useFilter")]
    user_id: Annotated[str, Field(alias="userId")]

    model_config = {"populate_by_name": True}


class OfferResponse(BaseModel):
    sdp: str
    session_type: Annotated[str, Field(alias="type")]

    model_config = {"populate_by_name": True}


class AnalyzeBody(BaseModel):
    expected: str
    actual: str
    method: MethodType


class ResultItem(BaseModel):
    text: str
    color: Color = Field()

    @field_serializer("color")
    def color_serializer(self, color: Color):
        return color.as_hex()


class ContactBody(BaseModel):
    name: str
    lastname: str
    email: EmailStr
    observation: str


class OpinionForm(BaseModel):
    usability: str
    technical_issues: str
    device: str
    device_other: str = ""
    sentence_usefulness: str
    ai_accuracy: str
    feedback: str
    voice_clarity: str
    recognition: str
    motivation: str
    paraphrase_usefulness: str
    exposure_time: str
    exposure_time_improvement: str = ""
    ai_comprehension: str
    liked_aspect: str
    aspect_to_improve: str
    recommend: str
    future_functionality: str
