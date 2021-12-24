import { answerToString } from "./QuestionsPage/Answer";
import React from "react";
import axios from "axios";
import prettifyResponseError from "./shared/prettifyResponseError";
import {
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@material-ui/core";
import { useNavigate } from "react-router-dom";

export const AnswerHistoryTable = ({ answerHistory }) => {
  return (
    <main>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 920 }} aria-label="answer history table">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                <strong>Вопрос</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Ваш ответ</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Вероятность</strong>
              </TableCell>
              <TableCell align="center">
                <strong>На самом деле</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Комментарий</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {answerHistory.map((answer) => (
              <TableRow
                key={answer.name}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {answer.question}
                </TableCell>
                <TableCell align="center">
                  {answerToString(answer.user_answer)}
                </TableCell>
                <TableCell align="center">
                  {answer.probability === -1 ? 50 : answer.probability}
                </TableCell>
                <TableCell align="center">
                  {answerToString(answer.real_answer)}
                </TableCell>
                <TableCell align="right">{answer.comment}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </main>
  );
};

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
  const navigate = useNavigate();

  return (
    <>
      <nav>
        <Button variant="contained" size="large" onClick={() => navigate(-1)}>
          Назад
        </Button>
      </nav>
      {(function () {
        if (error !== "") return <Typography variant="h4">{error}</Typography>;
        if (answerHistory.length === 0)
          return (
            <Typography variant="h4">
              Пока что вы ещё не ответили ни на один вопрос
            </Typography>
          );
        else return <AnswerHistoryTable answerHistory={answerHistory} />;
      })()}
    </>
  );
};
