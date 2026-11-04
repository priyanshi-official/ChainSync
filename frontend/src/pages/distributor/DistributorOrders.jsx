import { useEffect, useState } from "react"
import { getMyDistributorOrders } from "../../services/distributorWorkflowService"

export default function DistributorOrders() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    getMyDistributorOrders()
      .then((data) => setOrders(data.orders || []))
      .catch((e) => setError(e.response?.data?.message || "Orders load nahi hue."))
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0d211a]">My Orders</h1>
        <p className="mt-1 text-sm text-[#557064]">Track your orders and review their details.</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {!orders.length && !error && (
        <div className="rounded-2xl border border-[#d8e7dd] bg-white p-6 text-center">
          <p className="font-semibold text-[#0d211a]">No orders found</p>
          <p className="mt-1 text-sm text-[#648074]">Your placed orders will appear here.</p>
        </div>
      )}

      {orders.map((order) => (
        <article key={order._id} className="overflow-hidden rounded-2xl bg-[#0d211a] text-[#edf8f2]">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#9bb9aa]">Order ID</p>
              <h2 className="mt-0.5 text-sm font-semibold">#{order._id.slice(-6).toUpperCase()}</h2>
            </div>
            <span className="rounded-full border border-[#29483a] bg-[#10271e] px-3 py-1 text-xs font-medium capitalize text-[#42dda0]">
              {order.status}
            </span>
          </div>

          <div className="mx-4 rounded-lg border border-[#29483a] bg-[#10271e] px-3 py-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#9bb9aa]">Manufacturer</p>
            <p className="mt-0.5 text-sm font-medium">{order.manufacturer?.name || "Manufacturer"}</p>
          </div>

          <div className="space-y-2 px-4 py-3">
            <p className="text-xs font-semibold text-[#c5d8d0]">Order Items</p>
            {(order.items || []).map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-[#19372a] bg-[#10271e] px-3 py-2">
                <span className="text-sm">{item.product?.name || "Product"}</span>
                <span className="rounded-md bg-[#19372a] px-2 py-0.5 text-xs font-medium text-[#42dda0]">× {item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="mx-3 mb-3 flex items-center justify-between gap-1 rounded-lg bg-[#dff4e7] px-3 py-3">
            <span className="text-sm font-medium text-[#285641]">Total Amount</span>
            <span className="text-base font-bold text-[#146b45]">₹{Number(order.totalAmount || 0).toFixed(2)}</span>
          </div>
        </article>
      ))}
    </div>
  )
}