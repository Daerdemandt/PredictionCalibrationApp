import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { About } from "./About";
import { QuestionsPage } from "./QuestionsPage/QuestionsPage";
import "./App.css";

function Home() {
  return (
    <>
      <main>
        <h2>Calibration tool</h2>
        <Link to="/questions">QuestionsPage</Link>
        <Link to="/about">About</Link>
      </main>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="questions" element={<QuestionsPage topic={"любая"} />} />
      </Routes>
    </div>
  );
}

export default App;
