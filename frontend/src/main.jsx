import "./index.css";
import App from "./App.jsx";
import { StrictMode } from "react";
import { BrowserRouter } from "react-router";
import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";
import { AppProvider } from "./context/appContext";

export const server = "http://localhost:8000";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppProvider>
    <ToastContainer position="top-center" />
  </StrictMode>,
);
