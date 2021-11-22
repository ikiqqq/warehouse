const express = require("express");
const router = express.Router()
const stockIn = require("../controllers/stock_in");
const auth = require("../middlewares/authentication");

router.post("/:id", auth, stockIn.stockIn);
router.get("/history-in", auth, stockIn.getStockIn)

module.exports = router