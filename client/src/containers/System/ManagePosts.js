import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import {
  ConfirmDialog,
  Loading,
  SystemPageHeader,
  SystemPostForm,
} from "../../components";
import {
  apiDeleteAdminPost,
  apiDeletePost,
  apiGetAdminPosts,
  apiGetUserPosts,
  apiUpdateAdminPostStatus,
  apiUpdatePost,
} from "../../services";
import * as actions from "../../store/actions";
import { path } from "../../ultils/constant";
import {
  ADMIN_POST_FILTERS,
  POST_STATUS,
  SYSTEM_POST_PAGE_SIZE,
  createDetailPath,
  getAdminStatusActions,
  getPostStatusMeta,
  normalizePostFormFromRecord,
  toPostPayload,
  validatePostForm,
} from "../../ultils/Common/systemPost";

const {
  isAdminRole,
  isBlockedUserStatus,
} = require("../../ultils/Common/authHelpers");
const {
  canDeletePost,
  canEditManagedPost,
} = require("../../ultils/Common/postPermissions");

const summaryCardClass =
  "surface-card rounded-[22px] border border-slate-200 bg-white px-5 py-5 lg:px-6";
const postCardClass =
  "surface-card h-full rounded-[22px] border border-slate-200 bg-white p-4 transition";
const actionButtonBaseClass =
  "inline-flex min-h-[42px] items-center justify-center whitespace-nowrap rounded-md border px-4 text-sm font-semibold leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200";

const formatDate = (value) => {
  const date = value ? new Date(value) : null;

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "--";

  return date.toLocaleDateString("vi-VN");
};

const normalizePage = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};

const getAdminTabKey = (status) => String(status || "").trim() || "all";
const getAdminPageParamName = (status) => `page_${getAdminTabKey(status)}`;

const readCurrentPage = ({ isAdmin, searchParams, status }) =>
  isAdmin
    ? normalizePage(searchParams.get(getAdminPageParamName(status)))
    : normalizePage(searchParams.get("page"));

const updateStatusFilterParams = (searchParams, status) => {
  const nextParams = new URLSearchParams(searchParams);

  if (status) {
    nextParams.set("status", status);
  } else {
    nextParams.delete("status");
  }

  return nextParams;
};

const updatePageParams = (searchParams, { isAdmin, status, page }) => {
  const nextParams = new URLSearchParams(searchParams);

  if (isAdmin) {
    nextParams.set(getAdminPageParamName(status), String(page));
    return nextParams;
  }

  nextParams.set("page", String(page));
  return nextParams;
};

const buildVisiblePages = (currentPage, totalPages) => {
  if (!totalPages) return [];

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  const visible = [];

  if (start > 1) {
    visible.push(1);
    if (start > 2) visible.push("...");
  }

  for (let page = start; page <= end; page += 1) {
    visible.push(page);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) visible.push("...");
    visible.push(totalPages);
  }

  return visible;
};

const getDialogActionContent = (action) => {
  switch (action?.key) {
    case "approve":
      return {
        title: "Duyệt bài đăng",
        confirmText: "Duyệt",
        successTitle: "Đã duyệt bài đăng",
        successText: "Bài đăng đã chuyển sang trạng thái đang hiển thị.",
      };
    case "reject":
      return {
        title: "Từ chối bài đăng",
        confirmText: "Từ chối",
        successTitle: "Đã từ chối bài đăng",
        successText: "Bài đăng đã chuyển sang trạng thái từ chối.",
      };
    case "hide":
      return {
        title: "Ẩn bài đăng",
        confirmText: "Ẩn bài",
        successTitle: "Đã ẩn bài đăng",
        successText: "Bài đăng đã chuyển sang trạng thái đã ẩn.",
      };
    case "reopen-rejected":
      return {
        title: "Gỡ bài từ chối",
        confirmText: "Gỡ",
        successTitle: "Đã gỡ bài từ chối",
        successText: "Bài đăng đã quay lại tab chờ duyệt.",
      };
    case "unhide":
      return {
        title: "Gỡ ẩn bài đăng",
        confirmText: "Gỡ ẩn",
        successTitle: "Đã gỡ ẩn bài đăng",
        successText: "Bài đăng đã quay lại tab đang hiển thị.",
      };
    case "restore-deleted":
      return {
        title: "Hoàn tác bài đăng",
        confirmText: "Hoàn tác",
        successTitle: "Đã hoàn tác bài đăng",
        successText: "Bài đăng đã quay về tab trước khi xóa.",
      };
    case "soft-delete-pending":
    case "soft-delete-published":
    case "soft-delete-rejected":
    case "soft-delete-hidden":
    case POST_STATUS.DELETED:
      return {
        title: "Xóa bài đăng",
        confirmText: "Xóa",
        successTitle: "Đã xóa mềm bài đăng",
        successText: "Bài đăng đã chuyển sang tab đã xóa.",
      };
    default:
      return {
        title: "Cập nhật trạng thái",
        confirmText: "Xác nhận",
        successTitle: "Đã cập nhật trạng thái",
        successText: "Trạng thái bài đăng đã được cập nhật.",
      };
  }
};

