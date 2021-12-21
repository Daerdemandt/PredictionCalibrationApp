import { answerToString } from "./Answer";
import styled from "styled-components";

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

export const AnswerHistory = ({ answeredQuestions }) => {
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
