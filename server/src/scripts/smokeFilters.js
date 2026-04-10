const fs = require("fs");
const { resolveProvinceCodeFromAddress } = require("../ultis/provinceCode");

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:5000/api/v1";
const outputFile = "filter_smoke_report.json";

const fetchJson = async (path) => {
  const response = await fetch(`${BASE_URL}${path}`);
  const json = await response.json();
  return { status: response.status, json };
};

const parseRangeFromLabel = (label = "") => {
  const numbers = (label.match(/\d+/g) || []).map(Number);

  if (!numbers.length) return null;
  if (/dưới/i.test(label)) return [0, numbers[0]];
  if (/trên/i.test(label)) return [numbers[0], numbers[0]];
  if (numbers.length >= 2) return [numbers[0], numbers[1]];

  return [numbers[0], numbers[0]];
};

async function main() {
  console.log(`Starting smoke test against ${BASE_URL}`);

  const [categoriesRes, provincesRes, pricesRes, areasRes] = await Promise.all([
    fetchJson("/category/all"),
    fetchJson("/province/all"),
    fetchJson("/price/all"),
    fetchJson("/area/all"),
  ]);

  const categories = categoriesRes.json.response || [];
  const provinces = provincesRes.json.response || [];
  const prices = pricesRes.json.response || [];
  const areas = areasRes.json.response || [];
  const failures = [];
  let checked = 0;
  let detailChecked = 0;

  const categoryOptions = [null, ...categories.map((item) => item.code)];
  const provinceOptions = [null, ...provinces.map((item) => item.code)];
  const priceOptions = [null, ...prices.map((item) => item.code)];
  const areaOptions = [null, ...areas.map((item) => item.code)];
  const sortOptions = [null, "latest"];

  for (const categoryCode of categoryOptions) {
    for (const provinceCode of provinceOptions) {
      for (const priceCode of priceOptions) {
        for (const areaCode of areaOptions) {
          for (const sort of sortOptions) {
            const params = new URLSearchParams({ page: "1" });

            if (categoryCode) params.set("categoryCode", categoryCode);
            if (provinceCode) params.set("provinceCode", provinceCode);
            if (priceCode) params.set("priceCode", priceCode);
            if (areaCode) params.set("areaCode", areaCode);
            if (sort) params.set("sort", sort);

            const path = `/post/limit?${params.toString()}`;
            const { status, json } = await fetchJson(path);
            checked += 1;

            if (status !== 200 || json?.err !== 0) {
              failures.push({ type: "http", path, status, err: json?.err });
              continue;
            }

            const rows = json?.response?.rows || [];
            const count = json?.response?.count;

            if (!Array.isArray(rows) || typeof count !== "number" || rows.length > 5 || count < rows.length) {
              failures.push({
                type: "shape",
                path,
                count,
                rowLength: rows.length,
              });
              continue;
            }

            if (provinceCode && rows.length) {
              const provinceMatch = rows.every(
                (row) =>
                  resolveProvinceCodeFromAddress(row.address, provinces) === provinceCode,
              );

              if (!provinceMatch) {
                failures.push({
                  type: "province-mismatch",
                  path,
                  rows: rows.slice(0, 3).map((row) => ({
                    id: row.id,
                    address: row.address,
                  })),
                });
              }
            }

            if (rows[0]?.id) {
              const detail = await fetchJson(`/post/${rows[0].id}`);
              detailChecked += 1;

              if (detail.status !== 200 || detail.json?.err !== 0 || detail.json?.response?.id !== rows[0].id) {
                failures.push({
                  type: "detail",
                  path,
                  postId: rows[0].id,
                  status: detail.status,
                  err: detail.json?.err,
                });
              }
            }
          }
        }
      }
    }
  }

  const representativeRanges = [
    { priceNumber: parseRangeFromLabel("Từ 1 - 2 triệu"), areaNumber: parseRangeFromLabel("Từ 20m - 30m") },
    { priceNumber: parseRangeFromLabel("Từ 3 - 5 triệu"), areaNumber: parseRangeFromLabel("Từ 30m - 50m") },
    { priceNumber: parseRangeFromLabel("Trên 15 triệu"), areaNumber: parseRangeFromLabel("Trên 90m") },
  ];

  for (const rangeCase of representativeRanges) {
    for (const categoryCode of categoryOptions) {
      for (const provinceCode of provinceOptions) {
        const params = new URLSearchParams({ page: "1" });

        if (categoryCode) params.set("categoryCode", categoryCode);
        if (provinceCode) params.set("provinceCode", provinceCode);
        if (rangeCase.priceNumber) {
          rangeCase.priceNumber.forEach((item) =>
            params.append("priceNumber", item.toString()),
          );
        }
        if (rangeCase.areaNumber) {
          rangeCase.areaNumber.forEach((item) =>
            params.append("areaNumber", item.toString()),
          );
        }

        const path = `/post/limit?${params.toString()}`;
        const { status, json } = await fetchJson(path);
        checked += 1;

        if (status !== 200 || json?.err !== 0) {
          failures.push({ type: "range-http", path, status, err: json?.err });
        }
      }
    }
  }

  const report = {
    baseUrl: BASE_URL,
    checked,
    detailChecked,
    failures: failures.length,
    items: failures.slice(0, 100),
  };

  fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));

  if (failures.length) {
    console.error(`Smoke test failed with ${failures.length} issues.`);
    console.error(`Report written to ${outputFile}`);
    process.exit(1);
  }

  console.log(`Smoke test passed. checked=${checked}, detailChecked=${detailChecked}`);
  console.log(`Report written to ${outputFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
