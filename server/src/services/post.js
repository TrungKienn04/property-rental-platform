import db from "../models";
import { v4 } from "uuid";
import generateCode from "../ultis/generateCode";
import { dataArea, dataPrice } from "../ultis/data";

const { buildPostWhereClause } = require("../ultis/postFilters");
const {
  isAdminRole,
  isPublishedPostStatus,
  normalizePostStatus,
  POST_STATUS_HIDDEN,
  POST_STATUS_PENDING,
  POST_STATUS_PUBLISHED,
  POST_STATUS_REJECTED,
} = require("../ultis/accessControl");
const {
  normalizeImageList,
  normalizeDescription,
} = require("../ultis/postData");
const {
  createProvinceCode,
  resolveProvinceCodeFromAddress,
} = require("../ultis/provinceCode");
const {
  derivePostPriceAreaCodes,
  formatAreaAttribute,
  formatPriceAttribute,
} = require("../ultis/priceAreaCode");

const DEFAULT_EXPIRED_DAYS = 10;

const baseListIncludes = [
  { model: db.Image, as: "images", attributes: ["image"] },
  {
    model: db.Attribute,
    as: "attributes",
    attributes: ["price", "acreage", "published", "hashtag"],
  },
];

const publicPostIncludes = [
  ...baseListIncludes,
  {
    model: db.User,
    as: "user",
    attributes: ["name", "zalo", "phone", "email", "fbUrl"],
  },
];

const managementPostIncludes = [
  ...publicPostIncludes,
  {
    model: db.Overview,
    as: "overview",
    attributes: ["code", "area", "type", "target", "bonus", "created", "expired"],
  },
];

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
  overview: record?.overview || null,
});

const buildPublicPostWhere = (filters = {}) => ({
  ...buildPostWhereClause(filters),
  status: POST_STATUS_PUBLISHED,
});

const canViewManagedPost = (post, viewer = {}) => {
  if (!post) return false;
  if (isPublishedPostStatus(post.status)) return true;
  if (isAdminRole(viewer.role)) return true;

  return Boolean(
    String(viewer.id || "").trim()
    && String(post.userId || "").trim()
    && String(viewer.id || "").trim() === String(post.userId || "").trim(),
  );
};

const normalizeDescriptionInput = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }

  return String(value || "")
    .split(/\r?\n/g)
    .map((item) => item.trim())
    .filter(Boolean);
};

const serializeDescription = (value) =>
  JSON.stringify(normalizeDescriptionInput(value));

const normalizeImagePayload = (images) => normalizeImageList(images).filter(Boolean);

const buildPostWritePayload = async (body = {}) => {
  const [priceCatalog, areaCatalog, category] = await Promise.all([
    db.Price.findAll({
      raw: true,
      attributes: ["code", "value", "order"],
    }),
    db.Area.findAll({
      raw: true,
      attributes: ["code", "value", "order"],
    }),
    db.Category.findOne({
      raw: true,
      where: { code: body.categoryCode },
      attributes: ["code", "value"],
    }),
  ]);

  const derivedCodes = derivePostPriceAreaCodes({
    priceNumber: body.priceNumber,
    areaNumber: body.areaNumber,
    priceCatalog: priceCatalog.length ? priceCatalog : dataPrice,
    areaCatalog: areaCatalog.length ? areaCatalog : dataArea,
  });

  const normalizedPriceNumber =
    derivedCodes.priceNumber ?? Number(body.priceNumber);
  const normalizedAreaNumber =
    derivedCodes.areaNumber ?? Number(body.areaNumber);
  const normalizedImages = normalizeImagePayload(body.images);
  const provinceName = String(body.province || "")
    .trim()
    || String(body.address || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(-1)[0]
    || "";
  const provinceCode =
    body.provinceCode ||
    resolveProvinceCodeFromAddress(provinceName, []) ||
    createProvinceCode(provinceName) ||
    null;

  return {
    category,
    derivedCodes,
    normalizedAreaNumber,
    normalizedImages,
    normalizedPriceNumber,
    provinceCode,
    provinceName,
  };
};

const ensureRelatedRecord = async (model, id, payload, transaction) => {
  const existing = await model.findOne({
    where: { id },
    transaction,
  });

  if (existing) {
    await existing.update(payload, { transaction });
    return existing;
  }

  return model.create(
    {
      id,
      ...payload,
    },
    { transaction },
  );
};

export const getPostsService = () =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.Post.findAll({
        where: {
          status: POST_STATUS_PUBLISHED,
        },
        raw: true,
        nest: true,
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
      });

      resolve({
        err: response ? 0 : 1,
        msg: response ? "OK" : "Getting posts is failed.",
        response: (response || []).map(mapPostResponse),
      });
    } catch (error) {
      reject(error);
    }
  });

