import { answerToString } from "./QuestionsPage/Answer";
import styled from "styled-components";
import React from "react";
import axios from "axios";
import prettifyResponseError from "./shared/prettifyResponseError";

const StyledItem = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 5px;
`;

const StyledColumn = styled.span`
  padding: 0 5px;
  white-space: nowrap;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  a {
    color: inherit;
  }

  width: ${(props) => props.width};
`;

export const AnswerHistory = ({ user }) => {
  const [answerHistory, setAnswerHistory] = React.useState([]);
  const [error, setError] = React.useState("");
  const requestAnswerHistory = React.useCallback(async () => {
    if (!error) {
      try {
        let url = `/get_answers?user_id=${user.user_id}`;
        const result = await axios.get(url);
        setAnswerHistory(result.data.answers);
      } catch (error) {
        console.log(error);
        setError(prettifyResponseError(error));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    requestAnswerHistory();
  }, [requestAnswerHistory]);

  if (answerHistory.length === 0) {
    return (
      <div>
        <p>Пока что вы ещё не ответили ни на один вопрос</p>
      </div>
    );
  }
  return (
    <div>
      <StyledItem style={{ paddingTop: 15 }}>
        <StyledColumn width="33%">
          <strong>Вопрос</strong>
        </StyledColumn>
        <StyledColumn width="12%">
          <strong>Ваш ответ</strong>
        </StyledColumn>
        <StyledColumn width="12%">
          <strong>На самом деле</strong>
        </StyledColumn>
        <StyledColumn width="33%">
          <strong>Комментарий</strong>
        </StyledColumn>
      </StyledItem>
      {answerHistory.map((answer) => (
        <StyledItem key={answer.question}>
          <StyledColumn width="33%">{answer.question}</StyledColumn>
          <StyledColumn width="12%">
            {answerToString(answer.user_answer)}
          </StyledColumn>
          <StyledColumn width="12%">
            {answerToString(answer.real_answer)}
          </StyledColumn>
          <StyledColumn width="33%">{answer.comment}</StyledColumn>
        </StyledItem>
      ))}
    </div>
  );
};
