import React, { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Item } from "../../components";
import * as actions from "../../store/actions";
import { path } from "../../ultils/constant";
import { scrollToTop } from "../../ultils/Common/scrollHelpers";

const SavedPosts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { posts, ids } = useSelector((state) => state.savedPosts);

  useEffect(() => {
    if (!isLoggedIn) return;
    dispatch(actions.getSavedPosts());
    dispatch(actions.getSavedPostIds());
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    scrollToTop("auto");
  }, []);

  if (!isLoggedIn) {
    return (
      <Navigate
        to={`/${path.LOGIN}`}
        replace
        state={{ flag: false, from: `${location.pathname}${location.search}` }}
      />
    );
  }

  const handleToggleSave = async (postId) => {
    await dispatch(actions.toggleSavedPost(postId));
  };

  return (
    <section className="surface-card rounded-[32px] border border-slate-200 bg-white p-5 lg:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
            Danh sách
          </p>
          <h2 className="text-2xl font-extrabold text-slate-900">Tin đã lưu</h2>
          <p className="text-sm text-slate-500">
            Bạn có {Array.isArray(posts) ? posts.length : 0} tin đã lưu.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            navigate("/");
            setTimeout(() => scrollToTop("smooth"), 0);
          }}
          className="inline-flex min-h-[42px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
        >
          Về trang chủ
        </button>
      </div>

      {posts?.length ? (
        <div className="space-y-5">
          {posts.map((item) => (
            <Item
              key={item?.id}
              address={item?.address}
              attributes={item?.attributes}
              description={item?.description}
              images={item?.images?.image}
              star={+item?.star}
              title={item?.title}
              user={item?.user}
              id={item?.id}
              isSaved={(ids || []).includes(item?.id)}
              onToggleSave={() => handleToggleSave(item?.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-slate-600">
          Chọn biểu tượng trái tim trên mỗi tin đăng để lưu lại.
        </div>
      )}
    </section>
  );
};

export default SavedPosts;
