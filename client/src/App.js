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
import { FloatingChat } from "./components";

const hasStoredToken = () =>
  Boolean(
    window.sessionStorage.getItem("APP_TOKEN") || window.localStorage.getItem("APP_TOKEN"),
  );

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { currentData } = useSelector((state) => state.user);
  const isAuthRoute = location.pathname === `/${path.LOGIN}`;

  useEffect(() => {
    if (isLoggedIn && !hasStoredToken()) {
      dispatch(actions.logout());
      return;
    }

    if (isLoggedIn && !currentData?.id) {
      dispatch(actions.getCurrent());
    }
  }, [currentData?.id, dispatch, isLoggedIn]);

  useEffect(() => {
    dispatch(actions.getCategories());
    dispatch(actions.getPrices());
    dispatch(actions.getAreas());
    dispatch(actions.getProvinces());
  }, [dispatch]);

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
          <Route path={path.DETAL_POST__TITLE__POSTID} element={<DetailPost />} />
          <Route path="chi-tiet/*" element={<DetailPost />} />
        </Route>
        <Route path={path.SYSTEM} element={<System />}>
          <Route index element={<Navigate to={path.CREATE_POST} replace />} />
          <Route path={path.CREATE_POST} element={<CreatePost />} />
          <Route path={path.MANAGE_POSTS} element={<ManagePosts />} />
          <Route path={path.EDIT_PROFILE} element={<EditProfile />} />
          <Route path={path.CONTACT} element={<ContactInfo />} />
        </Route>
      </Routes>
      {!isAuthRoute && <FloatingChat />}
    </div>
  );
}

export default App;
