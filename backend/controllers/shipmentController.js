const Shipment = require("../models/Shipment")
const DistributorOrder = require("../models/DistributorOrder")
const Notification = require("../models/Notification")
const PurchaseOrder = require("../models/PurchaseOrder")

const createShipment = async (req, res) => {
    try {
        const { orderId, trackingNumber, shippingAddress } = req.body

        if (!orderId || !trackingNumber || !shippingAddress) {
            return res.status(400).json({ message: "Order ID, tracking number and shipping address are required" })
        }

        const order = await DistributorOrder.findOne({
            _id: orderId,
            manufacturer: req.user.id,
            status: "accepted"
        })

        if (!order) {
            return res.status(404).json({ message: "Accepted order not found" })
        }

        const existingShipment = await Shipment.findOne({ order: orderId })

        if (existingShipment) {
            return res.status(400).json({ message: "Shipment already exists for this order" })
        }

        const shipment = await Shipment.create({
            order: orderId,
            manufacturer: order.manufacturer,
            distributor: order.distributor,
            trackingNumber,
            shippingAddress
        })

        res.status(201).json({ message: "Shipment created successfully", shipment })

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
}



const getMyShipments = async (req, res) => {
    try {
        const filter = req.user.role === "manufacturer"
            ? { manufacturer: req.user.id }
            : { distributor: req.user.id }

        const shipments = await Shipment.find(filter)
            .populate("order")
            .populate({
                path: "purchaseOrder",
                select: "material quantity status unitPrice totalAmount supplier",
                populate: {
                    path: "supplier",
                    select: "name email"
                }
            })
            .populate("manufacturer", "name email")
            .populate("distributor", "name email")
            .sort({ createdAt: -1 })

        return res.status(200).json({ shipments })
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        })
    }
}




const updateShipmentStatus = async (req, res) => {
    try {
        const { shipmentId, status } = req.body

        if (!shipmentId || !status) {
            return res.status(400).json({
                message: "Shipment ID and status are required"
            })
        }

        const allowedStatuses = [
            "processing",
            "shipped",
            "in_transit",
            "delivered"
        ]

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid shipment status"
            })
        }

        const shipment = await Shipment.findOne({
            _id: shipmentId,
            manufacturer: req.user.id,
            order: { $exists: true, $ne: null },
            $or: [
                { purchaseOrder: { $exists: false } },
                { purchaseOrder: null }
            ]
        })

        if (!shipment) {
            return res.status(404).json({
                message: "Distributor shipment not found"
            })
        }

        shipment.status = status

        if (status === "shipped") {
            shipment.shippedAt = new Date()
        }

        if (status === "delivered") {
            shipment.deliveredAt = new Date()
        }

        await shipment.save()

        await Notification.create({
            user: shipment.distributor,
            message: `Your shipment status has been updated to ${status}`,
            type: "shipment_update"
        })

        return res.status(200).json({
            message: `Shipment ${status}`,
            shipment
        })
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        })
    }
}




const createSupplierShipment = async (req, res) => {
    try {
        const { purchaseOrderId, trackingNumber, shippingAddress } = req.body;

        if (!purchaseOrderId || !trackingNumber?.trim() || !shippingAddress?.trim()) {
            return res.status(400).json({
                message: "Purchase order ID, tracking number and shipping address are required"
            });
        }

        const purchaseOrder = await PurchaseOrder.findOne({
            _id: purchaseOrderId,
            supplier: req.user.id,
            status: "confirmed"
        });

        if (!purchaseOrder) {
            return res.status(404).json({
                message: "Confirmed purchase order not found"
            });
        }

        const existingShipment = await Shipment.findOne({ purchaseOrder: purchaseOrderId });

        if (existingShipment) {
            return res.status(400).json({
                message: "Shipment already exists for this purchase order"
            });
        }

        const shipment = await Shipment.create({
            purchaseOrder: purchaseOrderId,
            manufacturer: purchaseOrder.manufacturer,
            trackingNumber: trackingNumber.trim(),
            shippingAddress: shippingAddress.trim()
        });

        return res.status(201).json({
            message: "Supplier shipment created successfully",
            shipment
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Shipment already exists or tracking number is already in use"
            });
        }

        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const getSupplierShipments = async (req, res) => {
    try {
        const shipments = await Shipment.find({
            purchaseOrder: { $ne: null },
            $or: [
                { "purchaseOrder": { $exists: true } }
            ]
        })
        .populate({
            path: "purchaseOrder",
            match: { supplier: req.user.id },
            select: "material quantity status unitPrice totalAmount"
        })
        .populate("manufacturer", "name email")
        .sort({ createdAt: -1 });

        return res.status(200).json({
            shipments: shipments.filter(
                shipment => shipment.purchaseOrder !== null
            )
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const updateSupplierShipmentStatus = async (req, res) => {
    try {
        const { shipmentId, status } = req.body;

        const allowedStatuses = [
            "processing",
            "shipped",
            "in_transit",
            "delivered"
        ];

        if (!shipmentId || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Valid shipment ID and status are required"
            });
        }

        const shipment = await Shipment.findOne({
            _id: shipmentId,
            purchaseOrder: { $exists: true, $ne: null }
        }).populate("purchaseOrder", "supplier");

        if (!shipment || !shipment.purchaseOrder ||
            shipment.purchaseOrder.supplier.toString() !== req.user.id) {
            return res.status(404).json({
                message: "Supplier shipment not found"
            });
        }

        shipment.status = status;

        if (status === "shipped") shipment.shippedAt = new Date();
        if (status === "delivered") shipment.deliveredAt = new Date();

        await shipment.save();

        await Notification.create({
            user: shipment.manufacturer,
            message: `Supplier shipment status updated to ${status}`,
            type: "shipment_update"
        });

        return res.status(200).json({
            message: `Shipment status updated to ${status}`,
            shipment
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}

module.exports = {createShipment , getMyShipments , updateShipmentStatus , createSupplierShipment, updateSupplierShipmentStatus , getSupplierShipments}