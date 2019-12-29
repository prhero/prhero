import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { Router } from "./components/Router";

import "normalize.css";
import "./index.css";

(function extractAuth() {
  const u = new URLSearchParams(window.location.search);
  const token = u.get("token");
  if (token) {
    localStorage.setItem("token", token);
    window.location.href = '/';
  }
})();

ReactDOM.render(
  <Router />,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
