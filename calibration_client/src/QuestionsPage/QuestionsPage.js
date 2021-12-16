import React from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import {
  Answer,
  AnsweredQuestionHistory,
  ProbabilityButtonArray,
  DontKnowConfirmButton,
  NDYButtonArray,
  MainPlaque,
} from "./QuestionsPageSubcomponents";
import { StyledButtonLarge } from "../shared/SharedStyle";
import prettifyResponseError from "../shared/prettifyResponseError";

const getBlankAnswer = (userId) => ({
  ynq_id: -1,
  user_id: userId,
  answer: null,
  probability: -1,
  confirmed: false,
});

const questionReducer = (state, action) => {
  switch (action.type) {
    case "ADD":
      return {
        ...state,
        loading: false,
        error: null,
        questions: state.questions.concat(action.payload.questions),
        hasMore: action.payload.hasMore,
        nextPage: state.nextPage + 1,
      };
    case "NEXT":
      let newAnswered =
        state.answeredQuestions.length > 10
          ? state.answeredQuestions.slice(0, -1)
          : Object.assign([], state.answeredQuestions);
      newAnswered = [
        {
          userAnswer: action.payload,
          ...state.questions[state.questions.length - 1],
        },
        ...newAnswered,
      ];
      return {
        ...state,
        questions: state.questions.slice(0, -1),
        answeredQuestions: newAnswered,
      };
    case "ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      throw new TypeError("Illegal action in questionReducer");
  }
};

function getAnswerReducer(userId) {
  return (state, action) => {
    switch (action.type) {
      case "RESET":
        return getBlankAnswer(userId);
      case "SET_QUESTION_ID":
        return {
          ...state,
          ynq_id: action.payload,
        };
      case "SET_YN":
        return {
          ...state,
          answer: action.payload,
        };
      case "SET_PROBABILITY":
        return {
          ...state,
          probability: action.payload,
        };
      case "CONFIRM":
        return {
          ...state,
          confirmed: true,
        };
      default:
        throw new TypeError("Illegal action in getAnswerReducer");
    }
  };
}

// ---

// ---

export function QuestionsPage({ topic }) {
  const location = useLocation();
  const user = location.state.user;
  if (user == null || user.user_id == null || user.name == null) {
    console.log(user);
    throw new ReferenceError("Malformed user");
  }

  const [showProbs, setShowProbs] = React.useState(false);
  const [showDontKnowConfirm, setShowDontKnowConfirm] = React.useState(false);
  const [showAnswered, setShowAnswered] = React.useState(false);

  const [questionsData, dispatchQuestionsData] = React.useReducer(
    questionReducer,
    {
      loading: true,
      error: null,
      questions: [],
      answeredQuestions: [],
      hasMore: true,
      nextPage: 0,
    }
  );

  const requestQuestions = React.useCallback(async () => {
    if (
      questionsData.error == null &&
      questionsData.questions.length <= 1 &&
      questionsData.hasMore
    ) {
      try {
        let url = `/get_questions?page=${questionsData.nextPage}&user_id=${user.user_id}`;
        const result = await axios.get(url);
        dispatchQuestionsData({
          type: "ADD",
          payload: {
            questions: result.data.questions,
            hasMore: result.data.has_more,
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
      setShowProbs(false);
      setShowDontKnowConfirm(false);
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

  return (
    <>
      <main>
        <h3>Тема: {topic}</h3>
        <h3>Пользователь: {user.name}</h3>
        <MainPlaque
          questions={questionsData.questions}
          hasMore={questionsData.hasMore}
          error={questionsData.error}
        />
        {questionsData.questions.length > 0 && (
          <NDYButtonArray
            onAnswer={(answer) => {
              switch (answer) {
                case Answer.NO:
                  dispatchAnswer({ type: "SET_YN", payload: Answer.NO });
                  setShowProbs(true);
                  break;
                case Answer.YES:
                  dispatchAnswer({ type: "SET_YN", payload: Answer.YES });
                  setShowProbs(true);
                  break;
                case Answer.DONTKNOW:
                  dispatchAnswer({ type: "SET_YN", payload: Answer.DONTKNOW });
                  setShowDontKnowConfirm(true);
                  break;
                default:
                  throw new Error();
              }
            }}
          />
        )}
        {showProbs && (
          <ProbabilityButtonArray
            onProbabilitySelected={(prob) => {
              dispatchAnswer({ type: "SET_PROBABILITY", payload: prob });
              dispatchAnswer({ type: "CONFIRM" });
            }}
          />
        )}
        {showDontKnowConfirm && (
          <DontKnowConfirmButton
            confirmDontKnow={() => dispatchAnswer({ type: "CONFIRM" })}
          />
        )}
        <hr />
        <StyledButtonLarge onClick={() => setShowAnswered(!showAnswered)}>
          Показать историю ответов
        </StyledButtonLarge>
        {showAnswered && (
          <AnsweredQuestionHistory
            answeredQuestions={questionsData.answeredQuestions}
          />
        )}
        <hr />
      </main>
      <nav>
        <Link to="/">Назад</Link>
      </nav>
    </>
  );
}
