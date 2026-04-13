import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { ConfirmDialog, Loading, SystemPostForm } from "../../components";
import {
  apiDeletePost,
  apiForceDeletePost,
  apiGetPostsByCurrentUser,
  apiUpdatePost,
} from "../../services";
import * as actions from "../../store/actions";
import { path } from "../../ultils/constant";
import {
  createDetailPath,
  createEmptyPostForm,
  getPostStatusMeta,
  normalizePostFormFromRecord,
  toPostPayload,
  validatePostForm,
} from "../../ultils/Common/systemPost";

const {
  canDeletePost,
  canEditManagedPost,
} = require("../../ultils/Common/postPermissions");
const { isAdminRole } = require("../../ultils/Common/authHelpers");

const summaryCardClass =
  "surface-card rounded-[22px] border border-slate-200 bg-white px-5 py-5 lg:px-6";
const postCardClass =
  "surface-card h-full rounded-[22px] border border-slate-200 bg-white p-4 transition";
const actionButtonBaseClass =
  "inline-flex min-h-[42px] w-full items-center justify-center whitespace-nowrap rounded-md border px-4 text-sm font-semibold leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200";

const formatDate = (value) => {
  const date = value ? new Date(value) : null;

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "--";

  return date.toLocaleDateString("vi-VN");
};

const updateEditorSearchParams = (searchParams, postId) => {
  const nextParams = new URLSearchParams(searchParams);

  if (postId) {
    nextParams.set("edit", postId);
  } else {
    nextParams.delete("edit");
  }

  return nextParams;
};

