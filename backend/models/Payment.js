
const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema(
    {
        invoice: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Invoice",
            required: true
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DistributorOrder",
            default: null
        },
        purchaseOrder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PurchaseOrder",
            default: null
        },
        distributor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        manufacturer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        amount: {
            type: Number,
            required: true
        },
        paymentMethod: {
            type: String,
            enum: ["bank_transfer", "cash", "upi", "other"],
            required: true
        },
        transactionId: {
            type: String,
            default: ""
        },
        paymentDate: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "completed"
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model("Payment", paymentSchema)
