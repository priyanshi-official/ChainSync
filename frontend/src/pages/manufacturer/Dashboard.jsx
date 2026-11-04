import { useEffect, useState } from 'react'
import { Package, AlertTriangle, ClipboardList, Truck, CreditCard, RefreshCw } from 'lucide-react'
import { getSupplyChainHealth } from '../../services/dashboardService'

function Dashboard() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const healthData = await getSupplyChainHealth()
      setHealth(healthData)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const stats = [
    { label: 'Inventory Items', value: health?.inventory?.length ?? 0, icon: Package },
    { label: 'Low Stock Items', value: health?.lowStockItems?.length ?? 0, icon: AlertTriangle },
    { label: 'Pending Purchase Orders', value: health?.pendingPurchaseOrders ?? 0, icon: ClipboardList },
    { label: 'Active Shipments', value: health?.activeShipments ?? 0, icon: Truck },
    { label: 'Pending Payments', value: health?.pendingPayments ?? 0, icon: CreditCard }
  ]

  if (loading) return (
    <div className="flex min-h-64 items-center justify-center gap-3 text-[#557064]">
      <RefreshCw className="animate-spin" size={20} /> Loading dashboard...
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-[#16865b]">Your business at a glance</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#0d211a]">Overview</h2>
          <p className="mt-1 text-sm text-[#557064]">Monitor your inventory, procurement and distribution.</p>
        </div>
        <button type="button" onClick={loadDashboard} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d211a] px-4 py-2.5 text-sm font-semibold text-[#edf8f2] transition hover:bg-[#19372a] disabled:opacity-60">
          <RefreshCw size={16} /> Refresh data
        </button>
      </div>

      {error && (
        <div className="flex flex-col gap-3 rounded-xl bg-red-100 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <p>{error}</p>
          <button type="button" onClick={loadDashboard} className="font-semibold underline">Try again</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl bg-[#0d211a] p-4 transition hover:-translate-y-0.5 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-[#c5d8d0]">{label}</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-[#edf8f2]">{value}</p>
              </div>
              <span className="rounded-xl bg-[#19372a] p-3 text-[#42dda0]"><Icon size={21} /></span>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl bg-[#0d211a] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-[#edf8f2]">Inventory Snapshot</h3>
            <p className="mt-1 text-sm text-[#9bb9aa]">Your current material stock</p>
          </div>
          <Package className="text-[#42dda0]" size={21} />
        </div>

        {!health?.inventory?.length ? (
          <div className="mt-5 rounded-xl bg-[#10271e] px-4 py-10 text-center">
            <Package size={28} className="mx-auto text-[#42dda0]" />
            <p className="mt-2 text-sm text-[#c5d8d0]">No inventory records yet.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl bg-[#10271e] p-3 sm:p-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <table className="w-full min-w-[450px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#29483a] text-[#9bb9aa]">
                  <th className="pb-3 pr-4 font-medium">Material</th>
                  <th className="pb-3 pr-4 font-medium">Quantity</th>
                  <th className="pb-3 font-medium">Stock status</th>
                </tr>
              </thead>
              <tbody>
                {health.inventory.map((item) => {
                  const low = item.quantity < item.minStock
                  return (
                    <tr key={item._id} className="border-b border-[#29483a] last:border-0">
                      <td className="py-4 pr-4 font-medium text-[#edf8f2]">{item.material}</td>
                      <td className="py-4 pr-4 tabular-nums text-[#c5d8d0]">{item.quantity}</td>
                      <td className="py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${low ? 'bg-[#fef3c7] text-[#92400e]' : 'bg-[#dff4e7] text-[#146b45]'}`}>
                          {low ? 'Low stock' : 'Healthy'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default Dashboard
