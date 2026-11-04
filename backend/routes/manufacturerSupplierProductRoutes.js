const express = require("express")
const router = express.Router()

const {getProductsForManufacturer} = require("../controllers/supplierProductController")

const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

router.get("/:supplierId",authMiddleware,roleMiddleware("manufacturer"),getProductsForManufacturer)

module.exports = router
