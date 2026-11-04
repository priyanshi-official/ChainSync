
const mongoose = require("mongoose")
const DistributorOrder = require("../models/DistributorOrder")
const Connection = require("../models/ManufacturerDistributorConnection")
const Product = require("../models/Product")
const Notification = require("../models/Notification")

const createOrder = async (req, res) => {
  try {
    const { connectionId, items: requestedItems } = req.body

    if (!mongoose.isValidObjectId(connectionId)) {
      return res.status(400).json({ message: "Valid connection ID required" })
    }

    if (!Array.isArray(requestedItems) || !requestedItems.length) {
      return res.status(400).json({ message: "Select at least one product" })
    }

    const connection = await Connection.findOne({
      _id: connectionId,
      distributor: req.user.id,
      status: "accepted",
    })

    if (!connection) {
      return res.status(403).json({
        message: "An accepted manufacturer connection is required",
      })
    }

    const items = requestedItems.map(item => ({
      product: String(item.productId || item.product || ""),
      quantity: Number(item.quantity),
    }))

    if (items.some(item =>
      !mongoose.isValidObjectId(item.product) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    )) {
      return res.status(400).json({
        message: "Each product needs a valid ID and quantity of at least 1",
      })
    }

    const ids = items.map(item => item.product)

    if (new Set(ids).size !== ids.length) {
      return res.status(400).json({
        message: "A product can only be ordered once per order",
      })
    }

    const products = await Product.find({
      _id: { $in: ids },
      manufacturer: connection.manufacturer,
    }).select("_id name price quantity")

    if (products.length !== items.length) {
      return res.status(400).json({
        message: "One or more products do not belong to this manufacturer",
      })
    }

    const productMap = new Map(products.map(p => [String(p._id), p]))

    for (const item of items) {
      const product = productMap.get(item.product)

      if (!product || product.quantity < item.quantity) {
        return res.status(400).json({
          message: `${product?.name || "Product"} has insufficient stock`,
        })
      }

      item.unitPrice = Number(product.price)
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    )

    const order = await DistributorOrder.create({
      distributor: req.user.id,
      manufacturer: connection.manufacturer,
      connection: connection._id,
      items,
      totalAmount,
      status: "pending",
    })

    await Notification.create({
      user: connection.manufacturer,
      message: "A distributor has placed an order for your review.",
      type: "distributor_order",
    })

    return res.status(201).json({
      message: "Order submitted for approval",
      order,
    })
  } catch (error) {
    return res.status(500).json({
      message: "Unable to create order",
      error: error.message,
    })
  }
}

const getManufacturerOrders = async (req, res) => {
  try {
    const orders = await DistributorOrder.find({
      manufacturer: req.user.id,
    })
      .populate("distributor", "name email")
      .populate("items.product", "name price")
      .populate("product", "name price")
      .sort({ createdAt: -1 })

    return res.json({ orders })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

const getMyOrders = async (req, res) => {
  try {
    const orders = await DistributorOrder.find({
      distributor: req.user.id,
    })
      .populate("manufacturer", "name email")
      .populate("items.product", "name price")
      .populate("product", "name price")
      .sort({ createdAt: -1 })

    return res.json({ orders })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body

    if (
      !mongoose.isValidObjectId(orderId) ||
      !["accepted", "rejected"].includes(status)
    ) {
      return res.status(400).json({
        message: "Valid order ID and status required",
      })
    }

    const order = await DistributorOrder.findOne({
      _id: orderId,
      manufacturer: req.user.id,
      status: "pending",
    })

    if (!order) {
      return res.status(404).json({ message: "Pending order not found" })
    }

    if (status === "rejected") {
      order.status = "rejected"
      await order.save()
    } else {
      const items = order.items.length
        ? order.items
        : [{ product: order.product, quantity: order.quantity }]

      if (!items.length || items.some(item => !item.product)) {
        return res.status(400).json({ message: "Order has no valid products" })
      }

      const deducted = []

      for (const item of items) {
        const updated = await Product.findOneAndUpdate(
          {
            _id: item.product,
            manufacturer: req.user.id,
            quantity: { $gte: item.quantity },
          },
          { $inc: { quantity: -item.quantity } },
          { new: true }
        )

        if (!updated) {
          for (const previous of deducted) {
            await Product.updateOne(
              { _id: previous.product },
              { $inc: { quantity: previous.quantity } }
            )
          }

          return res.status(400).json({
            message: "Insufficient stock. No stock was deducted.",
          })
        }

        deducted.push({
          product: item.product,
          quantity: item.quantity,
        })
      }

      order.inventoryDeducted = true
      order.status = "accepted"

      try {
        await order.save()
      } catch (error) {
        for (const previous of deducted) {
          await Product.updateOne(
            { _id: previous.product },
            { $inc: { quantity: previous.quantity } }
          )
        }
        throw error
      }
    }

    await Notification.create({
      user: order.distributor,
      message: status === "accepted"
        ? "Your order was accepted by the manufacturer."
        : "Your order was rejected by the manufacturer.",
      type: status === "accepted" ? "order_accepted" : "order_rejected",
    })

    return res.json({ message: `Order ${status}`, order })
  } catch (error) {
    return res.status(500).json({
      message: "Unable to update order",
      error: error.message,
    })
  }
}

module.exports = {
  createOrder,
  getManufacturerOrders,
  updateOrderStatus,
  getMyOrders,
}
