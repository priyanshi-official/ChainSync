import { useEffect, useState } from "react"
import { Package, RefreshCw, Truck, FileText, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"
import Swal from "sweetalert2"
import {
  getManufacturerDistributorOrders,
  updateDistributorOrderStatus,
  createShipment,
  createInvoice,
} from "../../services/distributorWorkflowService"
import { confirmAction } from "../../utils/alertUtils"

export default function DistributorOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState("")

  const load = async () => {
    try {
      const data = await getManufacturerDistributorOrders()
      setOrders(data.orders || [])
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to load orders.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const updateStatus = async (orderId, status) => {
    if (status === "rejected") {
      const result = await confirmAction(
        "Reject Order?",
        "Are you sure you want to reject this distributor order?",
        "Yes, reject"
      )
      if (!result.isConfirmed) return
    }

    setBusy(orderId)
    try {
      await updateDistributorOrderStatus(orderId, status)
      toast.success(status === "accepted" ? "Order accepted successfully." : "Order rejected successfully.")
      await load()
    } catch (e) {
      toast.error(e.response?.data?.message || "Order not updated.")
    } finally {
      setBusy("")
    }
  }

  const makeShipment = async (order) => {
    const trackingResult = await Swal.fire({
      title: "Enter Tracking Number",
      input: "text",
      inputPlaceholder: "Tracking number",
      showCancelButton: true,
      confirmButtonText: "Next",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#16865b",
      inputValidator: (value) => {
        if (!value?.trim()) return "Tracking number required."
      },
    })

    if (!trackingResult.isConfirmed) return

    const addressResult = await Swal.fire({
      title: "Enter Shipping Address",
      input: "textarea",
      inputPlaceholder: "Shipping address",
      showCancelButton: true,
      confirmButtonText: "Create Shipment",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#16865b",
      inputValidator: (value) => {
        if (!value?.trim()) return "Shipping address required."
      },
    })

    if (!addressResult.isConfirmed) return

    setBusy(order._id)
    try {
      await createShipment({
        orderId: order._id,
        trackingNumber: trackingResult.value.trim(),
        shippingAddress: addressResult.value.trim(),
      })
      toast.success("Shipment created.")
      await load()
    } catch (e) {
      toast.error(e.response?.data?.message || "Shipment not created.")
    } finally {
      setBusy("")
    }
  }

  const makeInvoice = async (orderId) => {
    setBusy(orderId)
    try {
      await createInvoice(orderId)
      toast.success("Invoice created.")
      await load()
    } catch (e) {
      toast.error(e.response?.data?.message || "Invoice not created.")
    } finally {
      setBusy("")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-[#557064]">
        <RefreshCw size={18} className="animate-spin text-[#16865b]" />
        Loading orders...
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0d211a]">Distributor Orders</h1>
        <p className="mt-1 text-sm text-[#557064]">Review orders, manage dispatch and generate invoices.</p>
      </div>

      {!orders.length && (
        <div className="rounded-2xl bg-[#0d211a] px-6 py-12 text-center text-[#edf8f2]">
          <Package size={34} className="mx-auto text-[#42dda0]" />
          <h3 className="mt-3 font-semibold">No distributor orders found</h3>
          <p className="mt-1 text-sm text-[#9bb9aa]">New distributor orders will appear here.</p>
        </div>
      )}

      {orders.map(order => (
        <article key={order._id} className="space-y-4 rounded-2xl bg-[#0d211a] p-4 text-[#edf8f2] sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Order #{order._id.slice(-6).toUpperCase()}</h2>
              <p className="mt-1 text-sm text-[#9bb9aa]">Distributor: {order.distributor?.name || "Distributor"}</p>
            </div>
            <span className="rounded-full bg-[#dff4e7] px-3 py-1.5 text-xs font-semibold capitalize text-[#146b45]">
              {order.status}
            </span>
          </div>

          <div className="space-y-2 rounded-xl bg-[#10271e] p-3">
            {(order.items || []).map((item, i) => (
              <div key={i} className="flex flex-wrap justify-between gap-2 text-sm">
                <span className="font-medium">{item.product?.name || "Product"} × {item.quantity}</span>
                <span className="text-[#c5d8d0]">₹{Number(item.unitPrice || 0).toFixed(2)} each</span>
              </div>
            ))}

            {!order.items?.length && order.product && (
              <p className="text-sm">{order.product.name} × {order.quantity}</p>
            )}

            <div className="flex justify-between border-t border-[#29483a] pt-3 text-sm">
              <span className="font-semibold text-[#c5d8d0]">Total Amount</span>
              <strong className="text-[#42dda0]">₹{Number(order.totalAmount || 0).toFixed(2)}</strong>
            </div>
          </div>

          {(order.status === "pending" || order.status === "accepted") && (
            <div className="mx-1 mb-1 rounded-xl bg-[#dff4e7] p-3 sm:mx-2">
              {order.status === "pending" && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => updateStatus(order._id, "accepted")}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#16865b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#106e49] disabled:opacity-50"
                  >
                    {busy === order._id ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Accept Order
                  </button>
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => updateStatus(order._id, "rejected")}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    Reject Order
                  </button>
                </div>
              )}

              {order.status === "accepted" && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => makeShipment(order)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#16865b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#106e49] disabled:opacity-50"
                  >
                    {busy === order._id ? <RefreshCw size={16} className="animate-spin" /> : <Truck size={16} />}
                    Create Shipment
                  </button>
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => makeInvoice(order._id)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#16865b] bg-white px-4 py-2.5 text-sm font-semibold text-[#146b45] transition hover:bg-[#edf8f2] disabled:opacity-50"
                  >
                    <FileText size={16} />
                    Generate Invoice
                  </button>
                </div>
              )}
            </div>
          )}
        </article>
      ))}
    </div>
  )
}
