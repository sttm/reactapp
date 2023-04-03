import React from "react";
import { Route, Switch } from "wouter";
// import Home from "../pages/home.jsx";
import About from "../pages/about.jsx";

export default function PageRouter() {
  return (
    <Switch>
      <Route path="/about" component={About} />
    </Switch>
  );
}