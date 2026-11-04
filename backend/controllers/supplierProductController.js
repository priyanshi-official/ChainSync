
const SupplierProduct = require("../models/SupplierProduct")

const createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body

    if (
      !name?.trim() ||
      !description?.trim() ||
      price === undefined ||
      price === "" ||
      quantity === undefined ||
      quantity === ""
    ) {
      return res.status(400).json({
        message: "All product fields are required"
      })
    }

    const parsedPrice = Number(price)
    const parsedQuantity = Number(quantity)

    if (
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0 ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 0
    ) {
      return res.status(400).json({
        message: "Enter a valid price and whole-number quantity"
      })
    }

    const product = await SupplierProduct.create({
      supplier: req.user.id,
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      quantity: parsedQuantity
    })

    res.status(201).json({
      message: "Supplier product added successfully",
      product
    })
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    })
  }
}

const getMyProducts = async (req, res) => {
  try {
    const products = await SupplierProduct.find({
      supplier: req.user.id
    }).sort({ createdAt: -1 })

    res.status(200).json({ products })
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    })
  }
}

const updateProduct = async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body

    if (
      !name?.trim() ||
      !description?.trim() ||
      price === undefined ||
      price === "" ||
      quantity === undefined ||
      quantity === ""
    ) {
      return res.status(400).json({
        message: "All product fields are required"
      })
    }

    const parsedPrice = Number(price)
    const parsedQuantity = Number(quantity)

    if (
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0 ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 0
    ) {
      return res.status(400).json({
        message: "Enter a valid price and whole-number quantity"
      })
    }

    const product = await SupplierProduct.findOneAndUpdate(
      {
        _id: req.params.id,
        supplier: req.user.id
      },
      {
        name: name.trim(),
        description: description.trim(),
        price: parsedPrice,
        quantity: parsedQuantity
      },
      { new: true, runValidators: true }
    )

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      })
    }

    res.status(200).json({
      message: "Product updated successfully",
      product
    })
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    })
  }
}

const deleteProduct = async (req, res) => {
  try {
    const product = await SupplierProduct.findOneAndDelete({
      _id: req.params.id,
      supplier: req.user.id
    })

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      })
    }

    res.status(200).json({
      message: "Product deleted successfully"
    })
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    })
  }
}




const getProductsForManufacturer = async (req, res) => {
  try {
    const { supplierId } = req.params

    const connection = await require("../models/Connection").findOne({
      manufacturer: req.user.id,
      supplier: supplierId,
      status: "accepted"
    })

    if (!connection) {
      return res.status(403).json({
        message: "You can only view products of connected suppliers"
      })
    }

    const products = await SupplierProduct.find({
      supplier: supplierId
    }).sort({ createdAt: -1 })

    res.status(200).json({ products })
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    })
  }
}
module.exports = {createProduct,getMyProducts,updateProduct,deleteProduct,getProductsForManufacturer}
