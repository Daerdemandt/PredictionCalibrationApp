import React from "react";
import {
  StyledItem,
  StyledColumn,
  StyledButtonSmall,
  StyledButtonLarge,
} from "./QuestionsPageStyle";

export const Answer = {
  INVALID: -1,
  NO: 0,
  YES: 1,
  DONTKNOW: 2,
};
Object.freeze(Answer);

export const answerToString = (answer) => {
  if (answer === 0 || answer === false) return "Нет";
  else if (answer === 1 || answer === true) return "Да";
  else if (answer === 2) return "Не знаю";
  throw new Error(`Unknown answer ${answer}`);
};

export const NDYButtonArray = ({ onAnswer }) => (
  <div>
    <StyledButtonLarge onClick={() => onAnswer(Answer.NO)}>
      Нет
    </StyledButtonLarge>
    <StyledButtonLarge onClick={() => onAnswer(Answer.DONTKNOW)}>
      Я не знаю
    </StyledButtonLarge>
    <StyledButtonLarge onClick={() => onAnswer(Answer.YES)}>
      Да
    </StyledButtonLarge>
  </div>
);

export const ProbabilityButtonArray = ({ onProbabilitySelected }) => {
  return (
    <>
      <div>
        <h3>Насколько вы уверены?</h3>
      </div>
      <div>
        {[55, 60, 65, 70, 75, 80, 85, 90, 95, 99].map((prob) => (
          <StyledButtonSmall
            key={Math.round(prob)}
            onClick={() => onProbabilitySelected(prob)}
          >
            {String(Math.round(prob)) + "%"}
          </StyledButtonSmall>
        ))}
      </div>
    </>
  );
};

export const DontKnowConfirmButton = ({ confirmDontKnow }) => {
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
        <StyledButtonSmall onClick={confirmDontKnow}>
          Совсем-совсем не знаю
        </StyledButtonSmall>
      </div>
    </>
  );
};

export const AnsweredQuestionHistory = ({ answeredQuestions }) => {
  if (answeredQuestions.length === 0)
    return (
      <div>
        <p>Пока что вы ещё не ответили ни на один вопрос</p>
      </div>
    );
  return (
    <div>
      <StyledItem>
        <StyledColumn width="30%">
          <strong>Вопрос</strong>
        </StyledColumn>
        <StyledColumn width="15%">
          <strong>Ваш ответ</strong>
        </StyledColumn>
        <StyledColumn width="15%">
          <strong>На самом деле</strong>
        </StyledColumn>
        <StyledColumn width="30%">
          <strong>Комментарий</strong>
        </StyledColumn>
      </StyledItem>
      {answeredQuestions.map((question) => (
        <StyledItem key={question.id}>
          <StyledColumn width="30%">{question.question}</StyledColumn>
          <StyledColumn width="15%">
            {answerToString(question.userAnswer)}
          </StyledColumn>
          <StyledColumn width="15%">
            {answerToString(question.answer)}
          </StyledColumn>
          <StyledColumn width="30%">{question.comment}</StyledColumn>
        </StyledItem>
      ))}
    </div>
  );
};
