const db = require("../src/models");
const { Op } = require("sequelize");
const util = require("util");

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log("DB connected");

    const queries = {
      provinceCode: "TPHCM",
      priceNumber: { [Op.between]: [0, 15] },
    };
    const findOptions = {
      where: queries,
      raw: true,
      nest: true,
      offset: 0,
      limit: 5,
      include: [
        { model: db.Image, as: "images", attributes: ["image"] },
        {
          model: db.Attribute,
          as: "attributes",
          attributes: ["price", "acreage", "published", "hashtag"],
        },
        { model: db.User, as: "user", attributes: ["name", "zalo", "phone"] },
      ],
      attributes: ["id", "title", "star", "address", "description"],
    };

    console.log("findOptions.where =", findOptions.where);

    try {
      const rows = await db.Post.findAll({
        ...findOptions,
        logging: (sql) => console.log("SQL:", sql),
      });
      console.log("rows length =", rows.length);
    } catch (e) {
      console.error("findAll error:", e && e.stack ? e.stack : e);
      console.error(
        "findAll error props:",
        util.inspect(e, { depth: 6, showHidden: true }),
      );
      try {
        console.error(
          "findAll error names:",
          Object.getOwnPropertyNames(e || {}),
        );
      } catch (_) {}
    }

    try {
      const count = await db.Post.count({
        where: findOptions.where,
        logging: (sql) => console.log("COUNT SQL:", sql),
      });
      console.log("count =", count);
    } catch (e) {
      console.error("count error:", e && e.stack ? e.stack : e);
      console.error(
        "count error props:",
        util.inspect(e, { depth: 6, showHidden: true }),
      );
      try {
        console.error(
          "count error names:",
          Object.getOwnPropertyNames(e || {}),
        );
      } catch (_) {}
    }

    process.exit(0);
  } catch (err) {
    console.error("connect/auth error", err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
