import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getBlankAnswer, getAnswerReducer } from "./Answer";
import { getBlankQuestion, questionReducer } from "./Question";
import { QuestionsAnsweringControl } from "./QuestionsAnsweringControl";
import prettifyResponseError from "../shared/prettifyResponseError";
import { Button, Typography } from "@mui/material";

const MainPlaque = ({ questions, hasMore, error }) => {
  if (error != null) return <h1>Ошибка при загрузке вопросов: {error}</h1>;
  if (questions.length === 0) {
    if (hasMore) return <h1>Загрузка...</h1>;
    else return <h1>Вопросы закончились, попробуйте выбрать другую тему</h1>;
  }
  let lastQuestion = questions[questions.length - 1].question;
  return <h1>{lastQuestion}</h1>;
};

const shouldRequestMoreQuestions = (questionsData) => {
  return (
    questionsData.error == null &&
    questionsData.questions.length <= 1 &&
    questionsData.hasMore
  );
};

export function QuestionsPage({ topic, user }) {
  const [questionsData, dispatchQuestionsData] = React.useReducer(
    questionReducer,
    getBlankQuestion()
  );

  const requestQuestions = React.useCallback(async () => {
    if (shouldRequestMoreQuestions(questionsData)) {
      try {
        let url = `/get_questions?user_id=${user.user_id}`;
        const result = await axios.get(url);
        dispatchQuestionsData({
          type: "ADD",
          payload: {
            questions: result.data.questions,
            hasMore: result.data.questions.length !== 0,
          },
        });
      } catch (error) {
        console.log(error);
        let errorMessage = prettifyResponseError(error);
        dispatchQuestionsData({ type: "ERROR", payload: errorMessage });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionsData]);
  React.useEffect(() => {
    requestQuestions();
  }, [requestQuestions]);

  const [currentAnswer, dispatchAnswer] = React.useReducer(
    getAnswerReducer(user.user_id),
    getBlankAnswer(user.user_id)
  );

  React.useEffect(() => {
    if (currentAnswer.confirmed) {
      let { confirmed, ...postData } = currentAnswer;
      axios.post("/answer_question", postData); // ignore promise for now
      dispatchQuestionsData({ type: "NEXT", payload: currentAnswer.answer });
      dispatchAnswer({ type: "RESET" });
    }
  }, [currentAnswer]);

  React.useEffect(() => {
    const questions = questionsData.questions;
    if (questions.length > 0) {
      const currentQuestion = questions[questions.length - 1];
      dispatchAnswer({
        type: "SET_QUESTION_ID",
        payload: currentQuestion.ynq_id,
      });
    }
  }, [questionsData.questions]);
  const navigate = useNavigate();

  return (
    <>
      <nav>
        <Button variant="contained" size="large" onClick={() => navigate(-1)}>
          Назад
        </Button>
      </nav>
      <main>
        <Typography variant="h6">Тема: {topic}</Typography>
        <Typography variant="h6">Пользователь: {user.name}</Typography>
        <MainPlaque
          questions={questionsData.questions}
          hasMore={questionsData.hasMore}
          error={questionsData.error}
        />
        {questionsData.questions.length > 0 && (
          <QuestionsAnsweringControl
            currentAnswer={currentAnswer}
            dispatchAnswer={dispatchAnswer}
          />
        )}
      </main>
    </>
  );
}
