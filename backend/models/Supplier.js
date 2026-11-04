const mongoose = require("mongoose")

const supplierSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        companyName: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        address: {
            type: String,
            required: true
        },

        description: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Supplier", supplierSchema)