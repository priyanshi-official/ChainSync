const mongoose = require("mongoose")

const distributorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: 
    { type: String, 
        required: true,
         trim: true },
    phone:
     { type: String,
         required: true, 
         trim: true },
    address: 
    { type: String, 
        required: true, 
        trim: true },
    description: 
    { type: String, 
        required: true, 
        trim: true },
    businessType: 
    { type: String, 
        trim: true, 
        default: "" },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Distributor", distributorSchema)
