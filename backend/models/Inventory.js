const mongoose = require("mongoose")

const inventorySchema = new mongoose.Schema(
    {
        manufacturer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        material: {
            type: String,
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            default: 0
        },
        minStock: {
            type: Number,
            default: 50
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Inventory", inventorySchema)