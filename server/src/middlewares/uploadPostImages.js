import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDirectory = path.resolve(process.cwd(), "uploads", "posts");

fs.mkdirSync(uploadDirectory, { recursive: true });

const getFileExtension = (file = {}) => {
  const originalExtension = path.extname(file.originalname || "").toLowerCase();
  if (originalExtension) return originalExtension;

  const mimeExtension = String(file.mimetype || "").split("/")[1];
  return mimeExtension ? `.${mimeExtension}` : ".jpg";
};

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (_req, file, callback) => {
    callback(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${getFileExtension(file)}`,
    );
  },
});

const fileFilter = (_req, file, callback) => {
  if (!file?.mimetype?.startsWith("image/")) {
    callback(new Error("Chỉ chấp nhận tệp hình ảnh."), false);
    return;
  }

  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;
