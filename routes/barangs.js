const express = require('express')
const router = express.Router()
const barang = require('../controllers/barangs')
const auth = require('../middlewares/authentication')

router.post("/create", auth,barang.createBarang)  
router.get("/", auth, barang.getBarang)
//router.get("/:category", auth, barang.getAllBarangsByCategory)  
router.put("/edit/:id", auth,barang.updateBarang)
router.delete("/delete/:id", auth,barang.deleteItem)

module.exports = router