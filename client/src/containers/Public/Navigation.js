import React, { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { formatVietnameseToString } from "../../ultils/Common/formatVietnameseToString";
import * as actions from "../../store/actions";
import { scrollToTop } from "../../ultils/Common/scrollHelpers";

const Navigation = ({ isAdmin }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.app);
  const location = useLocation();

  useEffect(() => {
    dispatch(actions.getCategories());
  }, [dispatch]);

  return (
    <div
      id="main-nav"
      className="border-b border-slate-200/80 bg-white/80 backdrop-blur"
    >
      <div
        className={`mx-auto flex w-full max-w-[1180px] flex-wrap gap-2 px-4 py-2.5 lg:px-6 ${
          isAdmin ? "justify-start" : "justify-center"
        }`}
      >
        <NavLink
          to="/"
          end
          onClick={(event) => {
            // Same-route click should still bring user to the top of Home.
            if (location.pathname === "/" && !location.search && !location.hash) {
              event.preventDefault();
              scrollToTop("smooth");
            }
          }}
          className={({ isActive }) =>
            `rounded-full px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-amber-50 hover:text-amber-700"
            }`
          }
        >
          Trang chủ
        </NavLink>
        {categories?.map((item) => (
          <NavLink
            key={item.code}
            to={{
              pathname: `/${formatVietnameseToString(item.value)}`,
              hash: "#post-list",
            }}
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-amber-400 text-slate-950 shadow-sm"
                  : "bg-white text-slate-600 hover:bg-amber-50 hover:text-amber-700"
              }`
            }
          >
            {item.value}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Navigation;
