const Inventory = require("../models/Inventory")
const PurchaseOrder = require("../models/PurchaseOrder")

const receiveMaterial = async (req, res) => {
    try {
        const { purchaseOrderId } = req.body

        if (!purchaseOrderId) {
            return res.status(400).json({ message: "Purchase order ID is required"})
        }

        const purchaseOrder = await PurchaseOrder.findOne({
            _id: purchaseOrderId,
            manufacturer: req.user.id,
            status: "confirmed"
        })

        if (!purchaseOrder) {
            return res.status(404).json({message: "Confirmed purchase order not found"})
        }

        let inventory = await Inventory.findOne({
            manufacturer: req.user.id,
            material: purchaseOrder.material})

        if (inventory) {
            inventory.quantity += purchaseOrder.quantity
            await inventory.save()
        } else {
            inventory = await Inventory.create({
                manufacturer: req.user.id,
                material: purchaseOrder.material,
                quantity: purchaseOrder.quantity})
        }

        res.status(200).json({ message: "Material received and inventory updated",inventory})

    } catch (error) {
        res.status(500).json({message: "Server error",error: error.message})
    }
}


const getMyInventory = async (req, res) => {
    try {
        const inventory = await Inventory.find({ manufacturer: req.user.id})

        res.status(200).json({inventory})

    } catch (error) {
        res.status(500).json({message: "Server error",error: error.message})
    }
}

module.exports = { receiveMaterial , getMyInventory}