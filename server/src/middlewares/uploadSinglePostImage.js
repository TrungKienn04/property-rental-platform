import upload from "./uploadPostImages";

const uploadSinglePostImage = (req, res, next) => {
  const handler = upload.single("file");

  handler(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    res.status(400).json({
      err: 1,
      msg:
        error.code === "LIMIT_FILE_SIZE"
          ? "Anh tai len khong duoc vuot qua 5MB."
          : error.message || "Khong the tai anh len.",
      response: null,
    });
  });
};

export default uploadSinglePostImage;
