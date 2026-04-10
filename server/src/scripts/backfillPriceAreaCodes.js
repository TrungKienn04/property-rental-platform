import db from "../models";
import fs from "fs";
import { dataArea, dataPrice } from "../ultis/data";

const {
  derivePostPriceAreaCodes,
} = require("../ultis/priceAreaCode");

const reportFile = "price_area_backfill_report.json";

async function main() {
  console.log("Starting price/area backfill...");

  const [priceCatalog, areaCatalog, posts] = await Promise.all([
    db.Price.findAll({
      raw: true,
      attributes: ["code", "value", "order"],
    }),
    db.Area.findAll({
      raw: true,
      attributes: ["code", "value", "order"],
    }),
    db.Post.findAll({
      raw: true,
      nest: true,
      include: [
        {
          model: db.Attribute,
          as: "attributes",
          attributes: ["price", "acreage"],
        },
      ],
      attributes: [
        "id",
        "title",
        "priceNumber",
        "areaNumber",
        "priceCode",
        "areaCode",
      ],
    }),
  ]);

  const effectivePriceCatalog = priceCatalog.length ? priceCatalog : dataPrice;
  const effectiveAreaCatalog = areaCatalog.length ? areaCatalog : dataArea;
  const unmatched = [];
  let updated = 0;

  for (const post of posts) {
    const derived = derivePostPriceAreaCodes({
      priceText: post?.attributes?.price,
      acreageText: post?.attributes?.acreage,
      priceNumber: post.priceNumber,
      areaNumber: post.areaNumber,
      priceCatalog: effectivePriceCatalog,
      areaCatalog: effectiveAreaCatalog,
    });

    const nextValues = {};

    if (
      derived.priceNumber !== null &&
      Number(post.priceNumber) !== derived.priceNumber
    ) {
      nextValues.priceNumber = derived.priceNumber;
    }

    if (
      derived.areaNumber !== null &&
      Number(post.areaNumber) !== derived.areaNumber
    ) {
      nextValues.areaNumber = derived.areaNumber;
    }

    if (derived.priceCode && post.priceCode !== derived.priceCode) {
      nextValues.priceCode = derived.priceCode;
    }

    if (derived.areaCode && post.areaCode !== derived.areaCode) {
      nextValues.areaCode = derived.areaCode;
    }

    if (!derived.priceCode || !derived.areaCode) {
      unmatched.push({
        id: post.id,
        title: post.title,
        price: post?.attributes?.price || null,
        acreage: post?.attributes?.acreage || null,
        currentPriceNumber: post.priceNumber,
        currentAreaNumber: post.areaNumber,
        derived,
      });
    }

    if (!Object.keys(nextValues).length) continue;

    await db.Post.update(nextValues, {
      where: { id: post.id },
    });
    updated += 1;
  }

  fs.writeFileSync(
    reportFile,
    JSON.stringify(
      {
        scanned: posts.length,
        updated,
        unmatched: unmatched.length,
        unmatchedItems: unmatched.slice(0, 50),
      },
      null,
      2,
    ),
  );

  console.log(
    `Backfill complete. scanned=${posts.length}, updated=${updated}, unmatched=${unmatched.length}`,
  );
  console.log(`Report written to ${reportFile}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
