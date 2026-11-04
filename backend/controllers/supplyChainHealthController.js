const Inventory = require("../models/Inventory")
const PurchaseOrder = require("../models/PurchaseOrder")
const Shipment = require("../models/Shipment")
const Invoice = require("../models/Invoice")

const getSupplyChainHealth = async (req, res) => {
    try {
        const inventory = await Inventory.find({ manufacturer: req.user.id })

        //low-stock calculation
        const lowStockItems = inventory.filter(item => item.quantity < item.minStock)

        const pendingPOs = await PurchaseOrder.countDocuments({
            manufacturer: req.user.id,
            status: "pending"
        })

        const shipments = await Shipment.countDocuments({
            manufacturer: req.user.id,
            status: { $in: ["processing", "shipped", "in_transit"] }
        })

        const pendingPayments = await Invoice.countDocuments({
            manufacturer: req.user.id,
            paymentStatus: { $in: ["pending", "partially_paid"] }
        })

        res.status(200).json({
            inventory,
            lowStockItems,
            pendingPurchaseOrders: pendingPOs,
            activeShipments: shipments,
            pendingPayments
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = { getSupplyChainHealth }