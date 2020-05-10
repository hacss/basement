import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx";
import ace from "ace";

ace.config.set("basePath", "https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.11");

const container = document.createElement("div");
container.setAttribute(
  "style",
  `
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`,
);
document.body.appendChild(container);

ReactDOM.render(React.createElement(App), container);
