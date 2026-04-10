import db from "../models";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 } from "uuid";
require("dotenv").config();

const hashPassword = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(12));

const createAccessToken = (user) =>
  jwt.sign(
    { id: user.id, phone: user.phone },
    process.env.SECRET_KEY || "secret",
    { expiresIn: "2d" },
  );

export const registerService = ({ phone, password, name }) =>
  new Promise(async (resolve) => {
    try {
      const normalizedPhone = String(phone || "")
        .trim()
        .replace(/\s+/g, "");
      const normalizedName = String(name || "").trim();

      const existing = await db.User.findOne({
        where: { phone: normalizedPhone },
        raw: true,
      });

      if (existing) {
        return resolve({
          err: 2,
          msg: "Số điện thoại này đã được sử dụng.",
          token: null,
        });
      }

      const created = await db.User.create({
        id: v4(),
        phone: normalizedPhone,
        name: normalizedName,
        password: hashPassword(password),
      });

      if (!created) {
        return resolve({
          err: 1,
          msg: "Không thể tạo tài khoản.",
          token: null,
        });
      }

      return resolve({
        err: 0,
        msg: "Đăng ký thành công.",
        token: createAccessToken(created),
      });
    } catch (error) {
      console.error("registerService error:", error);
      return resolve({
        err: -1,
        msg: "Lỗi máy chủ nội bộ.",
        token: null,
      });
    }
  });

export const loginService = ({ phone, password }) =>
  new Promise(async (resolve) => {
    try {
      const normalizedPhone = String(phone || "")
        .trim()
        .replace(/\s+/g, "");

      const response = await db.User.findOne({
        where: { phone: normalizedPhone },
        raw: true,
      });

      if (!response) {
        return resolve({
          err: 2,
          msg: "Không tìm thấy tài khoản với số điện thoại này.",
          token: null,
        });
      }

      const isCorrectPassword = bcrypt.compareSync(password, response.password);

      if (!isCorrectPassword) {
        return resolve({
          err: 2,
          msg: "Mật khẩu không đúng.",
          token: null,
        });
      }

      return resolve({
        err: 0,
        msg: "Đăng nhập thành công.",
        token: createAccessToken(response),
      });
    } catch (error) {
      console.error("loginService error:", error);
      return resolve({
        err: -1,
        msg: "Lỗi máy chủ nội bộ.",
        token: null,
      });
    }
  });
