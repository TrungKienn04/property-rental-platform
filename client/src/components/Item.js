import React, { memo, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import icons from "../ultils/icons";
import { formatVietnameseToString } from "../ultils/Common/formatVietnameseToString";
import { apiDeletePost, apiForceDeletePost } from "../services";

const {
  canDeletePost,
} = require("../ultils/Common/postPermissions");
const { isAdminRole } = require("../ultils/Common/authHelpers");
const {
  getDisplayDescription,
  getShortAddress,
} = require("../ultils/Common/postHelpers");

const { GrStar, RiHeartFill, RiHeartLine, BsBookmarkStarFill } = icons;

const normalizeImages = (images) =>
  Array.isArray(images) ? images.filter(Boolean) : [];

const Item = ({
  images,
  user,
  userId,
  title,
  star,
  description,
  attributes,
  address,
  id,
  onDeleteSuccess,
}) => {
  const [isHoverHeart, setIsHoverHeart] = useState(false);
  const [hiddenImages, setHiddenImages] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const { role: storedRole } = useSelector((state) => state.auth);
  const { currentData } = useSelector((state) => state.user);
  const placeholder = "/placeholder.svg";
  const safeImages = normalizeImages(images);
  const resolvedRole = currentData?.role || storedRole;
  const isAdmin = isAdminRole(resolvedRole);
  const canDeleteCurrentPost = canDeletePost({
    role: resolvedRole,
    currentUserId: currentData?.id,
    post: { id, userId },
  });

  useEffect(() => {
    setHiddenImages([]);
  }, [id, images]);

  const visibleImages = safeImages.filter(
    (image) => !hiddenImages.includes(image),
  );
  const previewImage = visibleImages.length ? visibleImages[0] : null;
  const detailPath = `/chi-tiet/${formatVietnameseToString(title)}/${id}`;
  const imageCount = visibleImages.length || safeImages.length;

  const handleHideImage = (image) => {
    if (!image) return;
    setHiddenImages((prev) => (prev.includes(image) ? prev : [...prev, image]));
  };

  const handleDeletePost = async () => {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: isAdmin ? "Xóa bài đăng khỏi hệ thống?" : "Xóa bài đăng của bạn?",
      text: isAdmin
        ? "Bài đăng sẽ bị gỡ khỏi toàn bộ hệ thống. Thao tác này không thể hoàn tác."
        : "Bài đăng sẽ bị xóa khỏi danh sách quản lý và các dữ liệu hiển thị liên quan.",
      showCancelButton: true,
      confirmButtonText: "Xóa bài đăng",
      cancelButtonText: "Quay lại",
      confirmButtonColor: "#dc2626",
    });

    if (!confirmation.isConfirmed) return;

    setIsDeleting(true);

    try {
      const response = isAdmin
        ? await apiForceDeletePost(id)
        : await apiDeletePost(id);

      if (response?.data?.err === 0) {
        await onDeleteSuccess?.();

        await Swal.fire({
          icon: "success",
          title: "Đã xóa bài đăng",
          text: "Danh sách hiển thị đã được đồng bộ lại.",
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

  return (
    <article className="surface-card overflow-hidden rounded-[30px]">
      <div className="grid gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Link
          to={detailPath}
          className="group relative block min-h-[180px] overflow-hidden bg-slate-100 lg:min-h-full"
        >
          {previewImage ? (
            <img
              src={previewImage}
              alt={title}
              className="h-full min-h-[180px] w-full object-cover transition duration-500 group-hover:scale-105"
              onError={() => handleHideImage(previewImage)}
            />
          ) : (
            <div className="flex h-full min-h-[180px] items-center justify-center bg-gradient-to-br from-slate-200 via-slate-100 to-white">
              <div className="rounded-[24px] border border-white/70 bg-white/90 px-5 py-4 text-center shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Hình ảnh
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  Chưa có ảnh xem trước
                </p>
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
            <span className="rounded-full bg-slate-950/72 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {imageCount ? `${imageCount} ảnh` : "Tin mới"}
            </span>
            <span
              className="rounded-full bg-white/90 p-2 text-slate-700 shadow-sm backdrop-blur"
              onMouseEnter={() => setIsHoverHeart(true)}
              onMouseLeave={() => setIsHoverHeart(false)}
            >
              {isHoverHeart ? (
                <RiHeartFill size={20} color="#ef4444" />
              ) : (
                <RiHeartLine size={20} />
              )}
            </span>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent" />
        </Link>

        <div className="flex min-w-0 flex-col justify-between px-5 py-5 lg:px-6 lg:py-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-1">
                  {Array.from({ length: Number(star) || 0 }).map((_, index) => (
                    <GrStar
                      key={index}
                      className="star-item"
                      size={15}
                      color="#f59e0b"
                    />
                  ))}
                </div>
                <Link
                  to={detailPath}
                  className="line-clamp-2 text-xl font-extrabold leading-snug text-slate-900 transition hover:text-amber-700"
                >
                  {title}
                </Link>
              </div>
              <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-amber-50">
                <BsBookmarkStarFill size={22} color="#f59e0b" />
              </div>
            </div>

            <div className="grid gap-3 rounded-[24px] border border-slate-200 bg-white/90 p-4 text-sm text-slate-600 md:grid-cols-3">
              <span className="truncate rounded-full bg-emerald-50 px-3 py-2 font-semibold text-emerald-700">
                {attributes?.price}
              </span>
              <span className="truncate rounded-full bg-slate-100 px-3 py-2 font-medium text-slate-700">
                {attributes?.acreage}
              </span>
              <span className="truncate rounded-full bg-slate-100 px-3 py-2 font-medium text-slate-700">
                {getShortAddress(address)}
              </span>
            </div>

            <p className="line-clamp-5 text-sm leading-7 text-slate-500">
              {getDisplayDescription(description)}
            </p>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-3">
              <img
                src={
                  user?.avatar ||
                  "https://lnsel.com/wp-content/uploads/2018/12/anon-avatar-300x300.png"
                }
                alt="avatar"
                className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = placeholder;
                }}
              />
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-slate-900">
                  {user?.name || "Chủ nhà"}
                </p>
                <p className="break-words text-sm text-slate-500">{address}</p>
              </div>
            </div>

            <div className="mt-4 flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
              <a
                href={`tel:${user?.phone || ""}`}
                className="inline-flex min-h-[46px] w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 sm:min-w-[140px] sm:w-auto"
              >
                {`Gọi ${user?.phone || "liên hệ"}`}
              </a>
              <Link
                to={detailPath}
                className="inline-flex min-h-[46px] w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 sm:min-w-[140px] sm:w-auto"
              >
                Xem chi tiết
              </Link>
              {canDeleteCurrentPost && (
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeletePost}
                  className="inline-flex min-h-[46px] w-full items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[120px] sm:w-auto"
                >
                  {isDeleting
                    ? "Đang xóa..."
                    : isAdmin && currentData?.id !== userId
                      ? "Xóa bài"
                      : "Xóa tin"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default memo(Item);
