import { useEffect, useState } from "react"
import { Package, RefreshCw, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"
import { confirmAction } from "../../utils/alertUtils"
import { getMySupplierPurchaseOrders, decideSupplierQuotation } from "../../services/supplierService"

export default function SupplierPurchaseOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await getMySupplierPurchaseOrders()
      setOrders(res.purchaseOrders || [])
      setError("")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load purchase orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleDecision = async (orderId, status) => {
    if (status === "cancelled") {
      const result = await confirmAction(
        "Cancel Purchase Order?",
        "Are you sure you want to cancel this purchase order?",
        "Yes, cancel"
      )
      if (!result.isConfirmed) return
    }

    try {
      await decideSupplierQuotation(orderId, status)
      toast.success(`Purchase order ${status} successfully`)
      await fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-[#285641]">
        <RefreshCw size={18} className="animate-spin text-[#16865b]" />
        Loading purchase orders...
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0d211a]">Supplier Purchase Orders</h1>
        <p className="mt-1 text-sm text-[#557064]">View supplier orders, pricing and quotations.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
          <button type="button" onClick={fetchOrders} className="ml-2 font-semibold underline">
            Try again
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-2xl bg-[#0d211a] p-8 text-center text-[#edf8f2]">
          <Package size={32} className="mx-auto text-[#42dda0]" />
          <h3 className="mt-3 font-semibold">No supplier purchase orders found</h3>
          <p className="mt-1 text-sm text-[#9bb9aa]">New purchase orders will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="rounded-2xl bg-[#0d211a] p-5 text-[#edf8f2]">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-[#19372a] p-3 text-[#42dda0]">
                    <Package size={21} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{order.material || order.product?.name || "Product"}</h2>
                    <p className="mt-1 text-sm text-[#9bb9aa]">
                      Supplier: {order.supplier?.name || order.supplier?.email || "Supplier"}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#19372a] px-3 py-1.5 text-xs font-semibold capitalize text-[#42dda0]">
                  {order.status?.replaceAll("_", " ")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-[#10271e] p-3">
                  <p className="text-xs text-[#9bb9aa]">Quantity</p>
                  <p className="mt-1 font-semibold">{order.quantity}</p>
                </div>
                <div className="rounded-lg bg-[#10271e] p-3">
                  <p className="text-xs text-[#9bb9aa]">Listed Unit Price</p>
                  <p className="mt-1 font-semibold">{order.listedPrice != null ? `₹${order.listedPrice}` : "—"}</p>
                </div>
                <div className="rounded-lg bg-[#10271e] p-3">
                  <p className="text-xs text-[#9bb9aa]">Listed Total</p>
                  <p className="mt-1 font-semibold">{order.listedPrice != null ? `₹${order.listedPrice * order.quantity}` : "—"}</p>
                </div>
                <div className="rounded-lg bg-[#10271e] p-3">
                  <p className="text-xs text-[#9bb9aa]">Quoted Unit Price</p>
                  <p className="mt-1 font-semibold">{order.unitPrice != null ? `₹${order.unitPrice}` : "Awaiting quotation"}</p>
                </div>
                <div className="rounded-lg bg-[#10271e] p-3">
                  <p className="text-xs text-[#9bb9aa]">Quoted Total</p>
                  <p className="mt-1 font-semibold text-[#42dda0]">{order.totalAmount != null ? `₹${order.totalAmount}` : "—"}</p>
                </div>
              </div>

              {order.status === "quotation_received" && (
                <div className="mt-4 flex flex-wrap gap-3 border-t border-[#19372a] pt-4">
                  <button
                    type="button"
                    onClick={() => handleDecision(order._id, "confirmed")}
                    className="flex items-center gap-2 rounded-lg bg-[#42dda0] px-4 py-2.5 text-sm font-semibold text-[#0d211a] transition hover:bg-[#68e9b5]"
                  >
                    <CheckCircle2 size={16} />
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision(order._id, "cancelled")}
                    className="flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
                  >
                    <XCircle size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}