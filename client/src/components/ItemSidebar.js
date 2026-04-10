import React, { memo } from "react";
import icons from "../ultils/icons";
import { formatVietnameseToString } from "../ultils/Common/formatVietnameseToString";
import {
  Link,
  createSearchParams,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

const {
  buildSearchParamsObject,
  mergeQueryValues,
} = require("../ultils/Common/queryHelpers");

const { GrNext } = icons;

const ItemSidebar = ({ title, content, isDouble, type }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentQuery = buildSearchParamsObject(searchParams);

  const pairedContent = content?.reduce((result, item, index) => {
    if (index % 2 === 0) {
      result.push({ left: item, right: content[index + 1] || null });
    }
    return result;
  }, []);

  const handleFilterPosts = (code) => {
    const resetPatch = {};

    if (type === "priceCode") {
      resetPatch.priceNumber = null;
    }

    if (type === "areaCode") {
      resetPatch.areaNumber = null;
    }

    const nextQuery = mergeQueryValues(currentQuery, {
      ...resetPatch,
      [type]: code,
      page: 1,
    });

    navigate({
      pathname: location.pathname,
      search: createSearchParams(nextQuery).toString(),
    });
  };

  const isActiveCode = (code) => currentQuery[type] === code;

  return (
    <div className="surface-card w-full rounded-[28px] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {type && currentQuery[type] && (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Đang lọc
          </span>
        )}
      </div>

      {!isDouble && (
        <div className="flex flex-col gap-2">
          {content?.map((item) => {
            const pathname = `/${formatVietnameseToString(item.value)}`;
            const isActive = location.pathname === pathname;

            return (
              <Link
                to={pathname}
                key={item.code}
                className={`flex items-center gap-2 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-amber-50 text-amber-700"
                    : "text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                }`}
              >
                <GrNext size={10} />
                <p>{item.value}</p>
              </Link>
            );
          })}
        </div>
      )}

      {isDouble && (
        <div className="grid gap-2 lg:grid-cols-2">
          {pairedContent?.map((item, index) => (
            <React.Fragment key={`${item.left?.code || "left"}-${index}`}>
              <button
                type="button"
                onClick={() => handleFilterPosts(item.left.code)}
                className={`flex items-center gap-2 rounded-2xl border px-3 py-3 text-left text-sm font-medium transition ${
                  isActiveCode(item.left.code)
                    ? "border-amber-200 bg-amber-50 text-amber-700 shadow-sm"
                    : "border-transparent text-slate-600 hover:border-amber-100 hover:bg-amber-50 hover:text-amber-700"
                }`}
              >
                <GrNext size={10} />
                <p>{item.left.value}</p>
              </button>
              {item.right ? (
                <button
                  type="button"
                  onClick={() => handleFilterPosts(item.right.code)}
                  className={`flex items-center gap-2 rounded-2xl border px-3 py-3 text-left text-sm font-medium transition ${
                    isActiveCode(item.right.code)
                      ? "border-amber-200 bg-amber-50 text-amber-700 shadow-sm"
                      : "border-transparent text-slate-600 hover:border-amber-100 hover:bg-amber-50 hover:text-amber-700"
                  }`}
                >
                  <GrNext size={10} />
                  <p>{item.right.value}</p>
                </button>
              ) : (
                <div />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(ItemSidebar);
