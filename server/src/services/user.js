import db from "../models";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

require("dotenv").config();

const hashPassword = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(12));

const createAccessToken = (user) =>
  jwt.sign(
    { id: user.id, phone: user.phone },
    process.env.SECRET_KEY || "secret",
    { expiresIn: "2d" },
  );

const mapUserResponse = (user) => {
  if (!user) return user;

  return {
    ...user,
    email: user?.fbUrl || "",
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
        msg: response ? "OK" : "Failed to get provinces.",
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
          msg: "Kh\u00f4ng t\u00ecm th\u1ea5y t\u00e0i kho\u1ea3n.",
          response: null,
          token: null,
        });
      }

      const normalizedName = String(payload.name || "").trim();
      const normalizedPhone = String(payload.phone || "")
        .trim()
        .replace(/\s+/g, "");
      const normalizedZalo = String(payload.zalo || "").trim();
      const normalizedEmail = String(payload.email || "").trim();
      const currentPassword = String(payload.currentPassword || "");
      const newPassword = String(payload.newPassword || "");

      if (!normalizedName || normalizedName.length < 2) {
        return resolve({
          err: 1,
          msg: "H\u1ecd t\u00ean ph\u1ea3i c\u00f3 \u00edt nh\u1ea5t 2 k\u00fd t\u1ef1.",
          response: null,
          token: null,
        });
      }

      if (!/^0\d{8,10}$/.test(normalizedPhone)) {
        return resolve({
          err: 1,
          msg: "S\u1ed1 \u0111i\u1ec7n tho\u1ea1i kh\u00f4ng h\u1ee3p l\u1ec7.",
          response: null,
          token: null,
        });
      }

      if (
        normalizedEmail
        && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
      ) {
        return resolve({
          err: 1,
          msg: "Email kh\u00f4ng h\u1ee3p l\u1ec7.",
          response: null,
          token: null,
        });
      }

      const existingPhone = await db.User.findOne({
        where: { phone: normalizedPhone },
        raw: true,
      });

      if (existingPhone && existingPhone.id !== id) {
        return resolve({
          err: 1,
          msg: "S\u1ed1 \u0111i\u1ec7n tho\u1ea1i n\u00e0y \u0111\u00e3 \u0111\u01b0\u1ee3c s\u1eed d\u1ee5ng.",
          response: null,
          token: null,
        });
      }

      if (newPassword) {
        if (newPassword.length < 6) {
          return resolve({
            err: 1,
            msg: "M\u1eadt kh\u1ea9u m\u1edbi ph\u1ea3i c\u00f3 \u00edt nh\u1ea5t 6 k\u00fd t\u1ef1.",
            response: null,
            token: null,
          });
        }

        if (!currentPassword || !bcrypt.compareSync(currentPassword, user.password)) {
          return resolve({
            err: 1,
            msg: "M\u1eadt kh\u1ea9u hi\u1ec7n t\u1ea1i kh\u00f4ng \u0111\u00fang.",
            response: null,
            token: null,
          });
        }

        user.password = hashPassword(newPassword);
      }

      user.name = normalizedName;
      user.phone = normalizedPhone;
      user.zalo = normalizedZalo || normalizedPhone;
      user.fbUrl = normalizedEmail;

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
