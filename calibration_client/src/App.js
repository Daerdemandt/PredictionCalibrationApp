import React from "react";
import { Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { About } from "./About";
import { QuestionsPage } from "./QuestionsPage/QuestionsPage";
import { StyledButtonLarge } from "./shared/SharedStyle";
import "./App.css";
import { NewUserInput } from "./NewUserInput";

function Home() {
  const navigate = useNavigate();
  return (
    <main>
      <h2>Calibration tool</h2>
      <div style={{ paddingBottom: "5px" }}>
        <StyledButtonLarge onClick={() => navigate("/questions")}>
          Отвечать на вопросы
        </StyledButtonLarge>
      </div>
      <div style={{ paddingBottom: "5px" }}>
        <StyledButtonLarge onClick={() => navigate("/create_user")}>
          Создать нового пользователя
        </StyledButtonLarge>
      </div>
      <div style={{ paddingBottom: "5px" }}>
        <StyledButtonLarge onClick={() => navigate("/about")}>
          Помощь
        </StyledButtonLarge>
      </div>
    </main>
  );
}

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/questions" element={<QuestionsPage topic="любая" />} />
        <Route path="/create_user" element={<NewUserInput />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

export default App;