const Pagination = ({ currentPage, totalPages, onChange }) => {
  const pages = useMemo(
    () => buildVisiblePages(currentPage, totalPages),
    [currentPage, totalPages],
  );

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="flex h-11 min-w-[44px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ‹
      </button>
      {pages.map((page, index) => (
        <button
          key={`${page}-${index}`}
          type="button"
          disabled={page === "..."}
          onClick={() => {
            if (page !== "...") {
              onChange(page);
            }
          }}
          className={`flex h-11 min-w-[44px] items-center justify-center rounded-2xl border px-3 text-sm font-semibold transition ${
            Number(page) === Number(currentPage)
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
          } ${page === "..." ? "cursor-default" : ""}`}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="flex h-11 min-w-[44px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ›
      </button>
    </div>
  );
};

const ManagePosts = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.app);
  const { currentData } = useSelector((state) => state.user);
  const { role: storedRole } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeActionKey, setActiveActionKey] = useState("");
  const [statusCounts, setStatusCounts] = useState({});
  const [editingPostId, setEditingPostId] = useState("");
  const [editingPostSnapshot, setEditingPostSnapshot] = useState(null);
  const [editFormData, setEditFormData] = useState(
    normalizePostFormFromRecord(),
  );
  const [editErrors, setEditErrors] = useState({});
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    count: 0,
    totalPages: 0,
    limit: SYSTEM_POST_PAGE_SIZE,
  });

  const activeStatusFilter = searchParams.get("status") || "";
  const resolvedRole = currentData?.role || storedRole;
  const isAdmin = isAdminRole(resolvedRole);
  const currentUserId = currentData?.id || "";
  const currentUserStatus = currentData?.status || "";
  const isBlockedUser = isBlockedUserStatus(currentUserStatus);
  const currentPage = readCurrentPage({
    isAdmin,
    searchParams,
    status: activeStatusFilter,
  });

  const categoryMap = useMemo(
    () =>
      Object.fromEntries(
        (categories || []).map((item) => [item.code, item.value]),
      ),
    [categories],
  );

  const editingPost = useMemo(() => {
    if (!editingPostId) return null;

    return (
      posts.find((item) => item.id === editingPostId) || editingPostSnapshot
    );
  }, [editingPostId, editingPostSnapshot, posts]);

  const totalCount = useMemo(() => {
    const summaryCount = Object.values(statusCounts || {}).reduce(
      (sum, count) => sum + (Number(count) || 0),
      0,
    );

    return summaryCount || pagination.count || 0;
  }, [pagination.count, statusCounts]);

  const syncPublicPostLists = useCallback(
    () =>
      Promise.all([
        dispatch(actions.getPosts()),
        dispatch(actions.getNewPosts()),
        dispatch(actions.getPostsLimit({ page: 1, sort: "latest" })),
      ]),
    [dispatch],
  );

  const fetchPosts = useCallback(async () => {
    setLoading(true);

    try {
      const query = {
        page: currentPage,
        limit: SYSTEM_POST_PAGE_SIZE,
      };

      if (isAdmin && activeStatusFilter) {
        query.status = activeStatusFilter;
      }

      const response = isAdmin
        ? await apiGetAdminPosts(query)
        : await apiGetUserPosts(query);
      const payload = response?.data?.response || {};
      const nextPosts = Array.isArray(payload?.rows)
        ? payload.rows
        : Array.isArray(payload)
          ? payload
          : [];
      const nextPage = normalizePage(payload?.page);

      setPosts(nextPosts);
      setStatusCounts(payload?.countsByStatus || {});
      setPagination({
        page: nextPage,
        count: Number(payload?.count) || nextPosts.length,
        totalPages: Number(payload?.totalPages) || 0,
        limit: Number(payload?.limit) || SYSTEM_POST_PAGE_SIZE,
      });

      if (nextPage !== currentPage) {
        setSearchParams(
          updatePageParams(searchParams, {
            isAdmin,
            status: activeStatusFilter,
            page: nextPage,
          }),
          { replace: true },
        );
      }
    } catch (error) {
      setPosts([]);
      setStatusCounts({});
      setPagination({
        page: 1,
        count: 0,
        totalPages: 0,
        limit: SYSTEM_POST_PAGE_SIZE,
      });
    } finally {
      setLoading(false);
    }
  }, [
    activeStatusFilter,
    currentPage,
    isAdmin,
    searchParams,
    setSearchParams,
  ]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (!editingPostId) return;

    const matchedPost = posts.find((item) => item.id === editingPostId);

    if (matchedPost) {
      setEditingPostSnapshot(matchedPost);
      return;
    }

    if (!loading) {
      setEditingPostId("");
      setEditingPostSnapshot(null);
      setEditErrors({});
    }
  }, [editingPostId, loading, posts]);

  const refreshAfterMutation = useCallback(async () => {
    await Promise.all([syncPublicPostLists(), fetchPosts()]);
  }, [fetchPosts, syncPublicPostLists]);

  const resetEditingState = useCallback(() => {
    setEditingPostId("");
    setEditingPostSnapshot(null);
    setEditErrors({});
    setEditFormData(normalizePostFormFromRecord());
  }, []);

  const handleStatusFilterChange = (status) => {
    setSearchParams(updateStatusFilterParams(searchParams, status));
  };

  const handlePageChange = (page) => {
    setSearchParams(
      updatePageParams(searchParams, {
        isAdmin,
        status: activeStatusFilter,
        page,
      }),
    );
  };

  const handleAdminAction = async (post, action) => {
    if (!isAdmin || action?.actionType !== "status") return;

    const actionKey = `${post.id}:${action.key}`;
    const content = getDialogActionContent(action);
    const confirmation = await Swal.fire({
      icon: action.nextStatus === POST_STATUS.DELETED ? "warning" : "question",
      title: content.title,
      text: `Bài "${post.title}" sẽ được cập nhật theo workflow kiểm duyệt hiện tại.`,
      showCancelButton: true,
      confirmButtonText: content.confirmText,
      cancelButtonText: "Hủy",
      confirmButtonColor:
        action.nextStatus === POST_STATUS.DELETED ? "#dc2626" : undefined,
    });

    if (!confirmation.isConfirmed) return;

    setActiveActionKey(actionKey);

    try {
      const response = await apiUpdateAdminPostStatus(post.id, {
        status: action.nextStatus,
      });

      if (response?.data?.err === 0) {
        await refreshAfterMutation();

        await Swal.fire({
          icon: "success",
          title: content.successTitle,
          text: content.successText,
        });
        return;
      }

      await Swal.fire({
        icon: "error",
        title: "Không thể cập nhật trạng thái",
        text:
          response?.data?.msg || "Máy chủ không chấp nhận thao tác này.",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Không thể cập nhật trạng thái",
        text:
          error?.response?.data?.msg ||
          "Có lỗi xảy ra khi cập nhật trạng thái bài đăng.",
      });
    } finally {
      setActiveActionKey("");
    }
  };

  const handleStartEdit = (post) => {
    setEditingPostId(post.id);
    setEditingPostSnapshot(post);
    setEditFormData(normalizePostFormFromRecord(post));
    setEditErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdatePost = async () => {
    if (!editingPostId || isAdmin) return;

    const nextErrors = validatePostForm(editFormData);
    setEditErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;

    setIsUpdatingPost(true);

    try {
      const response = await apiUpdatePost(
        editingPostId,
        toPostPayload(editFormData),
      );

      if (response?.data?.err === 0) {
        await refreshAfterMutation();
        resetEditingState();

        await Swal.fire({
          icon: "success",
          title: "Đã lưu thay đổi",
          text: "Thông tin bài đăng của bạn đã được cập nhật thành công.",
        });
        return;
      }

      await Swal.fire({
        icon: "error",
        title: "Không thể lưu thay đổi",
        text:
          response?.data?.msg || "Có lỗi xảy ra khi cập nhật bài đăng.",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Không thể lưu thay đổi",
        text:
          error?.response?.data?.msg ||
          "Có lỗi xảy ra khi cập nhật bài đăng.",
      });
    } finally {
      setIsUpdatingPost(false);
    }
  };

  const openDeleteDialog = (post, mode) => {
    setDeleteTarget({ post, mode });
  };

  const handleDelete = async () => {
    if (!deleteTarget?.post?.id) return;

    setIsDeleting(true);

    try {
      if (deleteTarget.mode === "force-delete" && isAdmin) {
        const response = await apiDeleteAdminPost(deleteTarget.post.id);

        if (response?.data?.err === 0) {
          await refreshAfterMutation();
          setDeleteTarget(null);

          await Swal.fire({
            icon: "success",
            title: "Đã xóa vĩnh viễn",
            text: "Bài đăng đã bị xóa khỏi dữ liệu hệ thống.",
          });
          return;
        }

        await Swal.fire({
          icon: "error",
          title: "Không thể xóa vĩnh viễn",
          text:
            response?.data?.msg || "Có lỗi xảy ra khi xóa bài đăng.",
        });
        return;
      }

      const response = await apiDeletePost(deleteTarget.post.id);

      if (response?.data?.err === 0) {
        if (editingPostId === deleteTarget.post.id) {
          resetEditingState();
        }

        await refreshAfterMutation();
        setDeleteTarget(null);

        await Swal.fire({
          icon: "success",
          title: "Đã xóa bài đăng",
          text: "Bài đăng của bạn đã được xóa thành công.",
        });
        return;
      }

      await Swal.fire({
        icon: "error",
        title: "Không thể xóa bài đăng",
        text: response?.data?.msg || "Có lỗi xảy ra khi xóa bài đăng.",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title:
          deleteTarget?.mode === "force-delete"
            ? "Không thể xóa vĩnh viễn"
            : "Không thể xóa bài đăng",
        text:
          error?.response?.data?.msg ||
          (deleteTarget?.mode === "force-delete"
            ? "Có lỗi xảy ra khi xóa vĩnh viễn bài đăng."
            : "Có lỗi xảy ra khi xóa bài đăng."),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderPostCard = (post, options = {}) => {
    const { hideActions = false, highlight = false } = options;
    const statusMeta = getPostStatusMeta(post);
    const adminActions = isAdmin ? getAdminStatusActions(post) : [];
    const isOwner =
      String(currentUserId || "").trim() === String(post.userId || "").trim();
    const canEditThisPost =
      !isAdmin &&
      post.status !== POST_STATUS.DELETED &&
      canEditManagedPost({
        role: resolvedRole,
        currentUserId,
        post,
        currentUserStatus,
      });
    const canDeleteThisPost =
      !isAdmin &&
      post.status !== POST_STATUS.DELETED &&
      canDeletePost({
        role: resolvedRole,
        currentUserId,
        post,
        currentUserStatus,
      });

    return (
      <article
        key={post.id}
        className={`${postCardClass} ${highlight ? "border-slate-900 shadow-[0_26px_60px_rgba(15,23,42,0.08)]" : ""}`}
      >
        <div className="flex h-full flex-col gap-4 sm:flex-row">
          <div className="h-36 w-full overflow-hidden rounded-[18px] bg-slate-100 sm:h-32 sm:w-[160px] sm:flex-none">
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
                  {categoryMap[post.categoryCode] ||
                    post.categoryCode ||
                    "Bài đăng"}
                </p>
                <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-8 text-slate-950">
                  {post.title}
                </h3>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                {highlight ? (
                  <span className="inline-flex whitespace-nowrap rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                    Đang chỉnh sửa
                  </span>
                ) : null}
                <span
                  className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.tone}`}
                >
                  {statusMeta.label}
                </span>
              </div>
            </div>

            <div className="mt-3 space-y-3 text-sm text-slate-500">
              <p className="line-clamp-2">{post.address}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <span>{post.attributes?.price}</span>
                <span>{post.attributes?.acreage}</span>
                <span>Đăng: {formatDate(post.createdAt)}</span>
                {post?.moderatedAt ? (
                  <span>Duyệt: {formatDate(post.moderatedAt)}</span>
                ) : null}
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Trạng thái từ máy chủ
                </p>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  {statusMeta.description}
                </p>
                {statusMeta.note ? (
                  <p className={`mt-2 text-sm font-semibold ${statusMeta.note.tone}`}>
                    {statusMeta.note.label}
                  </p>
                ) : null}
              </div>

              {post?.moderationReason ? (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                    Ghi chú kiểm duyệt
                  </p>
                  <p className="mt-2 text-sm leading-6 text-amber-900">
                    {post.moderationReason}
                  </p>
                </div>
              ) : null}

              {isAdmin ? (
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
                  {post.user?.name ? (
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {post.user.name}
                    </span>
                  ) : null}
                  {post.user?.phone ? (
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {post.user.phone}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>

            {!hideActions ? (
              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                <Link
                  to={createDetailPath(post)}
                  className={`${actionButtonBaseClass} border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900`}
                >
                  Xem
                </Link>

                {!isAdmin && canEditThisPost ? (
                  <button
                    type="button"
                    onClick={() => handleStartEdit(post)}
                    className={`${actionButtonBaseClass} border-slate-900 bg-slate-900 text-white hover:bg-slate-800`}
                  >
                    Sửa
                  </button>
                ) : null}

                {!isAdmin && canDeleteThisPost ? (
                  <button
                    type="button"
                    onClick={() => openDeleteDialog(post, "delete-own")}
                    className={`${actionButtonBaseClass} border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700`}
                  >
                    Xóa
                  </button>
                ) : null}

                {adminActions.map((action) => {
                  const actionKey = `${post.id}:${action.key}`;

                  if (action.actionType === "force-delete") {
                    return (
                      <button
                        key={action.key}
                        type="button"
                        onClick={() => openDeleteDialog(post, "force-delete")}
                        className={`${actionButtonBaseClass} ${action.className}`}
                      >
                        {action.label}
                      </button>
                    );
                  }

                  return (
                    <button
                      key={action.key}
                      type="button"
                      disabled={activeActionKey === actionKey}
                      onClick={() => handleAdminAction(post, action)}
                      className={`${actionButtonBaseClass} ${action.className} disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {activeActionKey === actionKey
                        ? "Đang xử lý..."
                        : action.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </article>
    );
  };

  const primaryAction =
    isAdmin || isBlockedUser ? null : (
      <Link
        to={`/he-thong/${path.CREATE_POST}`}
        className="inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-md bg-slate-700 px-4 text-sm font-semibold leading-none text-white transition hover:bg-slate-800"
      >
        Tạo tin mới
      </Link>
    );

  if (loading) {
    return (
      <div className="surface-card flex min-h-[320px] items-center justify-center rounded-[20px]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!isAdmin && isBlockedUser ? (
        <section className="rounded-[22px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-7 text-rose-700">
          Tài khoản đang bị khóa. Bạn chỉ có thể xem trạng thái bài đăng của mình.
        </section>
      ) : null}

      <SystemPageHeader
        eyebrow={isAdmin ? "Admin mode" : "Bài đăng"}
        title={isAdmin ? "Kiểm duyệt bài đăng" : "Danh sách bài của tôi"}
        description={
          isAdmin
            ? "Mỗi tab chỉ lấy đúng trạng thái từ backend và mọi thao tác đều đi qua workflow kiểm duyệt."
            : "Bạn có thể theo dõi, sửa hoặc xóa bài đăng của chính mình ngay trong khu vực quản lý."
        }
        action={primaryAction}
      />

      {editingPost ? (
        <section className="space-y-4">
          <div className={summaryCardClass}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700">
                  Chỉnh sửa bài đăng
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  Kiểm tra lại toàn bộ thông tin trước khi lưu
                </h2>
              </div>
              <button
                type="button"
                onClick={resetEditingState}
                className="inline-flex min-h-[42px] items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Đóng phần sửa
              </button>
            </div>

            {renderPostCard(editingPost, { hideActions: true, highlight: true })}
          </div>

          <div className="surface-card rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-[0_26px_60px_rgba(15,23,42,0.08)] lg:px-5 lg:py-5">
            <SystemPostForm
              value={editFormData}
              setValue={setEditFormData}
              errors={editErrors}
              onSubmit={handleUpdatePost}
              isSubmitting={isUpdatingPost}
              submitLabel="Lưu thay đổi"
              onCancel={resetEditingState}
              showCancel
            />
          </div>
        </section>
      ) : null}

      <section className={summaryCardClass}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Tổng số
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-950">
                {totalCount}
              </p>
            </div>
            {Object.entries(statusCounts).map(([status, count]) => {
              const meta = getPostStatusMeta({ status });

              return (
                <div key={status} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {meta.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">
                    {count}
                  </p>
                </div>
              );
            })}
          </div>

          {isAdmin ? (
            <div className="flex flex-wrap gap-2">
              {ADMIN_POST_FILTERS.map((item) => {
                const isActive = (activeStatusFilter || "") === item.value;

                return (
                  <button
                    key={item.value || "all"}
                    type="button"
                    onClick={() => handleStatusFilterChange(item.value)}
                    className={`inline-flex min-h-[40px] items-center justify-center rounded-full border px-4 text-sm font-semibold transition ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      {posts.length ? (
        <>
          <section className="grid gap-4 xl:grid-cols-2">
            {posts.map((post) => renderPostCard(post))}
          </section>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onChange={handlePageChange}
          />
        </>
      ) : (
        <div className="surface-card rounded-[20px] border border-dashed border-slate-300 px-5 py-12 text-center">
          <p className="text-lg font-semibold text-slate-950">
            {isAdmin
              ? "Hiện chưa có bài đăng nào khớp bộ lọc này."
              : "Bạn chưa có bài đăng nào."}
          </p>
          {!isAdmin && !isBlockedUser ? (
            <Link
              to={`/he-thong/${path.CREATE_POST}`}
              className="mt-5 inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-md bg-slate-700 px-5 text-sm font-semibold leading-none text-white transition hover:bg-slate-800"
            >
              Đi tới trang đăng tin
            </Link>
          ) : null}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={
          deleteTarget?.mode === "force-delete"
            ? "Xác nhận xóa vĩnh viễn"
            : "Xác nhận xóa bài đăng"
        }
        description={
          deleteTarget?.mode === "force-delete"
            ? `Bài đăng "${deleteTarget?.post?.title || ""}" sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu và dữ liệu liên quan. Thao tác này không thể hoàn tác.`
            : `Bài đăng "${deleteTarget?.post?.title || ""}" sẽ bị xóa khỏi danh sách quản lý của bạn. Thao tác này không thể hoàn tác.`
        }
        confirmLabel={
          deleteTarget?.mode === "force-delete"
            ? "Xóa vĩnh viễn"
            : "Xóa bài đăng"
        }
        cancelLabel="Quay lại"
        onConfirm={handleDelete}
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
