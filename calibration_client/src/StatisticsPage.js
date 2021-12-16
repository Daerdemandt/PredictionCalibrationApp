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
import { StyledButtonLarge } from "./shared/SharedStyle";

function ProbsLineChart({ statistics, children }) {
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
        data={statistics.statistics}
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

  return (
    <>
      <StyledButtonLarge onClick={() => navigate(-1)}>Назад</StyledButtonLarge>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ProbsLineChart statistics={statistics}>
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
        <ProbsLineChart statistics={statistics}>
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
