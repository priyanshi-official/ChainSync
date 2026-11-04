
const mongoose = require("mongoose")
const Connection = require("../models/ManufacturerDistributorConnection")
const Distributor = require("../models/Distributor")
const User = require("../models/User")
const Product = require("../models/Product")
const Notification = require("../models/Notification")

const createConnectionRequest = async (req, res) => {
  try {
    const { manufacturerId, message = "" } = req.body
    if (!mongoose.Types.ObjectId.isValid(manufacturerId || "")) {
      return res.status(400).json({ message: "A valid manufacturer ID is required" })
    }
    if (typeof message !== "string" || message.length > 1000) {
      return res.status(400).json({ message: "Message must be 1000 characters or fewer" })
    }

    const manufacturer = await User.findOne({ _id: manufacturerId, role: "manufacturer" }).select("_id")
    if (!manufacturer) return res.status(404).json({ message: "Manufacturer not found" })

    const profile = await Distributor.findOne({ user: req.user.id }).select("_id")
    if (!profile) return res.status(400).json({ message: "Complete your distributor company profile first" })

    const input = req.body.requestedProducts
    let items

    if (Array.isArray(input)) {
      items = input.map(x => ({ productId: String(x.productId || x.product || ""), quantity: Number(x.quantity) }))
    } else if (Array.isArray(req.body.productIds)) {
      // Compatibility for older clients: old requests default to quantity 1.
      items = req.body.productIds.map(productId => ({ productId: String(productId), quantity: 1 }))
    } else {
      return res.status(400).json({ message: "Enter a quantity for at least one product" })
    }

    if (!items.length) return res.status(400).json({ message: "Enter a quantity for at least one product" })
    if (items.some(x => !mongoose.Types.ObjectId.isValid(x.productId) || !Number.isInteger(x.quantity) || x.quantity < 1)) {
      return res.status(400).json({ message: "Each product needs a valid ID and a whole quantity of at least 1" })
    }

    const ids = items.map(x => x.productId)
    if (new Set(ids).size !== ids.length) {
      return res.status(400).json({ message: "A product can only be listed once per request" })
    }

    const products = await Product.find({
      _id: { $in: ids },
      manufacturer: manufacturerId,
    }).select("_id name price quantity")

    if (products.length !== ids.length) {
      return res.status(400).json({ message: "One or more products do not belong to this manufacturer" })
    }

    const productMap = new Map(products.map(p => [String(p._id), p]))
    for (const item of items) {
      const product = productMap.get(item.productId)
      if (item.quantity > Number(product.quantity)) {
        return res.status(400).json({ message: `${product.name} has only ${product.quantity} available` })
      }
    }

    const requestedProducts = items.map(item => ({
      product: item.productId,
      quantity: item.quantity,
      unitPrice: Number(productMap.get(item.productId).price),
    }))

    let connection = await Connection.findOne({ manufacturer: manufacturerId, distributor: req.user.id })
    const wasExisting = Boolean(connection)

    if (connection && ["pending", "accepted"].includes(connection.status)) {
      return res.status(409).json({
        message: connection.status === "pending" ? "Connection request is already pending" : "You are already connected to this manufacturer",
        status: connection.status,
      })
    }

    if (connection) {
      connection.productIds = ids
      connection.requestedProducts = requestedProducts
      connection.message = message.trim()
      connection.status = "pending"
      await connection.save()
    } else {
      connection = await Connection.create({
        manufacturer: manufacturerId,
        distributor: req.user.id,
        productIds: ids,
        requestedProducts,
        message: message.trim(),
        status: "pending",
      })
    }

    await Notification.create({
      user: manufacturerId,
      message: "A distributor sent you a connection request.",
      type: "distributor_connection_request",
    })

    return res.status(wasExisting ? 200 : 201).json({ message: "Connection request sent successfully", connection })
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "A connection request already exists" })
    return res.status(500).json({ message: "Server error", error: error.message })
  }
}

const getManufacturerRequests = async (req, res) => {
  try {
    const requests = await Connection.find({ manufacturer: req.user.id })
      .populate("distributor", "name email")
      .populate("productIds", "name description price quantity")
      .populate("requestedProducts.product", "name description price quantity")
      .sort({ updatedAt: -1 }).lean()

    const ids = requests.map(r => r.distributor?._id).filter(Boolean)
    const profiles = await Distributor.find({ user: { $in: ids } }).lean()
    const map = new Map(profiles.map(p => [String(p.user), p]))

    return res.status(200).json({
      requests: requests.map(r => ({ ...r, distributorProfile: map.get(String(r.distributor?._id)) || null })),
    })
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message })
  }
}

