'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class stock_in extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  stock_in.init({
    barang_id: DataTypes.INTEGER,
    date: DataTypes.DATE,
    name: DataTypes.STRING,
    jumlah: DataTypes.INTEGER,
    penerima: DataTypes.STRING,
    keterangan: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'stock_in',
  });
  return stock_in;
};