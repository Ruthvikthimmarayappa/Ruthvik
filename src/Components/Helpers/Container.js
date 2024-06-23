import React from "react";

function Container(props) {
  return (
    <div
      className={`flex bg-[#ecf0f3] ${props.className}`}>
      {props.children}
    </div>
  );
}

export default Container;
