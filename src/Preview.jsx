import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import dompurify from "dompurify";
import uniqid from "uniqid";

const prefix = (prefix, css) =>
  css
    .split("\n")
    .filter(x => x)
    .map(x => [prefix, x].join(" "))
    .join("\n");

const sanitize = html => ({ __html: dompurify.sanitize(html) });

const Preview = ({ html, css }) => {
  const [id] = useState(() => uniqid());
  const [style, setStyle] = useState();

  useEffect(() => {
    const style = document.createElement("style");
    document.head.appendChild(style);
    setStyle(style);
    return () => {
      document.head.appendChild(style);
      setStyle(null);
    };
  }, []);

  useEffect(() => {
    if (style) {
      style.textContent = prefix(`#${id}`, css);
    }
  }, [style, css]);

  return (
    <div
      className="overflow:auto; max-height:100%;"
      id={id}
      dangerouslySetInnerHTML={sanitize(html)}
    />
  );
};

Preview.propTypes = {
  html: PropTypes.string.isRequired,
  css: PropTypes.string.isRequired,
};

export default Preview;
