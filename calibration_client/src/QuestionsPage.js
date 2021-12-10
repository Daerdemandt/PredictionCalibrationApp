import React from "react";
import axios from "axios";
import styled from "styled-components";
import { Link } from "react-router-dom";

const StyledButton = styled.button`
  background: transparent;
  border: 1px solid #171212;
  padding: 5px;
  cursor: pointer;
  transition: all 0.1s ease-in;

  &:hover {
    background: #171212;
    color: #ffffff;
  }
`;

const StyledButtonSmall = styled(StyledButton)`
  padding: 10px;
`;

const StyledButtonLarge = styled(StyledButton)`
  padding: 20px;
`;

function MainYNButtonArray({ dispatchCurrentAnswer }) {
  function setDontKnow() {
    dispatchCurrentAnswer({ type: "ANSWER_SET_YN", payload: 2 });
    dispatchCurrentAnswer({ type: "ANSWER_SET_PROBABILITY", payload: 0.5 });
  }
  return (
    <div>
      <StyledButtonLarge
        onClick={() =>
          dispatchCurrentAnswer({ type: "ANSWER_SET_YN", payload: 1 })
        }
      >
        Нет
      </StyledButtonLarge>
      <StyledButtonLarge onClick={setDontKnow}>Я не знаю</StyledButtonLarge>
      <StyledButtonLarge
        onClick={() =>
          dispatchCurrentAnswer({ type: "ANSWER_SET_YN", payload: 0 })
        }
      >
        Да
      </StyledButtonLarge>
    </div>
  );
}

export function QuestionsPage({ topic }) {
  const [questionsData, setQuestionsData] = React.useState({
    loading: true,
    error: false,
    questions: null,
    has_more: true,
  });

  const requestQuestions = React.useCallback(async () => {
    try {
      console.log("requestQuestions");
      const result = await axios.get("/get_questions");
      console.log(result);
      setQuestionsData({
        loading: false,
        error: false,
        questions: result.data.questions,
        has_more: result.data.has_more,
      });
    } catch (error) {
      switch (error.response.status) {
        case 500:
          console.log("Error code 500; is backend server running?");
          break;
        default:
          console.log("Unknown error");
          console.log(error);
      }

      setQuestionsData({
        loading: false,
        error: true,
        questions: null,
        has_more: false,
      });
    }
  }, []);
  React.useEffect(() => {
    requestQuestions();
  }, [requestQuestions]);

  // return {"ynq_id": 1, "user": "Stub", "answer": "y"}
  const getBlankAnswer = () => ({
    ynq_id: -1,
    user_id: -1,
    answer: null,
    probability: null,
  });

  const currentAnswerReducer = (state, action) => {
    switch (action.type) {
      case "ANSWER_RESET":
        return getBlankAnswer();
      case "ANSWER_SET_YN":
        return {
          ...state,
          answer: action.payload,
        };
      case "ANSWER_SET_PROBABILITY":
        return {
          ...state,
          probability: action.payload,
        };
      default:
        throw new Error();
    }
  };
  const [currentAnswer, dispatchCurrentAnswer] = React.useReducer(
    currentAnswerReducer,
    getBlankAnswer()
  );
  const list_of_probabilities = [
    0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 0.99,
  ];
  const constructSetProbFn = (prob) => () =>
    dispatchCurrentAnswer({ type: "ANSWER_SET_PROBABILITY", payload: prob });

  // {questionsData.questions && data.questions.map(question => (<p>{question}</p>))}
  return (
    <>
      <main>
        <h3>Тема: {topic}</h3>
        <h1>Question here</h1>
        {questionsData.loading && <p>Загрузка...</p>}
        {questionsData.error && <p>Ошибка при загрузке вопросов</p>}
        <MainYNButtonArray dispatchCurrentAnswer={dispatchCurrentAnswer} />
        <div>
          {currentAnswer.answer != null &&
            list_of_probabilities.map((prob) => (
              <StyledButtonSmall
                key={Math.round(prob * 100)}
                onClick={constructSetProbFn(prob)}
              >
                {String(Math.round(prob * 100)) + "%"}
              </StyledButtonSmall>
            ))}
        </div>
      </main>
      <nav>
        <Link to="/">Назад</Link>
      </nav>
    </>
  );
}
