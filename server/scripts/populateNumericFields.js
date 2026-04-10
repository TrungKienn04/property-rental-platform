const db = require("../src/models");

async function run() {
  try {
    await db.sequelize.authenticate();
    console.log("DB connected");

    const posts = await db.Post.findAll({
      include: [
        {
          model: db.Attribute,
          as: "attributes",
          attributes: ["price", "acreage"],
        },
      ],
      limit: 1000,
    });

    console.log("Found posts:", posts.length);
    let updated = 0;
    for (const p of posts) {
      const attr = p.attributes || {};
      let priceNum = null;
      let areaNum = null;

      if (attr.price && typeof attr.price === "string") {
        // try to extract a number
        const m = attr.price.match(/([0-9]+(?:[\.\,][0-9]+)?)/);
        if (m) {
          // normalize comma to dot
          const raw = m[1].replace(/,/g, ".");
          priceNum = parseFloat(raw);
        }
      }
      if (attr.acreage && typeof attr.acreage === "string") {
        const m2 = attr.acreage.match(/([0-9]+(?:[\.\,][0-9]+)?)/);
        if (m2) {
          const raw2 = m2[1].replace(/,/g, ".");
          areaNum = parseFloat(raw2);
        }
      }

      // update if parsed
      const toUpdate = {};
      if (priceNum !== null && !isNaN(priceNum))
        toUpdate.priceNumber = priceNum;
      if (areaNum !== null && !isNaN(areaNum)) toUpdate.areaNumber = areaNum;

      if (Object.keys(toUpdate).length > 0) {
        await p.update(toUpdate);
        updated++;
      }
    }

    console.log("Updated posts with numeric fields:", updated);
    await db.sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error("populate failed:", err && err.message);
    process.exit(1);
  }
}

run();
