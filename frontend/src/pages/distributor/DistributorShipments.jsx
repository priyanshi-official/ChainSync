import { useEffect, useState } from "react"
import { getMyShipments } from "../../services/distributorWorkflowService"

export default function DistributorShipments() {
  const [shipments, setShipments] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    getMyShipments()
      .then((data) => setShipments(data.shipments || []))
      .catch((e) => setError(e.response?.data?.message || "Shipments load nahi hue."))
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0d211a]">Track Shipments</h1>
        <p className="mt-1 text-sm text-[#557064]">Check your shipment status and delivery details.</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {!shipments.length && !error && (
        <div className="rounded-2xl bg-white p-6 text-center">
          <p className="font-semibold text-[#0d211a]">No shipments yet</p>
          <p className="mt-1 text-sm text-[#648074]">Your shipment details will appear here.</p>
        </div>
      )}

      {shipments.map((shipment) => (
        <article key={shipment._id} className="overflow-hidden rounded-2xl bg-[#0d211a] text-[#edf8f2]">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#9bb9aa]">Tracking Number</p>
              <h2 className="mt-0.5 text-sm font-semibold">{shipment.trackingNumber}</h2>
            </div>
            <span className="rounded-full bg-[#10271e] px-3 py-1 text-xs font-medium capitalize text-[#42dda0]">
              {shipment.status}
            </span>
          </div>

          <div className="mx-4 space-y-2 rounded-lg bg-[#10271e] px-3 py-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#9bb9aa]">Shipping Address</p>
              <p className="mt-0.5 text-sm">{shipment.shippingAddress}</p>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-[#29483a] pt-2">
              <span className="text-xs text-[#9bb9aa]">Order</span>
              <span className="text-sm font-medium">#{String(shipment.order?._id || shipment.order).slice(-6).toUpperCase()}</span>
            </div>
          </div>

          {(shipment.shippedAt || shipment.deliveredAt) && (
            <div className="mx-4 my-3 rounded-lg bg-[#dff4e7] px-3 py-2">
              {shipment.shippedAt && (
                <p className="text-xs text-[#285641]">
                  <span className="font-semibold">Shipped:</span> {new Date(shipment.shippedAt).toLocaleString()}
                </p>
              )}
              {shipment.deliveredAt && (
                <p className="mt-1 text-xs text-[#285641]">
                  <span className="font-semibold">Delivered:</span> {new Date(shipment.deliveredAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </article>
      ))}
    </div>
  )
}