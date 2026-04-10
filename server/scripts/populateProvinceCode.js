const db = require("../src/models");
const { Op } = require("sequelize");

async function run() {
  try {
    await db.sequelize.authenticate();
    console.log("DB connected");

    const provinces = await db.Province.findAll({ raw: true });
    console.log("Found provinces:", provinces.length);
    let totalUpdated = 0;

    for (const p of provinces) {
      const code = p.code;
      const name = p.value;
      if (!name || !code) continue;

      // build variants: full name, last 3 tokens, last 2 tokens
      const parts = name.split(/\s+/).filter(Boolean);
      const variants = new Set([name]);
      if (parts.length >= 3) variants.add(parts.slice(-3).join(" "));
      if (parts.length >= 2) variants.add(parts.slice(-2).join(" "));

      for (const v of variants) {
        const like = `%${v}%`;
        const [affected] = await db.Post.update(
          { provinceCode: code },
          { where: { address: { [Op.like]: like } } },
        );
        if (affected && affected > 0) {
          console.log(
            `Updated ${affected} posts for province ${code} (match='${v}')`,
          );
          totalUpdated += affected;
        }
      }
    }

    console.log("Total posts updated with provinceCode:", totalUpdated);
    await db.sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error("populateProvinceCode failed:", err && err.message);
    process.exit(1);
  }
}

run();
