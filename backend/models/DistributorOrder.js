
const mongoose = require("mongoose")

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
}, { _id: false })

const distributorOrderSchema = new mongoose.Schema({
  distributor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  manufacturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  connection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ManufacturerDistributorConnection",
    default: null,
  },

  // New multi-product order format
  items: { type: [orderItemSchema], default: [] },

  // Legacy fields retained for older orders
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: null,
  },
  quantity: { type: Number, default: 0 },

  totalAmount: { type: Number, required: true, min: 0 },
  inventoryDeducted: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
    index: true,
  },
}, { timestamps: true })

module.exports = mongoose.model("DistributorOrder", distributorOrderSchema)
