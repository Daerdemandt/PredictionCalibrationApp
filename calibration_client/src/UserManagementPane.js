import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import ConfirmDialog from "./shared/ConfirmDialog";
import { Button, TextField, FormLabel } from "@mui/material";

export function NewUserInput({ createNewUser }) {
  const [inputOk, setInputOk] = React.useState(false);
  const [name, setName] = React.useState("");

  const validateInput = (event) => {
    setInputOk(event.target.value !== "");
    setName(event.target.value);
  };

  return (
    <>
      <div>
        <FormLabel htmlFor="newUserName">Имя:</FormLabel>
        &nbsp;
        <TextField id="newUserName" value={name} onChange={validateInput} />
        &nbsp;
        <Button
          variant="contained"
          size="small"
          color="primary"
          disabled={!inputOk}
          onClick={() => createNewUser(name)}
        >
          Создать
        </Button>
      </div>
    </>
  );
}

export function UserManagementPane({
  allUsers,
  selectedUser,
  setSelectedUser,
  createNewUser,
  deleteUser,
}) {
  const userNames = allUsers.map((u) => u.name);

  async function deleteUserConfirmResult(isConfirmed) {
    setShowConfirmDelete(false);
    if (!isConfirmed) return;
    deleteUser();
  }
  const [showNewUser, setShowNewUser] = React.useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);
  return (
    <>
      <div style={{ paddingBottom: "5px" }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => setShowNewUser(!showNewUser)}
        >
          {showNewUser
            ? "Скрыть создание пользователя"
            : "Создать нового пользователя"}
        </Button>
      </div>
      {showNewUser && (
        <div>
          <hr />
          <NewUserInput
            createNewUser={(newUsername) => {
              setShowNewUser(false);
              createNewUser(newUsername);
            }}
          />
          <hr />
        </div>
      )}
      <div style={{ paddingBottom: "5px" }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => setShowConfirmDelete(true)}
        >
          Удалить текущего пользователя
        </Button>
      </div>
      {userNames.length === 0 ? (
        // This is fallback for graceful display of error.
        // This whole pane shouldn't be visible if there're no users yet.
        <h2>Пока нет пользователей</h2>
      ) : (
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
              const newUser = allUsers.find((e) => e.name === newValue);
              if (newUser == null)
                throw new Error(
                  `Can not select user ${newUser.name}: not in users list`
                );
              setSelectedUser(newUser);
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
      )}
      <ConfirmDialog
        title={`Удалить пользователя ${selectedUser.name}?`}
        message="Будет удалена вся статистика и предсказания этого пользователя"
        open={showConfirmDelete}
        onClose={deleteUserConfirmResult}
      />
    </>
  );
}
