const mongoose = require("mongoose")

const shipmentSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DistributorOrder",
            required: false
        },
        
        purchaseOrder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PurchaseOrder",
            required: false,
            unique: true,
            sparse: true
        },


        manufacturer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        distributor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false
        },

        trackingNumber: {
            type: String,
            required: true,
            unique: true
        },

        shippingAddress: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["processing", "shipped", "in_transit", "delivered"],
            default: "processing"
        },

        shippedAt: {
            type: Date
        },

        deliveredAt: {
            type: Date
        }
    },
    

    {
        timestamps: true
    }
)

module.exports = mongoose.model("Shipment", shipmentSchema)