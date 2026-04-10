import * as authService from "../services/auth";

const normalizeAuthPayload = (payload = {}) => ({
  name: String(payload.name || "").trim(),
  phone: String(payload.phone || "")
    .trim()
    .replace(/\s+/g, ""),
  password: String(payload.password || ""),
});

const isValidPhone = (phone) => /^0\d{8,10}$/.test(phone);

export const register = async (req, res) => {
  const normalizedPayload = normalizeAuthPayload(req.body);
  const { name, phone, password } = normalizedPayload;

  try {
    if (!name || !phone || !password) {
      return res.status(400).json({
        err: 1,
        msg: "Vui lòng nhập đầy đủ thông tin.",
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        err: 1,
        msg: "Họ tên phải có ít nhất 2 ký tự.",
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        err: 1,
        msg: "Số điện thoại không hợp lệ.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        err: 1,
        msg: "Mật khẩu phải có ít nhất 6 ký tự.",
      });
    }

    const response = await authService.registerService(normalizedPayload);
    return res.status(200).json(response);
  } catch (error) {
    console.error(
      "[auth.register] error:",
      error && error.stack ? error.stack : error,
    );
    return res.status(500).json({
      err: -1,
      msg: "Lỗi máy chủ nội bộ.",
    });
  }
};

export const login = async (req, res) => {
  const normalizedPayload = normalizeAuthPayload(req.body);
  const { phone, password } = normalizedPayload;

  try {
    if (!phone || !password) {
      return res.status(400).json({
        err: 1,
        msg: "Vui lòng nhập đầy đủ thông tin.",
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        err: 1,
        msg: "Số điện thoại không hợp lệ.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        err: 1,
        msg: "Mật khẩu phải có ít nhất 6 ký tự.",
      });
    }

    const response = await authService.loginService(normalizedPayload);
    return res.status(200).json(response);
  } catch (error) {
    console.error(
      "[auth.login] error:",
      error && error.stack ? error.stack : error,
    );
    return res.status(500).json({
      err: -1,
      msg: "Lỗi máy chủ nội bộ.",
    });
  }
};
