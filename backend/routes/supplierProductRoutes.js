const express = require("express")
const router = express.Router()

const {createProduct,getMyProducts,updateProduct,deleteProduct} = require("../controllers/supplierProductController")

const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

router.use(authMiddleware, roleMiddleware("supplier"))
router.post("/", createProduct)
router.get("/my-products", getMyProducts)
router.put("/:id", updateProduct)
router.delete("/:id", deleteProduct)

module.exports = router
