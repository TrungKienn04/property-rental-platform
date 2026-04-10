import React, { memo } from "react";

const InputForm = ({
  label,
  value,
  setValue,
  keyPayload,
  invalidFields = {},
  setInvalidFields,
  type = "text",
  placeholder = "",
  autoComplete = "off",
  inputMode,
  maxLength,
  description,
  onKeyDown,
}) => {
  const error = invalidFields?.[keyPayload];

  const handleChange = (event) => {
    const nextValue = event.target.value;

    setValue((prev) => ({ ...prev, [keyPayload]: nextValue }));

    if (error && typeof setInvalidFields === "function") {
      setInvalidFields((prev) => {
        if (!prev?.[keyPayload]) return prev;

        const nextInvalidFields = { ...prev };
        delete nextInvalidFields[keyPayload];
        return nextInvalidFields;
      });
    }
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor={keyPayload}
        className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-800"
      >
        <span>{label}</span>
      </label>
      {description && <p className="text-xs text-slate-500">{description}</p>}
      <input
        type={type}
        id={keyPayload}
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-slate-200"
        }`}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        onChange={handleChange}
        onKeyDown={onKeyDown}
      />
      {error && <small className="block text-xs font-medium text-red-500">{error}</small>}
    </div>
  );
};

export default memo(InputForm);
