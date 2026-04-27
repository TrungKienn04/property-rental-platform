const path = require("path");

process.env.NODE_ENV = "test";
process.env.SECRET_KEY = "test-secret";

require("@babel/register")({
  cwd: path.resolve(__dirname, ".."),
  extensions: [".js"],
  ignore: [/node_modules/],
});

const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const {
  buildPostWhereClause,
  normalizePostFilterQuery,
  parseNumberRange,
} = require("../src/ultis/postFilters");
const {
  buildProvinceCodeUpdates,
  createProvinceCode,
  extractProvinceNameFromAddress,
  resolveProvinceCodeFromAddress,
} = require("../src/ultis/provinceCode");
const {
  derivePostPriceAreaCodes,
  parsePriceValue,
  resolveRangeCode,
} = require("../src/ultis/priceAreaCode");
const db = require("../src/models");
const authService = require("../src/services/auth");
const userService = require("../src/services/user");
const postService = require("../src/services/post");
const savedPostService = require("../src/services/savedPost");
const verifyTokenModule = require("../src/middlewares/verifyToken");
const {
  POST_STATUS_DELETED,
  POST_STATUS_HIDDEN,
  POST_STATUS_PENDING,
  POST_STATUS_PUBLISHED,
  POST_STATUS_REJECTED,
} = require("../src/ultis/accessControl");

const verifyToken = verifyTokenModule.default;
const { isAdmin } = verifyTokenModule;

const provinces = [
  { code: "TPHCM", value: "Ho Chi Minh" },
  { code: "HANOI", value: "Ha Noi" },
  { code: "DANANG", value: "Da Nang" },
];

const prices = [
  { code: "OU1N", value: "Duoi 1 trieu", order: 1 },
  { code: "1U2N", value: "Tu 1 - 2 trieu", order: 2 },
  { code: "2U3N", value: "Tu 2 - 3 trieu", order: 3 },
  { code: "3U5N", value: "Tu 3 - 5 trieu", order: 4 },
  { code: "5U7N", value: "Tu 5 - 7 trieu", order: 5 },
  { code: "7U0N", value: "Tu 7 - 10 trieu", order: 6 },
  { code: "1E1N", value: "Tu 10 - 15 trieu", order: 7 },
  { code: "EU5N", value: "Tren 15 trieu", order: 8 },
];

const areas = [
  { code: "ON2E", value: "Duoi 20m2", order: 1 },
  { code: "2UMD", value: "Tu 20m - 30m", order: 2 },
  { code: "3UMD", value: "Tu 30m - 50m", order: 3 },
  { code: "5UMD", value: "Tu 50m - 70m", order: 4 },
  { code: "7UMD", value: "Tu 70m - 90m", order: 5 },
  { code: "EN9E", value: "Tren 90m", order: 6 },
];

const createMockResponse = () => {
  const response = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return response;
};

const loadFreshModule = (relativePath) => {
  const resolved = require.resolve(relativePath);
  delete require.cache[resolved];
  return require(relativePath);
};

const withPatched = async (target, patches, run) => {
  const originals = {};

  Object.entries(patches).forEach(([key, value]) => {
    originals[key] = target[key];
    target[key] = value;
  });

  try {
    return await run();
  } finally {
    Object.entries(originals).forEach(([key, value]) => {
      target[key] = value;
    });
  }
};

const createTransaction = () => ({
  committed: false,
  rolledBack: false,
  async commit() {
    this.committed = true;
  },
  async rollback() {
    this.rolledBack = true;
  },
});

