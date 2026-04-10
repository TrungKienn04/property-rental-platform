import React, { useState } from "react";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SystemPostForm } from "../../components";
import { apiCreateNewPost } from "../../services";
import * as actions from "../../store/actions";
import { path } from "../../ultils/constant";
import {
  createEmptyPostForm,
  toPostPayload,
  validatePostForm,
} from "../../ultils/Common/systemPost";

const CreatePost = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(createEmptyPostForm());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const syncPostCollections = async () =>
    Promise.all([
      dispatch(actions.getPosts()),
      dispatch(actions.getNewPosts()),
      dispatch(actions.getPostsLimit({ page: 1, sort: "latest" })),
    ]);

  const handleSubmit = async () => {
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
          text: "Tin mới đã được lưu vào database và đồng bộ sang danh sách bài mới nhất. Bạn có thể kiểm tra lại ngay trong mục quản lý tin đăng.",
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
          error?.response?.data?.msg
          || "Có lỗi xảy ra trong quá trình lưu bài đăng.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
  );
};

export default CreatePost;
