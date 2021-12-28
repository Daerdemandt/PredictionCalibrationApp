import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import prettifyResponseError from "./shared/prettifyResponseError";
import {
  ResolvePredictionResult,
  ResolvePredictionDialog,
} from "./ResolvePredictionDialog";
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

const PredictionsTable = ({ predictions, onResolveClick }) => {
  const resultToString = (result) => {
    switch (result) {
      case -1:
        return "Ещё не разрешено";
      case 0:
        return "Не исполнилось";
      case 1:
        return "Исполнилось";
      case 2:
        return "Результат неясен";
      default:
        throw new Error(`Unknown result ${result}`);
    }
  };

  const formatDate = (date) => {
    return (
      date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
    );
  };

  return (
    <main>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 920 }} aria-label="answer history table">
          <TableHead>
            <TableRow key="header-row">
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
              <TableCell align="center"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {predictions.map((prediction) => (
              <TableRow
                key={"row-" + prediction.prediction_id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {prediction.prediction}
                </TableCell>
                <TableCell align="center">
                  {formatDate(new Date(prediction.resolve_ts * 1000))}
                </TableCell>
                <TableCell align="center">
                  {formatDate(new Date(prediction.created_ts * 1000))}
                </TableCell>
                <TableCell align="center">
                  {resultToString(prediction.result)}
                </TableCell>
                <TableCell align="center">
                  <Button
                    color="secondary"
                    size="small"
                    onClick={() =>
                      onResolveClick(
                        prediction.prediction,
                        prediction.prediction_id
                      )
                    }
                  >
                    {prediction.result === -1
                      ? "Разрешить"
                      : "Изменить решение"}
                  </Button>
                </TableCell>
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
  const [selectedPrediciton, setSelectedPrediciton] = React.useState("");
  const [selectedPredicitonId, setSelectedPredicitonId] = React.useState(null);
  const [selectedResolve, setSelectedResolve] = React.useState(null);
  const [showAll, setShowAll] = React.useState(false);

  async function resolvePrediction(prId, result, hidePredictionsAfterwards) {
    try {
      const url = `/resolve_prediction?prediction_id=${prId}&result=${result}`;
      const backendResponse = await axios.put(url);
      if (backendResponse.status === 200) {
        if (hidePredictionsAfterwards) {
          if (result !== ResolvePredictionResult.UNRESOLVED) {
            const leftPredictions = predictions.filter(
              (p) => p.prediction_id !== prId
            );
            setPredictions(leftPredictions);
          }
        } else {
          let changed = predictions.find((p) => p.prediction_id === prId);
          if (changed != null) {
            changed.result = result;
            setPredictions(predictions.slice());
          } else {
            console.log(
              `Changed prediction with id ${prId} but not found it in the list later`
            );
          }
        }
      }
    } catch (e) {
      console.log(e);
      setError(prettifyResponseError(e));
    }
  }

  React.useEffect(
    () => {
      const result = selectedResolve;
      const prId = selectedPredicitonId;
      setSelectedResolve(null);
      setSelectedPredicitonId(null);
      if (prId != null && result != null) {
        resolvePrediction(prId, result, !showAll);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedResolve]
  );

  React.useEffect(() => {
    async function requestPredictions() {
      if (!error) {
        const userArg = `user_id=${user.user_id}`;
        let url = `/get_predictions?${userArg}`;
        if (!showAll) {
          const tsNow = new Date().getTime() / 1000;
          const filterArgs = `resolved_before_ts=${tsNow}&only_unresolved=1`;
          url += `&${filterArgs}`;
        }
        try {
          const result = await axios.get(url);
          setPredictions(result.data.predictions);
        } catch (e) {
          console.log(e);
          setError(prettifyResponseError(e));
        }
      }
    }
    requestPredictions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAll]);

  const onResolveClick = (perdiction, predictionId) => {
    setSelectedPrediciton(perdiction);
    setSelectedPredicitonId(predictionId);
  };

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
        <Button
          style={{ paddingBottom: "10px" }}
          variant="contained"
          size="large"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll
            ? "Показать только предсказания, по которым нужно решение"
            : "Показать все предсказания"}
        </Button>
        {(function () {
          if (error !== "")
            return <Typography variant="h4">{error}</Typography>;
          if (predictions.length === 0)
            return (
              <Typography variant="h4">Пока что нет предсказаний</Typography>
            );
          else
            return (
              <PredictionsTable
                predictions={predictions}
                onResolveClick={onResolveClick}
              />
            );
        })()}
        <ResolvePredictionDialog
          open={selectedPredicitonId != null}
          message={selectedPrediciton}
          onClose={setSelectedResolve}
        />
      </main>
    </>
  );
}
