import React, { useEffect, useState } from "react";
import Editor from "./Editor";
import Feature from "./Feature";
import Preview from "./Preview";
import Status from "./Status";
import TitleBar from "./TitleBar";
import useLocationState from "./useLocationState";
import useStyleWorker from "./useStyleWorker";

const resultCode = result => {
  if (!result) {
    return null;
  }

  if (result.error) {
    return result.error[0];
  }

  if (result.warning) {
    return result.warning[0];
  }

  return null;
};

const App = () => {
  const [[html, config, title], setState] = useLocationState(["", "", ""]);

  const setHtml = html => setState([html, config, title]);
  const setConfig = config => setState([html, config, title]);
  const setTitle = title => setState([html, config, title]);

  const [result, setResult] = useState();
  const [updateCode, updateConfig] = useStyleWorker(setResult);
  useEffect(() => updateCode(html), [html, updateCode]);
  useEffect(() => updateConfig(config), [config, updateConfig]);

  return (
    <div
      className={`
      position:absolute;
      top:0;
      right:0;
      bottom:0;
      left:0;
      background:$scorpion700;
    `}
    >
      <div
        className={`
        position:absolute;
        top:0;
        right:0;
        left:0;
        height:64px;
      `}
      >
        <TitleBar title={title} onTitleChange={setTitle} />
      </div>
      <div
        className={`
        position:absolute;
        top:96px;
        left:32px;
        right:calc(50%+16px);
        @sm-x{right:32px;}
        bottom:calc(50%-16px);
        @sm-y{display:none;}
      `}
      >
        <Feature title="Markup">
          <Editor mode="html" value={html} onChange={setHtml} />
        </Feature>
      </div>
      <div
        className={`
        position:absolute;
        top:96px;
        left:calc(50%+16px);
        right:32px;
        bottom:calc(50%-16px);
        @sm-x{display:none;}
        @sm-y{display:none;}
      `}
      >
        <Feature
          title="Configuration"
          status={
            resultCode(result) === "CONFIG" ? <Status {...result} /> : <></>
          }
        >
          <Editor mode="javascript" value={config} onChange={setConfig} />
        </Feature>
      </div>
      <div
        className={`
        position:absolute;
        top:calc(50%+48px);
        @sm-y{top:96px;}
        left:32px;
        right:32px;
        bottom:32px;
        overflow:hidden;
      `}
      >
        <Feature
          title="Preview"
          status={
            ["HACSS", "INVALID_RULES"].includes(resultCode(result)) ? (
              <Status {...result} />
            ) : (
              <></>
            )
          }
        >
          <Preview html={html} css={(result || {}).css || ""} />
        </Feature>
      </div>
    </div>
  );
};

export default App;
