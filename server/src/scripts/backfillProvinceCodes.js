import db from "../models";
import fs from "fs";
const {
  buildProvinceCodeUpdates,
  createProvinceCode,
  extractProvinceNameFromAddress,
  mergeProvinceCatalog,
} = require("../ultis/provinceCode");

const reportFile = "province_code_backfill_report.json";

async function main() {
  console.log("Starting provinceCode backfill...");

  const provinces = await db.Province.findAll({
    raw: true,
    attributes: ["code", "value"],
  });

  const posts = await db.Post.findAll({
    raw: true,
    attributes: ["id", "address", "provinceCode"],
  });

  const stalePosts = posts.filter((post) => !post?.provinceCode);
  const missingProvinceRecords = [];
  const knownProvinceCodes = new Set(
    mergeProvinceCatalog(provinces).map((province) => province.code),
  );

  stalePosts.forEach((post) => {
    const provinceName = extractProvinceNameFromAddress(post.address);
    const provinceCode = createProvinceCode(provinceName);

    if (!provinceName || !provinceCode || knownProvinceCodes.has(provinceCode)) {
      return;
    }

    knownProvinceCodes.add(provinceCode);
    missingProvinceRecords.push({
      code: provinceCode,
      value: provinceName,
    });
  });

  if (missingProvinceRecords.length) {
    await db.Province.bulkCreate(missingProvinceRecords, {
      ignoreDuplicates: true,
    });
  }

  const { updates, unmatched } = buildProvinceCodeUpdates(
    stalePosts,
    mergeProvinceCatalog([...provinces, ...missingProvinceRecords]),
  );

  for (const item of updates) {
    await db.Post.update(
      { provinceCode: item.provinceCode },
      { where: { id: item.id } },
    );
  }

  fs.writeFileSync(
    reportFile,
    JSON.stringify(
      {
        scanned: stalePosts.length,
        createdProvinces: missingProvinceRecords.length,
        updated: updates.length,
        unmatched: unmatched.length,
        unmatchedItems: unmatched.slice(0, 50),
      },
      null,
      2,
    ),
  );

  console.log(
    `Backfill complete. updated=${updates.length}, unmatched=${unmatched.length}`,
  );
  console.log(`Report written to ${reportFile}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
