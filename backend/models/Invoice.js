const mongoose = require("mongoose")

const invoiceSchema = new mongoose.Schema(
    {
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
        manufacturer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        distributor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        invoiceNumber: {
            type: String,
            required: true,
            unique: true
        },
        invoiceDate: {
            type: Date,
            default: Date.now
        },
        totalAmount: {
            type: Number,
            required: true
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "partially_paid"],
            default: "pending"
        },
        paidAmount: {
            type: Number,
            default: 0
        },
        companyStamp: {
            type: String,
            default: ""
        },
        authorisedSignatory: {
            type: String,
            default: ""
        },
        gstin: {
            type: String,
            default: ""
        },
        
    },
    { timestamps: true }
)
invoiceSchema.index(
    { order: 1 },
    {
        unique: true,
        partialFilterExpression: {
            order: { $type: "objectId" }
        }
    }
)

invoiceSchema.index(
    { purchaseOrder: 1 },
    {
        unique: true,
        partialFilterExpression: {
            purchaseOrder: { $type: "objectId" }
        }
    }
)

module.exports = mongoose.model("Invoice", invoiceSchema)

