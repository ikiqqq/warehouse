const { barangs, admins} = require("../models");
const Joi = require("joi");

module.exports = {
    createBarang: async (req, res) => {
        const body = req.body;
        try {
            const schema = Joi.object({
                admin_id: Joi.number().required(),
                code: Joi.string().required(),
                name: Joi.string().required(),
                category: Joi.string().required(),
                brand: Joi.string().required(),
                size: Joi.number().required(),
                price: Joi.number().required(),
                stock: Joi.number().required(),
                satuan: Joi.string().required()
            });
            const check = schema.validate(
                {
                    admin_id: body.admin_id,
                    code: body.code,
                    name: body.name,
                    category: body.category,
                    brand: body.brand,
                    size: body.size,
                    price: body.price,
                    stock: body.stock,
                    satuan: body.satuan
                },
                { abortEarly: false }
            );

            if (check.error) {
                return res.status(400).json({
                    status: "failed",
                    message: "Bad Request",
                    errors: check.error["details"][0]["message"],
                    data: null,
                });
            }

            const checkCode = await barangs.findOne({
                where: {
                    code: body.code,
                },
            });

            if (checkCode) {
                return res.status(400).json({
                    status: "failed",
                    message: "Code already used, please use another code",
                    data: null,
                });
            }

            const item = await barangs.create({
                admin_id: body.admin_id,
                code: body.code,
                name: body.name,
                category: body.category,
                brand: body.brand,
                size: body.size,
                price: body.price,
                stock: body.stock,
                satuan: body.satuan,
            });
            if (item) {
                return res.status(200).json({
                    success: true,
                    message: "Successfully created item",
                    data: item,
                });
            } else {
                return res.status(401).json({
                    message: "Failed to create item",
                    data: null,
                });
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error",
                data: null,
            });
        }
    },
    getBarang: async (req, res) => {
        try {
            const item = await barangs.findAll({
                order: [["createdAt", "DESC"]],
                include: [
                    {
                        model: admins,
                        as: "admins",
                        attributes: {
                            exclude: ["password", "email", "full_name", "createdAt", "updatedAt"],
                        },
                    },
                ],
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

    /*getAllBarangsByCategory: async (req, res) => {
        const category = req.params.category
        try {
            const dataBarang = await barangs.findAll({
                where: { category: category.toLowerCase() },
                include: [{
                    model: admins,
                    as: "admins",
                    attributes: { exclude: ["password", "email", "full_name", "createdAt", "updatedAt"] }
                }],
            });

            if (!dataBarang) {
                return res.status(400).json({
                    status: "failed",
                    message: "Data not found"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Succesfully retrieved data Admins",
                data: adminsData
              });
            } catch (error) {
              return res.status(500).json({
                status: "failed",
                message: "Internal Server Error"
              })
            }
    },*/

    updateBarang: async (req, res) => {
        const id = req.params.id
        const body = req.body;
        try {
            const schema = Joi.object({
                admin_id: Joi.number(),
                code: Joi.string(),
                name: Joi.string(),
                category: Joi.string(),
                brand: Joi.string(),
                size: Joi.number(),
                price: Joi.number(),
                satuan: Joi.string(),
                stock: Joi.number()
            });

            const { error } = schema.validate({
                admin_id: body.admin_id,
                code: body.code,
                name: body.name,
                category: body.category,
                brand: body.brand,
                size: body.size,
                price: body.price,
                satuan: body.satuan,
                stock: body.stock
            }, { abortEarly: false });

            if (error) {
                return res.status(400).json({
                    status: 'failed',
                    message: "Bad Request",
                    errors: error["details"][0]["message"],
                    data: null
                });
            };

            if (body.code) {
                const checkCode = await barangs.findOne({ where: { code: body.code } })
                if (checkCode) {
                    return res.status(400).json({
                        status: "failed",
                        message: "Code of item can not duplicate"
                    });
                }
            }

            updateItem = await barangs.update({
                admin_id: body.admin_id,
                code: body.code,
                name: body.name,
                category: body.category,
                brand: body.brand,
                size: body.size,
                price: body.price,
                satuan: body.satuan,
                stock: body.stock
            }, {
                where: { id }
            });

            if (!updateItem[0]) {
                return res.status(400).json({
                    status: 'failed',
                    message: 'Failed to update item. You can not update other people item',
                    data: null
                })
            };

            const data = await barangs.findOne({
                where: { id }
            });

            return res.status(200).json({
                status: 'success',
                message: 'Successfully retrieved data item',
                updatedItem: data
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: 'failed',
                message: 'Internal server error',
                data: null
            })
        };
    },
    deleteItem: async (req, res) => {
        try {
            const deletedItem = await barangs.destroy({
                where: {
                    id: req.params.id,
                },
            });

            if (!deletedItem) {
                return res.status(400).json({
                    status: "failed",
                    message: "Failed to delete!",
                    data: null,
                });
            } else {
                return res.status(200).json({
                    status: "success",
                    message: "Successfully delete item!",
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
};
