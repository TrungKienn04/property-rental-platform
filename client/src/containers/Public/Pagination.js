import React, { useEffect, useMemo, useState } from "react";
import { createSearchParams, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import icons from "../../ultils/icons";
import { PageNumber } from "../../components";

const { GrLinkNext, GrLinkPrevious } = icons;
const {
  buildSearchParamsObject,
  getTotalPages,
  mergeQueryValues,
} = require("../../ultils/Common/queryHelpers");

const Pagination = () => {
  const { count } = useSelector((state) => state.post);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const totalPages = getTotalPages(count);

  useEffect(() => {
    const page = Number(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  const pages = useMemo(() => {
    if (!totalPages) return [];

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    const visible = [];

    if (start > 1) {
      visible.push(1);
      if (start > 2) visible.push("...");
    }

    for (let page = start; page <= end; page += 1) {
      visible.push(page);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) visible.push("...");
      visible.push(totalPages);
    }

    return visible;
  }, [currentPage, totalPages]);

  const goToPage = (page) => {
    const current = buildSearchParamsObject(searchParams);
    const nextQuery = mergeQueryValues(current, {
      page,
    });

    setCurrentPage(page);
    navigate({
      pathname: location.pathname,
      search: createSearchParams(nextQuery).toString(),
    });
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-3">
      <button
        type="button"
        onClick={() => goToPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="flex h-11 min-w-[44px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <GrLinkPrevious />
      </button>
      {pages.map((page, index) => (
        <PageNumber
          key={`${page}-${index}`}
          text={page}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      ))}
      <button
        type="button"
        onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="flex h-11 min-w-[44px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <GrLinkNext />
      </button>
    </div>
  );
};

export default Pagination;
