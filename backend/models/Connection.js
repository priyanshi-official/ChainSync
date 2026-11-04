const mongoose = require("mongoose")
const connectionSchema = new mongoose.Schema(
    {
        manufacturer:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        supplier:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        status:{
            type:String,
            enum:["pending","accepted","rejected"],
            default:"pending"
        }
    },
    {
        timestamps:true
    }
)
module.exports=mongoose.model("Connection",connectionSchema)