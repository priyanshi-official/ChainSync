import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  getManufacturerShipments,
  updateShipmentStatus,
} from "../../services/distributorWorkflowService"
import { confirmAction } from "../../utils/alertUtils"

const statuses = ["processing", "shipped", "in_transit", "delivered"]

export default function ManufacturerShipments() {
  const [shipments, setShipments] = useState([])
  const [busy, setBusy] = useState("")

  const load = async () => {
    try {
      const data = await getManufacturerShipments()
      setShipments(data.shipments || [])
    } catch (e) {
      toast.error(e.response?.data?.message || "Shipments load nahi hue.")
    }
  }

  useEffect(() => {
    load()
  }, [])

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

      toast.success(
        status === "delivered"
          ? "Product marked as delivered successfully."
          : `Shipment status updated to ${status.replace("_", " ")}.`
      )

      await load()
    } catch (e) {
      toast.error(
        e.response?.data?.message || "Shipment status update nahi hua."
      )
    } finally {
      setBusy("")
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-[#0d211a]">
        Manage Shipments
      </h1>

      {!shipments.length && (
        <p className="text-[#557064]">No shipments found.</p>
      )}

      {shipments.map((shipment) => (
        <article
          key={shipment._id}
          className="space-y-3 rounded-2xl bg-[#0d211a] p-5 text-[#edf8f2]"
        >
          <h2 className="font-semibold">
            Tracking: {shipment.trackingNumber}
          </h2>

          <p className="text-[#c5d8d0]">
            Current status: {shipment.status}
          </p>

          <p className="text-[#c5d8d0]">
            Address: {shipment.shippingAddress}
          </p>

          <select
            value={shipment.status}
            disabled={!!busy}
            onChange={(e) => update(shipment._id, e.target.value)}
            className="rounded-lg border border-[#b9e6ca] bg-[#dff4e7] px-3 py-2 text-[#146b45] focus:outline-none focus:ring-2 focus:ring-[#42dda0]"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </article>
      ))}
    </div>
  )
}

