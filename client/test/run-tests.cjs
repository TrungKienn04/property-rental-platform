const assert = require("node:assert/strict");
const {
  buildSearchParamsObject,
  buildSearchTitle,
  getTotalPages,
  mergeQueryValues,
} = require("../src/ultils/Common/queryHelpers");
const {
  getDisplayDescription,
  getPrimaryImage,
  getShortAddress,
} = require("../src/ultils/Common/postHelpers");
const {
  extractRoleFromToken,
  normalizeLoginIdentifier,
} = require("../src/ultils/Common/authHelpers");
const {
  canDeletePost,
  canEditManagedPost,
} = require("../src/ultils/Common/postPermissions");

const tests = [
  {
    name: "buildSearchParamsObject preserves repeated params as arrays",
    run() {
      const params = new URLSearchParams(
        "priceNumber=3&priceNumber=5&provinceCode=TPHCM",
      );

      assert.deepEqual(buildSearchParamsObject(params), {
        priceNumber: ["3", "5"],
        provinceCode: "TPHCM",
      });
    },
  },
  {
    name: "mergeQueryValues removes empty values",
    run() {
      assert.deepEqual(
        mergeQueryValues(
          { provinceCode: "TPHCM", sort: "latest" },
          { sort: null, page: 2 },
        ),
        {
          provinceCode: "TPHCM",
          page: 2,
        },
      );
    },
  },
  {
    name: "buildSearchTitle creates readable label",
    run() {
      assert.equal(
        buildSearchTitle({
          category: "Cho thuê phòng trọ",
          province: "Hồ Chí Minh",
          price: "Từ 3 - 5 triệu",
        }),
        "Cho thuê phòng trọ tại Hồ Chí Minh mức giá Từ 3 - 5 triệu",
      );
    },
  },
  {
    name: "getTotalPages falls back to five posts per page",
    run() {
      assert.equal(getTotalPages(21), 5);
    },
  },
  {
    name: "getDisplayDescription joins array values",
    run() {
      assert.equal(
        getDisplayDescription(["dòng 1", "dòng 2"]),
        "dòng 1 dòng 2",
      );
    },
  },
  {
    name: "getShortAddress returns trailing address segments",
    run() {
      assert.equal(
        getShortAddress("Địa chỉ: Quận 10, Hồ Chí Minh, Việt Nam"),
        "Hồ Chí Minh, Việt Nam",
      );
    },
  },
  {
    name: "getPrimaryImage uses fallback for empty arrays",
    run() {
      assert.equal(getPrimaryImage([], "/fallback.svg"), "/fallback.svg");
    },
  },
  {
    name: "normalizeLoginIdentifier supports both email and phone login",
    run() {
      assert.equal(
        normalizeLoginIdentifier(" ADMIN@Example.com "),
        "admin@example.com",
      );
      assert.equal(
        normalizeLoginIdentifier("090 123 4567"),
        "0901234567",
      );
    },
  },
  {
    name: "extractRoleFromToken reads role from JWT payload",
    run() {
      const payload = Buffer.from(
        JSON.stringify({ id: "admin-1", role: "admin" }),
      ).toString("base64url");
      const token = `header.${payload}.signature`;

      assert.equal(extractRoleFromToken(token), "admin");
    },
  },
  {
    name: "canDeletePost allows admin on any post and user on own post only",
    run() {
      assert.equal(
        canDeletePost({
          role: "admin",
          currentUserId: "user-1",
          post: { id: "post-1", userId: "user-2" },
        }),
        true,
      );
      assert.equal(
        canDeletePost({
          role: "user",
          currentUserId: "user-1",
          post: { id: "post-1", userId: "user-1" },
        }),
        true,
      );
      assert.equal(
        canDeletePost({
          role: "user",
          currentUserId: "user-1",
          post: { id: "post-1", userId: "user-2" },
        }),
        false,
      );
    },
  },
  {
    name: "canEditManagedPost only allows the post owner to edit",
    run() {
      assert.equal(
        canEditManagedPost({
          currentUserId: "user-1",
          post: { id: "post-1", userId: "user-1" },
        }),
        true,
      );
      assert.equal(
        canEditManagedPost({
          currentUserId: "user-1",
          post: { id: "post-1", userId: "user-2" },
        }),
        false,
      );
    },
  },
];

let passed = 0;

tests.forEach(({ name, run }, index) => {
  try {
    run();
    passed += 1;
    console.log(`${index + 1}. PASS ${name}`);
  } catch (error) {
    console.error(`${index + 1}. FAIL ${name}`);
    console.error(error);
    process.exit(1);
  }
});

console.log(`All ${passed} client tests passed.`);
