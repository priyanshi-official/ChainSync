const express = require("express")
const router = express.Router()

const {createOrder,getManufacturerOrders,updateOrderStatus,getMyOrders,} = require("../controllers/distributorOrderController")

const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

router.post("/create", authMiddleware, roleMiddleware("distributor"), createOrder)
router.get("/manufacturer-orders", authMiddleware, roleMiddleware("manufacturer"), getManufacturerOrders)
router.put("/update-status", authMiddleware, roleMiddleware("manufacturer"), updateOrderStatus)
router.get("/my-orders", authMiddleware, roleMiddleware("distributor"), getMyOrders)

module.exports = router
