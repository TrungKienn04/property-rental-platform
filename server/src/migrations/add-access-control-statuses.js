"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const usersTable = await queryInterface.describeTable("Users");
    const postsTable = await queryInterface.describeTable("Posts");

    if (!usersTable.status) {
      await queryInterface.addColumn("Users", "status", {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "active",
      });
    }

    if (!usersTable.blockedAt) {
      await queryInterface.addColumn("Users", "blockedAt", {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    if (!usersTable.blockedReason) {
      await queryInterface.addColumn("Users", "blockedReason", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    await queryInterface.sequelize.query(`
      UPDATE \`Users\`
      SET status = 'active'
      WHERE status IS NULL OR status = ''
    `);

    if (!postsTable.status) {
      await queryInterface.addColumn("Posts", "status", {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "published",
      });
    }

    if (!postsTable.moderatedAt) {
      await queryInterface.addColumn("Posts", "moderatedAt", {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    if (!postsTable.moderatedBy) {
      await queryInterface.addColumn("Posts", "moderatedBy", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!postsTable.moderationReason) {
      await queryInterface.addColumn("Posts", "moderationReason", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }

    await queryInterface.sequelize.query(`
      UPDATE \`Posts\`
      SET status = 'published'
      WHERE status IS NULL OR status = ''
    `);

    await queryInterface.sequelize.query(`
      UPDATE \`Posts\`
      SET status = 'pending'
      WHERE LOWER(status) = 'draft'
    `);

    const userIndexes = await queryInterface.showIndex("Users");
    const hasUsersStatusRoleIndex = userIndexes.some(
      (index) => index.name === "users_status_role_idx",
    );

    if (!hasUsersStatusRoleIndex) {
      await queryInterface.addIndex("Users", ["status", "role"], {
        name: "users_status_role_idx",
      });
    }

    const postIndexes = await queryInterface.showIndex("Posts");
    const hasPostsStatusCreatedAtIndex = postIndexes.some(
      (index) => index.name === "posts_status_created_at_idx",
    );
    const hasPostsUserStatusCreatedAtIndex = postIndexes.some(
      (index) => index.name === "posts_user_status_created_at_idx",
    );

    if (!hasPostsStatusCreatedAtIndex) {
      await queryInterface.addIndex("Posts", ["status", "createdAt"], {
        name: "posts_status_created_at_idx",
      });
    }

    if (!hasPostsUserStatusCreatedAtIndex) {
      await queryInterface.addIndex("Posts", ["userId", "status", "createdAt"], {
        name: "posts_user_status_created_at_idx",
      });
    }
  },

  async down(queryInterface) {
    const userIndexes = await queryInterface.showIndex("Users");
    const postIndexes = await queryInterface.showIndex("Posts");
    const usersTable = await queryInterface.describeTable("Users");
    const postsTable = await queryInterface.describeTable("Posts");

    if (userIndexes.some((index) => index.name === "users_status_role_idx")) {
      await queryInterface.removeIndex("Users", "users_status_role_idx");
    }

    if (postIndexes.some((index) => index.name === "posts_status_created_at_idx")) {
      await queryInterface.removeIndex("Posts", "posts_status_created_at_idx");
    }

    if (postIndexes.some((index) => index.name === "posts_user_status_created_at_idx")) {
      await queryInterface.removeIndex("Posts", "posts_user_status_created_at_idx");
    }

    if (postsTable.moderationReason) {
      await queryInterface.removeColumn("Posts", "moderationReason");
    }

    if (postsTable.moderatedBy) {
      await queryInterface.removeColumn("Posts", "moderatedBy");
    }

    if (postsTable.moderatedAt) {
      await queryInterface.removeColumn("Posts", "moderatedAt");
    }

    if (postsTable.status) {
      await queryInterface.removeColumn("Posts", "status");
    }

    if (usersTable.blockedReason) {
      await queryInterface.removeColumn("Users", "blockedReason");
    }

    if (usersTable.blockedAt) {
      await queryInterface.removeColumn("Users", "blockedAt");
    }

    if (usersTable.status) {
      await queryInterface.removeColumn("Users", "status");
    }
  },
};
