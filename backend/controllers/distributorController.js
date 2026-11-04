//Handles reading and saving the logged-in distributor company profile
const Distributor = require("../models/Distributor")
const User = require("../models/User")
const Product = require("../models/Product")

const getMyProfile = async (req, res) => {
  try {
    const distributor = await Distributor.findOne({ user: req.user.id }).populate("user", "name email")
    return res.status(200).json({ distributor: distributor || null })
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message })
  }
}

const saveMyProfile = async (req, res) => {
  try {
    const { companyName, phone, address, description, businessType = "" } = req.body
    if (![companyName, phone, address, description].every((v) => typeof v === "string" && v.trim())) {
      return res.status(400).json({ message: "Company name, phone, address and description are required" })
    }

    const distributor = await Distributor.findOneAndUpdate(
      { user: req.user.id },
      {
        $set: {
          companyName: companyName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          description: description.trim(),
          businessType: typeof businessType === "string" ? businessType.trim() : ""
        },
        $setOnInsert: { user: req.user.id }
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate("user", "name email")

    return res.status(200).json({ message: "Distributor profile saved successfully", distributor })
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message })
  }
}

const getManufacturers = async (req, res) => {
  try {
    const { search = "" } = req.query
    const safeSearch = String(search).trim().slice(0, 100)
    const filter = { role: "manufacturer" }
    if (safeSearch) {
      const escaped = safeSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } }
      ]
    }
    const users = await User.find(filter).select("name email").sort({ name: 1 }).limit(100).lean()
    const ids = users.map((user) => user._id)
    const products = await Product.find({ manufacturer: { $in: ids } })
      .select("manufacturer name description price quantity")
      .sort({ name: 1 })
      .lean()
    const productMap = new Map()
    products.forEach((product) => {
      const key = String(product.manufacturer)
      if (!productMap.has(key)) productMap.set(key, [])
      productMap.get(key).push(product)
    })
    return res.status(200).json({
      manufacturers: users.map((user) => ({
        ...user,
        products: productMap.get(String(user._id)) || []
      }))
    })
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message })
  }
}

module.exports = { getMyProfile, saveMyProfile, getManufacturers }