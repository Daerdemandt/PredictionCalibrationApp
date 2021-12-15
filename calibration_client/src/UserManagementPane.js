import React from "react";
import { StyledButtonSmall } from "./shared/SharedStyle";
import styled from "styled-components";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import ConfirmDialog from "./shared/ConfirmDialog";
import { StyledButtonLarge } from "./shared/SharedStyle";

const StyledInput = styled.input`
  border: none;
  border-bottom: 1px solid #171212;
  background-color: transparent;

  font-size: 24px;
`;

const StyledLabel = styled.label`
  padding-left: 5px;
  font-size: 24px;
`;

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
        <StyledLabel htmlFor="newUserName">Имя:</StyledLabel>
        &nbsp;
        <StyledInput
          id="newUserName"
          type="text"
          value={name}
          onChange={validateInput}
        />
        &nbsp;
        <StyledButtonSmall
          disabled={!inputOk}
          onClick={() => createNewUser(name)}
        >
          Создать
        </StyledButtonSmall>
      </div>
    </>
  );
}

export function UserManagementPane({
  allUsers,
  selectedUserId,
  setSelectedUserId,
  createNewUser,
  deleteUser,
}) {
  const userNames = allUsers.map((u) => u.name);
  // assumed valid at this point if userNames not empty
  const selectedUser = allUsers.find((e) => e.user_id === selectedUserId);

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
            createNewUser={(newUsername) => {
              setShowNewUser(false);
              createNewUser(newUsername);
            }}
          />
          <hr />
        </div>
      )}
      <div style={{ paddingBottom: "5px" }}>
        <StyledButtonLarge onClick={() => setShowConfirmDelete(true)}>
          Удалить текущего пользователя
        </StyledButtonLarge>
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
              setSelectedUserId(newUser.user_id);
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
