const express = require("express")
const router = express.Router()

const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")
const { createPayment, getMyPayments } = require("../controllers/paymentController")

router.post("/create",authMiddleware,roleMiddleware("distributor", "manufacturer"),createPayment)
router.get("/my-payments", authMiddleware, getMyPayments)

module.exports = router