import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { SystemPageHeader } from "../../components";
import * as actions from "../../store/actions";
import actionTypes from "../../store/actions/actionTypes";
import { apiUpdateProfile } from "../../services";

const AUTH_STORAGE_MODE_KEY = "APP_TOKEN_STORAGE";

const sectionClass = "surface-card rounded-[24px] px-5 py-5 lg:px-6";
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900";
const primaryButtonClass =
  "inline-flex min-h-[48px] items-center justify-center whitespace-nowrap rounded-xl bg-slate-700 px-6 text-sm font-semibold leading-none text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60";

const persistRefreshedToken = (token) => {
  if (!token) return;

  const mode = window.localStorage.getItem(AUTH_STORAGE_MODE_KEY);
  const preferSession =
    mode === "session"
    || (!mode && Boolean(window.sessionStorage.getItem("APP_TOKEN")));

  window.localStorage.removeItem("APP_TOKEN");
  window.sessionStorage.removeItem("APP_TOKEN");

  if (preferSession) {
    window.sessionStorage.setItem("APP_TOKEN", token);
  } else {
    window.localStorage.setItem("APP_TOKEN", token);
  }

  if (mode) {
    window.localStorage.setItem(AUTH_STORAGE_MODE_KEY, mode);
  }
};

const createInitialForm = (currentData = {}) => ({
  name: currentData?.name || "",
  phone: currentData?.phone || "",
  zalo: currentData?.zalo || "",
  email: currentData?.email || "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const validateProfileForm = (values) => {
  const errors = {};

  if (!String(values.name || "").trim()) {
    errors.name = "Nhập họ tên.";
  } else if (String(values.name || "").trim().length < 2) {
    errors.name = "Họ tên cần tối thiểu 2 ký tự.";
  }

  if (!/^0\d{8,10}$/.test(String(values.phone || "").trim())) {
    errors.phone = "Số điện thoại không hợp lệ.";
  }

  if (
    values.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email).trim())
  ) {
    errors.email = "Email không hợp lệ.";
  }

  if (values.newPassword || values.currentPassword || values.confirmPassword) {
    if (String(values.newPassword).length < 6) {
      errors.newPassword = "Mật khẩu mới cần tối thiểu 6 ký tự.";
    }
    if (!values.currentPassword) {
      errors.currentPassword = "Nhập mật khẩu hiện tại để đổi mật khẩu.";
    }
    if (values.newPassword !== values.confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }
  }

  return errors;
};

const FieldError = ({ text }) =>
  text ? <p className="mt-2 text-xs font-medium text-rose-600">{text}</p> : null;

const EditProfile = () => {
  const dispatch = useDispatch();
  const { currentData } = useSelector((state) => state.user);
  const [formData, setFormData] = useState(createInitialForm(currentData));
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(createInitialForm(currentData));
  }, [currentData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const nextErrors = validateProfileForm(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        zalo: formData.zalo.trim(),
        email: formData.email.trim(),
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      };

      const response = await apiUpdateProfile(payload);

      if (response?.data?.err === 0) {
        persistRefreshedToken(response?.data?.token);
        dispatch({
          type: actionTypes.LOGIN_SUCCESS,
          data: response?.data?.token,
        });
        await dispatch(actions.getCurrent());
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        setErrors({});

        await Swal.fire({
          icon: "success",
          title: "Đã cập nhật tài khoản",
          text: "Thông tin liên hệ và hồ sơ hiện tại đã được đồng bộ.",
        });
        return;
      }

      await Swal.fire({
        icon: "error",
        title: "Không thể cập nhật",
        text: response?.data?.msg || "Có lỗi xảy ra khi cập nhật tài khoản.",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Không thể cập nhật",
        text:
          error?.response?.data?.msg || "Có lỗi xảy ra khi cập nhật tài khoản.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <SystemPageHeader
        eyebrow="Tài khoản"
        title="Thông tin cá nhân"
        description="Đồng bộ tên, số điện thoại, mật khẩu và thông tin liên hệ của tài khoản hiện tại."
      />

      <section className={sectionClass}>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Hồ sơ liên hệ</h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Thông tin ở đây sẽ được dùng cho phần liên hệ trên bài đăng và trong khu vực quản trị.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="name">
                Họ tên
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
              />
              <FieldError text={errors.name} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="phone">
                Số điện thoại
              </label>
              <input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={inputClass}
                inputMode="numeric"
              />
              <FieldError text={errors.phone} />
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="zalo">
                Zalo
              </label>
              <input
                id="zalo"
                name="zalo"
                value={formData.zalo}
                onChange={handleChange}
                className={inputClass}
                placeholder="Để trống nếu muốn dùng cùng số điện thoại"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="email">
                Gmail
              </label>
              <input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="example@gmail.com"
              />
              <FieldError text={errors.email} />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={primaryButtonClass}
            >
              {isSubmitting ? "Đang cập nhật..." : "Lưu thông tin"}
            </button>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Đổi mật khẩu</h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Chỉ cần nhập khi bạn muốn đổi sang mật khẩu mới.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="currentPassword">
              Mật khẩu hiện tại
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              className={inputClass}
            />
            <FieldError text={errors.currentPassword} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="newPassword">
                Mật khẩu mới
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                className={inputClass}
              />
              <FieldError text={errors.newPassword} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="confirmPassword">
                Xác nhận mật khẩu mới
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={inputClass}
              />
              <FieldError text={errors.confirmPassword} />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={primaryButtonClass}
            >
              {isSubmitting ? "Đang cập nhật..." : "Lưu mật khẩu"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EditProfile;
