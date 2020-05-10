import React from "react";
import PropTypes from "prop-types";

const Feature = ({ title, status, children }) => (
  <div
    className={`
    position:absolute;
    top:0;
    right:0;
    bottom:0;
    left:0;
    display:flex;
    flex-direction:column;
    background:$scorpion800;
    color:$scorpion400;
  `}
  >
    <div
      className={`
      font-family:$display;
      font-size:16px;
      line-height:1;
      padding-top:8px;
      padding-x:8px;
      display:flex;
    `}
    >
      <span className="flex:1;">{title}</span>
      {status}
    </div>
    <div
      className={`
        flex:1;
        position:relative;
      `}
    >
      <div
        className={`
        position:absolute;
        top:8px;
        right:8px;
        bottom:8px;
        left:8px;
        background:#fff;
        color:#000;
      `}
      >
        {children}
      </div>
    </div>
  </div>
);

Feature.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  status: PropTypes.element,
};

export default Feature;
