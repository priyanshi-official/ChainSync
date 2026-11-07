import { useEffect, useState } from "react"
import { Package, Truck, MapPin, Building2, Clock, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { getManufacturerShipments, updateShipmentStatus } from "../../services/distributorWorkflowService"
import { confirmAction } from "../../utils/alertUtils"

const statuses = ["processing", "shipped", "in_transit", "delivered"]

function ManufacturerShipments() {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState("")
  const [error, setError] = useState("")

  const load = async () => {
    try {
      setError("")
      const data = await getManufacturerShipments()
      setShipments(data.shipments || [])
    } catch (e) {
      setError(e.response?.data?.message || "Shipments load nahi hue.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const update = async (shipmentId, status) => {
    if (status === "delivered") {
      const result = await confirmAction(
        "Confirm Delivery?",
        "Are you sure this product has been delivered to the distributor?",
        "Yes, delivered"
      )
      if (!result.isConfirmed) return
    }

    setBusy(shipmentId)
    try {
      await updateShipmentStatus(shipmentId, status)
      toast.success(status === "delivered" ? "Product marked as delivered successfully." : `Shipment status updated to ${status.replace("_", " ")}.`)
      await load()
    } catch (e) {
      toast.error(e.response?.data?.message || "Shipment status update nahi hua.")
    } finally {
      setBusy("")
    }
  }

  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : "Not available"

  const statusColors = {
    processing: "bg-[#dff4e7] text-[#285641]",
    shipped: "bg-[#dff4e7] text-[#146b45]",
    in_transit: "bg-[#dff4e7] text-[#285641]",
    delivered: "bg-[#42dda0] text-[#071a12]",
  }

  const supplierShipments = shipments.filter(s => s.purchaseOrder)
  const distributorShipments = shipments.filter(s => s.order && !s.purchaseOrder)

  const StatusBadge = ({ status }) => (
    <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColors[status] || "bg-[#e8eee9] text-[#557064]"}`}>
      {status?.replace("_", " ")}
    </span>
  )

  const EmptyState = ({ message }) => (
    <div className="rounded-xl bg-[#dff4e7] px-4 py-5 text-center">
      <Package className="mx-auto mb-2 text-[#16865b]" size={26} />
      <p className="text-sm text-[#557064]">{message}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0d211a]">Manage Shipments</h1>
        <p className="mt-1 text-sm text-[#557064]">Track incoming and outgoing shipments.</p>
      </div>

      {error && <div className="rounded-xl bg-red-100 p-3 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#557064]">
          <RefreshCw size={18} className="animate-spin" /> Loading shipments...
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-bold text-[#0d211a]">Incoming Shipments</h2>
              <p className="mt-1 text-sm text-[#557064]">Shipments received from your suppliers.</p>
            </div>

            {!supplierShipments.length ? (
              <EmptyState message="No incoming supplier shipments yet." />
            ) : (
              <div className="flex flex-col gap-3">
                {supplierShipments.map(shipment => {
                  const order = shipment.purchaseOrder
                  const supplier = order?.supplier

                  return (
                    <article key={shipment._id} className="w-full rounded-xl bg-[#0d211a] px-4 py-3 text-[#edf8f2]">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#29483a] pb-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <Truck size={19} className="text-[#42dda0]" />
                          <h3 className="text-sm font-semibold">{shipment.trackingNumber}</h3>
                          <span className="text-xs text-[#9bb9aa]">Created {formatDate(shipment.createdAt)}</span>
                        </div>
                        <StatusBadge status={shipment.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 size={17} className="shrink-0 text-[#42dda0]" />
                          <div>
                            <p className="text-[11px] text-[#9bb9aa]">Supplier</p>
                            <p className="text-sm font-medium">{supplier?.name || "Not available"}</p>
                            <p className="text-xs text-[#c5d8d0]">{supplier?.email || ""}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Package size={17} className="shrink-0 text-[#42dda0]" />
                          <div>
                            <p className="text-[11px] text-[#9bb9aa]">Purchase Order</p>
                            <p className="text-sm font-medium">{order?.material || "Material not available"}</p>
                            <p className="text-xs text-[#c5d8d0]">Quantity: {order?.quantity ?? "—"}</p>
                          </div>
                        </div>

                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <MapPin size={17} className="shrink-0 text-[#42dda0]" />
                          <div className="min-w-0">
                            <p className="text-[11px] text-[#9bb9aa]">Shipping Address</p>
                            <p className="text-sm break-words">{shipment.shippingAddress}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock size={17} className="shrink-0 text-[#42dda0]" />
                          <div>
                            <p className="text-[11px] text-[#9bb9aa]">Order Total</p>
                            <p className="text-sm font-semibold">{order?.totalAmount != null ? `₹${order.totalAmount.toLocaleString("en-IN")}` : "Not available"}</p>
                          </div>
                        </div>
                      </div>

                      <p className="border-t border-[#29483a] pt-2 text-[11px] text-[#9bb9aa]">
                        Shipment status is updated by the supplier.
                      </p>
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-bold text-[#0d211a]">Outgoing Shipments</h2>
              <p className="mt-1 text-sm text-[#557064]">Shipments sent to your distributors.</p>
            </div>

            {!distributorShipments.length ? (
              <EmptyState message="No outgoing distributor shipments yet." />
            ) : (
              <div className="flex flex-col gap-3">
                {distributorShipments.map(shipment => {
                  const distributor = shipment.distributor

                  return (
                    <article key={shipment._id} className="w-full rounded-xl bg-[#0d211a] px-4 py-3 text-[#edf8f2]">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#29483a] pb-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <Truck size={19} className="text-[#42dda0]" />
                          <h3 className="text-sm font-semibold">{shipment.trackingNumber}</h3>
                          <span className="text-xs text-[#9bb9aa]">Created {formatDate(shipment.createdAt)}</span>
                        </div>
                        <StatusBadge status={shipment.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 size={17} className="shrink-0 text-[#42dda0]" />
                          <div>
                            <p className="text-[11px] text-[#9bb9aa]">Distributor</p>
                            <p className="text-sm font-medium">{distributor?.name || "Not available"}</p>
                            <p className="text-xs text-[#c5d8d0]">{distributor?.email || ""}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Package size={17} className="shrink-0 text-[#42dda0]" />
                          <div>
                            <p className="text-[11px] text-[#9bb9aa]">Order ID</p>
                            <p className="text-sm font-medium">#{String(shipment.order?._id || shipment.order).slice(-6).toUpperCase()}</p>
                          </div>
                        </div>

                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <MapPin size={17} className="shrink-0 text-[#42dda0]" />
                          <div className="min-w-0">
                            <p className="text-[11px] text-[#9bb9aa]">Shipping Address</p>
                            <p className="text-sm break-words">{shipment.shippingAddress}</p>
                          </div>
                        </div>

                        {(shipment.shippedAt || shipment.deliveredAt) && (
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {shipment.shippedAt && (
                              <p className="text-xs text-[#c5d8d0]">Shipped: {new Date(shipment.shippedAt).toLocaleString()}</p>
                            )}
                            {shipment.deliveredAt && (
                              <p className="text-xs text-[#c5d8d0]">Delivered: {new Date(shipment.deliveredAt).toLocaleString()}</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#29483a] pt-2">
                        <label htmlFor={`status-${shipment._id}`} className="text-xs font-medium text-[#c5d8d0]">
                          Update shipment status
                        </label>
                        <select
                          id={`status-${shipment._id}`}
                          value={shipment.status}
                          disabled={busy === shipment._id || shipment.status === "delivered"}
                          onChange={e => update(shipment._id, e.target.value)}
                          className="w-full max-w-52 rounded-lg border border-[#29483a] bg-[#10271e] px-3 py-2 text-sm text-[#edf8f2] outline-none focus:border-[#42dda0] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {statuses.map(status => (
                            <option key={status} value={status}>
                              {status.replace("_", " ").replace(/\b\w/g, char => char.toUpperCase())}
                            </option>
                          ))}
                        </select>
                        {busy === shipment._id && <p className="text-xs text-[#42dda0]">Updating status...</p>}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default ManufacturerShipments
