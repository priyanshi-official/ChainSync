const Supplier = require("../models/Supplier");

const createSupplierProfile = async (req, res) => {
    try {
        const { companyName, phone, address, description } = req.body;

        if (!companyName || !phone || !address || !description) {
            return res.status(400).json({message: "Company name, phone number, address and description are required"});
        }

        const existingProfile = await Supplier.findOne({user: req.user.id});

        if (existingProfile) {
            return res.status(400).json({message: "Supplier profile already exists"});
        }

        const supplier = await Supplier.create({
            user: req.user.id,
            companyName,
            phone,
            address,
            description
        });

        res.status(201).json({message: "Supplier profile created successfully",supplier});

    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};



const searchSuppliers = async(req,res)=>{
    try {
        const {search} = req.query
        const suppliers = await Supplier.find({companyName: { $regex: search, $options: "i" }})
        res.status(200).json(suppliers)
    } catch (error) {
        res.status(500).json({message:"Server error", error:error.message})
    }
}


const getMySupplierProfile = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ user: req.user.id })
    res.status(200).json({ supplier: supplier || null })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}


module.exports = { createSupplierProfile , searchSuppliers , getMySupplierProfile}