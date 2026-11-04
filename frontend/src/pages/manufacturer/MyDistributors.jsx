import { useCallback, useEffect, useState } from "react"
import { Users, RefreshCw, Unplug, MapPin, Phone, Package } from "lucide-react"
import { toast } from "sonner"
import { confirmAction } from "../../utils/alertUtils"
import { getManufacturerDistributorConnections, disconnectManufacturerDistributor } from "../../services/manufacturerDistributorService"

function MyDistributors() {
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updating, setUpdating] = useState({})

  const loadConnections = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await getManufacturerDistributorConnections()
      setConnections(data.connections || [])
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load connected distributors.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadConnections() }, [loadConnections])

  const handleDisconnect = async (connection) => {
    const name = connection.distributorProfile?.companyName || connection.distributor?.name || "this distributor"

    const result = await confirmAction(
      "Disconnect Distributor?",
      `Are you sure you want to disconnect from ${name}?`,
      "Yes, disconnect"
    )

    if (!result.isConfirmed) return

    setUpdating(prev => ({ ...prev, [connection._id]: true }))
    setError("")

    try {
      await disconnectManufacturerDistributor(connection._id)
      setConnections(prev => prev.filter(item => item._id !== connection._id))
      toast.success("Distributor disconnected successfully.")
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to disconnect.")
    } finally {
      setUpdating(prev => ({ ...prev, [connection._id]: false }))
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#0d211a]">My Distributors</h2>
          <p className="mt-1 text-sm text-[#557064]">Manage active distributor relationships.</p>
        </div>
        <button type="button" onClick={loadConnections} disabled={loading} className="flex items-center gap-2 rounded-xl bg-[#0d211a] px-4 py-2.5 text-sm font-semibold text-[#edf8f2] transition hover:bg-[#19372a] disabled:opacity-60">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-[#557064]">
          <RefreshCw size={18} className="animate-spin text-[#16865b]" /> Loading distributors...
        </div>
      ) : connections.length === 0 ? (
        <div className="rounded-2xl bg-[#0d211a] px-6 py-12 text-center text-[#edf8f2]">
          <Users size={36} className="mx-auto text-[#42dda0]" />
          <h3 className="mt-4 font-semibold">No connected distributors</h3>
          <p className="mt-2 text-sm text-[#9bb9aa]">Accepted distributor connections will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {connections.map(connection => {
            const profile = connection.distributorProfile
            const distributor = connection.distributor || {}

            return (
              <article key={connection._id} className="rounded-2xl bg-[#0d211a] p-4 text-[#edf8f2] sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{profile?.companyName || distributor.name || "Distributor"}</h3>
                    <p className="mt-1 text-sm text-[#9bb9aa]">{distributor.email}</p>
                  </div>
                  <span className="rounded-full bg-[#dff4e7] px-3 py-1 text-xs font-semibold text-[#146b45]">
                    Connected
                  </span>
                </div>

                {profile && (
                  <div className="mt-4 space-y-2 rounded-xl bg-[#dff4e7] p-3 text-sm text-[#285641]">
                    {profile.address && <p className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0" />{profile.address}</p>}
                    {profile.phone && <p className="flex items-center gap-2"><Phone size={15} />{profile.phone}</p>}
                    {profile.description && <p className="pt-1 text-[#557064]">{profile.description}</p>}
                  </div>
                )}

                {connection.productIds?.length > 0 && (
                  <div className="mt-4 rounded-xl bg-[#10271e] p-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-[#42dda0]">
                      <Package size={16} /> Products they initially requested
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[#c5d8d0]">
                      {connection.productIds.map(item => item.name).join(", ")}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  disabled={updating[connection._id]}
                  onClick={() => handleDisconnect(connection)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-60"
                >
                  {updating[connection._id] ? <RefreshCw size={16} className="animate-spin" /> : <Unplug size={16} />}
                  Disconnect
                </button>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MyDistributors
