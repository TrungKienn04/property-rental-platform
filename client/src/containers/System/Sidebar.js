import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import anonAvatar from "../../assets/anon-avatar.png";
import { Loading } from "../../components";
import * as actions from "../../store/actions";
import getMenuSidebar from "../../ultils/menuSidebar";
import icons from "../../ultils/icons";
import { path } from "../../ultils/constant";
import { scrollToTop } from "../../ultils/Common/scrollHelpers";

const { isAdminRole } = require("../../ultils/Common/authHelpers");

const { AiOutlineLogout, GrLinkPrevious } = icons;

const activeStyle =
  "group flex min-h-[46px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold leading-none shadow-sm transition";
const inactiveStyle =
  "group flex min-h-[46px] items-center gap-3 rounded-xl px-4 text-sm font-semibold leading-none transition hover:bg-slate-100";

const getLinkClassName = (isActive, highlight = false) => {
  if (isActive) {
    return `${activeStyle} ${
      highlight
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "text-slate-800"
    }`;
  }

  return `${inactiveStyle} ${
    highlight
      ? "text-amber-700 hover:bg-amber-50 hover:text-amber-800"
      : "text-slate-600 hover:text-slate-950"
  }`;
};

const getItemTextClass = (isActive, highlight = false) => {
  if (isActive) {
    return highlight ? "text-amber-700" : "text-slate-800";
  }

  return highlight
    ? "text-amber-700 group-hover:text-amber-800"
    : "text-slate-600 group-hover:text-slate-950";
};

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentData, isLoadingCurrent, isCurrentResolved } = useSelector(
    (state) => state.user,
  );
  const { role: storedRole } = useSelector((state) => state.auth);
  const resolvedRole = currentData?.role || storedRole;
  const isAdmin = isAdminRole(resolvedRole);
  const sidebarItems = getMenuSidebar(resolvedRole);
  const isHydratingUser = (isLoadingCurrent || !isCurrentResolved) && !currentData?.id;

  const handleLogout = () => {
    dispatch(actions.logout());
    navigate(`/${path.LOGIN}`, {
      replace: true,
      state: { flag: false, from: "/" },
    });
  };

  if (isHydratingUser) {
    return (
      <aside className="surface-card h-fit self-start rounded-[24px] p-4 xl:sticky xl:top-5">
        <div className="flex min-h-[240px] items-center justify-center">
          <Loading />
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`surface-card h-fit self-start rounded-[24px] p-4 xl:sticky xl:top-5 ${
        isAdmin ? "ring-1 ring-amber-100" : ""
      }`}
    >
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <img
            src={currentData?.avatar || anonAvatar}
            alt="avatar"
            className="h-12 w-12 object-cover"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-base font-semibold text-slate-950">
              {currentData?.name || "Tài khoản"}
            </p>
            {isAdmin && (
              <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
                Admin
              </span>
            )}
          </div>
          <p className="truncate text-sm text-slate-500">
            {currentData?.email || currentData?.phone || "Chưa cập nhật liên hệ"}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {sidebarItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              getLinkClassName(isActive, item.highlight)
            }
            key={item.id}
            to={item.path}
          >
            {({ isActive }) => {
              const itemTextClass = getItemTextClass(isActive, item.highlight);

              return (
                <>
                  <span
                    className={`flex h-5 w-5 flex-none items-center justify-center ${itemTextClass}`}
                  >
                    {item.icon}
                  </span>
                  <span className={`flex-1 leading-none ${itemTextClass}`}>
                    {item.text}
                  </span>
                  {item.badge && (
                    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
                      {item.badge}
                    </span>
                  )}
                </>
              );
            }}
          </NavLink>
        ))}
      </div>

      <div className="mt-6 space-y-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => {
            navigate("/", { replace: false });
            setTimeout(() => scrollToTop("smooth"), 0);
          }}
          className={`${inactiveStyle} w-full justify-start text-left text-slate-600 hover:text-slate-950`}
        >
          <GrLinkPrevious />
          Thoát
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className={`${inactiveStyle} w-full justify-start text-left text-rose-600 hover:bg-rose-50 hover:text-rose-700`}
        >
          <AiOutlineLogout />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
