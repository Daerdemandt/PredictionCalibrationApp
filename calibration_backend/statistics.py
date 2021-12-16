from dataclasses import dataclass
from typing import List
from common.utils import VALID_PROBABILITY_QUANTS


@dataclass
class AnswerDatapoint:
    real_answer: bool
    user_answer: bool
    probability: int

    @classmethod
    def from_tuple(cls, t):
        return cls(bool(t[0]), bool(t[1]), int(t[2]))


def number_of_correct_answers(dpts: List[AnswerDatapoint]):
    return len([dp for dp in dpts if dp.real_answer == dp.user_answer])


def to_statistics(datapoints):
    datapoints = [AnswerDatapoint.from_tuple(r) for r in datapoints if (r[1] == 0 or r[1] == 1)]
    grouped_datapoints = {pq: [] for pq in VALID_PROBABILITY_QUANTS[1:]}
    for datapoint in datapoints:
        grouped_datapoints[datapoint.probability].append(datapoint)

    return [{
        "probability_quotent": pq,
        "total": len(dpts),
        "total_correct": number_of_correct_answers(dpts),
        "correct_percent": int(100 * number_of_correct_answers(dpts) / len(dpts)) if dpts else None
    } for (pq, dpts) in grouped_datapoints.items()]
