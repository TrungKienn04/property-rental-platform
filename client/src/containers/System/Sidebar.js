import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import anonAvatar from "../../assets/anon-avatar.png";
import * as actions from "../../store/actions";
import menuSidebar from "../../ultils/menuSidebar";
import icons from "../../ultils/icons";
import { path } from "../../ultils/constant";

const { AiOutlineLogout, GrLinkPrevious } = icons;

const activeStyle =
  "group flex min-h-[46px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold leading-none text-slate-800 shadow-sm transition";
const inactiveStyle =
  "group flex min-h-[46px] items-center gap-3 rounded-xl px-4 text-sm font-semibold leading-none text-slate-600 transition hover:bg-slate-100 hover:text-slate-950";
const activeItemTextClass = "text-slate-800";
const inactiveItemTextClass = "text-slate-600 group-hover:text-slate-950";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentData } = useSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(actions.logout());
    navigate(`/${path.LOGIN}`, {
      replace: true,
      state: { flag: false, from: "/" },
    });
  };

  return (
    <aside className="surface-card h-fit self-start rounded-[24px] p-4 xl:sticky xl:top-5">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <img
            src={currentData?.avatar || anonAvatar}
            alt="avatar"
            className="h-12 w-12 object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-950">
            {currentData?.name || "Tài khoản"}
          </p>
          <p className="truncate text-sm text-slate-500">
            {currentData?.phone || "Chưa cập nhật số điện thoại"}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {menuSidebar.map((item) => (
          <NavLink
            className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
            key={item.id}
            to={item.path}
          >
            {({ isActive }) => {
              const itemTextClass = isActive
                ? activeItemTextClass
                : inactiveItemTextClass;

              return (
                <>
                  <span
                    className={`flex h-5 w-5 flex-none items-center justify-center ${itemTextClass}`}
                  >
                    {item.icon}
                  </span>
                  <span className={`leading-none ${itemTextClass}`}>
                    {item.text}
                  </span>
                </>
              );
            }}
          </NavLink>
        ))}
      </div>

      <div className="mt-6 space-y-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => navigate("/")}
          className={`${inactiveStyle} w-full justify-start text-left`}
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
