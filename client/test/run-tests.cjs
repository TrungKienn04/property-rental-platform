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
