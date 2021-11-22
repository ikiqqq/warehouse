const express = require('express')
const router = express.Router()
const admin = require('../controllers/admins')
const auth = require('../middlewares/authentication')

router.post("/register", admin.register) 
router.post("/login", admin.login)  
router.get("/:id", auth, admin.getOneAdmins) 
router.get("/", auth, admin.getAllAdmins)
router.post("/forgot", admin.forgotPassword);
router.put("/reset-password/:id/:token", admin.resetPassword);
router.put("/edit/:id", auth, admin.updateAdmin) 
router.delete("/delete/:id", auth, admin.deleteOneAdmins)

module.exports = router