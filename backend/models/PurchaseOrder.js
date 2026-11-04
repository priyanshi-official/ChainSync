
const mongoose = require("mongoose")

const purchaseOrderSchema = new mongoose.Schema(
    {
        manufacturer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SupplierProduct",
            required: false
        },

        material: {
            type: String,
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        listedPrice: {
            type: Number,
            min: 0
        },

        status: {
            type: String,
            enum: [
                "pending",
                "accepted",
                "rejected",
                "quotation_received",
                "confirmed",
                "cancelled"
            ],
            default: "pending"
        },

        unitPrice: {
            type: Number
        },

        totalAmount: {
            type: Number
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema)
