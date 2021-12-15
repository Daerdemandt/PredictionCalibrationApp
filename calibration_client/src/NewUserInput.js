import React from "react";
import { StyledButtonSmall } from "./shared/SharedStyle";
import styled from "styled-components";

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
