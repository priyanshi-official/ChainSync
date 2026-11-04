
const Product = require("../models/Product")

const createProduct = async (req, res) => {
    try {
        const { name, description, price, quantity } = req.body

        if (!name || !description || price === undefined || quantity === undefined) {
            return res.status(400).json({ message: "All product fields are required" })
        }

        const product = await Product.create({
            manufacturer: req.user.id,
            name,
            description,
            price,
            quantity
        })

        res.status(201).json({ message: "Product created successfully", product })
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

const getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate("manufacturer", "name email")
        res.status(200).json({ products })
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

const getManufacturerInventory = async (req, res) => {
    try {
        const products = await Product.find({ manufacturer: req.user.id }).sort({ createdAt: -1 })
        res.status(200).json({ products })
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

module.exports = { createProduct, getProducts, getManufacturerInventory }
