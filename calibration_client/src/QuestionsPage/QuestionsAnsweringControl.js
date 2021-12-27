import React from "react";
import { Button } from "@mui/material";
import { Answer, answerToString } from "./Answer";

const NDYButtonArray = ({ onAnswer }) => (
  <div>
    <Button
      variant="contained"
      size="large"
      color="trenary"
      onClick={() => onAnswer(Answer.NO)}
    >
      Нет
    </Button>
    <Button
      variant="contained"
      size="large"
      onClick={() => onAnswer(Answer.DONTKNOW)}
    >
      Я не знаю
    </Button>
    <Button
      variant="contained"
      size="large"
      color="secondary"
      onClick={() => onAnswer(Answer.YES)}
    >
      Да
    </Button>
  </div>
);

const ProbabilityButtonArray = ({ onProbabilitySelected }) => {
  return (
    <>
      <div>
        <h3>Насколько вы уверены?</h3>
      </div>
      <div>
        {[55, 60, 65, 70, 75, 80, 85, 90, 95, 99].map((prob) => (
          <Button
            variant="contained"
            size="small"
            key={Math.round(prob)}
            onClick={() => onProbabilitySelected(prob)}
          >
            {String(Math.round(prob)) + "%"}
          </Button>
        ))}
      </div>
    </>
  );
};

const DontKnowConfirmButton = ({ confirmDontKnow }) => {
  return (
    <>
      <div>
        <h3>Точно не знаете? Хотя бы примерно?</h3>
        <p>
          Цель этого упражнения как раз в том чтобы развить способность
          склоняться к правильному ответу даже когда нет точной уверенности
        </p>
      </div>
      <div>
        <Button variant="contained" size="small" onClick={confirmDontKnow}>
          Совсем-совсем не знаю
        </Button>
      </div>
    </>
  );
};

export const QuestionsAnsweringControl = ({
  currentAnswer,
  dispatchAnswer,
}) => {
  return (
    <>
      <NDYButtonArray
        onAnswer={(answer) =>
          dispatchAnswer({ type: "SET_YN", payload: answer })
        }
      />
      <h3>Текущий ответ: {answerToString(currentAnswer.answer)}</h3>
      {(currentAnswer.answer === Answer.YES ||
        currentAnswer.answer === Answer.NO) && (
        <ProbabilityButtonArray
          onProbabilitySelected={(prob) => {
            dispatchAnswer({ type: "SET_PROBABILITY", payload: prob });
            dispatchAnswer({ type: "CONFIRM" });
          }}
        />
      )}
      {currentAnswer.answer === Answer.DONTKNOW && (
        <DontKnowConfirmButton
          confirmDontKnow={() => dispatchAnswer({ type: "CONFIRM" })}
        />
      )}
    </>
  );
};
