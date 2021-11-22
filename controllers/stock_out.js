const { barangs, stock_out} = require("../models");
const Joi = require("joi");

module.exports = {
    stockOut: async (req, res) => {
        const id = req.params.id;
        const body = req.body;
        try {
            const schema = Joi.object({
                admin_id: Joi.number().required(),
                barang_id: Joi.number().required(),
                stockIn_id: Joi.number().required(),
                date: Joi.date().required(),
                name: Joi.string().required(),
                jumlah: Joi.number().required(),
                penerima: Joi.string().required(),
                keterangan: Joi.string()
            });

            const { error } = schema.validate(
                {
                    admin_id: body.admin_id,
                    barang_id: body.barang_id,
                    stockIn_id: body.stockIn_id,
                    date: body.date,
                    name: body.name,
                    jumlah: body.jumlah,
                    penerima: body.penerima,
                    keterangan: body.keterangan,
                },
                { abortEarly: false }
            );

            if (error) {
                return res.status(400).json({
                    status: "failed",
                    message: "Bad Request",
                    errors: error["details"][0]["message"],
                });
            }

            const barang = await barangs.findOne({
                where: {
                    id
                },
            });

            if (!barang) {
                return res.status(404).json({
                    status: "failed",
                    message: "Item not found",
                    data: null,
                });
            }

            const create = await stock_out.create({
                admin_id: body.admin_id,
                barang_id: body.barang_id,
                stockIn_id: body.stockIn_id,
                date: body.date,
                name: body.name,
                jumlah: body.jumlah,
                penerima: body.penerima,
                keterangan: body.keterangan,
                stock: barang.dataValues.stock - body.jumlah
            });

            if (!create) {
                return res.status(400).json({
                    status: "failed",
                    message: "Unable to save data to database",
                    data: null,
                });
            }

            //hitung stock baru
            const newStock = barang.stock - body.jumlah

            //update stock
            const updatebarang = await barangs.update(
                {
                    stock: newStock,
                },
                {
                    where: {
                        id,
                        admin_id:body.admin_id
                        
                    },
                }
            );

            const data = await stock_out.findOne({
                where: {
                    id: create.dataValues.id,
                }
            });

            return res.status(200).json({
                status: "success",
                message: "Successfully saved Stock Out to database",
                data: data,
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: "failed",
                message: "Internal server error",
                data: null,
            });
        }
    },

    getStockOut: async (req, res) => {
        try {
            const item = await stock_out.findAll({
                order: [["createdAt", "DESC"]]
            });

            if (!item.length) {
                return res.status(400).json({
                    status: "failed",
                    message: "There's no item in database!",
                    data: null,
                });
            } else {
                return res.status(200).json({
                    success: { message: "This is the list of items" },
                    data: item,
                });
            }
        } catch (error) {
            return res.status(500).json({
                status: "failed",
                message: error.message || "Internal Server Error",
                data: null,
            });
        }
    },
}