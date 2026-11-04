const express = require("express")
const router = express.Router()

const { createShipment, getMyShipments, updateShipmentStatus, createSupplierShipment, 
    getSupplierShipments, updateSupplierShipmentStatus} = require("../controllers/shipmentController");

const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

router.post("/create", authMiddleware, roleMiddleware("manufacturer"), createShipment)
router.get("/my-shipments", authMiddleware, roleMiddleware("distributor"), getMyShipments)
router.put("/update-status", authMiddleware, roleMiddleware("manufacturer"), updateShipmentStatus)
router.get("/manufacturer-shipments",authMiddleware,roleMiddleware("manufacturer"),getMyShipments)
router.post("/supplier/create",authMiddleware,roleMiddleware("supplier"),createSupplierShipment)
router.get( "/supplier/my-shipments", authMiddleware, roleMiddleware("supplier"), getSupplierShipments)
router.put( "/supplier/update-status", authMiddleware, roleMiddleware("supplier"), updateSupplierShipmentStatus)

module.exports = router