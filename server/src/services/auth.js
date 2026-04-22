import db from "../models";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { v4 } from "uuid";

require("dotenv").config();

const {
  USER_ROLE,
  USER_STATUS_ACTIVE,
  isBlockedUserStatus,
  normalizeRole,
} = require("../ultis/accessControl");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const normalizePhone = (phone) =>
  String(phone || "")
    .trim()
    .replace(/\s+/g, "");

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const isEmailIdentifier = (value) => EMAIL_REGEX.test(normalizeEmail(value));

const hashPassword = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(12));

const createAccessToken = (user) =>
  jwt.sign(
    { id: user.id, role: normalizeRole(user.role || USER_ROLE) },
    process.env.SECRET_KEY || "secret",
    { expiresIn: "2d" },
  );

const findUserByPhone = (phone) =>
  db.User.findOne({
    where: { phone },
    raw: true,
  });

const findUserByEmail = (email) =>
  db.User.findOne({
    where: {
      [Op.or]: [{ email }, { fbUrl: email }],
    },
    raw: true,
  });

const findUsersByIdentifier = (identifier) => {
  if (isEmailIdentifier(identifier)) {
    const email = normalizeEmail(identifier);
    return db.User.findAll({
      where: {
        [Op.or]: [{ email }, { fbUrl: email }],
      },
      raw: true,
    });
  }

  return db.User.findAll({
    where: { phone: normalizePhone(identifier) },
    raw: true,
  });
};

export const registerService = ({ phone, password, name, email }) =>
  new Promise(async (resolve) => {
    try {
      const normalizedPhone = normalizePhone(phone);
      const normalizedName = String(name || "").trim();
      const normalizedEmail = normalizeEmail(email);

      const [existingPhone, existingEmail] = await Promise.all([
        findUserByPhone(normalizedPhone),
        findUserByEmail(normalizedEmail),
      ]);

      if (existingPhone) {
        return resolve({
          err: 2,
          msg: "So dien thoai nay da duoc su dung.",
          token: null,
        });
      }

      if (existingEmail) {
        return resolve({
          err: 2,
          msg: "Email nay da duoc su dung.",
          token: null,
        });
      }

      const created = await db.User.create({
        id: v4(),
        phone: normalizedPhone,
        name: normalizedName,
        email: normalizedEmail,
        password: hashPassword(password),
        role: USER_ROLE,
        status: USER_STATUS_ACTIVE,
      });

      if (!created) {
        return resolve({
          err: 1,
          msg: "Khong the tao tai khoan.",
          token: null,
        });
      }

      return resolve({
        err: 0,
        msg: "Dang ky thanh cong.",
        token: createAccessToken(created),
      });
    } catch (error) {
      console.error("registerService error:", error);
      return resolve({
        err: -1,
        msg: "Loi may chu noi bo.",
        token: null,
      });
    }
  });

export const loginService = ({ identifier, password }) =>
  new Promise(async (resolve) => {
    try {
      const normalizedIdentifier = String(identifier || "").trim();
      const candidates = await findUsersByIdentifier(normalizedIdentifier);

      if (!candidates.length) {
        return resolve({
          err: 2,
          msg: isEmailIdentifier(normalizedIdentifier)
            ? "Khong tim thay tai khoan voi email nay."
            : "Khong tim thay tai khoan voi so dien thoai nay.",
          token: null,
        });
      }

      const matchedUsers = [];

      for (const user of candidates) {
        // Legacy data can contain duplicated phones, so choose the single
        // password match instead of trusting the first row.
        if (await bcrypt.compare(password, user.password)) {
          matchedUsers.push(user);
        }
      }

      if (!matchedUsers.length) {
        return resolve({
          err: 2,
          msg: "Mat khau khong dung.",
          token: null,
        });
      }

      if (matchedUsers.length > 1) {
        return resolve({
          err: 2,
          msg: "Thong tin dang nhap khong duy nhat. Vui long dung email.",
          token: null,
        });
      }

      if (isBlockedUserStatus(matchedUsers[0]?.status)) {
        return resolve({
          err: 2,
          msg: "Tai khoan da bi khoa.",
          token: null,
        });
      }

      return resolve({
        err: 0,
        msg: "Dang nhap thanh cong.",
        token: createAccessToken(matchedUsers[0]),
      });
    } catch (error) {
      console.error("loginService error:", error);
      return resolve({
        err: -1,
        msg: "Loi may chu noi bo.",
        token: null,
      });
    }
  });
