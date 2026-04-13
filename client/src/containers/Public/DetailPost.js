import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "../../axiosConfig";
import { apiDeletePost, apiForceDeletePost } from "../../services";
import * as actions from "../../store/actions";
import { path } from "../../ultils/constant";

const { canDeletePost } = require("../../ultils/Common/postPermissions");
const { isAdminRole } = require("../../ultils/Common/authHelpers");
const {
  getDisplayDescription,
  getPrimaryImage,
} = require("../../ultils/Common/postHelpers");

const DetailPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { role: storedRole } = useSelector((state) => state.auth);
  const { currentData } = useSelector((state) => state.user);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const placeholder = "/placeholder.svg";
  const resolvedRole = currentData?.role || storedRole;
  const isAdmin = isAdminRole(resolvedRole);
  const canDeleteCurrentPost = canDeletePost({
    role: resolvedRole,
    currentUserId: currentData?.id,
    post,
  });

  useEffect(() => {
    if (!postId) return;

    setLoading(true);
    axios
      .get(`/api/v1/post/${postId}`)
      .then((response) => {
        if (response.data?.err === 0) {
          const nextPost = response.data.response;
          const nextImages = Array.isArray(nextPost?.images?.image)
            ? nextPost.images.image
            : [];

          setPost(nextPost);
          setImages(nextImages.length ? nextImages : [placeholder]);
          setActiveImage(0);
        }
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [postId]);

  const syncPostCollections = async () =>
    Promise.all([
      dispatch(actions.getPosts()),
      dispatch(actions.getNewPosts()),
      dispatch(actions.getPostsLimit({ page: 1, sort: "latest" })),
    ]);

  const handleDeletePost = async () => {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: isAdmin ? "Xóa bài đăng khỏi hệ thống?" : "Xóa bài đăng của bạn?",
      text: isAdmin
        ? "Bài đăng này sẽ bị gỡ khỏi toàn bộ hệ thống. Thao tác này không thể hoàn tác."
        : "Bài đăng này sẽ bị xóa khỏi danh sách quản lý và dữ liệu hiển thị liên quan.",
      showCancelButton: true,
      confirmButtonText: "Xóa bài đăng",
      cancelButtonText: "Quay lại",
      confirmButtonColor: "#dc2626",
    });

    if (!confirmation.isConfirmed) return;

    setIsDeleting(true);

    try {
      const response = isAdmin
        ? await apiForceDeletePost(post.id)
        : await apiDeletePost(post.id);

      if (response?.data?.err === 0) {
        await syncPostCollections();

        await Swal.fire({
          icon: "success",
          title: "Đã xóa bài đăng",
          text: "Dữ liệu hiển thị đã được đồng bộ lại.",
        });

        navigate(`/he-thong/${path.MANAGE_POSTS}`, { replace: true });
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

  if (loading) {
    return <div className="rounded-[28px] bg-white p-8 shadow-sm">Loading...</div>;
  }

  if (!post) {
    return <div className="rounded-[28px] bg-white p-8 shadow-sm">Không tìm thấy bài viết.</div>;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-5 rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm lg:p-8">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
              Chi tiết tin đăng
            </p>
            {isAdmin && (
              <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
                Admin
              </span>
            )}
          </div>
          <h1 className="break-words text-3xl font-semibold leading-tight text-slate-900">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-600">
              {post.attributes?.price}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {post.attributes?.acreage}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">{post.address}</span>
            {canDeleteCurrentPost && (
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeletePost}
                className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Đang xóa..." : "Xóa bài đăng"}
              </button>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] bg-slate-100">
          <img
            src={getPrimaryImage([images[activeImage]], placeholder)}
            alt={post.title}
            className="h-[420px] w-full object-cover"
            onError={(event) => {
              event.target.onerror = null;
              event.target.src = placeholder;
            }}
          />
        </div>

        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-3 lg:grid-cols-6">
            {images.map((image, index) => (
              <button
                type="button"
                key={`${image}-${index}`}
                onClick={() => setActiveImage(index)}
                className={`overflow-hidden rounded-2xl border ${
                  activeImage === index
                    ? "border-amber-500"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <img
                  src={image}
                  alt={`${post.title}-${index}`}
                  className="h-20 w-full object-cover"
                  onError={(event) => {
                    event.target.onerror = null;
                    event.target.src = placeholder;
                  }}
                />
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-5 rounded-[28px] bg-slate-50 p-5 lg:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Mô tả chi tiết</h2>
            {Array.isArray(post.description) ? (
              post.description.map((item, index) => (
                <p key={index} className="break-words text-sm leading-7 text-slate-600">
                  {item}
                </p>
              ))
            ) : (
              <p className="break-words text-sm leading-7 text-slate-600">
                {getDisplayDescription(post.description)}
              </p>
            )}
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Thông tin nhanh</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                <span>Giá thuê</span>
                <span className="font-semibold text-slate-900">{post.attributes?.price}</span>
              </div>
              <div className="flex items-start justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                <span>Diện tích</span>
                <span className="font-semibold text-slate-900">{post.attributes?.acreage}</span>
              </div>
              <div className="flex items-start justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                <span>Địa chỉ</span>
                <span className="text-right font-semibold text-slate-900">{post.address}</span>
              </div>
              <div className="flex items-start justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                <span>Ngày đăng</span>
                <span className="font-semibold text-slate-900">
                  {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {post.address && (
          <div className="space-y-3 rounded-[28px] border border-slate-200 p-5">
            <h3 className="text-lg font-semibold text-slate-900">Bản đồ khu vực</h3>
            <div className="h-[360px] overflow-hidden rounded-[24px]">
              <iframe
                title="map"
                className="h-full w-full border-0"
                src={`https://www.google.com/maps?q=${encodeURIComponent(post.address)}&output=embed`}
              />
            </div>
          </div>
        )}
      </section>

      <aside className="space-y-5">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-2xl font-semibold text-amber-700">
            {post.user?.name?.charAt(0) || "U"}
          </div>
          <h4 className="text-xl font-semibold text-slate-900">
            {post.user?.name || "Chủ nhà"}
          </h4>
          <p className="mt-2 text-sm text-slate-500">Liên hệ trực tiếp để hẹn xem phòng.</p>
          <div className="mt-5 space-y-3">
            <a
              href={`tel:${post.user?.phone || ""}`}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {`Gọi ${post.user?.phone || "liên hệ"}`}
            </a>
            {(post.user?.zalo || post.user?.phone) && (
              <a
                href={`https://zalo.me/${post.user?.zalo || post.user?.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Nhắn Zalo
              </a>
            )}
          </div>
        </div>
        <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
            Gợi ý
          </p>
          <h5 className="mt-3 text-lg font-semibold text-slate-900">
            Ưu tiên liên hệ sớm
          </h5>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            Tin đang hiển thị đầy đủ thông tin, phù hợp để gọi ngay hoặc nhắn Zalo trước
            khi đi xem phòng.
          </p>
        </div>
      </aside>
    </div>
  );
};

export default DetailPost;
