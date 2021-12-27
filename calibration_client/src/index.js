import React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { grey, indigo, red } from "@mui/material/colors";

let theme = createTheme({
  palette: {
    primary: {
      main: grey[200],
    },
    secondary: {
      main: indigo[600],
    },
    trenary: {
      main: red[600],
    },
  },
});

ReactDOM.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
