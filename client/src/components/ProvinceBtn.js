import React, { memo } from "react";
import {
  createSearchParams,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { path } from "../ultils/constant";

const {
  buildSearchParamsObject,
  mergeQueryValues,
} = require("../ultils/Common/queryHelpers");

const ProvinceBtn = ({ name, image, code }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const placeholder = "/placeholder.svg";
  const currentQuery = buildSearchParamsObject(searchParams);
  const isActive = currentQuery.provinceCode === code;

  const handleSelectProvince = () => {
    const nextQuery = mergeQueryValues(currentQuery, {
      provinceCode: code,
      page: 1,
    });

    navigate(
      {
        pathname: `/${path.SEARCH}`,
        search: createSearchParams(nextQuery).toString(),
      },
      {
        state: {
          titleSearch: `Cho thuê tại ${name}`,
          from: location.pathname,
        },
      },
    );
  };

  return (
    <button
      type="button"
      onClick={handleSelectProvince}
      className={`group overflow-hidden rounded-[28px] border text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        isActive
          ? "border-amber-300 bg-amber-50/80 shadow-[0_20px_40px_rgba(245,158,11,0.18)]"
          : "border-slate-200 bg-white/95"
      }`}
    >
      <div className="relative overflow-hidden">
        <img
          src={image || placeholder}
          alt={name}
          className="h-[168px] w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = placeholder;
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-900/5 to-transparent" />
      </div>

      <div className="space-y-2 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
            Khu vực nổi bật
          </p>
          {isActive && (
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700 shadow-sm">
              Active
            </span>
          )}
        </div>
        <div className="text-lg font-bold text-slate-900">{name}</div>
      </div>
    </button>
  );
};

export default memo(ProvinceBtn);
