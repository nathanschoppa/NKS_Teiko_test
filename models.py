'''
AUTHOR: Nathaniel Schoppa
DATE: August 26 2026
 
Models contains the pydantic models used to send filter information from React to
FastAPI
'''

from pydantic import BaseModel

class Table1Request(BaseModel):
    sort_by: str = 'sample'
    samples: list[str] = []
    populations: list[str] = []

class BoxplotRequest(BaseModel):
    factor: str | None = 'response'
    filters: dict[str, list[str|int|float]] = {}

class Table2Request(BaseModel):
    columns: list[str] = []
    filters: dict[str, list[str|int|float]] = {}
    show_proportions: bool = False