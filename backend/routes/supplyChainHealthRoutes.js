const express = require("express")
const router = express.Router()

const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")
const { getSupplyChainHealth } = require("../controllers/supplyChainHealthController")

router.get("/", authMiddleware, roleMiddleware("manufacturer"), getSupplyChainHealth)

module.exports = router