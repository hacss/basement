const hacss = require("hacss");
const testConfig = require("hacss/test/config.js");
const example = require("hacss/test/index.html");
const ace = require("ace");

const hacssPlugins = {
  "global-variables": require("hacss/plugins/global-variables.js"),
  "indexed-variables": require("hacss/plugins/indexed-variables.js"),
};

(function() {
  window.hacssPlugins = hacssPlugins;

  const style = document.createElement("style");
  document.head.appendChild(style);

  const container = document.createElement("div");
  container.className = `
    position:absolute;
    top:0;
    right:0;
    bottom:0;
    left:0;
    display:flex;
    flex-direction:row;
    @small{flex-direction:column;}
    @medium{flex-direction:column;}
  `;
  document.body.insertBefore(container, document.body.firstChild);

  const editPanel = document.createElement("div");
  editPanel.className = `
    background:#1a1817;
    flex-basis:50%;
    flex-grow:0;
    flex-shrink:0;
    position:relative;
  `;
  container.appendChild(editPanel);

  const markupEditor = document.createElement("div");
  editPanel.appendChild(markupEditor);

  const configEditor = document.createElement("div");
  editPanel.appendChild(configEditor);

  markupEditor.className = configEditor.className = `
    position:absolute;
    top:40px;
    right:8px;
    bottom:8px;
    left:8px;
    border-width:2px;
    border-color:#7e7c8d;
    border-style:solid;
  `;

  configEditor.classList.add("display:none;");

  const editorTogglePanel = document.createElement("div");
  editorTogglePanel.className = `
    position:absolute;
    top:8px;
    right:8px;
    left:8px;
    height:32px;
    display:flex;
    align-items:stretch;
    justify-content:flex-end;
  `;
  editPanel.appendChild(editorTogglePanel);

  const title = document.createElement("h1");
  title.className = `
    margin:0;
    font-family:sans-serif;
    font-weight:normal;
    font-size:20px;
    color:#cad1ce;
    width:100%;
    display:inline-flex;
    align-items:center;
  `;
  title.innerText = "Basement Hacss";
  editorTogglePanel.appendChild(title);

  const buttonClasses = `
    border:0;
    padding-left:8px;
    padding-right:8px;
    margin-top:0;
    margin-bottom:0;
    margin-right:0;
    margin-left:2px;
    font-family:sans-serif;
    font-size:14px;
    border-radius:0;
    outline:none;
  `;
  const activeButtonClasses = `
    ${buttonClasses}
    background:#7e7c8d;
    color:#e4e2f3;
  `;
  const inactiveButtonClasses = `
    ${buttonClasses}
    background:#313835;
    :hover{background:#4b524f;}
    color:#cad1ce;
    :hover{color:#e3eae7;}
    cursor:pointer;
  `;

  const markupButton = document.createElement("button");
  const configButton = document.createElement("button");

  markupButton.innerHTML = "Markup";
  markupButton.className = activeButtonClasses;
  markupButton.addEventListener("click", () => {
    configButton.className = inactiveButtonClasses;
    markupButton.className = activeButtonClasses;
    markupEditor.classList.remove("display:none;");
    configEditor.classList.add("display:none;");
  });
  editorTogglePanel.appendChild(markupButton);

  configButton.innerHTML = "Configuration";
  configButton.className = inactiveButtonClasses;
  configButton.addEventListener("click", () => {
    configButton.className = activeButtonClasses;
    markupButton.className = inactiveButtonClasses;
    markupEditor.classList.add("display:none;");
    configEditor.classList.remove("display:none;");
  });
  editorTogglePanel.appendChild(configButton);

  const previewPanel = document.createElement("div");
  previewPanel.className = `
    flex-grow:0;
    flex-shrink:0;
    flex-basis:50%;
    overflow:auto;
    position:relative;
  `;
  container.appendChild(previewPanel);

  const [ markupCallback, configCallback ] = usePreview(
    (code, config) => {
      let parsedConfig;

      try {
        parsedConfig =
          Function(
            config
              .replace(
                /require\(["']hacss\/plugins\/(.*)['"]\)/g,
                (a, b) => `window.hacssPlugins["${b}"]`,
              )
              .replace(/module\.exports\s?=\s?/, "return ")
          )();
      }
      catch (_) {
        return;
      }

      try {
        style.textContent = hacss(code, parsedConfig);
        previewPanel.innerHTML = code;
      }
      catch (_) {
        // TODO: Fix issue upstream.
        return;
      }
    },
    example,
    testConfig,
  );

  initEditor(
    markupEditor,
    "html",
    example,
    markupCallback,
  );

  initEditor(
    configEditor,
    "javascript",
    testConfig,
    configCallback,
  );

  function usePreview(callback, initialCode, initialConfig) {
    let code = initialCode;
    let config = initialConfig;
    return [
      c => callback(code = c, config),
      c => callback(code, config = c),
    ];
  }

  function initEditor(host, mode, initialValue, callback) {
    const editor = ace.edit(host);
    editor.setTheme("ace/theme/kr_theme");
    const session = editor.session;
    session.setMode("ace/mode/" + mode);
    session.setOptions({
      tabSize: 2,
      useSoftTabs: true,
    });
    session.on("change", function() {
      callback(session.getValue());
    });
    session.setValue(initialValue);
  }
})();
