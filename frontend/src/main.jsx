// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import App from "./App";

// Context providers (yours)
import { AuthProvider } from "./context/AuthContext";
import { TaskProvider } from "./context/TaskContext";
import { CardProvider } from "./context/CardContext"; // if you use cards

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#6b7280" }
  },
  shape: { borderRadius: 10 }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CardProvider>
          <TaskProvider>
            <App />
          </TaskProvider>
        </CardProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);
