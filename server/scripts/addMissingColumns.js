const db = require("../src/models");

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log("DB connected");
    const qi = db.sequelize.getQueryInterface();
    const desc = await qi.describeTable("Posts");
    const toAdd = [];
    if (!desc.provinceCode)
      toAdd.push({
        name: "provinceCode",
        def: { type: db.Sequelize.STRING, allowNull: true },
      });
    if (!desc.priceCode)
      toAdd.push({
        name: "priceCode",
        def: { type: db.Sequelize.STRING, allowNull: true },
      });
    if (!desc.areaCode)
      toAdd.push({
        name: "areaCode",
        def: { type: db.Sequelize.STRING, allowNull: true },
      });
    if (!desc.priceNumber)
      toAdd.push({
        name: "priceNumber",
        def: { type: db.Sequelize.FLOAT, allowNull: true },
      });
    if (!desc.areaNumber)
      toAdd.push({
        name: "areaNumber",
        def: { type: db.Sequelize.FLOAT, allowNull: true },
      });

    if (toAdd.length === 0) {
      console.log("No columns to add.");
      process.exit(0);
    }

    for (const col of toAdd) {
      console.log("Adding column", col.name);
      await qi.addColumn("Posts", col.name, col.def);
      console.log("Added", col.name);
    }

    console.log("All missing columns added.");
    process.exit(0);
  } catch (err) {
    console.error("add columns error", err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
