
const express = require("express")
const router = express.Router()

const { createProduct, getProducts, getManufacturerInventory } = require("../controllers/productController")
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

router.post("/create", authMiddleware, roleMiddleware("manufacturer"), createProduct)
router.get("/inventory", authMiddleware, roleMiddleware("manufacturer"), getManufacturerInventory)
router.get("/", authMiddleware, roleMiddleware("distributor"), getProducts)

module.exports = router
