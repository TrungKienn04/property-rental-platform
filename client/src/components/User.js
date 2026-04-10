import React from "react";
import { useSelector } from "react-redux";
import anonAvatar from "../assets/anon-avatar.png";

const User = () => {
  const { currentData } = useSelector((state) => state.user);

  return (
    <div className="flex items-center gap-2 rounded-[20px] border border-slate-200 bg-slate-50/95 px-2.5 py-2 shadow-sm">
      <img
        src={currentData?.avatar || anonAvatar}
        alt="avatar"
        className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
        onError={(event) => {
          event.target.onerror = null;
          event.target.src = anonAvatar;
        }}
      />
      <div className="min-w-0">
        <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
          Xin chào
        </span>
        <span className="block truncate text-sm font-semibold text-slate-900">
          {currentData?.name || "Tài khoản"}
        </span>
      </div>
    </div>
  );
};

export default User;
