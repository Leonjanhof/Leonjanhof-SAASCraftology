import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

// Add a global error handler for unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled Promise Rejection:", event.reason);
  // Prevent the default browser behavior which might terminate the page
  event.preventDefault();
});

// Add a global error handler for uncaught exceptions
window.addEventListener("error", (event) => {
  console.error("Uncaught Error:", event.error || event.message);
  // Prevent the default browser behavior which might show an error dialog
  event.preventDefault();
});

const basename = import.meta.env.BASE_URL;

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

// Add error logging
window.onerror = function (message, source, lineno, colno, error) {
  console.error("Global error:", { message, source, lineno, colno, error });
};
