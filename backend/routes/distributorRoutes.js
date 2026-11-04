const express = require("express")
const router = express.Router()
const { getMyProfile, saveMyProfile, getManufacturers } = require("../controllers/distributorController")
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

router.get("/my-profile", authMiddleware, roleMiddleware("distributor"), getMyProfile)
router.put("/my-profile", authMiddleware, roleMiddleware("distributor"), saveMyProfile)
router.get("/manufacturers", authMiddleware, roleMiddleware("distributor"), getManufacturers)

module.exports = router