export const getPostsLimitService = (
  page,
  query,
  { priceNumber, areaNumber, sort },
) =>
  new Promise(async (resolve, reject) => {
    try {
      const offset = !page || +page <= 1 ? 0 : +page - 1;
      const where = buildPublicPostWhere({
        ...query,
        priceNumber,
        areaNumber,
      });

      const findOptions = {
        where,
        raw: true,
        nest: true,
        offset: offset * +process.env.LIMIT,
        limit: +process.env.LIMIT,
        order: [["createdAt", "DESC"]],
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
      };

      console.log(
        "[getPostsLimitService] findOptions.where:",
        JSON.stringify(where, null, 2),
      );

      const rows = await db.Post.findAll(findOptions);
      const count = await db.Post.count({ where });

      resolve({
        err: 0,
        msg: "OK",
        response: {
          rows: (rows || []).map(mapPostResponse),
          count,
        },
      });
    } catch (error) {
      reject(error);
    }
  });

export const getNewPostService = () =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.Post.findAll({
        where: {
          status: POST_STATUS_PUBLISHED,
        },
        raw: true,
        nest: true,
        offset: 0,
        order: [["createdAt", "DESC"]],
        limit: +process.env.LIMIT,
        include: baseListIncludes,
        attributes: ["id", "title", "star", "createdAt", "status"],
      });

      resolve({
        err: response ? 0 : 1,
        msg: response ? "OK" : "Getting posts is failed.",
        response: (response || []).map(mapPostResponse),
      });
    } catch (error) {
      reject(error);
    }
  });

export const getPostByIdService = (id, viewer = {}) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.Post.findOne({
        where: { id },
        raw: true,
        nest: true,
        include: managementPostIncludes,
        attributes: [
          "id",
          "title",
          "star",
          "address",
          "description",
          "userId",
          "createdAt",
          "status",
          "moderatedAt",
          "moderatedBy",
          "moderationReason",
        ],
      });

      if (!response) {
        return resolve({ err: 1, msg: "Not found", response: null });
      }

      if (!canViewManagedPost(response, viewer)) {
        return resolve({ err: 1, msg: "Not found", response: null });
      }

      resolve({
        err: 0,
        msg: "OK",
        response: mapPostResponse(response),
      });
    } catch (error) {
      reject(error);
    }
  });

export const createNewPostService = (body, userId) =>
  new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();

    try {
      const attributesId = v4();
      const imagesId = v4();
      const overviewId = v4();
      const postId = v4();
      const labelCode = generateCode(body.categoryCode);
      const hashtag = `#${Math.floor(Math.random() * Math.pow(10, 6))}`;
      const currentDate = new Date();
      const expiredDate = new Date(
        currentDate.getTime() + DEFAULT_EXPIRED_DAYS * 24 * 60 * 60 * 1000,
      );
      const {
        category,
        derivedCodes,
        normalizedAreaNumber,
        normalizedImages,
        normalizedPriceNumber,
        provinceCode,
        provinceName,
      } = await buildPostWritePayload(body);

      await db.Post.create({
        id: postId,
        title: body.title,
        labelCode,
        address: body.address || "",
        attributesId,
        categoryCode: body.categoryCode,
        description: serializeDescription(body.description),
        userId,
        overviewId,
        imagesId,
        areaCode: derivedCodes.areaCode || body.areaCode || null,
        priceCode: derivedCodes.priceCode || body.priceCode || null,
        provinceCode,
        priceNumber: normalizedPriceNumber,
        areaNumber: normalizedAreaNumber,
        status: POST_STATUS_PUBLISHED,
        moderatedAt: null,
        moderatedBy: null,
        moderationReason: null,
      }, { transaction });

      await db.Attribute.create({
        id: attributesId,
        price: formatPriceAttribute(normalizedPriceNumber),
        acreage: formatAreaAttribute(normalizedAreaNumber),
        published: currentDate.toLocaleDateString("vi-VN"),
        hashtag,
      }, { transaction });

      await db.Image.create({
        id: imagesId,
        image: JSON.stringify(normalizedImages),
      }, { transaction });

      await db.Overview.create({
        id: overviewId,
        code: hashtag,
        area: provinceName,
        type: category?.value || body.categoryCode || "",
        target: body.target || "T\u1ea5t c\u1ea3",
        bonus: "Tin th\u01b0\u1eddng",
        created: currentDate,
        expired: expiredDate,
      }, { transaction });

      await transaction.commit();

      resolve({
        err: 0,
        msg: "OK",
      });
    } catch (error) {
      await transaction.rollback();
      reject(error);
    }
  });

