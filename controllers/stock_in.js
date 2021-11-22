const { barangs, stock_in} = require("../models");
const Joi = require("joi");

module.exports = {
    stockIn: async(req, res) => {
        const id = req.params.id
        const body = req.body
        try {
            const schema = Joi.object({
                admin_id: Joi.number().required(),
                barang_id: Joi.number().required(),
                stockOut_id: Joi.number().required(),
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
                    stockOut_id: body.stockOut_id,
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
                    id: id
                }
            })
            if (!barang) {
                return res.status(400).json({
                    status: "failed",
                    message: "item cannot found"
                })
            }

            const createStockIn = await stock_in.create({
                admin_id: body.admin_id,
                barang_id: id,
                stockOut_id: body.stockOut_id,
                date: body.date,
                name: body.name,
                jumlah: body.jumlah,
                penerima: body.penerima,
                keterangan: body.keterangan,
            })
            if (!createStockIn) {
                return res.status(400).json({
                    status: "failed",
                    message: "Unable to save data to database",
                    data: null,
                })
            }

            const allStock = barang.stock + body.jumlah

            const updateStock = await barangs.update(
                {
                stock: allStock
            }, {
                where: {
                    id
                }
            })

            return res.status(200).json({
                status: "success",
                message: "Successfully saved Stock In to database",
                data: createStockIn,
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
    
    getStockIn: async (req, res) => {
        try {
            const item = await stock_in.findAll({
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