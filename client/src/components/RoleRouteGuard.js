import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import Loading from "./Loading";
import { path } from "../ultils/constant";

const {
  hasResolvedAuthProfile,
  resolveAuthRole,
} = require("../ultils/Common/authHelpers");

const RoleRouteGuard = ({
  allowRoles = [],
  children,
  redirectTo = `/he-thong/${path.MANAGE_POSTS}`,
}) => {
  const location = useLocation();
  const { isLoggedIn, role: storedRole } = useSelector((state) => state.auth);
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

  if (
    isLoadingCurrent ||
    (!isCurrentResolved && !hasResolvedAuthProfile(currentData))
  ) {
    return (
      <div className="surface-card flex min-h-[280px] items-center justify-center rounded-[24px] border border-slate-200 bg-white">
        <Loading />
      </div>
    );
  }

  const resolvedRole = resolveAuthRole(currentData?.role, storedRole);

  if (!resolvedRole || !allowRoles.includes(resolvedRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RoleRouteGuard;
