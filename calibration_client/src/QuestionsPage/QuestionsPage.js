import React from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Answer,
  AnsweredQuestionHistory,
  ProbabilityButtonArray,
  DontKnowConfirmButton,
  NDYButtonArray,
  MainPlaque,
} from "./QuestionsPageSubcomponents";
import { StyledButtonLarge } from "./QuestionsPageStyle";

const getBlankAnswer = () => ({
  ynq_id: -1,
  user_id: -1,
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
        error: false,
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
        error: true,
      };
    default:
      throw new Error();
  }
};

const answerReducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return getBlankAnswer();
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
      throw new Error();
  }
};

// ---

// ---

export function QuestionsPage({ topic }) {
  const [showProbs, setShowProbs] = React.useState(false);
  const [showDontKnowConfirm, setShowDontKnowConfirm] = React.useState(false);
  const [showAnswered, setShowAnswered] = React.useState(false);

  const [questionsData, dispatchQuestionsData] = React.useReducer(
    questionReducer,
    {
      loading: true,
      error: false,
      questions: [],
      answeredQuestions: [],
      hasMore: true,
      nextPage: 0,
    }
  );

  const requestQuestions = React.useCallback(async () => {
    if (questionsData.questions.length <= 1 && questionsData.hasMore) {
      try {
        let url = `/get_questions?page=${questionsData.nextPage}`;
        const result = await axios.get(url);
        dispatchQuestionsData({
          type: "ADD",
          payload: {
            questions: result.data.questions,
            hasMore: result.data.has_more,
          },
        });
      } catch (error) {
        dispatchQuestionsData({ type: "ERROR" });
      }
    }
  }, [questionsData]);
  React.useEffect(() => {
    requestQuestions();
  }, [requestQuestions]);

  const [currentAnswer, dispatchAnswer] = React.useReducer(
    answerReducer,
    getBlankAnswer()
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

  return (
    <>
      <main>
        <h3>Тема: {topic}</h3>
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
