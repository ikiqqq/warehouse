const { barangs, stock_in, stock_out } = require("../models");
const Joi = require("joi");
const { Op } = require("sequelize");

module.exports = {
    postAddIncome: async (req, res) => {
        const admin = req.admin;
        const body = req.body;
        try {
            const schema = Joi.object({
                admin_id: Joi.number().required(),
                barang_id: Joi.number().required(),
                date: Joi.date().required(),
                jumlah: Joi.number().required(),
                penerima: Joi.string().required(),
                keterangan: Joi.string().required(),
            });

            const { error } = schema.validate(
                {
                    admin_id: admin.id,
                    barang_id: body.barang_id,
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

            const safe = await barangs.findOne({
                where: {
                    id: body.barang_id,
                    admin_id: admin.id,
                },
            });

            if (!safe) {
                return res.status(404).json({
                    status: "failed",
                    message: "Safe not found",
                    data: null,
                });
            }

            const create = await stock_in.create({
                admin_id: admin.id,
                barang_id: body.barang_id,
                stockIn_id: body.stockIn_id,
                date: body.date,
                jumlah: body.jumlah,
                penerima: body.penerima,
                keterangan: body.keterangan,
                stock: safe.dataValues.stock + body.jumlah,
                type: "addItem",
            });

            if (!create) {
                return res.status(400).json({
                    status: "failed",
                    message: "Unable to save add income to database",
                    data: null,
                });
            }

            //hitung all expense type
            const stock = await stock_in.findAll({
                where: {
                    admin_id: admin.id,
                    barang_id: body.barang_id,
                    type: "expense",
                },
            });

            let allExpenses = stock.map((e) => {
                return e.dataValues.stock;
            });

            let sumstock;
            if (allstocks.length == 0) sumstock = 0;
            if (allstocks.length == 1) sumstock = allstocks[0];
            if (allstocks.length > 1)
                sumstock = allstocks.reduce((a, b) => a + b);

            //to count all transaction type addIncome -> hitung addIncome
            const addItem = await stock_in.findAll({
                where: {
                    admin_id: admin.id,
                    safe_id: body.safe_id,
                    type: "addItem",
                },
            });

            const allAddItems = addItem.map((e) => {
                return e.dataValues.stock;
            });

            let sumItem;
            if (allAddItems.length == 1) sumItem = allAddItems[0];
            if (allAddItems.length > 1)
                sumItem = allAddItems.reduce((a, b) => a + b);

            //hitung stock baru
            const newSafe = safe.openingBalance + sumItem - sumExpense;

            //update stock
            const updateSafe = await barangs.update(
                {
                    amount: newSafe,
                },
                {
                    where: {
                        id: body.safe_id,
                        admin_id: admin.id,
                    },
                }
            );

            const data = await stock_in.findOne({
                where: {
                    id: create.dataValues.id,
                    admin_id: admin.id,
                },
                include: [
                    {
                        model: Safes,
                    },
                ],
            });

            return res.status(200).json({
                status: "success",
                message: "Successfully saved add income to database",
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
}