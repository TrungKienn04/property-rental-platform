import React from "react";
import { useSelector } from "react-redux";
import anonAvatar from "../assets/anon-avatar.png";

const { isAdminRole } = require("../ultils/Common/authHelpers");

const User = () => {
  const { role: storedRole } = useSelector((state) => state.auth);
  const { currentData, isLoadingCurrent, isCurrentResolved } = useSelector(
    (state) => state.user,
  );
  const resolvedRole = currentData?.role || storedRole;
  const isAdmin = isAdminRole(resolvedRole);
  const isHydratingUser = (isLoadingCurrent || !isCurrentResolved) && !currentData?.id;

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
        <div className="mt-0.5 flex items-center gap-2">
          <span className="block truncate text-sm font-semibold text-slate-900">
            {isHydratingUser ? "Đang tải..." : currentData?.name || "Tài khoản"}
          </span>
          {isAdmin && (
            <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
              Admin
            </span>
          )}
        </div>
        <span className="block truncate text-xs text-slate-400">
          {isHydratingUser
            ? "Đang đồng bộ quyền"
            : isAdmin
              ? "Quản trị viên"
              : currentData?.email || currentData?.phone || "Thành viên"}
        </span>
      </div>
    </div>
  );
};

export default User;
