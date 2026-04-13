import React, { memo } from "react";
import {
  createSearchParams,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
const {
  buildSearchParamsObject,
  mergeQueryValues,
} = require("../ultils/Common/queryHelpers");

const PageNumber = ({ text, currentPage, icon, setCurrentPage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isActive = Number(text) === Number(currentPage);
  const isEllipsis = text === "...";

  const scrollToPostsTop = () => {
    try {
      const el = document.getElementById("post-list");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    } catch (e) {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChangePage = () => {
    if (isEllipsis) return;

    const current = buildSearchParamsObject(searchParams);
    const nextQuery = mergeQueryValues(current, {
      page: Number(text),
    });

    setCurrentPage(Number(text));
    navigate({
      pathname: location.pathname,
      search: createSearchParams(nextQuery).toString(),
    });
    // Scroll to list top after navigation to improve UX
    scrollToPostsTop();
  };

  return (
    <button
      type="button"
      className={`flex h-11 min-w-[44px] items-center justify-center rounded-2xl border px-3 text-sm font-semibold transition ${
        isActive
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      } ${isEllipsis ? "cursor-default" : ""}`}
      onClick={handleChangePage}
    >
      {icon || text}
    </button>
  );
};

export default memo(PageNumber);
