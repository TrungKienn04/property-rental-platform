import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loading } from "../../components";
import { path } from "../../ultils/constant";
import { Sidebar } from "./";

const System = () => {
  const location = useLocation();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { currentData, isLoadingCurrent, isCurrentResolved } = useSelector(
    (state) => state.user,
  );

  if (!isLoggedIn) {
    return (
      <Navigate
        to={`/${path.LOGIN}`}
        replace
        state={{ flag: false, from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if ((isLoadingCurrent || !isCurrentResolved) && !currentData?.id) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),_transparent_22%),linear-gradient(180deg,_#fffdf8_0%,_#eef2f7_100%)]">
        <div className="mx-auto flex min-h-screen w-full max-w-[1280px] items-center justify-center px-4 py-6 lg:px-6">
          <div className="surface-card flex min-h-[280px] w-full max-w-[420px] items-center justify-center rounded-[24px] border border-slate-200 bg-white">
            <Loading />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),_transparent_22%),linear-gradient(180deg,_#fffdf8_0%,_#eef2f7_100%)]">
      <div className="mx-auto grid w-full max-w-[1280px] gap-5 px-4 py-5 lg:px-6 lg:py-6 xl:grid-cols-[260px_minmax(0,1fr)] xl:items-start">
        <Sidebar />
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default System;
