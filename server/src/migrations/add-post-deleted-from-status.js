"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const postsTable = await queryInterface.describeTable("Posts");

    if (!postsTable.deletedFromStatus) {
      await queryInterface.addColumn("Posts", "deletedFromStatus", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const postsTable = await queryInterface.describeTable("Posts");

    if (postsTable.deletedFromStatus) {
      await queryInterface.removeColumn("Posts", "deletedFromStatus");
    }
  },
};
