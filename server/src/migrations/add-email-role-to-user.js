"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = "Users";
    const table = await queryInterface.describeTable(tableName);

    if (!table.email) {
      await queryInterface.addColumn(tableName, "email", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!table.role) {
      await queryInterface.addColumn(tableName, "role", {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "user",
      });
    }

    await queryInterface.sequelize.query(`
      UPDATE \`${tableName}\`
      SET role = 'user'
      WHERE role IS NULL OR role = ''
    `);

    const indexes = await queryInterface.showIndex(tableName);
    const hasEmailUniqueIndex = indexes.some(
      (index) =>
        index.unique
        && Array.isArray(index.fields)
        && index.fields.length === 1
        && index.fields[0]?.attribute === "email",
    );

    if (!hasEmailUniqueIndex) {
      await queryInterface.addIndex(tableName, ["email"], {
        unique: true,
        name: "users_email_unique",
      });
    }
  },

  async down(queryInterface) {
    const tableName = "Users";
    const table = await queryInterface.describeTable(tableName);
    const indexes = await queryInterface.showIndex(tableName);
    const hasEmailUniqueIndex = indexes.some(
      (index) => index.name === "users_email_unique",
    );

    if (hasEmailUniqueIndex) {
      await queryInterface.removeIndex(tableName, "users_email_unique");
    }

    if (table.role) {
      await queryInterface.removeColumn(tableName, "role");
    }

    if (table.email) {
      await queryInterface.removeColumn(tableName, "email");
    }
  },
};
