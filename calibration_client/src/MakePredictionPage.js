import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button, TextField } from "@mui/material";
import DesktopDatePicker from "@mui/lab/DesktopDatePicker";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import InfoAlert from "./shared/InfoAlert";

function getEmptyForm() {
  return {
    prediction: "",
    probability: 80,
    predictionResolveDate: new Date(),
  };
}

export function MakePredictionPage({ user }) {
  const [postData, setPostData] = React.useState(null);
  const [predictionError, setPredictionError] = React.useState(false);
  const [probabilityError, setProbabilityError] = React.useState(false);
  const [temporaryState, setTemporaryState] = React.useState(getEmptyForm());
  const [showPredictionMadeAlert, setShowPredicitonMadeAlert] =
    React.useState(false);

  React.useEffect(() => {
    async function realCreatePrediction() {
      if (postData != null) {
        try {
          // ignore result for now, do not await
          const response = await axios.post("/create_prediction", postData);
          if (response.status === 200) setShowPredicitonMadeAlert(true);
        } catch (error) {
          console.log(error);
          // Ignore for now
        }
        setPostData(null);
      }
    }
    realCreatePrediction();
  }, [postData]);

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
              setPostData({
                user_id: user.user_id,
                prediction: temporaryState.prediction,
                probability: temporaryState.probability,
                created_ts: new Date().getTime() / 1000,
                resolve_ts: Math.floor(
                  temporaryState.predictionResolveDate.getTime() / 1000
                ),
              });
              setTemporaryState(getEmptyForm());
            }
          }}
        >
          Отправить
        </Button>
        <InfoAlert
          open={showPredictionMadeAlert}
          title={`Предсказание создано`}
          onClose={() => setShowPredicitonMadeAlert(false)}
        />
      </main>
    </>
  );
}
