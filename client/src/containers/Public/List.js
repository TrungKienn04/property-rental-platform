import React, { useCallback, useEffect } from "react";
import { Button, Item } from "../../components";
import {
  createSearchParams,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "../../store/actions";
import { scrollToPostList } from "../../ultils/Common/scrollHelpers";
import { path } from "../../ultils/constant";

const {
  buildSearchParamsObject,
  mergeQueryValues,
} = require("../../ultils/Common/queryHelpers");

const List = ({ categoryCode }) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { posts } = useSelector((state) => state.post);
  const { ids: savedIds } = useSelector((state) => state.savedPosts);
  const { isLoggedIn } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const refreshVisiblePosts = useCallback(async () => {
    const currentQuery = buildSearchParamsObject(searchParams);
    const nextQuery = mergeQueryValues(currentQuery, {
      categoryCode,
    });

    await dispatch(actions.getPostsLimit(nextQuery));
  }, [categoryCode, dispatch, searchParams]);

  useEffect(() => {
    refreshVisiblePosts();
  }, [refreshVisiblePosts]);

  // Ensure list section is visible below sticky header/nav.
  const scrollToList = (smooth = true) => {
    const tryScroll = (attempts = 0) => {
      const scrolled = scrollToPostList({ behavior: smooth ? "smooth" : "auto" });
      if (scrolled) return;

      if (attempts < 6) {
        setTimeout(() => tryScroll(attempts + 1), 80);
      }
    };

    tryScroll();
  };

  // If URL includes hash to the list, scroll on mount
  useEffect(() => {
    if (location.hash && location.hash.includes("post-list")) {
      scrollToList(true);
    }
  }, [location.hash]);

  // When filters / search params change, scroll to the list for better UX
  useEffect(() => {
    if (!location.hash || !location.hash.includes("post-list")) return;

    // small delay to allow DOM update after posts refresh
    const t = setTimeout(() => {
      scrollToList(true);
    }, 120);
    return () => clearTimeout(t);
  }, [location.hash, location.search]);

  const handleDeleteSuccess = useCallback(async () => {
    await Promise.all([
      dispatch(actions.getPosts()),
      dispatch(actions.getNewPosts()),
      refreshVisiblePosts(),
    ]);
  }, [dispatch, refreshVisiblePosts]);

  const handleToggleSave = async (postId) => {
    if (!postId) return;

    if (!isLoggedIn) {
      navigate(`/${path.LOGIN}`, {
        state: {
          flag: false,
          from: `${location.pathname}${location.search}${location.hash || ""}`,
        },
      });
      return;
    }

    await dispatch(actions.toggleSavedPost(postId));
  };

  const updateSort = (sort) => {
    const currentQuery = buildSearchParamsObject(searchParams);
    const nextQuery = mergeQueryValues(currentQuery, {
      sort,
      page: 1,
    });

    navigate({
      pathname: location.pathname,
      search: createSearchParams(nextQuery).toString(),
      hash: "#post-list",
    });
  };

  return (
    <section id="post-list" className="surface-card rounded-[32px] p-4 lg:p-6">
      <div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h4 className="text-2xl font-extrabold text-slate-900">
            Danh sách tin đăng
          </h4>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-semibold text-slate-500">
            Sắp xếp
          </span>
          <Button
            bgColor={
              !searchParams.get("sort") ? "bg-slate-900" : "bg-slate-100"
            }
            text="Mặc định"
            textColor={
              !searchParams.get("sort") ? "text-white" : "text-slate-700"
            }
            className="min-h-[42px] text-sm shadow-none hover:shadow-sm"
            onClick={() => updateSort(null)}
          />
          <Button
            bgColor={
              searchParams.get("sort") === "latest"
                ? "bg-amber-400"
                : "bg-slate-100"
            }
            text="Mới nhất"
            textColor={
              searchParams.get("sort") === "latest"
                ? "text-slate-950"
                : "text-slate-700"
            }
            className="min-h-[42px] text-sm shadow-none hover:shadow-sm"
            onClick={() => updateSort("latest")}
          />
        </div>
      </div>

      <div className="space-y-5">
        {posts?.length ? (
          posts.map((item) => (
            <Item
              key={item?.id}
              address={item?.address}
              attributes={item?.attributes}
              description={item?.description}
              images={item?.images?.image}
              star={+item?.star}
              title={item?.title}
              user={item?.user}
              userId={item?.userId}
              id={item?.id}
              onDeleteSuccess={handleDeleteSuccess}
              isSaved={(savedIds || []).includes(item?.id)}
              onToggleSave={() => handleToggleSave(item?.id)}
            />
          ))
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-slate-500">
            Không tìm thấy bài đăng phù hợp với tổ hợp filter hiện tại.
          </div>
        )}
      </div>
    </section>
  );
};

export default List;
