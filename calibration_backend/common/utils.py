import json
from pathlib import Path
from typing import Dict, Any

from werkzeug.datastructures import MultiDict

VALID_PROBABILITY_QUANTS = [-1] + list(range(55, 100, 5)) + [99]
PAGE_SIZE = 5
PROJECT_ROOT = Path(__file__).parent.parent


def load_questions():
    with open(f"{PROJECT_ROOT}/raw_data/questions_pack_science.txt", "r") as fp:
        questions = json.load(fp)
        return questions


def make_to_dict_clsfn(field_list):
    def to_json(self):
        return {field: self.__dict__[field] for field in field_list}
    return to_json


def gather_and_validate_fields(
        expected: Dict[str, type], raw_data: MultiDict[str, Any], /, required=True):
    clean_data = {}
    for field, expected_type in expected.items():
        if (val := raw_data.get(field, default=None, type=expected_type)) is None:
            if required:
                raise ValueError(f"No {field!r} provided (or could not convert)")
        else:
            clean_data[field] = val
    return clean_data


def dict_intersection(d1, d2):
    return {k: v for k, v in d1.items() if k in d2 and d2[k] == v}