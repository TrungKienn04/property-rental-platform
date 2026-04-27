const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
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

const systemPostSource = fs.readFileSync(
  path.resolve(__dirname, "../src/ultils/Common/systemPost.js"),
  "utf8",
);

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
    name: "canDeletePost allows admin or active owner to delete",
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
          currentUserStatus: "active",
        }),
        true,
      );
      assert.equal(
        canDeletePost({
          role: "user",
          currentUserId: "user-1",
          post: { id: "post-1", userId: "user-2" },
          currentUserStatus: "active",
        }),
        false,
      );
    },
  },
  {
    name: "canEditManagedPost only allows active owner to edit",
    run() {
      assert.equal(
        canEditManagedPost({
          role: "user",
          currentUserId: "user-1",
          post: { id: "post-1", userId: "user-1" },
          currentUserStatus: "active",
        }),
        true,
      );
      assert.equal(
        canEditManagedPost({
          role: "user",
          currentUserId: "user-1",
          post: { id: "post-1", userId: "user-2" },
          currentUserStatus: "active",
        }),
        false,
      );
    },
  },
  {
    name: "admin filters no longer expose the draft tab",
    run() {
      assert.equal(systemPostSource.includes('value: "draft"'), false);
    },
  },
  {
    name: "admin workflow exposes reopen and unhide actions",
    run() {
      assert.equal(systemPostSource.includes('key: "reopen-rejected"'), true);
      assert.equal(systemPostSource.includes('key: "unhide"'), true);
    },
  },
  {
    name: "deleted tab exposes restore and force delete actions",
    run() {
      assert.equal(systemPostSource.includes('key: "restore-deleted"'), true);
      assert.equal(systemPostSource.includes('actionType: "force-delete"'), true);
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
