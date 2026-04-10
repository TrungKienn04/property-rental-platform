import db from "../models";
import fs from "fs";
const { extractUrls, normalizeImageList } = require("../ultis/postData");

// Script to repair Images.image fields that may contain truncated/malformed JSON strings.
// Usage (dev): npx babel-node src/scripts/repairImages.js

const backupFile = "images_backup.json";

async function backupImages() {
  const images = await db.Image.findAll({ raw: true });
  fs.writeFileSync(backupFile, JSON.stringify(images, null, 2));
  console.log(`Backup written to ${backupFile}`);
}

async function repair() {
  console.log("Starting images repair...");
  await backupImages();
  const images = await db.Image.findAll({ raw: true });
  let updated = 0;
  let failed = [];
  for (const img of images) {
    const val = img.image;
    let arr = null;
    try {
      arr = normalizeImageList(val);
    } catch (err) {
      // attempt to extract urls
      const urls = extractUrls(val);
      if (urls.length > 0) arr = urls;
      else {
        failed.push({ id: img.id, image: val?.slice(0, 200) });
        continue;
      }
    }
    try {
      await db.Image.update(
        { image: JSON.stringify(arr) },
        { where: { id: img.id } },
      );
      updated++;
    } catch (err) {
      failed.push({ id: img.id, err: err.message });
    }
  }
  console.log(`Repair complete. updated=${updated}, failed=${failed.length}`);
  if (failed.length) {
    fs.writeFileSync(
      "images_repair_failed.json",
      JSON.stringify(failed, null, 2),
    );
    console.log("Failures written to images_repair_failed.json");
  }
  process.exit(0);
}

repair().catch((err) => {
  console.error(err);
  process.exit(1);
});
