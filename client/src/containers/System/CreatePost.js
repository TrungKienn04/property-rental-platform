import React, { useState } from "react";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SystemPageHeader, SystemPostForm } from "../../components";
import { apiCreateNewPost } from "../../services";
import * as actions from "../../store/actions";
import { path } from "../../ultils/constant";
import {
  createEmptyPostForm,
  toPostPayload,
  validatePostForm,
} from "../../ultils/Common/systemPost";

const { canCreatePost } = require("../../ultils/Common/postPermissions");

const CreatePost = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentData } = useSelector((state) => state.user);
  const { role: storedRole } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState(createEmptyPostForm());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canCreate = canCreatePost({
    role: currentData?.role || storedRole,
    currentUserStatus: currentData?.status,
  });

  const syncPostCollections = async () =>
    Promise.all([
      dispatch(actions.getPosts()),
      dispatch(actions.getNewPosts()),
      dispatch(actions.getPostsLimit({ page: 1, sort: "latest" })),
    ]);

  const handleSubmit = async () => {
    if (!canCreate) {
      await Swal.fire({
        icon: "warning",
        title: "Không thể tạo bài đăng",
        text: "Frontend đang phản ánh trạng thái tài khoản từ backend nên không mở thao tác tạo mới cho tài khoản này.",
      });
      return;
    }

    const nextErrors = validatePostForm(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);

    try {
      const response = await apiCreateNewPost(toPostPayload(formData));

      if (response?.data?.err === 0) {
        await syncPostCollections();

        await Swal.fire({
          icon: "success",
          title: "Đăng tin thành công",
          text: "Tin mới đã được lưu theo dữ liệu backend và danh sách công khai đã được đồng bộ lại.",
          confirmButtonText: "Đi tới quản lý tin",
        });

        setFormData(createEmptyPostForm());
        setErrors({});
        navigate(`/he-thong/${path.MANAGE_POSTS}`);
        return;
      }

      await Swal.fire({
        icon: "error",
        title: "Không thể đăng tin",
        text: response?.data?.msg || "Có lỗi xảy ra trong quá trình lưu bài đăng.",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Không thể đăng tin",
        text:
          error?.response?.data?.msg ||
          "Có lỗi xảy ra trong quá trình lưu bài đăng.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <SystemPageHeader
        eyebrow="Bài đăng"
        title="Tạo bài đăng mới"
        description="Frontend chỉ gửi dữ liệu nội dung, còn trạng thái hiển thị cuối cùng sẽ do backend quyết định."
      />

      {!canCreate ? (
        <section className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-5 text-sm leading-7 text-rose-700">
          Tài khoản hiện không ở trạng thái được phép tạo bài đăng mới. Nếu backend đã khóa tài khoản hoặc trả role không hợp lệ, giao diện sẽ dừng tại đây.
        </section>
      ) : null}

      <div className="max-w-[1040px]">
        <div className="surface-card rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-[0_26px_60px_rgba(15,23,42,0.08)] lg:px-5 lg:py-5">
          <SystemPostForm
            value={formData}
            setValue={setFormData}
            errors={errors}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Đăng tin"
          />
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
