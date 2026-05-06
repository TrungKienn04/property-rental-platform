import db from "../models";

const WINDOW_START = "2026-02-01 08:00:00";
const WINDOW_MINUTES = 48 * 24 * 60; // 01 Feb through 20 Mar
const MAX_UPDATE_DELAY_MINUTES = 3 * 24 * 60;
const TIMESTAMP_TABLES = [
  "Posts", "Users", "SavedPosts", "Categories", "Categorys",
  "Prices", "Areas", "Provinces", "Labels",
];

const hasColumn = (columns, column) =>
  Object.prototype.hasOwnProperty.call(columns, column);

const createdExpression = (idColumn = "id") =>
  `DATE_ADD('${WINDOW_START}', INTERVAL MOD(CRC32(CAST(\`${idColumn}\` AS CHAR)), ${WINDOW_MINUTES}) MINUTE)`;

const updatedExpression = (idColumn = "id") =>
  `DATE_ADD(${createdExpression(idColumn)}, INTERVAL (1 + MOD(CRC32(CONCAT(CAST(\`${idColumn}\` AS CHAR), '-updated')), ${MAX_UPDATE_DELAY_MINUTES})) MINUTE)`;

const updateTimestampPair = async (queryInterface, tableName, transaction) => {
  const columns = await queryInterface.describeTable(tableName);
  if (!hasColumn(columns, "id") || !hasColumn(columns, "createdAt") || !hasColumn(columns, "updatedAt")) return;

  await db.sequelize.query(
    `UPDATE \`${tableName}\` SET \`createdAt\` = ${createdExpression()}, \`updatedAt\` = ${updatedExpression()}`,
    { transaction },
  );
};

const run = async () => {
  const queryInterface = db.sequelize.getQueryInterface();
  const tables = await queryInterface.showAllTables();
  const existing = new Map(tables.map((name) => [String(name).toLowerCase(), String(name)]));
  const transaction = await db.sequelize.transaction();

  try {
    for (const requestedName of TIMESTAMP_TABLES) {
      const actualName = existing.get(requestedName.toLowerCase());
      if (actualName) await updateTimestampPair(queryInterface, actualName, transaction);
    }

    const postsName = existing.get("posts");
    if (postsName) {
      const postsColumns = await queryInterface.describeTable(postsName);

      const syncChild = async (childName, postForeignKey, extraAssignments = []) => {
        const actualChildName = existing.get(childName.toLowerCase());
        if (!actualChildName || !hasColumn(postsColumns, postForeignKey)) return;

        const childColumns = await queryInterface.describeTable(actualChildName);
        if (!hasColumn(childColumns, "createdAt") || !hasColumn(childColumns, "updatedAt")) return;

        await db.sequelize.query(
          `UPDATE \`${actualChildName}\` AS child INNER JOIN \`${postsName}\` AS post ON child.\`id\` = post.\`${postForeignKey}\` SET child.\`createdAt\` = post.\`createdAt\`, child.\`updatedAt\` = post.\`updatedAt\`${extraAssignments.join("")}`,
          { transaction },
        );
      };

      await syncChild("Images", "imagesId");
      await syncChild("Attributes", "attributesId", [
        ", child.`published` = DATE_FORMAT(post.`createdAt`, '%d/%m/%Y')",
      ]);
      await syncChild("Overviews", "overviewId", [
        ", child.`created` = post.`createdAt`",
        ", child.`expired` = DATE_ADD(post.`createdAt`, INTERVAL 10 DAY)",
      ]);
    }

    await transaction.commit();
    console.log("All business timestamps now fall in Feb-Mar 2026 with createdAt before updatedAt.");
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    await db.sequelize.close();
  }
};

run().catch((error) => {
  console.error("Unable to normalize timestamps:", error.message || error);
  process.exitCode = 1;
});
