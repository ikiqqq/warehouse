const { barangs, stock_in, stock_out } = require("../models");
const Joi = require("joi");
const { Op } = require("sequelize");

module.exports = {
    stockOut: async (req, res) => {
        const admin = req.admin;
        const body = req.body;
        try {
            const schema = Joi.object({
                admin_id: Joi.number().required(),
                barang_id: Joi.number().required(),
                stockIn_id: Joi.number().required(),
                date: Joi.date().required(),
                jumlah: Joi.number().required(),
                penerima: Joi.string().required(),
                keterangan: Joi.string().required(),
            });

            const { error } = schema.validate(
                {
                    admin_id: admin.id,
                    barang_id: body.barang_id,
                    stockIn_id: body.stockIn_id,
                    date: body.date,
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
                    id: body.barang_id,
                    admin_id: admin.id,
                },
            });

            if (!barang) {
                return res.status(404).json({
                    status: "failed",
                    message: "Item not found",
                    data: null,
                });
            }

            const addItem = await stock_in.findOne({
                where: {
                    barang_id: body.barang_id,
                    admin_id: admin.id,
                },
            });

            if (!addItem) {
                return res.status(404).json({
                    status: "failed",
                    message:
                        "New Stock is nothing",
                    data: null,
                });
            }

            const create = await stock_out.create({
                admin_id: admin.id,
                barang_id: body.barang_id,
                stockIn_id: body.stockIn_id,
                date: body.date,
                jumlah: body.jumlah,
                penerima: body.penerima,
                keterangan: body.keterangan,
            });

            if (!create) {
                return res.status(400).json({
                    status: "failed",
                    message: "Unable to save data to database",
                    data: null,
                });
            }

            // to count all stock type stock out
            const expense = await stock_out.findAll({
                where: {
                    admin_id: admin.id,
                    barang_id: body.barang_id,
                    type: "stock out",
                },
            });

            let allExpenses = expense.map((e) => {
                return e.dataValues.expense;
            });

            let sumExpense;
            if (allExpenses.length == 1) sumExpense = allExpenses[0];
            if (allExpenses.length > 1)
                sumExpense = allExpenses.reduce((a, b) => a + b);

            //to count all stock type stockin
            const stockIn = await stock_out.findAll({
                where: {
                    admin_id: admin.id,
                    barang_id: body.barang_id,
                    type: "stock in",
                },
            });

            const allStock = stockIn.map((e) => {
                return e.dataValues.expense;
            });

            let sumStock;
            if (allStock.length == 0) sumStock = 0;
            if (allStock.length == 1) sumStock = allStock[0];
            if (allStock.length > 1)
                sumStock = allStock.reduce((a, b) => a + b);

            //hitung nilai stock baru
            const newStock = barang.stock + sumStock - sumExpense;

            //update nilai stock
            const updateStock = await barangs.update(
                {
                    stock: newStock,
                },
                {
                    where: {
                        id: body.barang_id,
                        admin_id: admin.id,
                    },
                }
            );

            const data = await stock_out.findOne({
                where: {
                    id: create.dataValues.id,
                    admin_id: admin.id,
                },
                include: [
                    {
                        model: barangs,
                        as: "sisa stock",
                        include: [
                            {
                                where: {
                                    admin_id: admin.id,
                                },
                            },
                        ],
                    },
                ],
            });

            return res.status(200).json({
                status: "success",
                message: "Successfully saved data to database",
                data: { data },
            });
        } catch (error) {
            return res.status(500).json({
                status: "failed",
                message: "Internal server error",
                data: null,
            });
        }
    },
    getAllStockoutDaily: async (req, res) => {
        const admin = req.admin;
        let date = req.query.date;
        let where;
        try {
            if (date) {
                if (!date.match(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)) {
                    return res.status(400).json({
                        status: "failed",
                        message: "Date format not match",
                    });
                }
                let dateFrom = new Date(date);
                let dateTo = new Date(date).setDate(new Date(date).getDate() + 1);
                where = {
                    admin_id: admin.id,
                    createdAt: {
                        [Op.between]: [dateFrom, dateTo],
                    },
                };
            } else {
                where = {
                    admin_id: admin.id,
                    createdAt: new Date(),
                };
            }
            const safe = await stock_out.findAll({
                where: {
                    admin_id: admin.id,
                    createdAt: {
                        [Op.lt]: new Date(date).setDate(new Date(date).getDate() + 1),
                        [Op.gt]: new Date(date).setDate(1),
                    },
                },
                attributes: ["safe_id"],
                raw: true,
            });
            const safeid = safe.map((e) => e.safe_id);
            const stock_out = await stock_out.findAll({
                where: where,
                include: [
                    {
                        model: barangs,
                        as: "detail",
                        include: [
                            {
                                where: {
                                    admin_id: admin.id
                                },
                            },
                        ],
                    },
                ],
            });

            if (stock_out.length == 0) {
                return res.status(404).json({
                    status: "failed",
                    message: "Data not found",
                    data: null,
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Successfully retrieved data stock_out",
                data: { stock_out },
            });
        } catch (error) {
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error",
                data: null,
            });
        }
    },
    getAllStockMonthly: async (req, res) => {
        const admin = req.admin;
        let date = req.query.date;

        try {
            if (date == null) date = new Date();
            const safe = await stock_out.findAll({
                where: {
                    admin_id: admin.id,
                    createdAt: {
                        [Op.lt]: new Date(date).setDate(new Date(date).getDate() + 1),
                        [Op.gt]: new Date(date).setDate(1),
                    },
                },
                attributes: ["safe_id"],
                raw: true,
            });
            const safeid = safe.map((e) => e.safe_id);

            const stock_out = await stock_out.findAll({
                where: {
                    admin_id: admin.id,
                    createdAt: {
                        [Op.lt]: new Date(date).setDate(new Date(date).getDate() + 1),
                        [Op.gt]: new Date(date).setDate(1),
                    },
                },
                include: [
                    {
                        model: barangs,
                        as: "detail",
                        include: [
                            {
                                where: {
                                    admin_id: admin.id,
                                },
                            },
                        ],
                    },
                ],
            });
            if (stock_out.length == 0) {
                return res.status(404).json({
                    status: "failed",
                    message: "Data not found",
                    data: null,
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Successfully retrieved data stock_out",
                data: { stock_out },
            });
        } catch (error) {
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error",
                data: null,
            });
        }
    },
    updateTransaction: async (req, res) => {
        const admin = req.admin;
        const body = req.body;
        const { id } = req.params;
        try {
            const schema = Joi.object({
                admin_id: Joi.number(),
                barang_id: Joi.number(),
                stockIn_id: Joi.number(),
                date: Joi.date(),
                jumlah: Joi.number(),
                penerima: Joi.string(),
                keterangan: Joi.string()
            });

            const { error } = schema.validate(
                {
                    admin_id: admin.id,
                    barang_id: body.barang_id,
                    stockIn_id: body.stockIn_id,
                    date: body.date,
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

            const before = await stock_out.findOne({
                where: {
                    id: id,
                    admin_id: admin.id,
                },
            });

            const updateTransaction = await stock_out.update(
                { ...body },
                { where: { id: id } }
            );

            if (!updateTransaction[0]) {
                return res.status(400).json({
                    status: "failed",
                    message: "Unable to update transaction",
                    data: null,
                });
            }

            const after = await stock_out.findOne({
                where: { id: id, admin_id: admin.id },
            });

            const safe = await barangs.findOne({
                where: {
                    id: after.dataValues.safe_id,
                    admin_id: admin.id,
                },
            });
            const newSafe =
                safe.dataValues.amount +
                before.dataValues.expense -
                after.dataValues.expense;

            const updateSafe = await barangs.update(
                {
                    amount: newSafe,
                },
                {
                    where: {
                        id: after.dataValues.safe_id,
                        admin_id: admin.id,
                    },
                }
            );

            const update = await stock_out.update(
                {
                    amount: newSafe,
                },
                {
                    where: {
                        id,
                    },
                }
            );

            const data = await stock_out.findOne({
                where: { id: id, admin_id: admin.id },
            });

            return res.status(200).json({
                status: "success",
                message: "Successfully retrieved data stock_out",
                data: { data },
            });
        } catch (error) {
            return res.status(500).json({
                status: "failed",
                message: "Internal server error",
                data: null,
            });
        }
    },
    deleteTransaction: async (req, res) => {
        const admin = req.admin;
        const id = req.params.id;
        try {
            const transaction = await stock_out.findOne({
                where: {
                    id,
                    admin_id: admin.id,
                },
            });

            const safe = await barangs.findOne({
                where: {
                    admin_id: admin.id,
                    id: transaction.dataValues.safe_id,
                },
            });

            const sum = safe.dataValues.amount + transaction.dataValues.expense;

            const updateSafe = await barangs.update(
                {
                    amount: sum,
                },
                {
                    where: {
                        admin_id: admin.id,
                        id: transaction.dataValues.safe_id,
                    },
                }
            );

            const check = await stock_out.destroy({
                where: {
                    admin_id: admin.id,
                    id: id,
                },
            });

            if (!check) {
                return res.status(400).json({
                    status: "failed",
                    message: "Unable to delete the data",
                    data: null,
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Deleted successfully",
            });
        } catch (error) {
            return res.status(500).json({
                status: "failed",
                message: "Internal server error",
                data: null,
            });
        }
    },
    
};