const getDistributorRequests = async (req, res) => {
  try {
    const requests = await Connection.find({ distributor: req.user.id })
      .populate("manufacturer", "name email")
      .populate("productIds", "name description price quantity")
      .populate("requestedProducts.product", "name description price quantity")
      .sort({ updatedAt: -1 }).lean()
    return res.status(200).json({ requests })
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message })
  }
}

const updateRequestStatus = async (req, res) => {
  try {
    const { connectionId, status } = req.body
    if (!mongoose.Types.ObjectId.isValid(connectionId || "")) return res.status(400).json({ message: "A valid connection ID is required" })
    if (!["accepted", "rejected"].includes(status)) return res.status(400).json({ message: "Status must be accepted or rejected" })

    const connection = await Connection.findOne({ _id: connectionId, manufacturer: req.user.id, status: "pending" })
    if (!connection) return res.status(404).json({ message: "Pending connection request not found" })

    connection.status = status
    await connection.save()
    await Notification.create({
      user: connection.distributor,
      message: status === "accepted" ? "Your connection request was accepted by the manufacturer." : "Your connection request was rejected by the manufacturer.",
      type: status === "accepted" ? "manufacturer_connection_accepted" : "manufacturer_connection_rejected",
    })
    return res.status(200).json({ message: `Connection request ${status}`, connection })
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message })
  }
}

const cancelDistributorRequest = async (req, res) => {
  try {
    const { connectionId } = req.body
    if (!mongoose.Types.ObjectId.isValid(connectionId || "")) return res.status(400).json({ message: "A valid connection ID is required" })
    const connection = await Connection.findOne({ _id: connectionId, distributor: req.user.id, status: "pending" })
    if (!connection) return res.status(404).json({ message: "Pending request not found" })

    connection.status = "cancelled"
    await connection.save()
    await Notification.create({ user: connection.manufacturer, message: "A distributor cancelled a pending connection request.", type: "distributor_connection_cancelled" })
    return res.status(200).json({ message: "Connection request cancelled", connection })
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message })
  }
}

const disconnect = async (req, res) => {
  try {
    if (!["manufacturer", "distributor"].includes(req.user.role)) return res.status(403).json({ message: "Access denied" })
    const { connectionId } = req.body
    if (!mongoose.Types.ObjectId.isValid(connectionId || "")) return res.status(400).json({ message: "A valid connection ID is required" })

    const filter = req.user.role === "manufacturer"
      ? { _id: connectionId, manufacturer: req.user.id, status: "accepted" }
      : { _id: connectionId, distributor: req.user.id, status: "accepted" }

    const connection = await Connection.findOne(filter)
    if (!connection) return res.status(404).json({ message: "Active connection not found" })

    connection.status = "disconnected"
    await connection.save()
    await Notification.create({
      user: req.user.role === "manufacturer" ? connection.distributor : connection.manufacturer,
      message: "A manufacturer-distributor connection was disconnected.",
      type: "connection_disconnected",
    })
    return res.status(200).json({ message: "Connection disconnected", connection })
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message })
  }
}

const getMyConnections = async (req, res) => {
  try {
    if (!["manufacturer", "distributor"].includes(req.user.role)) return res.status(403).json({ message: "Access denied" })
    const filter = req.user.role === "manufacturer"
      ? { manufacturer: req.user.id, status: "accepted" }
      : { distributor: req.user.id, status: "accepted" }

    const connections = await Connection.find(filter)
      .populate("manufacturer", "name email")
      .populate("distributor", "name email")
      .populate("productIds", "name price")
      .populate("requestedProducts.product", "name price")
      .sort({ updatedAt: -1 }).lean()

    const ids = connections.map(c => c.distributor?._id).filter(Boolean)
    const profiles = await Distributor.find({ user: { $in: ids } }).lean()
    const map = new Map(profiles.map(p => [String(p.user), p]))

    return res.status(200).json({
      connections: connections.map(c => ({ ...c, distributorProfile: map.get(String(c.distributor?._id)) || null })),
    })
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message })
  }
}

module.exports = {
  createConnectionRequest, getManufacturerRequests, getDistributorRequests,
  updateRequestStatus, cancelDistributorRequest, disconnect, getMyConnections,
}