const tests = [
  {
    name: "parseNumberRange returns between condition for numeric ranges",
    run() {
      assert.deepEqual(parseNumberRange(["5", "3"]), {
        [Op.between]: [3, 5],
      });
    },
  },
  {
    name: "parseNumberRange ignores quick filter codes",
    run() {
      assert.equal(parseNumberRange("1U2N"), null);
    },
  },
  {
    name: "normalizePostFilterQuery keeps array filters stable",
    run() {
      const result = normalizePostFilterQuery({
        page: "2",
        sort: ["latest"],
        provinceCode: ["TPHCM"],
        "priceNumber[]": ["3", "5"],
        categoryCode: "CTPT",
      });

      assert.equal(result.page, "2");
      assert.equal(result.sort, "latest");
      assert.equal(result.filters.provinceCode, "TPHCM");
      assert.deepEqual(result.filters.priceNumber, ["3", "5"]);
      assert.equal(result.filters.categoryCode, "CTPT");
    },
  },
  {
    name: "buildPostWhereClause mixes exact filters and numeric ranges",
    run() {
      const where = buildPostWhereClause({
        categoryCode: "CTPT",
        provinceCode: ["TPHCM", "HANOI"],
        priceNumber: ["3", "5"],
      });

      assert.equal(where.categoryCode, "CTPT");
      assert.deepEqual(where.provinceCode, { [Op.in]: ["TPHCM", "HANOI"] });
      assert.deepEqual(where.priceNumber, { [Op.between]: [3, 5] });
    },
  },
  {
    name: "parsePriceValue normalizes dong values to millions",
    run() {
      assert.equal(parsePriceValue("700.000 dong/thang"), 0.7);
      assert.equal(parsePriceValue(1000000), 1);
    },
  },
  {
    name: "resolveRangeCode matches expected bands",
    run() {
      assert.equal(resolveRangeCode(12, prices), "1E1N");
      assert.equal(resolveRangeCode(28, areas), "2UMD");
    },
  },
  {
    name: "derivePostPriceAreaCodes prefers attribute text for backfill",
    run() {
      const derived = derivePostPriceAreaCodes({
        priceText: "700.000 dong/thang",
        acreageText: "28m2",
        priceNumber: 700,
        areaNumber: 28,
        priceCatalog: prices,
        areaCatalog: areas,
      });

      assert.equal(derived.priceNumber, 0.7);
      assert.equal(derived.areaNumber, 28);
      assert.equal(derived.priceCode, "OU1N");
      assert.equal(derived.areaCode, "2UMD");
    },
  },
  {
    name: "resolveProvinceCodeFromAddress matches Ho Chi Minh aliases",
    run() {
      assert.equal(
        resolveProvinceCodeFromAddress("Quan 10, Ho Chi Minh", provinces),
        "TPHCM",
      );
      assert.equal(
        resolveProvinceCodeFromAddress("Quan 7, TP HCM", provinces),
        "TPHCM",
      );
    },
  },
  {
    name: "resolveProvinceCodeFromAddress matches Ha Noi and Da Nang",
    run() {
      assert.equal(
        resolveProvinceCodeFromAddress("Dong Da, Ha Noi", provinces),
        "HANOI",
      );
      assert.equal(
        resolveProvinceCodeFromAddress("Son Tra, Da Nang", provinces),
        "DANANG",
      );
    },
  },
  {
    name: "createProvinceCode and extractProvinceNameFromAddress are deterministic",
    run() {
      assert.equal(
        extractProvinceNameFromAddress("Dia chi: Quy Nhon, Binh Dinh"),
        "Binh Dinh",
      );
      assert.equal(createProvinceCode("Binh Dinh"), "BINHDINH");
    },
  },
  {
    name: "buildProvinceCodeUpdates reports unmatched rows",
    run() {
      const result = buildProvinceCodeUpdates(
        [
          { id: "1", address: "Quan 1, Ho Chi Minh" },
          { id: "2", address: "Unknown address" },
        ],
        provinces,
      );

      assert.deepEqual(result.updates, [{ id: "1", provinceCode: "TPHCM" }]);
      assert.deepEqual(result.unmatched, [
        { id: "2", address: "Unknown address" },
      ]);
    },
  },
  {
    name: "registerService stores normalized email, hashed password and user role",
    async run() {
      const createdUsers = [];

      await withPatched(
        db.User,
        {
          findOne: async () => null,
          create: async (payload) => {
            createdUsers.push(payload);
            return payload;
          },
        },
        async () => {
          const response = await authService.registerService({
            name: "Admin Candidate",
            phone: "090 123 4567",
            email: "ADMIN@EXAMPLE.COM",
            password: "secret12",
            role: "admin",
          });

          assert.equal(response.err, 0);
          assert.equal(createdUsers.length, 1);
          assert.equal(createdUsers[0].phone, "0901234567");
          assert.equal(createdUsers[0].email, "admin@example.com");
          assert.equal(createdUsers[0].role, "user");
          assert.notEqual(createdUsers[0].password, "secret12");
          assert.equal(
            bcrypt.compareSync("secret12", createdUsers[0].password),
            true,
          );

          const payload = jwt.verify(response.token, process.env.SECRET_KEY);
          assert.equal(payload.id, createdUsers[0].id);
          assert.equal(payload.role, "user");
          assert.equal(payload.phone, undefined);
        },
      );
    },
  },
  {
    name: "registerService rejects duplicated email from new or legacy records",
    async run() {
      await withPatched(
        db.User,
        {
          findOne: async ({ where }) => {
            if (where.phone) return null;
            if (where[Op.or]) {
              return { id: "existing-user", fbUrl: "taken@example.com" };
            }
            return null;
          },
        },
        async () => {
          const response = await authService.registerService({
            name: "User",
            phone: "0901234567",
            email: "taken@example.com",
            password: "secret12",
          });

          assert.equal(response.err, 2);
          assert.equal(response.token, null);
        },
      );
    },
  },
  {
    name: "loginService supports email login and embeds role in JWT",
    async run() {
      const hash = bcrypt.hashSync("secret12", bcrypt.genSaltSync(12));

      await withPatched(
        db.User,
        {
          findAll: async ({ where }) => {
            assert.deepEqual(where[Op.or], [
              { email: "admin@example.com" },
              { fbUrl: "admin@example.com" },
            ]);

            return [{
              id: "admin-1",
              email: "admin@example.com",
              role: "admin",
              password: hash,
            }];
          },
        },
        async () => {
          const response = await authService.loginService({
            identifier: "ADMIN@example.com",
            password: "secret12",
          });

          assert.equal(response.err, 0);
          const payload = jwt.verify(response.token, process.env.SECRET_KEY);
          assert.equal(payload.id, "admin-1");
          assert.equal(payload.role, "admin");
        },
      );
    },
  },
  {
    name: "loginService resolves legacy duplicate phones by password match",
    async run() {
      const wrongHash = bcrypt.hashSync("other-pass", bcrypt.genSaltSync(12));
      const correctHash = bcrypt.hashSync("secret12", bcrypt.genSaltSync(12));

      await withPatched(
        db.User,
        {
          findAll: async ({ where }) => {
            assert.deepEqual(where, { phone: "0901234567" });
            return [
              { id: "legacy-a", role: "user", password: wrongHash },
              { id: "legacy-b", role: "user", password: correctHash },
            ];
          },
        },
        async () => {
          const response = await authService.loginService({
            identifier: "0901234567",
            password: "secret12",
          });

          assert.equal(response.err, 0);
          const payload = jwt.verify(response.token, process.env.SECRET_KEY);
          assert.equal(payload.id, "legacy-b");
          assert.equal(payload.role, "user");
        },
      );
    },
  },
  {
    name: "verifyToken reads bearer token and attaches req.user",
    run() {
      const token = jwt.sign(
        { id: "user-1", role: "admin" },
        process.env.SECRET_KEY,
        { expiresIn: "2d" },
      );
      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const res = createMockResponse();
      let nextCalled = false;

      verifyToken(req, res, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, true);
      assert.equal(req.user.id, "user-1");
      assert.equal(req.user.role, "admin");
      assert.equal(res.body, null);
    },
  },
  {
    name: "isAdmin blocks non-admin users with 403",
    run() {
      const req = { user: { id: "user-1", role: "user" } };
      const res = createMockResponse();
      let nextCalled = false;

      isAdmin(req, res, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, false);
      assert.equal(res.statusCode, 403);
      assert.deepEqual(res.body, {
        err: 1,
        msg: "Forbidden",
      });
    },
  },
  {
    name: "manage posts controller returns all posts for admin",
    async run() {
      const postServiceModule = require("../src/services/post");

      await withPatched(
        postServiceModule,
        {
          getAllManagedPostsService: async (filters, options) => ({
            err: 0,
            msg: "OK",
            response: {
              rows: [{ id: "post-admin" }],
              count: 1,
              page: 2,
              limit: 10,
              totalPages: 3,
            },
          }),
          getPostsByUserService: async () => ({
            err: 0,
            msg: "OK",
            response: {
              rows: [{ id: "post-user" }],
              count: 1,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          }),
        },
        async () => {
          const postController = loadFreshModule("../src/controllers/post");
          const res = createMockResponse();

          await postController.getPostsByCurrentUser(
            {
              query: { status: POST_STATUS_DELETED, page: "2" },
              user: { id: "admin-1", role: "admin" },
            },
            res,
          );

          assert.equal(res.statusCode, 200);
          assert.deepEqual(res.body.response.rows, [{ id: "post-admin" }]);
        },
      );
    },
  },
  {
    name: "admin controller keeps deleted filter and pagination intact",
    async run() {
      const adminController = loadFreshModule("../src/controllers/admin");
      const postServiceModule = require("../src/services/post");
      let captured = null;
      const res = createMockResponse();

      await withPatched(
        postServiceModule,
        {
          getAllManagedPostsService: async (filters, options) => {
            captured = { filters, options };
            return {
              err: 0,
              msg: "OK",
              response: {
                rows: [],
                count: 0,
                page: 2,
                limit: 10,
                totalPages: 0,
              },
            };
          },
        },
        async () => {
          await adminController.getPosts(
            { query: { status: POST_STATUS_DELETED, page: "2" } },
            res,
          );
        },
      );

      assert.equal(res.statusCode, 200);
      assert.deepEqual(captured, {
        filters: { status: POST_STATUS_DELETED },
        options: { page: 2, limit: undefined },
      });
    },
  },
  {
    name: "user controller keeps current page and defers to fixed managed page size",
    async run() {
      const userController = loadFreshModule("../src/controllers/user");
      const postServiceModule = require("../src/services/post");
      let captured = null;
      const res = createMockResponse();

      await withPatched(
        postServiceModule,
        {
          getPostsByUserService: async (userId, options) => {
            captured = { userId, options };
            return {
              err: 0,
              msg: "OK",
              response: {
                rows: [{ id: "post-user-page-3" }],
                count: 21,
                page: 3,
                limit: 10,
                totalPages: 3,
              },
            };
          },
        },
        async () => {
          await userController.getMyPosts(
            {
              query: { page: "3" },
              user: { id: "user-1", role: "user" },
            },
            res,
          );
        },
      );

      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body.response.rows, [{ id: "post-user-page-3" }]);
      assert.deepEqual(captured, {
        userId: "user-1",
        options: { status: undefined, page: 3, limit: undefined },
      });
    },
  },
  {
    name: "createNewPostService stores new posts as pending",
    async run() {
      const transaction = createTransaction();
      const postPayloads = [];

      await withPatched(
        db.sequelize,
        { transaction: async () => transaction },
        async () => {
          await withPatched(
            db.Price,
            {
              findAll: async () => prices,
            },
            async () => {
              await withPatched(
                db.Area,
                {
                  findAll: async () => areas,
                },
                async () => {
                  await withPatched(
                    db.Category,
                    {
                      findOne: async () => ({ code: "CTPT", value: "Phong tro" }),
                    },
                    async () => {
                      await withPatched(
                        db.Post,
                        {
                          create: async (payload) => {
                            postPayloads.push(payload);
                            return payload;
                          },
                        },
                        async () => {
                          await withPatched(
                            db.Attribute,
                            { create: async () => ({}) },
                            async () => {
                              await withPatched(
                                db.Image,
                                { create: async () => ({}) },
                                async () => {
                                  await withPatched(
                                    db.Overview,
                                    { create: async () => ({}) },
                                    async () => {
                                      const response =
                                        await postService.createNewPostService(
                                          {
                                            categoryCode: "CTPT",
                                            title: "Phong tro moi cho sinh vien",
                                            address: "So 1, Quan 1, Ho Chi Minh",
                                            description: ["Dong 1", "Dong 2", "Dong 3"],
                                            images: ["img-1"],
                                            priceNumber: 3.5,
                                            areaNumber: 25,
                                            province: "Ho Chi Minh",
                                          },
                                          "user-1",
                                        );

                                      assert.equal(response.err, 0);
                                    },
                                  );
                                },
                              );
                            },
                          );
                        },
                      );
                    },
                  );
                },
              );
            },
          );
        },
      );

      assert.equal(transaction.committed, true);
      assert.equal(postPayloads[0].status, POST_STATUS_PENDING);
    },
  },
  {
    name: "updatePostStatusService allows pending to published",
    async run() {
      let saved = false;
      const model = {
        id: "post-1",
        status: POST_STATUS_PENDING,
        moderatedBy: null,
        moderatedAt: null,
        moderationReason: null,
        async save() {
          saved = true;
        },
      };

      await withPatched(
        db.Post,
        {
          findOne: async ({ where }) => {
            assert.deepEqual(where, { id: "post-1" });
            return model;
          },
        },
        async () => {
          const response = await postService.updatePostStatusService(
            "post-1",
            POST_STATUS_PUBLISHED,
            "admin-1",
          );

          assert.equal(response.err, 0);
          assert.equal(saved, true);
          assert.equal(model.status, POST_STATUS_PUBLISHED);
          assert.equal(model.moderatedBy, "admin-1");
          assert.equal(model.moderationReason, null);
        },
      );
    },
  },
  {
    name: "updatePostStatusService reopens rejected posts back to pending",
    async run() {
      let saved = false;
      const model = {
        id: "post-rejected",
        status: POST_STATUS_REJECTED,
        deletedFromStatus: null,
        moderatedBy: null,
        moderatedAt: null,
        moderationReason: "Missing info",
        async save() {
          saved = true;
        },
      };

      await withPatched(
        db.Post,
        {
          findOne: async ({ where }) => {
            assert.deepEqual(where, { id: "post-rejected" });
            return model;
          },
        },
        async () => {
          const response = await postService.updatePostStatusService(
            "post-rejected",
            POST_STATUS_PENDING,
            "admin-2",
          );

          assert.equal(response.err, 0);
          assert.equal(saved, true);
          assert.equal(model.status, POST_STATUS_PENDING);
          assert.equal(model.moderationReason, null);
        },
      );
    },
  },
  {
    name: "updatePostStatusService stores the source tab before soft delete",
    async run() {
      let saved = false;
      const model = {
        id: "post-2",
        status: POST_STATUS_REJECTED,
        deletedFromStatus: null,
        moderatedBy: null,
        moderatedAt: null,
        moderationReason: "Rejected by admin",
        async save() {
          saved = true;
        },
      };

      await withPatched(
        db.Post,
        {
          findOne: async ({ where }) => {
            assert.deepEqual(where, { id: "post-2" });
            return model;
          },
        },
        async () => {
          const response = await postService.updatePostStatusService(
            "post-2",
            POST_STATUS_DELETED,
            "admin-9",
          );

          assert.equal(response.err, 0);
          assert.equal(saved, true);
          assert.equal(model.status, POST_STATUS_DELETED);
          assert.equal(model.deletedFromStatus, POST_STATUS_REJECTED);
          assert.equal(model.moderationReason, "Rejected by admin");
          assert.equal(response.response.deletedFromStatus, POST_STATUS_REJECTED);
        },
      );
    },
  },
  {
    name: "updatePostStatusService restores deleted posts to the saved tab",
    async run() {
      let saved = false;
      const model = {
        id: "post-3",
        status: POST_STATUS_DELETED,
        deletedFromStatus: POST_STATUS_HIDDEN,
        moderatedBy: null,
        moderatedAt: null,
        moderationReason: "Hidden by admin",
        async save() {
          saved = true;
        },
      };

      await withPatched(
        db.Post,
        {
          findOne: async ({ where }) => {
            assert.deepEqual(where, { id: "post-3" });
            return model;
          },
        },
        async () => {
          const response = await postService.updatePostStatusService(
            "post-3",
            POST_STATUS_HIDDEN,
            "admin-5",
          );

          assert.equal(response.err, 0);
          assert.equal(saved, true);
          assert.equal(model.status, POST_STATUS_HIDDEN);
          assert.equal(model.deletedFromStatus, null);
          assert.equal(model.moderationReason, "Hidden by admin");
          assert.equal(response.response.deletedFromStatus, null);
        },
      );
    },
  },
  {
    name: "updatePostStatusService rejects invalid transitions",
    async run() {
      await withPatched(
        db.Post,
        {
          findOne: async () => ({
            id: "post-1",
            status: POST_STATUS_DELETED,
            async save() {
              throw new Error("save should not be called");
            },
          }),
        },
        async () => {
          const response = await postService.updatePostStatusService(
            "post-1",
            POST_STATUS_PUBLISHED,
            "admin-1",
          );

          assert.equal(response.err, 1);
          assert.equal(response.statusCode, 400);
        },
      );
    },
  },
  {
    name: "user workflow endpoints allow updating and deleting own posts",
    async run() {
      const userController = loadFreshModule("../src/controllers/user");
      const postServiceModule = require("../src/services/post");
      let updatedPayload = null;
      let deletedPostId = null;

      await withPatched(
        postServiceModule,
        {
          updatePostService: async (postId, payload, userId) => {
            updatedPayload = { postId, payload, userId };
            return { err: 0, msg: "OK" };
          },
          deletePostService: async (postId, userId) => {
            deletedPostId = { postId, userId };
            return { err: 0, msg: "OK" };
          },
        },
        async () => {
          const updateRes = createMockResponse();
          await userController.updateMyPost(
            {
              params: { id: "post-1" },
              user: { id: "user-1" },
              body: {
                categoryCode: "CTPT",
                title: "Phong tro da du thong tin",
                address: "So 1, Quan 1, Ho Chi Minh",
                description: ["Dong 1", "Dong 2", "Dong 3"],
                images: ["img-1"],
                priceNumber: 3.5,
                areaNumber: 25,
                province: "Ho Chi Minh",
              },
            },
            updateRes,
          );
          assert.equal(updateRes.statusCode, 200);
          assert.deepEqual(updatedPayload, {
            postId: "post-1",
            payload: {
              categoryCode: "CTPT",
              title: "Phong tro da du thong tin",
              priceNumber: 3.5,
              areaNumber: 25,
              images: ["img-1"],
              address: "So 1, Quan 1, Ho Chi Minh",
              description: ["Dong 1", "Dong 2", "Dong 3"],
              target: "Tat ca",
              provinceCode: "",
              province: "Ho Chi Minh",
            },
            userId: "user-1",
          });

          const deleteRes = createMockResponse();
          await userController.deleteMyPost(
            { params: { id: "post-1" }, user: { id: "user-1" } },
            deleteRes,
          );
          assert.equal(deleteRes.statusCode, 200);
          assert.deepEqual(deletedPostId, {
            postId: "post-1",
            userId: "user-1",
          });
        },
      );
    },
  },
  {
    name: "getPostsLimitService keeps userId for role-aware public actions",
    async run() {
      await withPatched(
        db.Post,
        {
          findAll: async () => [
            {
              id: "post-1",
              userId: "user-9",
              title: "Phong dep",
              star: 0,
              address: "Quan 1, Ho Chi Minh",
              description: JSON.stringify(["Dong 1"]),
              images: { image: JSON.stringify(["img-1"]) },
              attributes: { price: "3 trieu", acreage: "20m2" },
              user: {
                name: "Owner",
                phone: "0901234567",
                email: "owner@example.com",
                fbUrl: "",
              },
            },
          ],
          count: async () => 1,
        },
        async () => {
          const response = await postService.getPostsLimitService(1, {}, {});
          const firstPost = response.response.rows[0];

          assert.equal(firstPost.userId, "user-9");
          assert.equal(firstPost.user.email, "owner@example.com");
        },
      );
    },
  },
  {
    name: "getPostsByUserService enforces 10 posts per page and orders newest first",
    async run() {
      let capturedCountWhere = null;
      let capturedRowsQuery = null;

      await withPatched(
        db.Post,
        {
          count: async ({ where }) => {
            capturedCountWhere = where;
            return 23;
          },
          findAll: async (query) => {
            capturedRowsQuery = query;
            return [];
          },
        },
        async () => {
          const response = await postService.getPostsByUserService("user-9", {
            page: 2,
            limit: 999,
          });

          assert.equal(response.err, 0);
          assert.equal(response.response.page, 2);
          assert.equal(response.response.limit, 10);
          assert.equal(response.response.totalPages, 3);
        },
      );

      assert.deepEqual(capturedCountWhere, { userId: "user-9" });
      assert.equal(capturedRowsQuery.limit, 10);
      assert.equal(capturedRowsQuery.offset, 10);
      assert.deepEqual(capturedRowsQuery.order, [["createdAt", "DESC"]]);
      assert.deepEqual(capturedRowsQuery.where, { userId: "user-9" });
    },
  },
  {
    name: "toggleSavedPostService creates and removes saved posts",
    async run() {
      const transaction = createTransaction();
      let created = null;
      let destroyed = false;
      let existing = null;

      await withPatched(
        db.sequelize,
        { transaction: async () => transaction },
        async () => {
          await withPatched(
            db.Post,
            {
              findOne: async ({ where }) => {
                assert.equal(where.id, "post-1");
                assert.equal(where.status, POST_STATUS_PUBLISHED);
                return { id: "post-1" };
              },
            },
            async () => {
              await withPatched(
                db.SavedPost,
                {
                  findOne: async () => existing,
                  create: async (payload) => {
                    created = payload;
                    existing = {
                      ...payload,
                      async destroy() {
                        destroyed = true;
                      },
                    };
                    return existing;
                  },
                },
                async () => {
                  const first = await savedPostService.toggleSavedPostService(
                    "user-1",
                    "post-1",
                  );
                  assert.equal(first.err, 0);
                  assert.deepEqual(first.response, { saved: true, postId: "post-1" });
                  assert.deepEqual(created, { userId: "user-1", postId: "post-1" });

                  const second = await savedPostService.toggleSavedPostService(
                    "user-1",
                    "post-1",
                  );
                  assert.equal(second.err, 0);
                  assert.deepEqual(second.response, { saved: false, postId: "post-1" });
                  assert.equal(destroyed, true);
                },
              );
            },
          );
        },
      );

      assert.equal(transaction.committed, true);
      assert.equal(transaction.rolledBack, false);
    },
  },
  {
    name: "getSavedPostIdsService returns saved post ids",
    async run() {
      await withPatched(
        db.SavedPost,
        {
          findAll: async () => [{ postId: "post-1" }, { postId: "post-2" }],
        },
        async () => {
          const response = await savedPostService.getSavedPostIdsService("user-1");
          assert.equal(response.err, 0);
          assert.deepEqual(response.response, ["post-1", "post-2"]);
        },
      );
    },
  },
  {
    name: "deletePostService still prevents deleting another user's post",
    async run() {
      const transaction = createTransaction();

      await withPatched(
        db.sequelize,
        {
          transaction: async () => transaction,
        },
        async () => {
          await withPatched(
            db.Post,
            {
              findOne: async ({ where }) => {
                assert.deepEqual(where, {
                  id: "post-1",
                  userId: "user-1",
                });
                return null;
              },
            },
            async () => {
              const response = await postService.deletePostService("post-1", "user-1");

              assert.equal(response.err, 1);
              assert.equal(transaction.rolledBack, true);
              assert.equal(transaction.committed, false);
            },
          );
        },
      );
    },
  },
  {
    name: "forceDeletePostService deletes post and related records in one transaction",
    async run() {
      const transaction = createTransaction();
      const destroyCalls = [];

      await withPatched(
        db.sequelize,
        {
          transaction: async () => transaction,
        },
        async () => {
          await withPatched(
            db.Post,
            {
              findOne: async ({ where }) => {
                assert.deepEqual(where, { id: "post-1" });
                return {
                  id: "post-1",
                  status: POST_STATUS_DELETED,
                  imagesId: "img-1",
                  attributesId: "attr-1",
                  overviewId: "overview-1",
                };
              },
              destroy: async ({ where }) => {
                destroyCalls.push({ model: "Post", where });
              },
            },
            async () => {
              await withPatched(
                db.Image,
                {
                  findOne: async ({ where }) => {
                    assert.deepEqual(where, { id: "img-1" });
                    return { id: "img-1", image: JSON.stringify(["https://cdn.example.com/img-1.jpg"]) };
                  },
                  destroy: async ({ where }) => {
                    destroyCalls.push({ model: "Image", where });
                  },
                },
                async () => {
                  await withPatched(
                    db.Attribute,
                    {
                      destroy: async ({ where }) => {
                        destroyCalls.push({ model: "Attribute", where });
                      },
                    },
                    async () => {
                      await withPatched(
                        db.Overview,
                        {
                          destroy: async ({ where }) => {
                            destroyCalls.push({ model: "Overview", where });
                          },
                        },
                        async () => {
                          const response = await postService.forceDeletePostService("post-1");

                          assert.equal(response.err, 0);
                          assert.equal(transaction.committed, true);
                          assert.equal(transaction.rolledBack, false);
                          assert.deepEqual(destroyCalls, [
                            { model: "Post", where: { id: "post-1" } },
                            { model: "Image", where: { id: "img-1" } },
                            { model: "Attribute", where: { id: "attr-1" } },
                            { model: "Overview", where: { id: "overview-1" } },
                          ]);
                        },
                      );
                    },
                  );
                },
              );
            },
          );
        },
      );
    },
  },
  {
    name: "forceDeletePostService refuses hard delete outside deleted tab",
    async run() {
      const transaction = createTransaction();

      await withPatched(
        db.sequelize,
        {
          transaction: async () => transaction,
        },
        async () => {
          await withPatched(
            db.Post,
            {
              findOne: async () => ({
                id: "post-1",
                status: POST_STATUS_PUBLISHED,
              }),
            },
            async () => {
              const response = await postService.forceDeletePostService("post-1");

              assert.equal(response.err, 1);
              assert.equal(response.statusCode, 400);
              assert.equal(transaction.rolledBack, true);
              assert.equal(transaction.committed, false);
            },
          );
        },
      );
    },
  },
  {
    name: "promoteUserToAdmin updates role and strips password from response",
    async run() {
      let saved = false;
      const model = {
        id: "user-1",
        role: "user",
        email: "user@example.com",
        password: "hashed-password",
        async save() {
          saved = true;
        },
        get() {
          return {
            id: this.id,
            role: this.role,
            email: this.email,
            password: this.password,
          };
        },
      };

      await withPatched(
        db.User,
        {
          findOne: async ({ where }) => {
            assert.deepEqual(where, { id: "user-1" });
            return model;
          },
        },
        async () => {
          const response = await userService.promoteUserToAdmin("user-1");

          assert.equal(response.err, 0);
          assert.equal(saved, true);
          assert.equal(model.role, "admin");
          assert.equal(response.response.role, "admin");
          assert.equal("password" in response.response, false);
        },
      );
    },
  },
];

(async () => {
  let passed = 0;

  for (let index = 0; index < tests.length; index += 1) {
    const { name, run } = tests[index];

    try {
      await run();
      passed += 1;
      console.log(`${index + 1}. PASS ${name}`);
    } catch (error) {
      console.error(`${index + 1}. FAIL ${name}`);
      console.error(error);
      process.exit(1);
    }
  }

  console.log(`All ${passed} backend tests passed.`);
})();
