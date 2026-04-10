const db = require("../src/models");

(async function () {
  try {
    await db.sequelize.authenticate();
    console.log("Sequelize connected");
    const codes = ["TPHCM"];
    const provinces = await db.Province.findAll({
      where: { code: codes },
      raw: true,
    });
    console.log("provinces via sequelize:", provinces);
    await db.sequelize.close();
    process.exit(0);
  } catch (e) {
    console.error(e && e.message);
    process.exit(1);
  }
})();
