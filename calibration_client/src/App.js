import React from "react";
import { Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { HelpPage } from "./HelpPage";
import { QuestionsPage } from "./QuestionsPage/QuestionsPage";
import { StatisticsPage } from "./StatisticsPage";
import { AnswerHistory } from "./AnswerHistory";
import { Button, Typography } from "@material-ui/core";
import "./App.css";
import { NewUserInput, UserManagementPane } from "./UserManagementPane";
import InfoAlert from "./shared/InfoAlert";
import axios from "axios";
import prettifyResponseError from "./shared/prettifyResponseError";

const useSemiPersistentState = (key, initialValue) => {
  let storedValue = null;
  const storedStr = localStorage.getItem(key);
  if (storedStr != null && storedStr !== "NaN")
    storedValue = JSON.parse(storedStr);
  const [value, setValue] = React.useState(storedValue || initialValue);
  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);
  return [value, setValue];
};

function Home({ selectedUser, setSelectedUser }) {
  const [usersData, setUsersData] = React.useState({
    users: [],
    loading: true,
    error: null,
  });
  const requestUsers = React.useCallback(async () => {
    try {
      let url = `/get_users`;
      const result = await axios.get(url);
      const users = result.data.users;
      setUsersData({
        users: users,
        loading: false,
        error: null,
      });
      if (users.length !== 0) {
        const cantFindSelectedUser = !users.find(
          (e) => e.user_id === selectedUser.user_id
        );
        if (cantFindSelectedUser) setSelectedUser(users[0]);
      }
    } catch (error) {
      console.log(error);
      let errorMessage = prettifyResponseError(error);
      setUsersData({
        users: [],
        loading: false,
        error: errorMessage,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    requestUsers();
  }, [requestUsers]);

  const [showUserCreatedAlert, setShowUserCreatedAlert] = React.useState(false);
  async function createNewUser(newUsername) {
    setShowUserCreatedAlert(true);
    const postData = { name: newUsername };
    // Ignore errors right now
    let result = await axios.post("/create_user", postData);
    setUsersData({
      ...usersData,
      users: result.data.users,
    });
  }

  async function deleteUser() {
    // Ignore errors right now
    let result = await axios.delete(
      `/delete_user?user_id=${selectedUser.user_id}`
    );
    if (result.data.users) setSelectedUser(result.data.users[0]);
    setUsersData({
      ...usersData,
      users: result.data.users,
    });
  }

  const navigate = useNavigate();
  if (usersData.error != null) return <h1>Ошибка: {usersData.error}</h1>;
  else if (usersData.loading) return <h1>Загрузка...</h1>;
  else if (usersData.users.length === 0) {
    return (
      <>
        <h2>Пока что нет пользователей, зарегистрируйтесь</h2>
        <NewUserInput createNewUser={createNewUser} />
      </>
    );
  } else {
    return (
      <main>
        <div style={{ paddingBottom: "5px" }}>
          <Button
            color="secondary"
            variant="contained"
            size="large"
            onClick={() => navigate("/help")}
          >
            Помощь
          </Button>
        </div>
        <div style={{ paddingBottom: "5px" }}>
          <Button
            variant="contained"
            size="large"
            color="primary"
            onClick={() => navigate("/questions")}
          >
            Отвечать на вопросы
          </Button>
        </div>
        <div style={{ paddingBottom: "5px" }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/statistics")}
          >
            Статистика
          </Button>
        </div>
        <div style={{ paddingBottom: "5px" }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/history")}
          >
            История ответов
          </Button>
        </div>
        <UserManagementPane
          allUsers={usersData.users}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          createNewUser={createNewUser}
          deleteUser={deleteUser}
        />
        <InfoAlert
          open={showUserCreatedAlert}
          title={`Пользователь создан`}
          onClose={() => {
            setShowUserCreatedAlert(false);
          }}
        />
      </main>
    );
  }
}

function App() {
  const [selectedUser, setSelectedUser] = useSemiPersistentState(
    "selectedUser",
    { user_id: -1, name: "" }
  );

  return (
    <div
      style={{
        width: 920,
        margin: "auto",
        textAlign: "center",
        justifyContent: "center",
      }}
    >
      <Typography
        style={{
          paddingBottom: "15px",
        }}
        variant="h2"
      >
        Калибровка уверенности
      </Typography>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
            />
          }
        />
        <Route
          path="/questions"
          element={<QuestionsPage user={selectedUser} topic="любая" />}
        />
        <Route
          path="/statistics"
          element={<StatisticsPage user={selectedUser} />}
        />
        <Route
          path="/history"
          element={<AnswerHistory user={selectedUser} />}
        />
        <Route path="/help" element={<HelpPage />} />
      </Routes>
    </div>
  );
}

export default App;
