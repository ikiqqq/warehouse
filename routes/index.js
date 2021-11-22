const express = require('express');
const router = express.Router()
const adminsRouter = require('./admins');
const barangRouter = require('./barangs');
const stockInRouter = require('./stock_in');
const stockOutRouter = require('./stock_out');

router.use('/admin', adminsRouter)
router.use('/barang', barangRouter)
router.use('/stockIn', stockInRouter)
router.use('/stockOut', stockOutRouter)


module.exports = router
