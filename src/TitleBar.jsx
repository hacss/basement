import React from "react";
import PropTypes from "prop-types";
import useDimensions from "./useDimensions";

const TitleBar = ({ title, onTitleChange }) => (
  <div
    className={`
    position:absolute;
    top:0;
    right:0;
    bottom:0;
    left:0;
    background:$black;
    display:flex;
    flex-direction:row;
    align-items:center;
    padding-x:16px;
  `}
  >
    <a href="https://hacss.io">
      <img
        src="//hacss.io/logo-h.svg"
        alt="Hacss logo"
        className="height:32px;"
      />
    </a>
    <input
      type="text"
      defaultValue={title}
      onInput={e => onTitleChange(e.target.value)}
      className={`
        flex:1;
        width:auto;
        text-overflow:ellipsis;
        border:none;
        margin-left:12px;
        margin-y:0;
        padding-x:8px;
        padding-y:4px;
        background:transparent;
        font-family:$sans;
        font-size:32px;
        letter-spacing:-1px;
        line-height:1;
        color:$dolphin200;
        outline:none;
        :hover:not(:focus){background:$dolphin800;}
        :focus{background:$dolphin700;}
        :focus{color:$dolphin100;}
        transition-property:width;
        transition-duration:500ms;
      `}
    />
  </div>
);

TitleBar.propTypes = {
  title: PropTypes.string,
  onTitleChange: PropTypes.func.isRequired,
};

export default TitleBar;
