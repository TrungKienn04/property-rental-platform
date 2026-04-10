const db = require("../src/models");

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log("DB connected");
    const qi = db.sequelize.getQueryInterface();
    const desc = await qi.describeTable("Posts");
    console.log("Posts table columns:");
    console.log(desc);
    process.exit(0);
  } catch (err) {
    console.error("describe error", err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
