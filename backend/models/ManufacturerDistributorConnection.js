const mongoose = require("mongoose");

const requestedProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const schema = new mongoose.Schema(
  {
    manufacturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    requestedProducts: { type: [requestedProductSchema], default: [] },
    message: { type: String, trim: true, maxlength: 1000, default: "" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled", "disconnected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
)

schema.index({ manufacturer: 1, distributor: 1 }, { unique: true })

module.exports = mongoose.model("ManufacturerDistributorConnection", schema)
