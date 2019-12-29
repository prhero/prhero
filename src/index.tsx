import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { Router } from "./components/Router";
import { BaseStyles } from "@primer/components";

import "normalize.css";
import "./index.css";

ReactDOM.render(
  <BaseStyles>
    <div style={{ height: "100vh" }}>
      <Router />
    </div>
  </BaseStyles>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
