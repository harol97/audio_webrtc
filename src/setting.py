from functools import lru_cache
from typing import Annotated

from fastapi import Depends
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Setting(BaseSettings):
    model_config = SettingsConfigDict(enable_decoding=False)
    openai_key: str
    model_name: str
    origins: list[str] = []
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    email_user: str = "visiondgkop@gmail.com"
    email_password: str = "oxsikhaneplkiswf"
    email_to: str = "harolav3@gmail.com"
    input_openai: str = """respondeme en ingles si crees que la frase "{}"  contiene las ideas parcialmente similares al párrafo: "{}"? 
            Sin ser muy esctricto, En que porcentaje se parece las ideas  de lo explicado por el usuario al párrafo original?"""

    @field_validator("origins", mode="before")
    @classmethod
    def decode_origins(cls, v: str | list) -> list[str]:
        if isinstance(v, list):
            return v
        return v.split(",")


@lru_cache
def get_setting():
    return Setting()  # type: ignore


SettingDepends = Annotated[Setting, Depends(get_setting)]
