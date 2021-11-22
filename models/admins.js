'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class admins extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      admins.hasMany(models.barangs, { foreignKey: 'admin_id', sourceKey: 'id' })
      admins.hasMany(models.stock_in, { foreignKey: 'admin_id', sourceKey: 'id' })
      admins.hasMany(models.stock_out, { foreignKey: 'admin_id', sourceKey: 'id' })
    }
  };
  admins.init({
    email: DataTypes.STRING,
    full_name: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'admins',
  });
  return admins;
};