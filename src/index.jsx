import React from "react";
import ReactDOM from "react-dom";
import App from "./app.jsx";
import { HelmetProvider } from "react-helmet-async";
import { createRoot } from "react-dom/client";
const rootElement = document.getElementById("root");
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
/**
 * Root of react site
 *
 * Imports Helment provider for the page head
 * And App which defines the content and navigation
 */