export const getPostsByUserService = (userId) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.Post.findAll({
        where: { userId },
        raw: true,
        nest: true,
        order: [["createdAt", "DESC"]],
        include: managementPostIncludes,
        attributes: [
          "id",
          "title",
          "star",
          "address",
          "description",
          "categoryCode",
          "priceCode",
          "areaCode",
          "provinceCode",
          "priceNumber",
          "areaNumber",
          "status",
          "moderatedAt",
          "moderatedBy",
          "moderationReason",
          "createdAt",
          "updatedAt",
        ],
      });

      resolve({
        err: 0,
        msg: "OK",
        response: (response || []).map(mapPostResponse),
      });
    } catch (error) {
      reject(error);
    }
  });

export const getAllManagedPostsService = (filters = {}) =>
  new Promise(async (resolve, reject) => {
    try {
      const where = buildPostWhereClause(filters);
      const response = await db.Post.findAll({
        where,
        raw: true,
        nest: true,
        order: [["createdAt", "DESC"]],
        include: managementPostIncludes,
        attributes: [
          "id",
          "title",
          "star",
          "address",
          "description",
          "categoryCode",
          "priceCode",
          "areaCode",
          "provinceCode",
          "priceNumber",
          "areaNumber",
          "userId",
          "status",
          "moderatedAt",
          "moderatedBy",
          "moderationReason",
          "createdAt",
          "updatedAt",
        ],
      });

      resolve({
        err: 0,
        msg: "OK",
        response: (response || []).map(mapPostResponse),
      });
    } catch (error) {
      reject(error);
    }
  });

export const updatePostService = (postId, body, userId) =>
  new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();

    try {
      const post = await db.Post.findOne({
        where: { id: postId, userId },
        transaction,
      });

      if (!post) {
        await transaction.rollback();
        return resolve({
          err: 1,
          msg: "Kh\u00f4ng t\u00ecm th\u1ea5y tin \u0111\u0103ng c\u1ea7n c\u1eadp nh\u1eadt.",
        });
      }

      const {
        category,
        derivedCodes,
        normalizedAreaNumber,
        normalizedImages,
        normalizedPriceNumber,
        provinceCode,
        provinceName,
      } = await buildPostWritePayload(body);

      await post.update(
        {
          title: body.title,
          labelCode: generateCode(body.categoryCode),
          address: body.address || "",
          categoryCode: body.categoryCode,
          description: serializeDescription(body.description),
          areaCode: derivedCodes.areaCode || body.areaCode || null,
          priceCode: derivedCodes.priceCode || body.priceCode || null,
          provinceCode,
          priceNumber: normalizedPriceNumber,
          areaNumber: normalizedAreaNumber,
          status: normalizePostStatus(post.status),
        },
        { transaction },
      );

      const attributePublished =
        post.createdAt instanceof Date
          ? post.createdAt.toLocaleDateString("vi-VN")
          : new Date().toLocaleDateString("vi-VN");

      await ensureRelatedRecord(
        db.Attribute,
        post.attributesId,
        {
          price: formatPriceAttribute(normalizedPriceNumber),
          acreage: formatAreaAttribute(normalizedAreaNumber),
          published: attributePublished,
          hashtag: (
            await db.Attribute.findOne({
              where: { id: post.attributesId },
              transaction,
            })
          )?.hashtag || `#${Math.floor(Math.random() * Math.pow(10, 6))}`,
        },
        transaction,
      );

      await ensureRelatedRecord(
        db.Image,
        post.imagesId,
        {
          image: JSON.stringify(normalizedImages),
        },
        transaction,
      );

      const existingOverview = await db.Overview.findOne({
        where: { id: post.overviewId },
        transaction,
      });

      await ensureRelatedRecord(
        db.Overview,
        post.overviewId,
        {
          code:
            existingOverview?.code
            || (
              await db.Attribute.findOne({
                where: { id: post.attributesId },
                transaction,
              })
            )?.hashtag
            || `#${Math.floor(Math.random() * Math.pow(10, 6))}`,
          area: provinceName,
          type: category?.value || body.categoryCode || "",
          target: body.target || "T\u1ea5t c\u1ea3",
          bonus: existingOverview?.bonus || "Tin th\u01b0\u1eddng",
          created: existingOverview?.created || post.createdAt || new Date(),
          expired:
            existingOverview?.expired
            || new Date(
              new Date().getTime() + DEFAULT_EXPIRED_DAYS * 24 * 60 * 60 * 1000,
            ),
        },
        transaction,
      );

      await transaction.commit();

      resolve({
        err: 0,
        msg: "OK",
      });
    } catch (error) {
      await transaction.rollback();
      reject(error);
    }
  });

