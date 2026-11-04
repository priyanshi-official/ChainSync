const express = require("express")
const router = express.Router()

const { receiveMaterial , getMyInventory} = require("../controllers/inventoryController")

const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

router.post("/receive",authMiddleware,roleMiddleware("manufacturer"),receiveMaterial)
router.get("/my-inventory",authMiddleware,roleMiddleware("manufacturer"),getMyInventory)

module.exports = router