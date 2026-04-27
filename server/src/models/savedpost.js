'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SavedPost extends Model {
    static associate(models) {
      SavedPost.belongsTo(models.User, {
        foreignKey: 'userId',
        targetKey: 'id',
        as: 'user',
      });
      SavedPost.belongsTo(models.Post, {
        foreignKey: 'postId',
        targetKey: 'id',
        as: 'post',
      });
    }
  }

  SavedPost.init(
    {
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      postId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'SavedPost',
      indexes: [
        {
          unique: true,
          fields: ['userId', 'postId'],
          name: 'saved_posts_user_post_unique',
        },
        {
          fields: ['userId', 'createdAt'],
          name: 'saved_posts_user_created_at_idx',
        },
      ],
    },
  );

  return SavedPost;
};

