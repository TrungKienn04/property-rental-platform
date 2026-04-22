import jwt from "jsonwebtoken";

const { normalizeRole } = require("../ultis/accessControl");

const readBearerToken = (headers = {}) => {
  const authorization = String(headers.authorization || "").trim();
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

const decodeAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.SECRET_KEY || "secret");
  } catch (error) {
    return null;
  }
};

const verifyToken = (req, res, next) => {
  const token = readBearerToken(req.headers);

  if (!token) {
    return res.status(401).json({
      err: 1,
      msg: "Missing access token",
    });
  }

  const user = decodeAccessToken(token);

  if (!user) {
    return res.status(401).json({
      err: 1,
      msg: "Access token invalid or expired",
    });
  }

  req.user = user;
  return next();
};

export const attachUserIfPresent = (req, _res, next) => {
  const token = readBearerToken(req.headers);

  if (!token) {
    return next();
  }

  const user = decodeAccessToken(token);

  if (user) {
    req.user = user;
  }

  return next();
};

export const requireRole = (...roles) => {
  const allowedRoles = roles.map((role) => normalizeRole(role));

  return (req, res, next) => {
    if (!allowedRoles.includes(normalizeRole(req.user?.role))) {
      return res.status(403).json({
        err: 1,
        msg: "Forbidden",
      });
    }

    return next();
  };
};

export const isAdmin = (req, res, next) => {
  return requireRole("admin")(req, res, next);
};

export default verifyToken;
