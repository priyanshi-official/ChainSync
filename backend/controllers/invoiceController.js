const Invoice = require("../models/Invoice")
const DistributorOrder = require("../models/DistributorOrder")
const PurchaseOrder = require("../models/PurchaseOrder")
const Notification = require("../models/Notification")

// Manufacturer creates invoice for DistributorOrder
const createInvoice = async (req, res) => {
    try {
        const { orderId, companyStamp, authorisedSignatory, gstin } = req.body

        const order = await DistributorOrder.findOne({
            _id: orderId,
            manufacturer: req.user.id,
            status: "accepted"
        })

        if (!order) {
            return res.status(404).json({ message: "Accepted order not found" })
        }

        const existingInvoice = await Invoice.findOne({ order: orderId })

        if (existingInvoice) {
            return res.status(400).json({ message: "Invoice already exists for this order" })
        }

        const invoice = await Invoice.create({
            order: order._id,
            manufacturer: order.manufacturer,
            distributor: order.distributor,
            invoiceNumber: `INV-${Date.now()}`,
            totalAmount: order.totalAmount,
            companyStamp: companyStamp || "",
            authorisedSignatory: authorisedSignatory || "",
            gstin: gstin || ""
        })

        res.status(201).json({ message: "Invoice created successfully", invoice })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


// Supplier creates invoice for confirmed PurchaseOrder
const createSupplierInvoice = async (req, res) => {
    try {
        const { purchaseOrderId, companyStamp, authorisedSignatory, gstin } = req.body

        const purchaseOrder = await PurchaseOrder.findOne({
            _id: purchaseOrderId,
            supplier: req.user.id,
            status: "confirmed"
        })

        if (!purchaseOrder) {
            return res.status(404).json({ message: "Confirmed purchase order not found" })
        }

        const existingInvoice = await Invoice.findOne({
            purchaseOrder: purchaseOrder._id
        })

        if (existingInvoice) {
            return res.status(400).json({  message: "Invoice already exists for this purchase order" })
        }

        const totalAmount = Number(purchaseOrder.totalAmount || 0)

        if (totalAmount <= 0) {
            return res.status(400).json({ message: "Valid purchase order amount not found" })
        }

        const invoice = await Invoice.create({
            purchaseOrder: purchaseOrder._id,
            manufacturer: purchaseOrder.manufacturer,
            supplier: purchaseOrder.supplier,
            invoiceNumber: `SUP-INV-${Date.now()}`,
            totalAmount,
            companyStamp: companyStamp || "",
            authorisedSignatory: authorisedSignatory || "",
            gstin: gstin || ""
        })

        try {
            await Notification.create({
                user: purchaseOrder.manufacturer,
                message: `Supplier has generated a new invoice: ${invoice.invoiceNumber}`,
                type: "supplier_invoice"
            })
        } catch (notificationError) {
            console.error("Notification Error:", notificationError.message)
        }

        res.status(201).json({ message: "Supplier invoice created successfully",invoice
})
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


// Manufacturer, Distributor and Supplier see their own invoices
const getMyInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({
            $or: [
                { manufacturer: req.user.id },
                { distributor: req.user.id },
                { supplier: req.user.id }
            ]
        })
        .populate("order", "quantity totalAmount status")
        .populate("purchaseOrder", "material quantity unitPrice totalAmount status")
        .populate("manufacturer", "name email")
        .populate("distributor", "name email")
        .populate("supplier", "name email")
        .sort({ createdAt: -1 })

        res.status(200).json(invoices)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = { createInvoice, createSupplierInvoice,getMyInvoices}
