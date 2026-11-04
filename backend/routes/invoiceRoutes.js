const express = require("express")
const router = express.Router()

const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

const {createInvoice, createSupplierInvoice,getMyInvoices} = require("../controllers/invoiceController")

router.post("/create", authMiddleware, roleMiddleware("manufacturer"), createInvoice)
router.post("/supplier/create", authMiddleware, roleMiddleware("supplier"), createSupplierInvoice)
router.get("/my-invoices", authMiddleware, getMyInvoices)

module.exports = router
