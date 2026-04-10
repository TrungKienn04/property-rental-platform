import React, { memo } from "react";

const SearchItem = ({
  IconBefore,
  IconAfter,
  text,
  fontWeight,
  defaultText,
}) => {
  return (
    <div className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm transition hover:border-slate-300 hover:shadow">
      <div className="flex min-w-0 items-center gap-3">
        <span className="text-lg text-slate-700">{IconBefore}</span>
        <span
          className={`truncate ${
            fontWeight || text ? "font-semibold text-slate-900" : ""
          }`}
        >
          {text || defaultText}
        </span>
      </div>
      <span className="text-slate-400">{IconAfter}</span>
    </div>
  );
};

export default memo(SearchItem);
