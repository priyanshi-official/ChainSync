const express = require("express");
const router = express.Router();

const {getMyNotifications,markAsRead} = require("../controllers/notificationController")
const authMiddleware = require("../middleware/authMiddleware")

router.get("/my-notifications",authMiddleware,getMyNotifications)
router.put("/read",authMiddleware,markAsRead)

module.exports = router