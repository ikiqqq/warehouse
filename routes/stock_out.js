const express = require("express");
const router = express.Router()
const stockOut = require("../controllers/stock_out");
const auth = require("../middlewares/authentication");

router.post("/:id", auth, stockOut.stockOut);
router.get("/history-out", auth, stockOut.getStockOut)

module.exports = router