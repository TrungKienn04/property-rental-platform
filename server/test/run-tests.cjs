const assert = require("node:assert/strict");
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

console.log(`All ${passed} backend tests passed.`);
