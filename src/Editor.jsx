import React, { useRef, useState } from "react";
import AceEditor from "react-ace";
import uniqid from "uniqid";
import useDimensions from "./useDimensions";

const options = {
  highlightActiveLine: false,
  showPrintMargin: false,
  useWorker: false,
};

const Editor = props => {
  const [id] = useState(() => uniqid());

  const container = useRef();
  const { width, height } = useDimensions(container);

  return (
    <div
      className={`
        position:absolute;
        top:0;
        right:0;
        bottom:0;
        left:0;
        overflow:hidden;
      `}
      ref={container}
    >
      <AceEditor
        name={id}
        theme="github"
        tabSize={2}
        setOptions={options}
        {...props}
        className="width:100%; height:100%;"
        width={`${width || 0}px`}
        height={`${height || 0}px`}
      />
    </div>
  );
};

export default Editor;