export const updatePostStatusService = (
  postId,
  status,
  moderatorId,
  moderationReason = "",
) =>
  new Promise(async (resolve, reject) => {
    try {
      const post = await db.Post.findOne({
        where: { id: postId },
      });

      if (!post) {
        return resolve({
          err: 1,
          msg: "Khong tim thay tin dang.",
          response: null,
        });
      }

      post.status = normalizePostStatus(status);
      post.moderatedBy = moderatorId || null;
      post.moderatedAt = new Date();
      post.moderationReason = String(moderationReason || "").trim() || null;

      await post.save();

      return resolve({
        err: 0,
        msg: "OK",
        response: {
          id: post.id,
          status: post.status,
          moderatedBy: post.moderatedBy,
          moderatedAt: post.moderatedAt,
          moderationReason: post.moderationReason,
        },
      });
    } catch (error) {
      reject(error);
    }
  });

export const deletePostService = (postId, userId) =>
  new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();

    try {
      const post = await db.Post.findOne({
        where: { id: postId, userId },
        raw: true,
        transaction,
      });

      if (!post) {
        await transaction.rollback();
        return resolve({
          err: 1,
          msg: "Kh\u00f4ng t\u00ecm th\u1ea5y tin \u0111\u0103ng c\u1ea7n x\u00f3a.",
        });
      }

      await db.Post.destroy({
        where: { id: postId, userId },
        transaction,
      });

      await Promise.all([
        db.Image.destroy({ where: { id: post.imagesId }, transaction }),
        db.Attribute.destroy({ where: { id: post.attributesId }, transaction }),
        db.Overview.destroy({ where: { id: post.overviewId }, transaction }),
      ]);

      await transaction.commit();

      resolve({
        err: 0,
        msg: "OK",
      });
    } catch (error) {
      await transaction.rollback();
      reject(error);
    }
  });

export const forceDeletePostService = (postId) =>
  new Promise(async (resolve, reject) => {
    const transaction = await db.sequelize.transaction();

    try {
      const post = await db.Post.findOne({
        where: { id: postId },
        raw: true,
        transaction,
      });

      if (!post) {
        await transaction.rollback();
        return resolve({
          err: 1,
          msg: "Khong tim thay tin dang can xoa.",
        });
      }

      await db.Post.destroy({
        where: { id: postId },
        transaction,
      });

      await Promise.all([
        db.Image.destroy({ where: { id: post.imagesId }, transaction }),
        db.Attribute.destroy({ where: { id: post.attributesId }, transaction }),
        db.Overview.destroy({ where: { id: post.overviewId }, transaction }),
      ]);

      await transaction.commit();

      return resolve({
        err: 0,
        msg: "OK",
      });
    } catch (error) {
      await transaction.rollback();
      reject(error);
    }
  });
