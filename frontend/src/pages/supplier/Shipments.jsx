import { useEffect, useState } from "react"
import { Package, Truck, MapPin, RefreshCw, Building2, Clock } from "lucide-react"
import { toast } from "sonner"
import { confirmAction } from "../../utils/alertUtils"
import { getSupplierShipments, updateSupplierShipmentStatus } from "../../services/distributorWorkflowService"

function Shipments() {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState("")
  const [error, setError] = useState("")

  const loadShipments = async () => {
    try {
      setError("")
      const data = await getSupplierShipments()
      setShipments(data.shipments || [])
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load shipments.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadShipments()
  }, [])

  const handleStatusChange = async (shipmentId, status) => {
    if (status === "delivered") {
      const result = await confirmAction(
        "Mark Shipment as Delivered?",
        "Are you sure this shipment has been delivered?",
        "Yes, mark delivered"
      )
      if (!result.isConfirmed) return
    }

    try {
      setUpdatingId(shipmentId)
      setError("")

      await updateSupplierShipmentStatus(shipmentId, status)

      toast.success("Shipment status updated successfully.")
      await loadShipments()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update shipment status.")
    } finally {
      setUpdatingId("")
    }
  }

  const formatDate = (date) => {
    if (!date) return "Not available"
    return new Date(date).toLocaleDateString()
  }

  const statusColors = {
    processing: "bg-[#dff4e7] text-[#285641]",
    shipped: "bg-[#dff4e7] text-[#146b45]",
    in_transit: "bg-[#dff4e7] text-[#285641]",
    delivered: "bg-[#42dda0] text-[#071a12]",
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0d211a]">Supplier Shipments</h1>
          <p className="mt-1 text-sm text-[#557064]">Track shipments sent to your connected manufacturers.</p>
        </div>
      </div>

      {error && <div className="rounded-xl bg-red-100 p-3 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#557064]">
          <RefreshCw size={18} className="animate-spin" /> Loading shipments...
        </div>
      ) : shipments.length === 0 ? (
        <div className="rounded-2xl bg-[#dff4e7] px-6 py-12 text-center">
          <Package className="mx-auto mb-3 text-[#16865b]" size={36} />
          <h2 className="font-semibold text-[#0d211a]">No shipments yet</h2>
          <p className="mt-2 text-sm text-[#557064]">Shipments for your confirmed purchase orders will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {shipments.map((shipment) => {
            const order = shipment.purchaseOrder
            const manufacturer = shipment.manufacturer

            return (
              <div key={shipment._id} className="rounded-2xl bg-[#0d211a] p-4 text-[#edf8f2] sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[#19372a] p-3 text-[#42dda0]">
                      <Truck size={22} />
                    </div>
                    <div>
                      <h2 className="font-semibold">{shipment.trackingNumber}</h2>
                      <p className="mt-1 text-xs text-[#9bb9aa]">Created {formatDate(shipment.createdAt)}</p>
                    </div>
                  </div>

                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColors[shipment.status] || "bg-[#e8eee9] text-[#557064]"}`}>
                    {shipment.status.replace("_", " ")}
                  </span>
                </div>

                <div className="my-4 space-y-4 rounded-xl bg-[#10271e] p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    <Building2 size={18} className="mt-1 shrink-0 text-[#42dda0]" />
                    <div className="min-w-0">
                      <p className="text-xs text-[#9bb9aa]">Manufacturer</p>
                      <p className="mt-1 font-medium">{manufacturer?.name || "Not available"}</p>
                      <p className="text-sm text-[#c5d8d0] break-all">{manufacturer?.email || ""}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Package size={18} className="mt-1 shrink-0 text-[#42dda0]" />
                    <div>
                      <p className="text-xs text-[#9bb9aa]">Purchase Order</p>
                      <p className="mt-1 font-medium">{order?.material || "Material not available"}</p>
                      <p className="text-sm text-[#c5d8d0]">Quantity: {order?.quantity ?? "—"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="mt-1 shrink-0 text-[#42dda0]" />
                    <div className="min-w-0">
                      <p className="text-xs text-[#9bb9aa]">Shipping Address</p>
                      <p className="mt-1 text-sm text-[#edf8f2] break-words">{shipment.shippingAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock size={18} className="mt-1 shrink-0 text-[#42dda0]" />
                    <div>
                      <p className="text-xs text-[#9bb9aa]">Order Total</p>
                      <p className="mt-1 font-semibold text-[#edf8f2]">
                        {order?.totalAmount != null ? `₹${order.totalAmount.toLocaleString("en-IN")}` : "Not available"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#29483a] pt-4">
                  <label htmlFor={`status-${shipment._id}`} className="mb-2 block text-sm font-medium text-[#c5d8d0]">
                    Update shipment status
                  </label>

                  <select id={`status-${shipment._id}`} value={shipment.status} disabled={updatingId === shipment._id || shipment.status === "delivered"} onChange={(e) => handleStatusChange(shipment._id, e.target.value)} className="w-full rounded-xl border border-[#29483a] bg-[#10271e] px-3 py-2.5 text-sm text-[#edf8f2] outline-none focus:border-[#42dda0] disabled:cursor-not-allowed disabled:opacity-60">
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                  </select>

                  {updatingId === shipment._id && (
                    <p className="mt-2 text-xs text-[#42dda0]">Updating status...</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Shipments

