'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class barangs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      barangs.belongsTo(models.admins, {foreignKey: 'admin_id', as : "admins"})
      barangs.hasMany(models.stock_out, {foreignKey: 'barang_id', as : "stock_out"})
      barangs.hasMany(models.stock_in, {foreignKey: 'barang_id', as : "stock_in"})
    }
  };
  barangs.init({
    code: DataTypes.INTEGER,
    name: DataTypes.STRING,
    category: DataTypes.STRING,
    brand: DataTypes.STRING,
    size: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
    satuan: DataTypes.STRING,
    stock: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'barangs',
  });
  return barangs;
};