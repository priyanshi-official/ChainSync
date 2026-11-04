
const express = require("express")
const cors = require("cors")
require("dotenv").config()
const cookieParser = require("cookie-parser")

const connectDB = require("./db")

const authRoutes = require("./routes/authRoutes")
const supplierRoutes = require("./routes/supplierRoutes")
const connectionRoutes = require("./routes/connectionRoutes")
const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes")
const inventoryRoutes = require("./routes/inventoryRoutes")
const notificationRoutes = require("./routes/notificationRoutes")
const productRoutes = require("./routes/productRoutes")
const distributorOrderRoutes = require("./routes/distributorOrderRoutes")
const shipmentRoutes = require("./routes/shipmentRoutes")
const invoiceRoutes = require("./routes/invoiceRoutes")
const paymentRoutes = require("./routes/paymentRoutes")
const supplyChainHealthRoutes = require("./routes/supplyChainHealthRoutes")
const supplierProductRoutes = require("./routes/supplierProductRoutes")

const distributorRoutes = require("./routes/distributorRoutes")
const manufacturerDistributorConnectionRoutes = require("./routes/manufacturerDistributorConnectionRoutes")
const manufacturerSupplierProductRoutes = require("./routes/manufacturerSupplierProductRoutes")

const app = express()

app.use(cors())
app.use(express.json())
app.use(cookieParser())

connectDB()

app.use("/api/auth", authRoutes)
app.use("/api/suppliers", supplierRoutes)
app.use("/api/connections", connectionRoutes)
app.use("/api/purchase-orders", purchaseOrderRoutes)
app.use("/api/inventory", inventoryRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/products", productRoutes)
app.use("/api/distributor-orders", distributorOrderRoutes)
app.use("/api/shipments", shipmentRoutes)
app.use("/api/invoices", invoiceRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/supply-chain-health", supplyChainHealthRoutes)
app.use("/api/supplier-products", supplierProductRoutes)
app.use("/api/manufacturer-supplier-products",manufacturerSupplierProductRoutes)



app.use("/api/distributors", distributorRoutes)

app.use(
  "/api/manufacturer-distributor",
  manufacturerDistributorConnectionRoutes
)

app.get("/", (req, res) => {
  res.send("ChainSync Backend is running")
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`)
})
