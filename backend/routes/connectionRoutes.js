const express = require("express")
const router = express.Router()

const {sendConnectionRequest,getSupplierRequests,updateConnectionStatus ,getMySuppliers , getMyConnectionRequests ,
    getMyManufacturers} = require("../controllers/connectionController")

const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

router.post("/request",authMiddleware,roleMiddleware("manufacturer"),sendConnectionRequest)
router.get("/requests",authMiddleware,roleMiddleware("supplier"),getSupplierRequests)
router.put("/update-status",authMiddleware,roleMiddleware("supplier"),updateConnectionStatus)
router.get("/my-suppliers",authMiddleware,roleMiddleware("manufacturer"),getMySuppliers)
router.get("/my-requests", authMiddleware, roleMiddleware("manufacturer"), getMyConnectionRequests)
router.get("/my-manufacturers",authMiddleware,roleMiddleware("supplier"),getMyManufacturers);

module.exports = router