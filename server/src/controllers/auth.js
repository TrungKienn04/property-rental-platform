import * as authService from "../services/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const PHONE_REGEX = /^0\d{8,10}$/;

const normalizePhone = (phone) =>
  String(phone || "")
    .trim()
    .replace(/\s+/g, "");

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const normalizeRegisterPayload = (payload = {}) => ({
  name: String(payload.name || "").trim(),
  phone: normalizePhone(payload.phone),
  email: normalizeEmail(payload.email),
  password: String(payload.password || ""),
});

const normalizeLoginPayload = (payload = {}) => {
  const rawIdentifier = String(payload.identifier || payload.phone || "").trim();

  return {
    identifier: EMAIL_REGEX.test(rawIdentifier)
      ? normalizeEmail(rawIdentifier)
      : normalizePhone(rawIdentifier),
    password: String(payload.password || ""),
  };
};

export const register = async (req, res) => {
  const normalizedPayload = normalizeRegisterPayload(req.body);
  const { name, phone, email, password } = normalizedPayload;

  try {
    if (!name || !phone || !email || !password) {
      return res.status(400).json({
        err: 1,
        msg: "Vui long nhap day du thong tin.",
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        err: 1,
        msg: "Ho ten phai co it nhat 2 ky tu.",
      });
    }

    if (!PHONE_REGEX.test(phone)) {
      return res.status(400).json({
        err: 1,
        msg: "So dien thoai khong hop le.",
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        err: 1,
        msg: "Email khong hop le.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        err: 1,
        msg: "Mat khau phai co it nhat 6 ky tu.",
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
      msg: "Loi may chu noi bo.",
    });
  }
};

export const login = async (req, res) => {
  const normalizedPayload = normalizeLoginPayload(req.body);
  const { identifier, password } = normalizedPayload;
  const loginWithEmail = EMAIL_REGEX.test(identifier);

  try {
    if (!identifier || !password) {
      return res.status(400).json({
        err: 1,
        msg: "Vui long nhap day du thong tin.",
      });
    }

    if (!loginWithEmail && !PHONE_REGEX.test(identifier)) {
      return res.status(400).json({
        err: 1,
        msg: "So dien thoai khong hop le.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        err: 1,
        msg: "Mat khau phai co it nhat 6 ky tu.",
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
      msg: "Loi may chu noi bo.",
    });
  }
};
