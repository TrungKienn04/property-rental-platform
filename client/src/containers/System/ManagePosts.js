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
  countPostsByStatus,
  createDetailPath,
  createEmptyPostForm,
  getAdminStatusActions,
  getPostStatusMeta,
  normalizePostFormFromRecord,
  toPostPayload,
  validatePostForm,
} from "../../ultils/Common/systemPost";

const {
  canDeletePost,
  canEditManagedPost,
  canModeratePost,
} = require("../../ultils/Common/postPermissions");
const {
  isAdminRole,
  isBlockedUserStatus,
} = require("../../ultils/Common/authHelpers");

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

const updateEditorSearchParams = (searchParams, postId) => {
  const nextParams = new URLSearchParams(searchParams);

  if (postId) {
    nextParams.set("edit", postId);
  } else {
    nextParams.delete("edit");
  }

  return nextParams;
};

const updateStatusFilterParams = (searchParams, status) => {
  const nextParams = new URLSearchParams(searchParams);

  if (status) {
    nextParams.set("status", status);
  } else {
    nextParams.delete("status");
  }

  nextParams.delete("edit");
  return nextParams;
};

const getAdminStatusActionContent = (nextStatus) => {
  switch (nextStatus) {
    case "published":
      return {
        title: "Duyệt bài đăng",
        confirmText: "Duyệt bài",
        successTitle: "Đã duyệt bài đăng",
        successText:
          "Tin đã được cập nhật trạng thái hiển thị theo dữ liệu máy chủ.",
      };
    case "rejected":
      return {
        title: "Từ chối bài đăng",
        confirmText: "Xác nhận từ chối",
        successTitle: "Đã từ chối bài đăng",
        successText: "Lý do moderation và trạng thái mới đã được đồng bộ lại.",
      };
    case "hidden":
      return {
        title: "Ẩn bài đăng",
        confirmText: "Ẩn bài",
        successTitle: "Đã ẩn bài đăng",
        successText: "Tin đã được gỡ khỏi trạng thái hiển thị công khai.",
      };
    case "restore":
      return {
        title: "Hiện lại bài đăng",
        confirmText: "Hiện lại bài",
        successTitle: "Đã khôi phục bài đăng",
        successText: "Tin đã được đưa trở lại trạng thái hiển thị.",
      };
    default:
      return {
        title: "Cập nhật trạng thái",
        confirmText: "Xác nhận",
        successTitle: "Đã cập nhật trạng thái",
        successText: "Dữ liệu trạng thái đã được đồng bộ lại.",
      };
  }
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
  const [activeModerationKey, setActiveModerationKey] = useState("");

  const activePostId = searchParams.get("edit") || "";
  const activeStatusFilter = searchParams.get("status") || "";
  const resolvedRole = currentData?.role || storedRole;
  const isAdmin = isAdminRole(resolvedRole);
  const currentUserId = currentData?.id || "";
  const currentUserStatus = currentData?.status || "";
  const isBlockedUser = isBlockedUserStatus(currentUserStatus);

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

  const statusCounts = useMemo(() => countPostsByStatus(posts), [posts]);

  const canEditPost = useCallback(
    (post) =>
      canEditManagedPost({
        role: resolvedRole,
        currentUserId,
        currentUserStatus,
        post,
      }),
    [currentUserId, currentUserStatus, resolvedRole],
  );

  const canDeleteManagedPost = useCallback(
    (post) =>
      canDeletePost({
        role: resolvedRole,
        currentUserId,
        currentUserStatus,
        post,
      }),
    [currentUserId, currentUserStatus, resolvedRole],
  );

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
      const response = isAdmin
        ? await apiGetAdminPosts(
            activeStatusFilter ? { status: activeStatusFilter } : {},
          )
        : await apiGetUserPosts();

      setPosts(response?.data?.response || []);
    } catch (error) {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [activeStatusFilter, isAdmin]);

  const refreshAfterMutation = useCallback(async () => {
    await Promise.all([syncPublicPostLists(), fetchPosts()]);
  }, [fetchPosts, syncPublicPostLists]);

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
  }, [fetchPosts]);

  useEffect(() => {
    if (isAdmin && activePostId) {
      closeEditor(true);
    }
  }, [activePostId, closeEditor, isAdmin]);

  useEffect(() => {
    if (loading || isAdmin) return;

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
    isAdmin,
    loading,
  ]);

  const handleSave = async () => {
    if (!activePostId || isAdmin || isBlockedUser) return;

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
        await refreshAfterMutation();

        await Swal.fire({
          icon: "success",
          title: "Đã cập nhật bài đăng",
          text: "Dữ liệu bài đăng đã được tải lại từ máy chủ và đồng bộ ra danh sách hiển thị.",
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

  const handleStatusFilterChange = (status) => {
    setSearchParams(updateStatusFilterParams(searchParams, status));
  };

  const handleAdminModeration = async (post, action) => {
    if (!canModeratePost({ role: resolvedRole, post })) return;

    const actionKey = `${post.id}:${action.key}`;
    const content = getAdminStatusActionContent(
      action.key === "restore" ? "restore" : action.nextStatus,
    );

    let moderationReason = "";

    if (action.requiresReason) {
      const prompt = await Swal.fire({
        title: content.title,
        text: "Nhập lý do để lưu cùng dữ liệu moderation từ backend.",
        input: "textarea",
        inputLabel: "Lý do moderation",
        inputPlaceholder: "Nhập lý do xử lý bài đăng",
        inputValue: post?.moderationReason || "",
        inputValidator: (value) => {
          if (!String(value || "").trim()) {
            return "Cần nhập lý do cho thao tác này.";
          }

          return undefined;
        },
        showCancelButton: true,
        confirmButtonText: content.confirmText,
        cancelButtonText: "Hủy",
      });

      if (!prompt.isConfirmed) return;
      moderationReason = String(prompt.value || "").trim();
    } else {
      const confirmation = await Swal.fire({
        icon: "question",
        title: content.title,
        text: `Thao tác này sẽ cập nhật trạng thái bài "${post.title}" theo dữ liệu máy chủ.`,
        showCancelButton: true,
        confirmButtonText: content.confirmText,
        cancelButtonText: "Hủy",
      });

      if (!confirmation.isConfirmed) return;
    }

    setActiveModerationKey(actionKey);

    try {
      const response = await apiUpdateAdminPostStatus(post.id, {
        status: action.nextStatus,
        moderationReason,
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
          response?.data?.msg || "Máy chủ không chấp nhận thao tác moderation.",
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
      setActiveModerationKey("");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id || !canDeleteManagedPost(deleteTarget)) return;

    setIsDeleting(true);

    try {
      const response = isAdmin
        ? await apiDeleteAdminPost(deleteTarget.id)
        : await apiDeletePost(deleteTarget.id);

      if (response?.data?.err === 0) {
        if (deleteTarget.id === activePostId) {
          closeEditor(true);
        }

        await refreshAfterMutation();
        setDeleteTarget(null);

        await Swal.fire({
          icon: "success",
          title: "Đã xóa bài đăng",
          text: isAdmin
            ? "Bài đăng đã được xóa khỏi hệ thống và danh sách quản trị đã được tải lại."
            : "Bài đăng đã được xóa và giao diện quản lý đã đồng bộ lại từ backend.",
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
    const adminActions = isAdmin ? getAdminStatusActions(post) : [];
    const isOwner =
      String(currentUserId || "").trim() === String(post.userId || "").trim();

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
                  {categoryMap[post.categoryCode] ||
                    post.categoryCode ||
                    "Bài đăng"}
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

            <div className="mt-3 space-y-3 text-sm text-slate-500">
              <p className={expanded ? "text-base" : "line-clamp-2"}>
                {post.address}
              </p>
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
                  <p
                    className={`mt-2 text-sm font-semibold ${statusMeta.note.tone}`}
                  >
                    {statusMeta.note.label}
                  </p>
                ) : null}
              </div>

              {post?.moderationReason ? (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                    Lý do moderation
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

            <div className="mt-auto flex flex-wrap gap-2 pt-5">
              {canEdit ? (
                <button
                  type="button"
                  onClick={() => openEditor(post.id)}
                  className={`${actionButtonBaseClass} ${
                    isActive
                      ? "border-slate-800 bg-slate-800 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  Sửa
                </button>
              ) : null}

              <Link
                to={createDetailPath(post)}
                className={`${actionButtonBaseClass} border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900`}
              >
                Xem
              </Link>

              {adminActions.map((action) => {
                const actionKey = `${post.id}:${action.key}`;

                return (
                  <button
                    key={action.key}
                    type="button"
                    disabled={activeModerationKey === actionKey}
                    onClick={() => handleAdminModeration(post, action)}
                    className={`${actionButtonBaseClass} ${action.className} disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {activeModerationKey === actionKey
                      ? "Đang xử lý..."
                      : action.label}
                  </button>
                );
              })}

              {canDelete ? (
                <button
                  type="button"
                  onClick={() => setDeleteTarget(post)}
                  className={`${actionButtonBaseClass} border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700`}
                >
                  {isAdmin ? "Xóa khỏi hệ thống" : "Xóa"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </article>
    );
  };

  const primaryAction =
    isAdmin || isBlockedUser ? null : (
      <Link
        to={`/he-thong/${path.CREATE_POST}`}
        className="inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-md bg-slate-950 px-4 text-sm font-semibold leading-none text-white transition hover:bg-slate-800"
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

  if (!isAdmin && activePost) {
    return (
      <div className="space-y-4">
        {isBlockedUser ? (
          <section className="rounded-[22px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-7 text-rose-700">
            Tài khoản đang bị khóa nên frontend chỉ cho xem dữ liệu hiện có. Các
            thao tác ghi sẽ do backend từ chối.
          </section>
        ) : null}

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
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!isAdmin && isBlockedUser ? (
        <section className="rounded-[22px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-7 text-rose-700">
          Tài khoản đang ở trạng thái bị khóa. Bạn vẫn xem được danh sách bài
          nhưng không nên kỳ vọng thao tác tạo/sửa/xóa thành công vì backend sẽ
          chặn.
        </section>
      ) : null}

      <SystemPageHeader
        eyebrow={isAdmin ? "Admin mode" : "Bài đăng"}
        title={isAdmin ? "Kiểm duyệt bài đăng" : "Danh sách bài của tôi"}
        description={
          isAdmin
            ? "Mọi hành động duyệt, từ chối, ẩn và khôi phục đều chỉ phản ánh đúng trạng thái backend trả về."
            : "Quản lý bài đăng cá nhân và theo dõi đúng trạng thái moderation mà máy chủ đang lưu."
        }
        action={primaryAction}
      />

      <section className={summaryCardClass}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Tổng số
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-950">
                {posts.length}
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
        <section className="grid gap-4 xl:grid-cols-2">
          {posts.map((post) => renderPostCard(post))}
        </section>
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
              className="mt-5 inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-md bg-slate-950 px-5 text-sm font-semibold leading-none text-white transition hover:bg-slate-800"
            >
              Đi tới trang đăng tin
            </Link>
          ) : null}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={isAdmin ? "Xác nhận xóa khỏi hệ thống" : "Xác nhận xóa"}
        description={
          isAdmin && deleteTarget?.userId !== currentUserId
            ? `Bài đăng "${deleteTarget?.title || ""}" sẽ bị xóa khỏi hệ thống quản trị. Đây là thao tác quản trị và không thể hoàn tác.`
            : `Bài đăng "${deleteTarget?.title || ""}" sẽ bị xóa và danh sách quản lý sẽ được đồng bộ lại từ backend.`
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
