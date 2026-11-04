const express = require("express")
const router = express.Router()
const { registerUser, loginUser } = require("../controllers/authController")
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/profile",authMiddleware,(req,res)=>{res.json({message:"You can access this protected route",user:req.user})})
router.get("/manufacturer",authMiddleware,roleMiddleware("manufacturer"),(req, res) => {res.json({message: "Welcome Manufacturer"})})

module.exports = router

