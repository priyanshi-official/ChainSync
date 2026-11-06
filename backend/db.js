// const mongoose = require("mongoose")

// const connectDB = async ()=>{
//     try {
//         await mongoose.connect(process.env.MONGO_URI)
//         console.log("MongoDB Connected✅")
//     } catch (error) {
//         console.log("MongoDB Conncetion Error:",error)
//     }
// }
// module.exports=connectDB

const mongoose = require("mongoose")

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB Connected ✅")
        console.log("Database Name:", mongoose.connection.name)
    } catch (error) {
        console.log("MongoDB Connection Error:", error.message)
        throw error
    }
}

module.exports = connectDB