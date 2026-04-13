import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import logo from "../../assets/logowithoutbg.png";
import { Button, User } from "../../components";
import icons from "../../ultils/icons";
import { path } from "../../ultils/constant";
import * as actions from "../../store/actions";
import getMenuManage from "../../ultils/menuManage";

const { isAdminRole } = require("../../ultils/Common/authHelpers");

const { AiOutlineLogout, AiOutlinePlusCircle, BsChevronDown } = icons;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const headerRef = useRef();
  const menuRef = useRef();
  const { isLoggedIn, role: storedRole } = useSelector((state) => state.auth);
  const { currentData } = useSelector((state) => state.user);
  const [isShowMenu, setIsShowMenu] = useState(false);
  const authPath = `/${path.LOGIN}`;
  const isAuthRoute = location.pathname === authPath;
  const isRegisterMode = Boolean(location.state?.flag);
  const authFromPath = location.state?.from || "/";
  const resolvedRole = currentData?.role || storedRole;
  const isAdmin = isAdminRole(resolvedRole);
  const menuItems = getMenuManage(resolvedRole);

  const goLogin = useCallback(
    (flag, fromPath) => {
      const resolvedFromPath =
        fromPath || (isAuthRoute ? authFromPath : `${location.pathname}${location.search}`);

      navigate(authPath, {
        replace: isAuthRoute,
        state: { flag, from: resolvedFromPath },
      });
    },
    [authFromPath, authPath, isAuthRoute, location.pathname, location.search, navigate],
  );

  useEffect(() => {
    headerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.search]);

  useEffect(() => {
    setIsShowMenu(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!isShowMenu) return undefined;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsShowMenu(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isShowMenu]);

  const handleLogout = () => {
    setIsShowMenu(false);
    dispatch(actions.logout());
    navigate(authPath, {
      replace: true,
      state: { flag: false, from: "/" },
    });
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-white/60 bg-white/88 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl"
    >
      <div
        className={`mx-auto flex w-full max-w-[1180px] px-4 lg:px-6 ${
          isAuthRoute
            ? "items-center justify-between gap-4 py-3"
            : "flex-col gap-4 py-3 lg:flex-row lg:items-center lg:justify-between"
        }`}
      >
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Phongtro123"
            className="h-10 w-[168px] object-contain sm:h-11 sm:w-[176px]"
          />
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          {isAuthRoute && !isLoggedIn && (
            <>
              <Button
                text="Đăng nhập"
                textColor={isRegisterMode ? "text-slate-700" : "text-white"}
                bgColor={isRegisterMode ? "bg-slate-100" : "bg-slate-900"}
                className="min-h-[44px] text-sm shadow-none hover:shadow-sm"
                onClick={() => goLogin(false, authFromPath)}
              />
              <Button
                text="Đăng ký"
                textColor={isRegisterMode ? "text-slate-900" : "text-slate-700"}
                bgColor={isRegisterMode ? "bg-amber-400" : "bg-slate-100"}
                className="min-h-[44px] text-sm shadow-none hover:shadow-sm"
                onClick={() => goLogin(true, authFromPath)}
              />
            </>
          )}

          {!isLoggedIn && !isAuthRoute && (
            <>
              <span className="hidden text-sm font-medium text-slate-500 lg:block">
                Phongtro123.com xin chào
              </span>
              <Button
                text="Đăng nhập"
                textColor="text-white"
                bgColor="bg-slate-900"
                className="min-h-[42px] text-sm shadow-none hover:shadow-sm"
                onClick={() => goLogin(false)}
              />
              <Button
                text="Đăng ký"
                textColor="text-slate-900"
                bgColor="bg-amber-400"
                className="min-h-[42px] text-sm shadow-none hover:shadow-sm"
                onClick={() => goLogin(true)}
              />
            </>
          )}

          {isLoggedIn && !isAuthRoute && (
            <div ref={menuRef} className="relative flex items-center gap-2 sm:gap-3">
              <User />
              <Button
                text={isAdmin ? "Bảng quản trị" : "Quản lý tài khoản"}
                textColor="text-white"
                bgColor="bg-slate-900"
                px="px-4"
                IcAfter={BsChevronDown}
                className="min-h-[42px] text-sm shadow-none hover:shadow-sm"
                onClick={() => setIsShowMenu((prev) => !prev)}
              />
              {isShowMenu && (
                <div className="absolute right-0 top-full z-20 mt-3 min-w-[268px] overflow-hidden rounded-[24px] border border-slate-200 bg-white/95 p-3 shadow-[0_24px_60px_rgba(15,23,42,0.14)] backdrop-blur-xl">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {isAdmin ? "Admin mode" : "Tài khoản"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {currentData?.name || "Tài khoản"}
                      </p>
                      {isAdmin && (
                        <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {currentData?.email || currentData?.phone || "Chưa cập nhật liên hệ"}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-col gap-2">
                    {menuItems.map((item) => (
                      <Link
                        className={`flex items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                          item.highlight
                            ? "bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                        key={item.id}
                        to={item.path}
                        onClick={() => setIsShowMenu(false)}
                      >
                        <span className="flex items-center gap-2">
                          {item.icon}
                          {item.text}
                        </span>
                        {item.badge && (
                          <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                      onClick={handleLogout}
                    >
                      <AiOutlineLogout />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isAuthRoute && (
            <Button
              text="Đăng tin mới"
              textColor="text-slate-950"
              bgColor="bg-amber-400"
              IcAfter={AiOutlinePlusCircle}
              className="min-h-[42px] text-sm shadow-none hover:shadow-sm"
              onClick={() =>
                isLoggedIn
                  ? navigate("/he-thong/tao-moi-bai-dang")
                  : goLogin(false, "/he-thong/tao-moi-bai-dang")
              }
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
