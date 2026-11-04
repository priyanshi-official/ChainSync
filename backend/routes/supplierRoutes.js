const express = require("express")
const router = express.Router()
const { createSupplierProfile , searchSuppliers , getMySupplierProfile } = require("../controllers/supplierController")

const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

router.post("/profile",authMiddleware,roleMiddleware("supplier"),createSupplierProfile)
router.get("/search", authMiddleware,roleMiddleware("manufacturer"),searchSuppliers)
router.get("/my-profile", authMiddleware, roleMiddleware("supplier"), getMySupplierProfile)

module.exports = router