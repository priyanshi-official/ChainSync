const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
    {
        manufacturer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        name: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            default: 0
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Product", productSchema)