const Payment = require("../models/Payment")
const Invoice = require("../models/Invoice")
const Notification = require("../models/Notification")

const createPayment = async (req, res) => {
    try {
        const { invoiceId, paymentMethod, transactionId } = req.body
        const amount = Number(req.body.amount)
        const userId = req.user.id
        const role = req.user.role

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                message: "Payment amount must be a valid number greater than 0.",
            })
        }

        let invoice

        if (role === "distributor") {
            invoice = await Invoice.findOne({
                _id: invoiceId,
                distributor: userId,
            })
        } else if (role === "manufacturer") {
            invoice = await Invoice.findOne({
                _id: invoiceId,
                manufacturer: userId,
                supplier: { $exists: true, $ne: null },
            })
        }

        if (!invoice) {
            return res.status(404).json({
                message: "Invoice not found",
            })
        }

        const remainingAmount = Number(
            (invoice.totalAmount - invoice.paidAmount).toFixed(2)
        )

        if (remainingAmount <= 0 || invoice.paymentStatus === "paid") {
            return res.status(400).json({
                message: "Invoice is already fully paid",
            })
        }

        if (amount > remainingAmount) {
            return res.status(400).json({
                message: `Payment cannot exceed the remaining balance of ${remainingAmount}.`,
            })
        }

        const paymentData = {
            invoice: invoice._id,
            amount,
            paymentMethod,
            transactionId,
            manufacturer: invoice.manufacturer,
        }

        if (invoice.order) {
            paymentData.order = invoice.order
        }

        if (invoice.purchaseOrder) {
            paymentData.purchaseOrder = invoice.purchaseOrder
        }

        if (invoice.distributor) {
            paymentData.distributor = invoice.distributor
        }

        if (invoice.supplier) {
            paymentData.supplier = invoice.supplier
        }

        const payment = await Payment.create(paymentData)

        invoice.paidAmount = Number(
            (invoice.paidAmount + amount).toFixed(2)
        )

        if (invoice.paidAmount >= invoice.totalAmount) {
            invoice.paidAmount = invoice.totalAmount
            invoice.paymentStatus = "paid"
        } else {
            invoice.paymentStatus = "partially_paid"
        }

        await invoice.save()

        if (invoice.supplier) {
            await Notification.create({
                user: invoice.supplier,
                message: `Payment of ₹${amount} received for invoice ${invoice.invoiceNumber}. Payment status: ${invoice.paymentStatus}.`,
                type: "payment_update"
            })
        }

        return res.status(201).json({
            message: "Payment recorded successfully",
            payment,
            invoice,
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        })
    }
}

// Manufacturer, Distributor and Supplier can view their own payment records
const getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({
            $or: [
                { distributor: req.user.id },
                { manufacturer: req.user.id },
                { supplier: req.user.id },
            ],
        })
            .populate("invoice", "invoiceNumber totalAmount paymentStatus")
            .populate("order", "quantity totalAmount status")
            .populate("purchaseOrder", "material quantity unitPrice totalAmount status")
            .populate("distributor", "name email")
            .populate("manufacturer", "name email")
            .populate("supplier", "name email")
            .sort({ createdAt: -1 })

        return res.status(200).json(payments)
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        })
    }
}

module.exports = {createPayment,getMyPayments,}
