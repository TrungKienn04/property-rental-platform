import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { InputForm } from "../../components";
import * as actions from "../../store/actions";
import icons from "../../ultils/icons";
import { path } from "../../ultils/constant";

const { GrFormClose } = icons;

const createInitialPayload = () => ({
  phone: "",
  password: "",
  name: "",
});

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn, msg } = useSelector((state) => state.auth);
  const [invalidFields, setInvalidFields] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [payload, setPayload] = useState(createInitialPayload());

  const authPath = `/${path.LOGIN}`;
  const isRegister = Boolean(location.state?.flag);
  const successPath =
    location.state?.from && location.state?.from !== authPath
      ? location.state.from
      : "/";
  const closePath = successPath.startsWith("/he-thong") ? "/" : successPath;

  useEffect(() => {
    setInvalidFields({});
    setPayload(createInitialPayload());
  }, [location.state?.flag]);

  useEffect(() => {
    if (isLoggedIn) {
      navigate(successPath, { replace: true });
    }
  }, [isLoggedIn, navigate, successPath]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        navigate(closePath, { replace: true });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closePath, navigate]);

  const switchMode = (nextIsRegister) => {
    navigate(authPath, {
      replace: true,
      state: {
        flag: nextIsRegister,
        from: successPath,
      },
    });
  };

  const validate = (formData) => {
    const nextInvalidFields = {};

    if (isRegister) {
      if (!formData.name) {
        nextInvalidFields.name = "Vui lòng nhập họ tên.";
      } else if (formData.name.length < 2) {
        nextInvalidFields.name = "Họ tên phải có ít nhất 2 ký tự.";
      }
    }

    if (!formData.phone) {
      nextInvalidFields.phone = "Vui lòng nhập số điện thoại.";
    } else if (!/^0\d{8,10}$/.test(formData.phone)) {
      nextInvalidFields.phone =
        "Số điện thoại phải gồm 9-11 số và bắt đầu bằng 0.";
    }

    if (!formData.password) {
      nextInvalidFields.password = "Vui lòng nhập mật khẩu.";
    } else if (formData.password.length < 6) {
      nextInvalidFields.password = "Mật khẩu phải có tối thiểu 6 ký tự.";
    }

    setInvalidFields(nextInvalidFields);
    return Object.keys(nextInvalidFields).length === 0;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const finalPayload = {
      phone: payload.phone.trim().replace(/\s+/g, ""),
      password: payload.password,
      name: payload.name.trim(),
    };

    if (!validate(finalPayload)) return;

    setIsSubmitting(true);

    try {
      if (isRegister) {
        await dispatch(actions.register(finalPayload, { rememberMe }));
      } else {
        await dispatch(
          actions.login(
            {
              phone: finalPayload.phone,
              password: finalPayload.password,
            },
            { rememberMe },
          ),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForm = (event) => {
    event.preventDefault();
    handleSubmit();
  };

  return (
    <section className="flex w-full items-center justify-center">
      <div className="w-full max-w-[640px]">
        <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.16)] backdrop-blur-xl sm:p-8 lg:p-9">
          <button
            type="button"
            onClick={() => navigate(closePath, { replace: true })}
            className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
            aria-label="Đóng hộp thoại tài khoản"
          >
            <GrFormClose size={20} />
          </button>

          <div className="pr-14">
            <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              Tài khoản Phongtro123
            </span>
            <div className="mt-4 space-y-3">
              <h1 className="text-[32px] font-extrabold leading-tight text-slate-950 sm:text-[38px]">
                {isRegister ? "Tạo tài khoản mới" : "Đăng nhập tài khoản"}
              </h1>
              <p className="max-w-[480px] text-[15px] leading-7 text-slate-500">
                {isRegister
                  ? "Điền thông tin cơ bản để bắt đầu đăng tin và quản lý tài khoản trên giao diện gọn gàng, dễ sử dụng."
                  : "Đăng nhập để tiếp tục quản lý bài đăng, thông tin cá nhân và các thao tác trong hệ thống."}
              </p>
            </div>
          </div>

          {msg && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {msg}
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmitForm}>
            {isRegister ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <InputForm
                  label="Họ và tên"
                  placeholder="Nhập họ tên của bạn"
                  value={payload.name}
                  setValue={setPayload}
                  keyPayload="name"
                  invalidFields={invalidFields}
                  setInvalidFields={setInvalidFields}
                  autoComplete="name"
                />
                <InputForm
                  label="Số điện thoại"
                  placeholder="Ví dụ: 0912345678"
                  value={payload.phone}
                  setValue={setPayload}
                  keyPayload="phone"
                  invalidFields={invalidFields}
                  setInvalidFields={setInvalidFields}
                  autoComplete="tel"
                  inputMode="numeric"
                  maxLength={11}
                />
              </div>
            ) : (
              <InputForm
                label="Số điện thoại"
                placeholder="Ví dụ: 0912345678"
                value={payload.phone}
                setValue={setPayload}
                keyPayload="phone"
                invalidFields={invalidFields}
                setInvalidFields={setInvalidFields}
                autoComplete="tel"
                inputMode="numeric"
                maxLength={11}
              />
            )}

            <InputForm
              label="Mật khẩu"
              placeholder={
                isRegister ? "Tạo mật khẩu tối thiểu 6 ký tự" : "Nhập mật khẩu"
              }
              value={payload.password}
              setValue={setPayload}
              keyPayload="password"
              invalidFields={invalidFields}
              setInvalidFields={setInvalidFields}
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              description="Mật khẩu cần tối thiểu 6 ký tự."
            />

            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-amber-400"
                />
                <span>
                  {isRegister
                    ? "Ghi nhớ đăng nhập sau khi tạo tài khoản"
                    : "Ghi nhớ đăng nhập trên thiết bị này"}
                </span>
              </label>
              {!isRegister && (
                <span className="text-sm text-slate-400">
                  Chỉ nên bật trên thiết bị cá nhân.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex min-h-[54px] w-full items-center justify-center rounded-2xl px-5 text-base font-semibold text-slate-950 transition ${
                isSubmitting
                  ? "cursor-not-allowed bg-amber-200"
                  : "bg-amber-400 hover:bg-amber-300"
              }`}
            >
              {isSubmitting
                ? "Đang xử lý..."
                : isRegister
                  ? "Tạo tài khoản"
                  : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={() => switchMode(!isRegister)}
              className="w-fit text-sm font-semibold text-slate-900 transition hover:text-amber-700"
            >
              {isRegister
                ? "Đã có tài khoản? Đăng nhập ngay"
                : "Chưa có tài khoản? Đăng ký tại đây"}
            </button>

            {!isRegister && (
              <p className="text-sm leading-6 text-slate-400">
                Nếu quên mật khẩu, vui lòng dùng số điện thoại đã đăng ký để
                được hỗ trợ.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
