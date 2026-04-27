import db from "../models";

const { POST_STATUS_PUBLISHED, normalizePostStatus } = require("../ultis/accessControl");
const { normalizeImageList, normalizeDescription } = require("../ultis/postData");

const mapUserResponse = (user) => {
  if (!user) return user;

  return {
    ...user,
    email: user?.email || user?.fbUrl || "",
  };
};

const mapPostResponse = (record) => ({
  ...record,
  status: normalizePostStatus(record?.status),
  user: mapUserResponse(record?.user),
  images: { image: normalizeImageList(record?.images?.image) },
  description: normalizeDescription(record?.description),
});

const publicPostIncludes = [
  { model: db.Image, as: "images", attributes: ["image"] },
  {
    model: db.Attribute,
    as: "attributes",
    attributes: ["price", "acreage", "published", "hashtag"],
  },
  {
    model: db.User,
    as: "user",
    attributes: ["name", "zalo", "phone", "email", "fbUrl"],
  },
];

export const getSavedPostIdsService = (userId) =>
  new Promise(async (resolve, reject) => {
    try {
      if (!userId) {
        return resolve({ err: 1, msg: "Missing userId", response: [] });
      }

      const rows = await db.SavedPost.findAll({
        where: { userId },
        raw: true,
        attributes: ["postId"],
        order: [["createdAt", "DESC"]],
      });

      resolve({
        err: 0,
        msg: "OK",
        response: (rows || []).map((row) => row.postId).filter(Boolean),
      });
    } catch (error) {
      reject(error);
    }
  });

export const getSavedPostsService = (userId) =>
  new Promise(async (resolve, reject) => {
    try {
      if (!userId) {
        return resolve({ err: 1, msg: "Missing userId", response: [] });
      }

      const rows = await db.SavedPost.findAll({
        where: { userId },
        raw: true,
        nest: true,
        include: [
          {
            model: db.Post,
            as: "post",
            where: { status: POST_STATUS_PUBLISHED },
            required: true,
            include: publicPostIncludes,
            attributes: [
              "id",
              "title",
              "star",
              "address",
              "description",
              "userId",
              "status",
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      const posts = (rows || [])
        .map((row) => row.post)
        .filter(Boolean)
        .map(mapPostResponse);

      resolve({
        err: 0,
        msg: "OK",
        response: posts,
      });
    } catch (error) {
      reject(error);
    }
  });

export const toggleSavedPostService = (userId, postId) =>
  new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();

    try {
      if (!userId || !postId) {
        await transaction.rollback();
        return resolve({
          err: 1,
          msg: "Missing userId or postId",
          response: null,
        });
      }

      const post = await db.Post.findOne({
        where: { id: postId, status: POST_STATUS_PUBLISHED },
        transaction,
      });

      if (!post) {
        await transaction.rollback();
        return resolve({
          err: 1,
          statusCode: 404,
          msg: "Not found",
          response: null,
        });
      }

      const existing = await db.SavedPost.findOne({
        where: { userId, postId },
        transaction,
      });

      if (existing) {
        await existing.destroy({ transaction });
        await transaction.commit();
        return resolve({
          err: 0,
          msg: "OK",
          response: { saved: false, postId },
        });
      }

      await db.SavedPost.create(
        {
          userId,
          postId,
        },
        { transaction },
      );

      await transaction.commit();
      return resolve({
        err: 0,
        msg: "OK",
        response: { saved: true, postId },
      });
    } catch (error) {
      await transaction.rollback();
      reject(error);
    }
  });
