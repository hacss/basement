import React from "react";
import PropTypes from "prop-types";

const warningIcon = (
  <>
    <polygon points="0,22 12,2 24,22" className="fill:$orange400;" />
    <polygon
      points="12,16 11,14 11,8 13,8 13,14"
      className="fill:$orange900;"
    />
    <circle cx="12" cy="18" r="1" className="fill:$orange900;" />
  </>
);

const errorIcon = (
  <>
    <circle cx="12" cy="12" r="12" className="fill:$red600;" />
    <path
      d="M4,8 l3,-3 l4,4 l4,-4 l3,3 l-4,4 l4,4 l-3,3 l-4,-4 l-4,4 l-3,-3 l4,-4"
      className="fill:$red100;"
    />
  </>
);

const Status = props => {
  const icon = props.error ? errorIcon : props.warning ? warningIcon : <></>;

  let details;

  if (props.warning) {
    if (props.warning[0] === "INVALID_RULES") {
      details =
        "Some rule candidates were discarded due to invalid CSS values.";
    } else {
      details = "An unknown warning has occurred.";
    }
  } else if (props.error) {
    switch (props.error[0]) {
      case "CONFIG":
        details = `Invalid configuration: ${props.error[1]}`;
        break;
      case "HACSS":
        details = `
          An error occurred while generating the style sheet. Please review your
          configuration and markup.
        `;
        break;
      default:
        details = "An unknown error has occurred.";
        break;
    }
  } else {
    details = <></>;
  }

  return (
    <div
      className={`
      width:16px;
      height:16px;
      display:inline-block;
      position:relative;
    `}
    >
      <svg viewBox="0 0 24 24" className="icon width:16px; height:16px;">
        {icon}
      </svg>
      <div
        className={`
        position:absolute;
        z-index:1000;
        top:24px;
        right:0;
        min-width:200px;
        padding:8px;
        ${
          props.error
            ? ` background:$red200;
              color:$red800;
              ::before{background:url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%209%205%27%20width=%279px%27%20height=%275px%27%3E%3Cpolygon%20points=%270,5%205,0%209,5%27%20fill=%27$(red200|url-encode)%27%20/%3E%3C/svg%3E');}
            `
            : ` background:$orange200;
              color:$orange800;
              ::before{background:url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%209%205%27%20width=%279px%27%20height=%275px%27%3E%3Cpolygon%20points=%270,5%205,0%209,5%27%20fill=%27$(orange200|url-encode)%27%20/%3E%3C/svg%3E');}
            `
        }
        font-family:$sans;
        font-size:14px;
        box-sizing:border-box;
        icon:not(:hover)+display:none;
        ::before{position:absolute;}
        ::before{content:'';}
        ::before{width:9px;}
        ::before{height:5px;}
        ::before{right:4px;}
        ::before{top:-5px;}
      `}
      >
        {details}
      </div>
    </div>
  );
};

Status.propTypes = {
  error: PropTypes.arrayOf(String),
  warning: PropTypes.arrayOf(String),
};

export default Status;
