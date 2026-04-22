import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  DetailPost,
  Home,
  Homepage,
  Login,
  Rental,
  SearchDetail,
  StaticPage,
} from "./containers/Public";
import {
  ContactInfo,
  CreatePost,
  EditProfile,
  ManagePosts,
  System,
} from "./containers/System";
import { path } from "./ultils/constant";
import * as actions from "./store/actions";
import { FloatingChat, Loading, RoleRouteGuard } from "./components";

const hasStoredToken = () =>
  Boolean(
    window.sessionStorage.getItem("APP_TOKEN") ||
      window.localStorage.getItem("APP_TOKEN"),
  );

const SystemRouteFallback = () => (
  <div className="surface-card flex min-h-[280px] items-center justify-center rounded-[24px] border border-slate-200 bg-white">
    <Loading />
  </div>
);

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { currentData, isLoadingCurrent, isCurrentResolved } = useSelector(
    (state) => state.user,
  );
  const isAuthRoute = location.pathname === `/${path.LOGIN}`;

  useEffect(() => {
    if (isLoggedIn && !hasStoredToken()) {
      dispatch(actions.logout());
      return;
    }

    if (
      isLoggedIn &&
      !currentData?.id &&
      !isLoadingCurrent &&
      !isCurrentResolved
    ) {
      dispatch(actions.getCurrent());
    }
  }, [
    currentData?.id,
    dispatch,
    isCurrentResolved,
    isLoadingCurrent,
    isLoggedIn,
  ]);

  useEffect(() => {
    dispatch(actions.getCategories());
    dispatch(actions.getPrices());
    dispatch(actions.getAreas());
    dispatch(actions.getProvinces());
  }, [dispatch]);

  useEffect(() => {
    let t;
    if (location.pathname === "/" && (!location.hash || location.hash === "")) {
      t = setTimeout(() => {
        try {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (e) {}
      }, 80);
    }
    return () => clearTimeout(t);
  }, [location.pathname, location.hash]);

  const renderSystemIndex = () => {
    if (isLoggedIn && !currentData?.id && !isCurrentResolved) {
      return <SystemRouteFallback />;
    }

    return currentData?.role === "admin" ? (
      <Navigate to={path.ADMIN_MANAGE_POSTS} replace />
    ) : (
      <Navigate to={path.MANAGE_POSTS} replace />
    );
  };

  return (
    <div className="bg-transparent">
      <Routes>
        <Route path={path.HOME} element={<Home />}>
          <Route path="*" element={<Homepage />} />
          <Route path={path.LOGIN} element={<Login />} />
          <Route path={path.CHO_THUE_CAN_HO} element={<Rental />} />
          <Route path={path.CHO_THUE_MAT_BANG} element={<Rental />} />
          <Route path={path.CHO_THUE_PHONG_TRO} element={<Rental />} />
          <Route path={path.NHA_CHO_THUE} element={<Rental />} />
          <Route path={path.SEARCH} element={<SearchDetail />} />
          <Route path="thong-tin/:slug" element={<StaticPage />} />
          <Route
            path={path.DETAL_POST__TITLE__POSTID}
            element={<DetailPost />}
          />
          <Route path="chi-tiet/*" element={<DetailPost />} />
        </Route>

        <Route path={path.SYSTEM} element={<System />}>
          <Route index element={renderSystemIndex()} />
          <Route
            path={path.CREATE_POST}
            element={
              <RoleRouteGuard
                allowRoles={["user"]}
                redirectTo={`/he-thong/${path.ADMIN_MANAGE_POSTS}`}
              >
                <CreatePost />
              </RoleRouteGuard>
            }
          />
          <Route
            path={path.MANAGE_POSTS}
            element={
              <RoleRouteGuard
                allowRoles={["user"]}
                redirectTo={`/he-thong/${path.ADMIN_MANAGE_POSTS}`}
              >
                <ManagePosts />
              </RoleRouteGuard>
            }
          />
          <Route
            path={path.ADMIN_MANAGE_POSTS}
            element={
              <RoleRouteGuard
                allowRoles={["admin"]}
                redirectTo={`/he-thong/${path.MANAGE_POSTS}`}
              >
                <ManagePosts />
              </RoleRouteGuard>
            }
          />
          <Route
            path={path.EDIT_PROFILE}
            element={
              <RoleRouteGuard allowRoles={["user", "admin"]}>
                <EditProfile />
              </RoleRouteGuard>
            }
          />
          <Route
            path={path.CONTACT}
            element={
              <RoleRouteGuard allowRoles={["user", "admin"]}>
                <ContactInfo />
              </RoleRouteGuard>
            }
          />
        </Route>
      </Routes>
      {!isAuthRoute && <FloatingChat />}
    </div>
  );
}

export default App;
