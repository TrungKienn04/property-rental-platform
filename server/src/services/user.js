import db from "../models";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

require("dotenv").config();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const PHONE_REGEX = /^0\d{8,10}$/;

const normalizePhone = (phone) =>
  String(phone || "")
    .trim()
    .replace(/\s+/g, "");

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const hashPassword = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(12));

const createAccessToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role || "user" },
    process.env.SECRET_KEY || "secret",
    { expiresIn: "2d" },
  );

const mapUserResponse = (user) => {
  if (!user) return user;

  const { password, ...userData } = user;

  return {
    ...userData,
    email: userData?.email || userData?.fbUrl || "",
  };
};

// GET CURRENT
export const getOne = (id) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.findOne({
        where: { id },
        raw: true,
        attributes: {
          exclude: ["password"],
        },
      });
      resolve({
        err: response ? 0 : 1,
        msg: response ? "OK" : "Failed to get user.",
        response: mapUserResponse(response),
      });
    } catch (error) {
      reject(error);
    }
  });

export const updateCurrentUser = (id, payload = {}) =>
  new Promise(async (resolve, reject) => {
    try {
      const user = await db.User.findOne({
        where: { id },
      });

      if (!user) {
        return resolve({
          err: 1,
          msg: "Khong tim thay tai khoan.",
          response: null,
          token: null,
        });
      }

      const normalizedName = String(payload.name || "").trim();
      const normalizedPhone = normalizePhone(payload.phone);
      const normalizedZalo = String(payload.zalo || "").trim();
      const normalizedEmail = normalizeEmail(payload.email);
      const currentPassword = String(payload.currentPassword || "");
      const newPassword = String(payload.newPassword || "");

      if (!normalizedName || normalizedName.length < 2) {
        return resolve({
          err: 1,
          msg: "Ho ten phai co it nhat 2 ky tu.",
          response: null,
          token: null,
        });
      }

      if (!PHONE_REGEX.test(normalizedPhone)) {
        return resolve({
          err: 1,
          msg: "So dien thoai khong hop le.",
          response: null,
          token: null,
        });
      }

      if (normalizedEmail && !EMAIL_REGEX.test(normalizedEmail)) {
        return resolve({
          err: 1,
          msg: "Email khong hop le.",
          response: null,
          token: null,
        });
      }

      const [existingPhone, existingEmail] = await Promise.all([
        db.User.findOne({
          where: { phone: normalizedPhone },
          raw: true,
        }),
        normalizedEmail
          ? db.User.findOne({
            where: {
              [Op.or]: [{ email: normalizedEmail }, { fbUrl: normalizedEmail }],
            },
            raw: true,
          })
          : null,
      ]);

      if (existingPhone && existingPhone.id !== id) {
        return resolve({
          err: 1,
          msg: "So dien thoai nay da duoc su dung.",
          response: null,
          token: null,
        });
      }

      if (existingEmail && existingEmail.id !== id) {
        return resolve({
          err: 1,
          msg: "Email nay da duoc su dung.",
          response: null,
          token: null,
        });
      }

      if (newPassword) {
        if (newPassword.length < 6) {
          return resolve({
            err: 1,
            msg: "Mat khau moi phai co it nhat 6 ky tu.",
            response: null,
            token: null,
          });
        }

        if (!currentPassword || !bcrypt.compareSync(currentPassword, user.password)) {
          return resolve({
            err: 1,
            msg: "Mat khau hien tai khong dung.",
            response: null,
            token: null,
          });
        }

        user.password = hashPassword(newPassword);
      }

      user.name = normalizedName;
      user.phone = normalizedPhone;
      user.zalo = normalizedZalo || normalizedPhone;
      user.email = normalizedEmail || null;

      if (EMAIL_REGEX.test(String(user.fbUrl || "").trim())) {
        user.fbUrl = null;
      }

      await user.save();

      const plainUser = mapUserResponse(user.get({ plain: true }));

      return resolve({
        err: 0,
        msg: "OK",
        response: plainUser,
        token: createAccessToken(user),
      });
    } catch (error) {
      reject(error);
    }
  });

export const promoteUserToAdmin = (userId) =>
  new Promise(async (resolve, reject) => {
    try {
      const user = await db.User.findOne({
        where: { id: userId },
      });

      if (!user) {
        return resolve({
          err: 1,
          msg: "Khong tim thay tai khoan.",
          response: null,
        });
      }

      user.role = "admin";
      await user.save();

      return resolve({
        err: 0,
        msg: "OK",
        response: mapUserResponse(user.get({ plain: true })),
      });
    } catch (error) {
      reject(error);
    }
  });
