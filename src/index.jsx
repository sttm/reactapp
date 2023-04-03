import React from "react";
import { createRoot } from 'react-dom/client';
import App from "./app.jsx";
import { HelmetProvider } from 'react-helmet-async';

/**
* Root of react site 
*
* Imports Helment provider for the page head
* And App which defines the content and navigation
*/

// Use createRoot instead of ReactDOM.render
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
