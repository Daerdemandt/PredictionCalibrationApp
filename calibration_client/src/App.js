import React from "react";
import { Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { About } from "./About";
import { QuestionsPage } from "./QuestionsPage/QuestionsPage";
import { StyledButtonLarge } from "./shared/SharedStyle";
import "./App.css";
import { NewUserInput } from "./NewUserInput";
import axios from "axios";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";

const useSemiPersistentInt = (key, initialValue) => {
  const [value, setValue] = React.useState(
    Number(localStorage.getItem(key)) || initialValue
  );
  React.useEffect(() => {
    localStorage.setItem(key, Number(value));
  }, [value, key]);
  return [value, setValue];
};

function Home() {
  const [selectedUserId, setSelectedUserId] = useSemiPersistentInt(
    "selectedUserId",
    -1
  );

  const [usersData, setUsersData] = React.useState({
    users: [],
    loading: true,
    error: null,
  });
  const requestUsers = React.useCallback(async () => {
    if (!usersData.loading) return;
    try {
      let url = `/get_users`;
      const result = await axios.get(url);
      const users = result.data.users;
      if (users.length !== 0) {
        const cant_find_selected_user = !users.find(
          (e) => e.id === selectedUserId
        );
        if (cant_find_selected_user) setSelectedUserId(users[0].id);
      }
      setUsersData({
        users: result.data.users,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.log(error);
      setUsersData({
        users: [],
        loading: false,
        error: error,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersData.loading]);
  React.useEffect(() => {
    requestUsers();
  }, [requestUsers]);

  const refreshUserlist = () =>
    setUsersData({
      ...usersData,
      loading: true,
    });

  const [showNewUser, setShowNewUser] = React.useState(false);

  const navigate = useNavigate();
  if (usersData.error != null) return <h1>Ошибка: {usersData.error}</h1>;
  else if (usersData.loading) return <h1>Загрузка...</h1>;
  else if (usersData.users.length === 0) {
    return (
      <>
        <h2>Пока что нет пользователей, зарегистрируйтесь</h2>
        <NewUserInput onUserCreated={() => refreshUserlist()} />
      </>
    );
  } else {
    const selectedUser = usersData.users.find((e) => e.id === selectedUserId);
    const userNames = usersData.users.map((u) => u.name);
    return (
      <main>
        <div style={{ paddingBottom: "5px" }}>
          <StyledButtonLarge onClick={() => navigate("/questions")}>
            Отвечать на вопросы
          </StyledButtonLarge>
        </div>
        <div style={{ paddingBottom: "5px" }}>
          <StyledButtonLarge onClick={() => navigate("/about")}>
            Помощь
          </StyledButtonLarge>
        </div>
        <div style={{ paddingBottom: "5px" }}>
          <StyledButtonLarge onClick={() => setShowNewUser(!showNewUser)}>
            {showNewUser
              ? "Скрыть создание пользователя"
              : "Создать нового пользователя"}
          </StyledButtonLarge>
        </div>
        {showNewUser && (
          <div>
            <hr />
            <NewUserInput
              onUserCreated={() => refreshUserlist() /* Just in case */}
            />
            <hr />
          </div>
        )}
        <div
          style={{
            marginLeft: "33%",
            paddingTop: "10px",
            paddingBottom: "5px",
          }}
        >
          <Autocomplete
            disableClearable
            options={userNames}
            value={selectedUser.name}
            style={{ width: "50%" }}
            onChange={(event, newValue) => {
              const newUser = usersData.users.find((e) => e.name === newValue);
              if (newUser == null)
                throw new Error(
                  `Can not select user ${newUser.name}: not in users list`
                );
              setSelectedUserId(newUser.id);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Выбранный пользователь"
                variant="outlined"
              />
            )}
          />
        </div>
      </main>
    );
  }
}

function App() {
  return (
    <div className="App">
      <h1>Калибровка уверенности</h1>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/questions" element={<QuestionsPage topic="любая" />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

export default App;
