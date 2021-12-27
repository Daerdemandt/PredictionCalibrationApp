import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button, TextField } from "@mui/material";
import DesktopDatePicker from "@mui/lab/DesktopDatePicker";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterDateFns from "@mui/lab/AdapterDateFns";

function getEmptyForm() {
  return {
    prediction: "",
    probability: 80,
    predictionResolveDate: new Date(),
  };
}

export function MakePredictionPage({ user }) {
  const [predictionError, setPredictionError] = React.useState(false);
  const [probabilityError, setProbabilityError] = React.useState(false);
  const [temporaryState, setTemporaryState] = React.useState(getEmptyForm());

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
        <TextField
          label="Прогноз"
          error={predictionError}
          multiline
          fullWidth
          rows={4}
          value={temporaryState.prediction}
          variant="outlined"
          margin="normal"
          onChange={(event) =>
            setTemporaryState({
              ...temporaryState,
              prediction: event.target.value,
            })
          }
          helperText={
            predictionError
              ? "Не должно быть пустым"
              : "[Событие] произойдёт с [объектом] до [определённой даты] и это можно будет проверить [способом]"
          }
        />
        <TextField
          label="Вероятность"
          error={probabilityError}
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          value={temporaryState.probability}
          helperText="Используйте вероятность от 50 до 99. Если вероятность события меньше 50, то переформулируйте прогноз как отрицание события."
          variant="outlined"
          margin="normal"
          onChange={(event) =>
            setTemporaryState({
              ...temporaryState,
              probability: event.target.value,
            })
          }
        />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DesktopDatePicker
            label="Напомнить о прогнозе"
            value={temporaryState.predictionResolveDate}
            minDate={new Date("2000-01-01")}
            onChange={(newValue) => {
              setTemporaryState({
                ...temporaryState,
                predictionResolveDate: newValue,
              });
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
        <Button
          variant="contained"
          size="large"
          onClick={() => {
            const isPredictionTextError = temporaryState.prediction === "";
            setPredictionError(isPredictionTextError);
            const isProbabilityError =
              50 <= temporaryState.prediction &&
              temporaryState.prediction <= 99;
            setProbabilityError(isProbabilityError);
            if (!isPredictionTextError && !isProbabilityError) {
              // ignore promise for now
              // axios.post("/create_prediction", {
              //   user_id: user.userId,
              //   prediction: temporaryState.prediction,
              //   probability: temporaryState.probability,
              //   created_ts: Math.floor(
              //     temporaryState.predictionResolveDate.getTime() / 1000
              //   ),
              // });
              setTemporaryState(getEmptyForm());
            }
          }}
        >
          Отправить
        </Button>
      </main>
    </>
  );
}
