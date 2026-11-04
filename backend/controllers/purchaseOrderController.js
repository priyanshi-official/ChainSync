
const PurchaseOrder = require("../models/PurchaseOrder")
const Connection = require("../models/Connection")
const Notification = require("../models/Notification")
const SupplierProduct = require("../models/SupplierProduct")

const createPurchaseOrder = async (req, res) => {
    try {
        const { supplierId, productId, quantity } = req.body

        if (!supplierId || !productId || !quantity) {
            return res.status(400).json({ message: "Supplier, product and quantity are required" })
        }

        const requestedQuantity = Number(quantity)

        if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
            return res.status(400).json({ message: "Quantity must be a positive whole number" })
        }

        const connection = await Connection.findOne({
            manufacturer: req.user.id,
            supplier: supplierId,
            status: "accepted"
        })

        if (!connection) {
            return res.status(403).json({ message: "You can only create PO for connected suppliers" })
        }

        const reservedProduct = await SupplierProduct.findOneAndUpdate(
            {
                _id: productId,
                supplier: supplierId,
                quantity: { $gte: requestedQuantity }
            },
            {
                $inc: { quantity: -requestedQuantity }
            },
            { new: true }
        )

        if (!reservedProduct) {
            const product = await SupplierProduct.findOne({
                _id: productId,
                supplier: supplierId
            })

            if (!product) {
                return res.status(404).json({ message: "Supplier product not found" })
            }

            return res.status(400).json({ message: `Only ${product.quantity} units are available`  })
        }

        let purchaseOrder

        try {
            purchaseOrder = await PurchaseOrder.create({
                manufacturer: req.user.id,
                supplier: supplierId,
                product: reservedProduct._id,
                material: reservedProduct.name,
                quantity: requestedQuantity,
                listedPrice: reservedProduct.price
            })
        } catch (error) {
            await SupplierProduct.updateOne(
                { _id: reservedProduct._id },
                { $inc: { quantity: requestedQuantity } }
            )
            throw error
        }

        res.status(201).json({  message: "Purchase order created successfully",   purchaseOrder })
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

const getMyPurchaseOrders = async (req, res) => {
    try {
        const purchaseOrders = await PurchaseOrder.find({
            manufacturer: req.user.id
        }).populate("supplier", "name email")

        res.status(200).json({ purchaseOrders })
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

const getReceivedPurchaseOrders = async (req, res) => {
    try {
        const purchaseOrders = await PurchaseOrder.find({
            supplier: req.user.id
        }).populate("manufacturer", "name email")

        res.status(200).json({ purchaseOrders })
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

const updatePurchaseOrderStatus = async (req, res) => {
    try {
        const { purchaseOrderId, status } = req.body

        if (!purchaseOrderId || !status) {
            return res.status(400).json({ message: "Purchase order ID and status are required" })
        }

        if (status !== "accepted" && status !== "rejected") {
            return res.status(400).json({ message: "Status must be accepted or rejected" })
        }

        const purchaseOrder = await PurchaseOrder.findOneAndUpdate(
            {
                _id: purchaseOrderId,
                supplier: req.user.id,
                status: "pending"
            },
            { $set: { status } },
            { new: true }
        )

        if (!purchaseOrder) {
            return res.status(404).json({ message: "Purchase order not found" })
        }

        if (status === "rejected") {
            await SupplierProduct.updateOne(
                { _id: purchaseOrder.product },
                { $inc: { quantity: purchaseOrder.quantity } }
            )
        }

        res.status(200).json({ message: `Purchase order ${status}`, purchaseOrder })
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

const addQuotation = async (req, res) => {
    try {
        const { purchaseOrderId, unitPrice } = req.body

        if (!purchaseOrderId || !unitPrice) {
            return res.status(400).json({ message: "Purchase order ID and unit price are required" })
        }

        const purchaseOrder = await PurchaseOrder.findOne({
            _id: purchaseOrderId,
            supplier: req.user.id,
            status: "accepted"
        })

        if (!purchaseOrder) {
            return res.status(404).json({ message: "Accepted purchase order not found" })
        }

        purchaseOrder.unitPrice = unitPrice
        purchaseOrder.totalAmount = purchaseOrder.quantity * unitPrice
        purchaseOrder.status = "quotation_received"

        await purchaseOrder.save()

        await Notification.create({
            user: purchaseOrder.manufacturer,
            message: "Supplier has submitted a quotation for your purchase order.",
            type: "quotation_received"
        })

        res.status(200).json({  message: "Quotation added successfully",  purchaseOrder })
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

const updateQuotationDecision = async (req, res) => {
    try {
        const { purchaseOrderId, status } = req.body

        if (!purchaseOrderId || !status) {
            return res.status(400).json({ message: "Purchase order ID and status are required" })
        }

        if (status !== "confirmed" && status !== "cancelled") {
            return res.status(400).json({ message: "Status must be confirmed or cancelled" })
        }

        const purchaseOrder = await PurchaseOrder.findOneAndUpdate(
            {
                _id: purchaseOrderId,
                manufacturer: req.user.id,
                status: "quotation_received"
            },
            { $set: { status } },
            { new: true }
        )

        if (!purchaseOrder) {
            return res.status(404).json({ message: "Quotation not found" })
        }

        if (status === "cancelled") {
            await SupplierProduct.updateOne(
                { _id: purchaseOrder.product },
                { $inc: { quantity: purchaseOrder.quantity } }
            )
        }

        await Notification.create({
            user: purchaseOrder.supplier,
            message: status === "confirmed"
                ? "Your purchase order has been confirmed. Please proceed with the order."
                : "Your purchase order has been cancelled.",
            type: status === "confirmed" ? "po_confirmed" : "po_cancelled"
        })

        res.status(200).json({ message: `Purchase order ${status}`, purchaseOrder})
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

module.exports = { createPurchaseOrder, getMyPurchaseOrders, getReceivedPurchaseOrders, updatePurchaseOrderStatus, addQuotation, updateQuotationDecision}
