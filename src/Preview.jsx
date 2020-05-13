import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import dompurify from "dompurify";
import uniqid from "uniqid";

const sanitize = html => ({ __html: dompurify.sanitize(html) });

const Preview = ({ id, html, css }) => {
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
      style.textContent = css;
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
  id: PropTypes.string.isRequired,
  html: PropTypes.string.isRequired,
  css: PropTypes.string.isRequired,
};

export default Preview;
