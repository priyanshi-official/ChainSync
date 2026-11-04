const express = require("express")
const router = express.Router()
const {createConnectionRequest,getManufacturerRequests,getDistributorRequests,updateRequestStatus,
  cancelDistributorRequest,disconnect,getMyConnections} = require("../controllers/manufacturerDistributorConnectionController")
  
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

router.post("/request", authMiddleware, roleMiddleware("distributor"), createConnectionRequest)
router.get("/manufacturer-requests", authMiddleware, roleMiddleware("manufacturer"), getManufacturerRequests)
router.get("/my-requests", authMiddleware, roleMiddleware("distributor"), getDistributorRequests)
router.put("/update-status", authMiddleware, roleMiddleware("manufacturer"), updateRequestStatus)
router.put("/cancel", authMiddleware, roleMiddleware("distributor"), cancelDistributorRequest)
router.put("/disconnect", authMiddleware, disconnect)
router.get("/my-connections", authMiddleware, getMyConnections)

module.exports = router