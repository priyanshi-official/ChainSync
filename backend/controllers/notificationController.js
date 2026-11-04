const Notification = require("../models/Notification");

const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            user: req.user.id
        }).sort({ createdAt: -1 });

        res.status(200).json({
            notifications
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.body;

        const notification = await Notification.findOne({
            _id: notificationId,
            user: req.user.id
        });

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({
            message: "Notification marked as read",
            notification
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


module.exports = {getMyNotifications,markAsRead}