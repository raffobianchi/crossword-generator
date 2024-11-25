from dataclasses import dataclass
from typing import List

@dataclass
class Word:
    text: str
    definitions: List[str]

@dataclass
class CrosswordCell:
    letter: str = ' '
    number: int = None
    is_start: bool = False
    is_horizontal: bool = False
    is_vertical: bool = False