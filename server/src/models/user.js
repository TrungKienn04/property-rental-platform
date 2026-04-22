'use strict';
const {
  Model
} = require('sequelize');

const {
  USER_ROLES,
  USER_STATUS_ACTIVE,
  USER_STATUSES,
} = require('../ultis/accessControl');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Post, { foreignKey: 'userId', as: 'user' })
    }
  }
  User.init({
    name: DataTypes.STRING,
    password: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
      validate: {
        isIn: [USER_ROLES],
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: USER_STATUS_ACTIVE,
      validate: {
        isIn: [USER_STATUSES],
      },
    },
    blockedAt: DataTypes.DATE,
    blockedReason: DataTypes.STRING,
    zalo: DataTypes.STRING,
    fbUrl: DataTypes.STRING,
    avatar: DataTypes.BLOB,
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