const ManagePosts = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.app);
  const { currentData } = useSelector((state) => state.user);
  const { role: storedRole } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(createEmptyPostForm());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const activePostId = searchParams.get("edit") || "";
  const resolvedRole = currentData?.role || storedRole;
  const isAdmin = isAdminRole(resolvedRole);
  const currentUserId = currentData?.id || "";

  const categoryMap = useMemo(
    () =>
      Object.fromEntries(
        (categories || []).map((item) => [item.code, item.value]),
      ),
    [categories],
  );

  const activePost = useMemo(
    () => posts.find((item) => item.id === activePostId) || null,
    [activePostId, posts],
  );

  const canEditPost = useCallback(
    (post) => canEditManagedPost({ currentUserId, post }),
    [currentUserId],
  );

  const canDeleteManagedPost = useCallback(
    (post) =>
      canDeletePost({
        role: resolvedRole,
        currentUserId,
        post,
      }),
    [currentUserId, resolvedRole],
  );

  const syncPublicPostLists = async () =>
    Promise.all([
      dispatch(actions.getPosts()),
      dispatch(actions.getNewPosts()),
      dispatch(actions.getPostsLimit({ page: 1, sort: "latest" })),
    ]);

  const fetchPosts = async () => {
    setLoading(true);

    try {
      const response = await apiGetPostsByCurrentUser();
      setPosts(response?.data?.response || []);
    } catch (error) {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const openEditor = useCallback(
    (postId) => {
      setSearchParams(updateEditorSearchParams(searchParams, postId));
    },
    [searchParams, setSearchParams],
  );

  const closeEditor = useCallback(
    (replace = true) => {
      setSearchParams(updateEditorSearchParams(searchParams, ""), { replace });
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!activePostId) {
      setFormData(createEmptyPostForm());
      setErrors({});
      return;
    }

    if (!activePost) {
      closeEditor(true);
      return;
    }

    if (currentUserId && !canEditPost(activePost)) {
      closeEditor(true);
      setFormData(createEmptyPostForm());
      setErrors({});
      return;
    }

    setFormData(normalizePostFormFromRecord(activePost));
    setErrors({});
  }, [
    activePost,
    activePostId,
    canEditPost,
    closeEditor,
    currentUserId,
    loading,
  ]);

  const handleSave = async () => {
    if (!activePostId) return;

    const nextErrors = validatePostForm(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);

    try {
      const response = await apiUpdatePost(
        activePostId,
        toPostPayload(formData),
      );

      if (response?.data?.err === 0) {
        await Promise.all([syncPublicPostLists(), fetchPosts()]);

        await Swal.fire({
          icon: "success",
          title: "Đã cập nhật bài đăng",
          text: "Thông tin mới đã được lưu và đồng bộ lại trong danh sách quản lý.",
        });
        return;
      }

      await Swal.fire({
        icon: "error",
        title: "Không thể cập nhật",
        text: response?.data?.msg || "Có lỗi xảy ra khi lưu thay đổi.",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Không thể cập nhật",
        text: error?.response?.data?.msg || "Có lỗi xảy ra khi lưu thay đổi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id || !canDeleteManagedPost(deleteTarget)) return;

    setIsDeleting(true);

    try {
      const response = isAdmin
        ? await apiForceDeletePost(deleteTarget.id)
        : await apiDeletePost(deleteTarget.id);

      if (response?.data?.err === 0) {
        if (deleteTarget.id === activePostId) {
          closeEditor(true);
        }

        await Promise.all([syncPublicPostLists(), fetchPosts()]);
        setDeleteTarget(null);

        await Swal.fire({
          icon: "success",
          title: "Đã xóa bài đăng",
          text: isAdmin
            ? "Bài đăng đã được gỡ khỏi hệ thống và đồng bộ lại trên giao diện quản trị."
            : "Bài đăng đã được gỡ khỏi danh sách quản lý và dữ liệu hiển thị liên quan.",
        });
        return;
      }

      await Swal.fire({
        icon: "error",
        title: "Không thể xóa",
        text: response?.data?.msg || "Có lỗi xảy ra khi xóa bài đăng.",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Không thể xóa",
        text: error?.response?.data?.msg || "Có lỗi xảy ra khi xóa bài đăng.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderPostCard = (post, { expanded = false } = {}) => {
    const isActive = post.id === activePostId;
    const statusMeta = getPostStatusMeta(post);
    const canEdit = canEditPost(post);
    const canDelete = canDeleteManagedPost(post);
    const isOwner = currentUserId && post.userId === currentUserId;
    const editButtonClass = isActive
      ? "border-slate-800 bg-slate-800 text-white shadow-sm"
      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100";
    const viewButtonClass =
      "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100";
    const deleteButtonClass =
      "border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700 active:bg-rose-100";
    const actionGridClass = expanded
      ? canEdit
        ? "sm:max-w-[420px] sm:grid-cols-3"
        : "sm:max-w-[320px] sm:grid-cols-2"
      : canEdit
        ? "grid-cols-3"
        : "grid-cols-2";

    return (
      <article
        key={`${post.id}-${expanded ? "expanded" : "grid"}`}
        className={`${postCardClass} ${
          isActive
            ? "border-slate-800 shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
            : ""
        }`}
      >
        <div
          className={`flex h-full gap-4 ${
            expanded ? "flex-col lg:flex-row" : "flex-col sm:flex-row"
          }`}
        >
          <div
            className={`overflow-hidden rounded-[18px] bg-slate-100 ${
              expanded
                ? "h-44 w-full lg:h-40 lg:w-[240px] lg:flex-none"
                : "h-36 w-full sm:h-32 sm:w-[160px] sm:flex-none"
            }`}
          >
            <img
              src={post?.images?.image?.[0] || "/placeholder.svg"}
              alt={post.title}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.target.onerror = null;
                event.target.src = "/placeholder.svg";
              }}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {categoryMap[post.categoryCode] || post.categoryCode}
                </p>
                <h3
                  className={`mt-2 font-bold text-slate-950 ${
                    expanded
                      ? "text-2xl leading-tight"
                      : "line-clamp-2 text-lg leading-8"
                  }`}
                >
                  {post.title}
                </h3>
              </div>

              <span
                className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.tone}`}
              >
                {statusMeta.label}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-sm text-slate-500">
              <p className={expanded ? "text-base" : "line-clamp-2"}>
                {post.address}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <span>{post.attributes?.price}</span>
                <span>{post.attributes?.acreage}</span>
                <span>Đăng: {formatDate(post.createdAt)}</span>
              </div>
              {isAdmin && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      isOwner
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {isOwner ? "Tin của bạn" : "Tin của thành viên"}
                  </span>
                  {post.user?.name && (
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {post.user.name}
                    </span>
                  )}
                  {post.user?.phone && (
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {post.user.phone}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className={`mt-auto grid gap-2 pt-5 ${actionGridClass}`}>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => openEditor(post.id)}
                  className={`${actionButtonBaseClass} ${editButtonClass}`}
                >
                  Sửa
                </button>
              )}

              <Link
                to={createDetailPath(post)}
                className={`${actionButtonBaseClass} ${viewButtonClass}`}
              >
                Xem
              </Link>

              {canDelete && (
                <button
                  type="button"
                  onClick={() => setDeleteTarget(post)}
                  className={`${actionButtonBaseClass} ${deleteButtonClass}`}
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-5">
      {loading ? (
        <div className="surface-card flex min-h-[320px] items-center justify-center rounded-[20px]">
          <Loading />
        </div>
      ) : posts.length ? (
        activePost ? (
          <section className="space-y-4">
            {renderPostCard(activePost, { expanded: true })}

            <div className="surface-card rounded-[22px] border border-slate-200 bg-white px-5 py-5 lg:px-6">
              <SystemPostForm
                value={formData}
                setValue={setFormData}
                errors={errors}
                onSubmit={handleSave}
                isSubmitting={isSubmitting}
                submitLabel="Lưu thay đổi"
                showCancel
                onCancel={() => {
                  closeEditor(true);
                  setFormData(createEmptyPostForm());
                  setErrors({});
                }}
              />
            </div>
          </section>
        ) : (
          <>
            <section className={summaryCardClass}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700">
                      {isAdmin ? "Admin mode" : "Quản lý"}
                    </p>
                    {isAdmin && (
                      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
                        Admin
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
                    {isAdmin
                      ? "Quản lý tất cả bài đăng"
                      : "Danh sách bài của tôi"}
                  </h1>
                  <p className="text-sm text-slate-500">
                    {isAdmin
                      ? "Tổng số tin đang quản trị: "
                      : "Số lượng tin đăng: "}
                    <span className="font-semibold text-slate-900">
                      {posts.length} tin
                    </span>
                  </p>
                </div>

                <Link
                  to={`/he-thong/${path.CREATE_POST}`}
                  className="inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-md bg-slate-950 px-4 text-sm font-semibold leading-none text-white transition hover:bg-slate-800"
                >
                  Tạo tin mới
                </Link>
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
              {posts.map((post) => renderPostCard(post))}
            </section>
          </>
        )
      ) : (
        <div className="surface-card rounded-[20px] border border-dashed border-slate-300 px-5 py-12 text-center">
          <p className="text-lg font-semibold text-slate-950">
            {isAdmin
              ? "Hiện chưa có bài đăng nào trên hệ thống."
              : "Bạn chưa có bài đăng nào."}
          </p>
          <Link
            to={`/he-thong/${path.CREATE_POST}`}
            className="mt-5 inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-md bg-slate-950 px-5 text-sm font-semibold leading-none text-white transition hover:bg-slate-800"
          >
            Đi tới trang đăng tin
          </Link>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={isAdmin ? "Xác nhận xóa khỏi hệ thống" : "Xác nhận xóa"}
        description={
          isAdmin && deleteTarget?.userId !== currentUserId
            ? `Bài đăng "${deleteTarget?.title || ""}" sẽ bị gỡ khỏi toàn bộ hệ thống. Đây là thao tác quản trị và không thể hoàn tác.`
            : `Bài đăng "${deleteTarget?.title || ""}" sẽ bị xóa khỏi danh sách quản lý và dữ liệu hiển thị liên quan. Thao tác này không thể hoàn tác.`
        }
        confirmLabel={isAdmin ? "Xóa khỏi hệ thống" : "Xóa bài đăng"}
        cancelLabel="Quay lại"
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
          }
        }}
        isSubmitting={isDeleting}
      />
    </div>
  );
};

export default ManagePosts;
