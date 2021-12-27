import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";

export const PredictionsTable = ({ predictions }) => {
  return (
    <main>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 920 }} aria-label="answer history table">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                <strong>Предсказание</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Время разрешения</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Создано</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Результат</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {predictions.map((prediction) => (
              <TableRow
                key={prediction.name}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {prediction.prediction}
                </TableCell>
                <TableCell align="center">{prediction.resolve_ts}</TableCell>
                <TableCell align="center">{prediction.created_ts}</TableCell>
                <TableCell align="center">{prediction.result}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </main>
  );
};

export function ShowPredictions({ user }) {
  const [predictions, setPredictions] = React.useState([]);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    async function requestPredictions() {
      if (!error) {
        try {
          let url = `/get_predictions?user_id=${user.user_id}`;
          const result = await axios.get(url);
          setPredictions(result.data.predictions);
        } catch (error) {
          console.log(error);
          setError(prettifyResponseError(error));
        }
      }
    }
    requestPredictions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = useNavigate();
  return (
    <>
      <nav>
        <Button
          style={{ paddingBottom: "10px" }}
          variant="contained"
          size="large"
          onClick={() => navigate(-1)}
        >
          Назад
        </Button>
      </nav>
      <main>
        {(function () {
          if (error !== "")
            return <Typography variant="h4">{error}</Typography>;
          if (predictions.length === 0)
            return (
              <Typography variant="h4">Пока что нет предсказаний</Typography>
            );
          else return <PredictionsTable predictions={predictions} />;
        })()}
      </main>
    </>
  );
}
