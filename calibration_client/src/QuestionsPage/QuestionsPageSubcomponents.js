import React from "react";
import { StyledItem, StyledColumn } from "./QuestionsPageStyle";
import { Button } from "@material-ui/core";

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
    <Button
      variant="contained"
      size="large"
      color="secondary"
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
      color="primary"
      onClick={() => onAnswer(Answer.YES)}
    >
      Да
    </Button>
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
        <Button variant="contained" size="small" onClick={confirmDontKnow}>
          Совсем-совсем не знаю
        </Button>
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
      <StyledItem style={{ paddingTop: 15 }}>
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
        <StyledItem key={question.ynq_id}>
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

export const MainPlaque = ({ questions, hasMore, error }) => {
  if (error != null) return <h1>Ошибка при загрузке вопросов: {error}</h1>;
  if (questions.length === 0) {
    if (hasMore) return <h1>Загрузка...</h1>;
    else return <h1>Вопросы закончились, попробуйте выбрать другую тему</h1>;
  }
  let lastQuestion = questions[questions.length - 1].question;
  return <h1>{lastQuestion}</h1>;
};
