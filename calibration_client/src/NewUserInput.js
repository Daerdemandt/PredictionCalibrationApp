import React from "react";
import { StyledButtonSmall } from "./shared/SharedStyle";
import styled from "styled-components";
import axios from "axios";

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

export function NewUserInput({ onUserCreated }) {
  const [inputOk, setInputOk] = React.useState(false);
  const [name, setName] = React.useState("");

  let validateInput = (event) => {
    setInputOk(event.target.value !== "");
    setName(event.target.value);
  };

  let createNewUser = () => {
    const postData = { name: name };
    let _unused = axios.post("/create_user", postData);
    // Ignore errors right now
    onUserCreated();
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
        <StyledButtonSmall disabled={!inputOk} onClick={createNewUser}>
          Создать
        </StyledButtonSmall>
      </div>
    </>
  );
}
