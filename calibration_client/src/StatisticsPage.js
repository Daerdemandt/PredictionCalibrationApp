import React from "react";
import axios from "axios";
import {
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";
import prettifyResponseError from "./shared/prettifyResponseError";
import { Button } from "@material-ui/core";

function ProbsLineChart({ datapoints, children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <LineChart
        width={window.innerWidth * 0.7}
        height={window.innerHeight * 0.8}
        data={datapoints}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <XAxis
          dataKey="probability_quotient"
          label={{
            value: "Предсказанная вероятность (%)",
            position: "insideBottomRight",
            offset: -10,
          }}
        />
        <Tooltip />
        <CartesianGrid stroke="#f5f5f5" />
        {children}
        <Legend />
      </LineChart>
    </div>
  );
}

const toDisplayableDatapoints = (statistics, granularityLevel) => {
  const granularity = [
    { low: 50, high: 58, display: 55 },
    { low: 58, high: 63, display: 60 },
    { low: 63, high: 68, display: 65 },
    { low: 68, high: 73, display: 70 },
    { low: 73, high: 78, display: 75 },
    { low: 78, high: 83, display: 80 },
    { low: 83, high: 88, display: 85 },
    { low: 88, high: 93, display: 90 },
    { low: 93, high: 98, display: 95 },
    { low: 98, high: 100, display: 99 },
  ];
  const groupedDatapoints = new Map();
  granularity.forEach((split) => {
    groupedDatapoints.set(split.display, []);
  });
  statistics.forEach((dp) => {
    granularity.forEach((split) => {
      if (split.low <= dp.probability && dp.probability < split.high)
        groupedDatapoints.get(split.display).push(dp);
    });
  });
  const numberOfCorrectAnswers = (datapoints) => {
    return datapoints.filter((dp) => dp.real_answer === dp.user_answer).length;
  };
  const result = [];
  groupedDatapoints.forEach((values, probability_quotient) => {
    result.push({
      probability_quotient: probability_quotient,
      total: values.length,
      total_correct: numberOfCorrectAnswers(values),
      correct_percent:
        values.length > 0
          ? (100 * numberOfCorrectAnswers(values)) / values.length
          : null,
    });
  });
  return result;
};

export function StatisticsPage({ user }) {
  const [statistics, setStatistics] = React.useState({
    statistics: [],
    error: null,
  });
  const requestStatistics = React.useCallback(async () => {
    try {
      let url = `/statistics?user_id=${user.user_id}`;
      const result = await axios.get(url);
      setStatistics({
        statistics: result.data.statistics,
        error: null,
      });
    } catch (error) {
      console.log(error);
      let errorMessage = prettifyResponseError(error);
      setStatistics({
        statistics: [],
        error: errorMessage,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    requestStatistics();
  }, [requestStatistics]);
  const navigate = useNavigate();
  const displayableDatapoints = toDisplayableDatapoints(statistics.statistics);

  if (statistics.error != null)
    return <h1>Ошибка при загрузке вопросов: {statistics.error}</h1>;
  return (
    <>
      <Button variant="contained" size="large" onClick={() => navigate(-1)}>
        Назад
      </Button>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ProbsLineChart datapoints={displayableDatapoints}>
          <YAxis
            label={{
              value: "Действительное количество верных ответов (%)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Line
            type="monotone"
            dataKey="probability_quotient"
            name="Идеальная калибровка"
            stroke="#ff0000"
          />
          <Line
            type="monotone"
            dataKey="correct_percent"
            name="Процент верных ответов"
            stroke="#0000ff"
            connectNulls={true}
          />
        </ProbsLineChart>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ProbsLineChart datapoints={displayableDatapoints}>
          <YAxis
            label={{
              value: "Количество вопросов",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Line
            type="monotone"
            dataKey="total_correct"
            name="Верно отвечено"
            stroke="#00aaaa"
            connectNulls={true}
          />
          <Line
            type="monotone"
            dataKey="total"
            name="Всего задано"
            stroke="#aa00aa"
            connectNulls={true}
          />
        </ProbsLineChart>
      </div>
    </>
  );
}
