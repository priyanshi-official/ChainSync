import { useCallback, useEffect, useState } from "react"
import { Users, RefreshCw, CheckCircle2, XCircle, MapPin, Phone, Package } from "lucide-react"
import { toast } from "sonner"
import { confirmAction } from "../../utils/alertUtils"
import { getManufacturerConnectionRequests, updateManufacturerConnectionStatus } from "../../services/manufacturerDistributorService"

const statusClass = {
  pending: "bg-[#fff0c7] text-[#8a5b08]",
  accepted: "bg-[#dff4e7] text-[#146b45]",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-[#e8eee9] text-[#557064]",
  disconnected: "bg-[#e8eee9] text-[#557064]",
}

function DistributorRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updating, setUpdating] = useState({})

  const loadRequests = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await getManufacturerConnectionRequests()
      setRequests(data.requests || [])
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load distributor requests.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadRequests() }, [loadRequests])

  const handleStatus = async (id, status) => {
    if (status === "rejected") {
      const result = await confirmAction(
        "Reject Distributor Request?",
        "Are you sure you want to reject this connection request?",
        "Yes, reject"
      )
      if (!result.isConfirmed) return
    }

    setUpdating(p => ({ ...p, [id]: status }))
    setError("")
    try {
      await updateManufacturerConnectionStatus(id, status)
      toast.success(`Distributor request ${status} successfully`)
      await loadRequests()
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to update request.")
    } finally {
      setUpdating(p => ({ ...p, [id]: "" }))
    }
  }

  const pendingCount = requests.filter(r => r.status === "pending").length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#16865b]">Seller workspace</p>
          <h2 className="mt-1 text-2xl font-bold text-[#0d211a]">Distributor Connection Requests</h2>
          <p className="mt-1 text-sm text-[#557064]">Review distributor details and requested product quantities.</p>
        </div>
        <button type="button" onClick={loadRequests} disabled={loading} className="flex items-center gap-2 rounded-xl bg-[#0d211a] px-4 py-2.5 text-sm font-semibold text-[#edf8f2] transition hover:bg-[#19372a] disabled:opacity-60">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-[#dff4e7] p-4">
        <div>
          <p className="text-sm font-medium text-[#285641]">Pending decisions</p>
          <p className="mt-1 text-2xl font-bold text-[#0d211a]">{pendingCount}</p>
        </div>
        <div className="rounded-xl bg-[#c5e9d3] p-3 text-[#16865b]">
          <Users size={24} />
        </div>
      </div>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-[#557064]">
          <RefreshCw size={18} className="animate-spin text-[#16865b]" /> Loading requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl bg-[#0d211a] px-6 py-12 text-center text-[#edf8f2]">
          <Users size={36} className="mx-auto text-[#42dda0]" />
          <h3 className="mt-4 font-semibold">No distributor requests yet</h3>
          <p className="mt-1 text-sm text-[#9bb9aa]">New connection requests will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {requests.map(r => {
            const d = r.distributor || {}
            const profile = r.distributorProfile
            const products = r.requestedProducts?.length
              ? r.requestedProducts.map(x => ({
                  id: String(x.product?._id || x.product),
                  name: x.product?.name || "Product",
                  quantity: Number(x.quantity || 0),
                  price: Number(x.unitPrice ?? x.product?.price ?? 0),
                }))
              : (r.productIds || []).map(p => ({
                  id: String(p._id || p),
                  name: p.name || "Product",
                  quantity: 1,
                  price: Number(p.price || 0),
                }))
            const total = products.reduce((sum, p) => sum + p.quantity * p.price, 0)

            return (
              <article key={r._id} className="rounded-2xl bg-[#0d211a] p-4 text-[#edf8f2] sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{profile?.companyName || d.name || "Distributor"}</h3>
                    <p className="mt-1 text-sm text-[#9bb9aa]">{d.email || "No email provided"}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass[r.status] || statusClass.pending}`}>
                    {r.status}
                  </span>
                </div>

                {profile && (
                  <div className="mt-4 space-y-2 rounded-xl bg-[#dff4e7] p-3 text-sm text-[#285641]">
                    {profile.address && <p className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0" />{profile.address}</p>}
                    {profile.phone && <p className="flex items-center gap-2"><Phone size={15} />{profile.phone}</p>}
                    {profile.description && <p className="text-[#557064]">{profile.description}</p>}
                  </div>
                )}

                <div className="mt-4">
                  <h4 className="flex items-center gap-2 text-sm font-semibold">
                    <Package size={16} className="text-[#42dda0]" /> Requested products
                  </h4>
                  {products.length ? (
                    <div className="mt-3 space-y-2">
                      {products.map(p => (
                        <div key={p.id} className="rounded-xl bg-[#10271e] p-3">
                          <div className="flex justify-between gap-3 text-sm">
                            <span className="font-semibold">{p.name}</span>
                            <span className="text-[#c5d8d0]">Qty: {p.quantity}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-[#9bb9aa]">
                            <span>₹{p.price.toLocaleString("en-IN")} each</span>
                            <span>Subtotal: ₹{(p.quantity * p.price).toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      ))}
                      <div className="rounded-xl bg-[#dff4e7] p-3 text-sm text-[#285641]">
                        <div className="flex justify-between gap-3">
                          <span className="font-semibold">Estimated total</span>
                          <strong className="text-[#146b45]">₹{total.toLocaleString("en-IN")}</strong>
                        </div>
                      </div>
                      <p className="px-1 text-xs text-[#9bb9aa]">Estimated amount only; accepting this connection does not create an order or deduct stock.</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-[#9bb9aa]">No products specified.</p>
                  )}
                </div>

                {r.message && (
                  <div className="mt-4 rounded-xl bg-[#10271e] p-3 text-sm">
                    <p className="mb-1 font-semibold text-[#42dda0]">Distributor message</p>
                    <p className="text-[#c5d8d0]">{r.message}</p>
                  </div>
                )}

                {r.status === "pending" && (
                  <div className="mt-4 flex gap-3 border-t border-[#19372a] pt-4">
                    <button type="button" disabled={!!updating[r._id]} onClick={() => handleStatus(r._id, "accepted")} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#42dda0] px-3 py-2.5 text-sm font-semibold text-[#0d211a] transition hover:bg-[#68e9b5] disabled:opacity-60">
                      {updating[r._id] === "accepted" ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Accept
                    </button>
                    <button type="button" disabled={!!updating[r._id]} onClick={() => handleStatus(r._id, "rejected")} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-60">
                      {updating[r._id] === "rejected" ? <RefreshCw size={16} className="animate-spin" /> : <XCircle size={16} />} Reject
                    </button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DistributorRequests
