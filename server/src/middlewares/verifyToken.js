import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authorization = String(req.headers.authorization || "").trim();
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      err: 1,
      msg: "Missing access token",
    });
  }

  jwt.verify(token, process.env.SECRET_KEY || "secret", (error, user) => {
    if (error) {
      return res.status(401).json({
        err: 1,
        msg: "Access token invalid or expired",
      });
    }

    req.user = user;
    return next();
  });
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      err: 1,
      msg: "Forbidden",
    });
  }

  return next();
};

export default verifyToken;
