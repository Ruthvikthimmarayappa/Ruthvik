import React from "react";

function Button(props) {
  return (
    <button
      type={props.type}
      disabled={props.loading}
      className={` flex gap py-[10px] h-[50px] rounded-[25px] items-center  transition-all text-xl ${
        props.className
      } ${props.white ? `bg-white text-black` : "bg-[#4b70e2] text-[#f9f9f9]"} ${props.loading?"cursor-wait bg-[#4b70e21a]":"hover:bg-gray-500 cursor-pointer"}`}
      onClick={props.onClick}>
      {props.image && (
        <img src={props.image} alt="button" className="h-[50px] w-[50px] p-3" />
      )}
      <p
        className={`m-auto pr-[50px] font-light text-sm  ${
          !props.image ? "pl-[50px]" : "pl-[20px]"
        }`}>
        {props.loading?"Loading...":props.children}
      </p>
    </button>
  );
}

export default Button;
