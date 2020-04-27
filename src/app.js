const hacss = require("hacss");
const example = require("hacss/test/index.html");
const exampleConfig = require("hacss/test/config.js");
const ace = require("ace");
const autoprefixer = require("autoprefixer");
const postcss = require("postcss");
const scopify = require("postcss-scopify");

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

  const optionsEditor = document.createElement("div");
  editPanel.appendChild(optionsEditor);

  markupEditor.className = configEditor.className = optionsEditor.className = `
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
  optionsEditor.classList.add("display:none;");

  optionsEditor.innerHTML = `
    <div class="margin:16px; font-family:$sans-serif; font-size:16px; color:#7e7c8d;">
      <label class="display:flex; align-items:center;">
        <input id="autoprefixerOption" type="checkbox" class="
          appearance:none;
          border-width:1px;
          border-style:solid;
          border-color:#7e7c8d;
          width:16px;
          height:16px;
          :focus{outline-width:1px;}
          :focus{outline-style:solid;}
          :focus{outline-color:#7e7c8d;}
          position:relative;
          ::after{position:absolute;}
          ::after{top:2px;}
          ::after{left:2px;}
          :checked::after{content:'';}
          ::after{width:10px;}
          ::after{height:10px;}
          ::after{background:url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2716px%27%20viewBox=%270%200%2024%2024%27%3E%3Cpath%20d=%27M20.285%202l-11.285%2011.567-5.286-5.011-3.714%203.716%209%208.728%2015-15.285z%27%20fill=%27%23fff%27/%3E%3C/svg%3E');}
          ::after{background-size:10px;}
          ::after{background-repeat:no-repeat;}
          ::after{background-position:center;}
          cbx
        " checked />
        <span class="
          cbx:checked+color:#fff;
          display:inline-block;
          margin-left:4px;
          font-family:$sans-serif;
          font-size:14px;
        ">
          Enable Autoprefixer
        </span>
      </label>
    </div>
  `;

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

  const title = document.createElement("div");
  title.className = "width:100%; display:flex; align-items:center;";
  title.innerHTML = `
    <a href="https://hacss.io/" class="display:inline-flex; align-items:center;">
      <svg width="12.5px" height="16px" viewBox="0 0 400 512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad0" x1="0" y1="0" x2="0" y2="100%">
            <stop offset="62.5%" style="stop-color:white;stop-opacity:1" />
            <stop offset="62.5%" style="stop-color:#9d9bad;stop-opacity:1" />
          </linearGradient>
        </defs>
        <g fill="url(#grad1)">
          <path fill="url(#grad0)" d="M16,0 v256 l16,16 l-32,32 l32,32 l-32,32 l32,32 l-32,32 l32,32 l-32,32 l16,16 h96 v-288 h128 a64,64 0 0 1 64,64 v224 h96 v-224 a160,160 1 0 0 -160,-160 h-128 v-128" />
        </g>
      </svg>
    </a>
    <div class="padding-top:1px; margin-left:6px; font-family:$display; color:#9d9bad; font-size:22px; line-height:1;">Basement</div>
  `;
  editorTogglePanel.appendChild(title);

  const buttonClasses = `
    border:0;
    padding-left:8px;
    padding-right:8px;
    margin-top:0;
    margin-bottom:0;
    margin-right:0;
    margin-left:2px;
    font-family:$sans-serif;
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
  const optionsButton = document.createElement("button");

  markupButton.className = activeButtonClasses;
  configButton.className = optionsButton.className = inactiveButtonClasses;

  const buttons = [markupButton, configButton, optionsButton];
  buttons.forEach(button => editorTogglePanel.appendChild(button));

  const setActiveButton = b => {
    b.className = activeButtonClasses;
    buttons
      .filter(btn => btn !== b)
      .forEach(btn => btn.className = inactiveButtonClasses);
  };

  const features = [markupEditor, configEditor, optionsEditor];

  const setActiveFeature = f => {
    f.classList.remove("display:none;");
    features
      .filter(feat => feat !== f)
      .forEach(feat => feat.classList.add("display:none;"));
  };

  markupButton.innerHTML = "Markup";
  markupButton.addEventListener("click", () => {
    setActiveButton(markupButton);
    setActiveFeature(markupEditor);
  });

  configButton.innerHTML = "Configuration";
  configButton.addEventListener("click", () => {
    setActiveButton(configButton);
    setActiveFeature(configEditor);
  });

  optionsButton.innerHTML = "Options";
  optionsButton.addEventListener("click", () => {
    setActiveButton(optionsButton);
    setActiveFeature(optionsEditor);
  });

  const previewPanel = document.createElement("div");
  previewPanel.id = "previewPanel";
  previewPanel.className = `
    flex-grow:0;
    flex-shrink:0;
    flex-basis:50%;
    overflow:auto;
    position:relative;
  `;
  container.appendChild(previewPanel);

  const [ markupCallback, configCallback, optionsCallback ] = usePreview(
    (code, config, options) => {
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
        const css = hacss(code, parsedConfig);

        style.textContent =
          postcss(
            [scopify("#previewPanel")]
              .concat(options.autoprefixer ? [autoprefixer] : [])
          )
            .process(css)
            .css;

        previewPanel.innerHTML = code.replace("<!DOCTYPE html>", "");
      }
      catch (_) {
        // TODO: Fix issue upstream.
        return;
      }
    },
    example,
    exampleConfig,
    { autoprefixer: true },
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
    exampleConfig,
    configCallback,
  );

  autoprefixerOption.addEventListener("change", () => optionsCallback({
    autoprefixer: autoprefixerOption.checked,
  }));

  function usePreview(callback, initialCode, initialConfig, initialOptions) {
    let code = initialCode;
    let config = initialConfig;
    let options = initialOptions;
    return [
      c => callback(code = c, config, options),
      c => callback(code, config = c, options),
      o => callback(code, config, options = o),
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
