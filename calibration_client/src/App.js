import React from "react";
import { Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { About } from "./About";
import { QuestionsPage } from "./QuestionsPage/QuestionsPage";
import { StyledButtonLarge } from "./shared/SharedStyle";
import "./App.css";
import { NewUserInput, UserManagementPane } from "./UserManagementPane";
import InfoAlert from "./shared/InfoAlert";
import axios from "axios";

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
    try {
      let url = `/get_users`;
      const result = await axios.get(url);
      setUsersData({
        users: result.data.users,
        loading: false,
        error: null,
      });
    } catch (error) {
      let errorMessage = "";
      switch (error.response.status) {
        case 500:
          errorMessage = "Ошибка 500; запущен ли бэкэнд сервер?";
          break;
        case 404:
          errorMessage =
            "Ошибка 404; не удалось получить список пользователей" +
            " - не поменял ли кто-то адрес в API?";
          break;
        default:
          errorMessage = error.response.data;
      }
      console.log(error);
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

  if (usersData.users.length !== 0) {
    const cantFindSelectedUser = !usersData.users.find(
      (e) => e.user_id === selectedUserId
    );
    if (cantFindSelectedUser) setSelectedUserId(usersData.users[0].user_id);
  }
  const selectedUser = usersData.users.find(
    (e) => e.user_id === selectedUserId
  );

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
    let result = await axios.delete(`/delete_user?user_id=${selectedUserId}`);
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
          <StyledButtonLarge
            onClick={() =>
              navigate("/questions", { state: { user: selectedUser } })
            }
          >
            Отвечать на вопросы
          </StyledButtonLarge>
        </div>
        <div style={{ paddingBottom: "5px" }}>
          <StyledButtonLarge onClick={() => navigate("/about")}>
            Помощь
          </StyledButtonLarge>
        </div>
        <UserManagementPane
          allUsers={usersData.users}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
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
