import React, { memo } from "react";

const Button = ({
  text,
  textColor,
  bgColor,
  IcAfter,
  onClick,
  fullWidth,
  px,
  className = "",
  disabled = false,
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl py-3 text-center whitespace-nowrap leading-none ${
        px || "px-4"
      } ${textColor} ${bgColor} ${
        fullWidth ? "w-full" : ""
      } font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      onClick={onClick}
    >
      <span>{text}</span>
      <span>{IcAfter && <IcAfter />}</span>
    </button>
  );
};

export default memo(Button);
