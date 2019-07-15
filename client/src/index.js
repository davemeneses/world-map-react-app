import React from "react";
import ReactDOM from "react-dom";

import "leaflet/dist/leaflet.css";
import "bootstrap/dist/css/bootstrap.css";

import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
require("dotenv").config();

ReactDOM.render(<App />, document.getElementById("root"));
serviceWorker.unregister();
