const express = require("express")
const router = express.Router()

const {createPurchaseOrder,getMyPurchaseOrders,getReceivedPurchaseOrders,updatePurchaseOrderStatus,addQuotation,
    updateQuotationDecision} = require("../controllers/purchaseOrderController")

const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

router.post("/create",authMiddleware,roleMiddleware("manufacturer"),createPurchaseOrder)
router.get("/my-orders",authMiddleware,roleMiddleware("manufacturer"),getMyPurchaseOrders)
router.get("/received",authMiddleware,roleMiddleware("supplier"),getReceivedPurchaseOrders)
router.put("/update-status",authMiddleware,roleMiddleware("supplier"),updatePurchaseOrderStatus)
router.put("/quotation",authMiddleware,roleMiddleware("supplier"),addQuotation)
router.put("/quotation-decision",authMiddleware,roleMiddleware("manufacturer"),updateQuotationDecision)


module.exports = router