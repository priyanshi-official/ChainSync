import { useEffect, useState } from "react"
import axios from "axios"
import { Boxes, Package, IndianRupee, RefreshCw } from "lucide-react"

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchInventory = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("chainsync-token")
      const response = await axios.get(`${API}/products/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProducts(response.data.products || response.data || [])
    } catch (err) {
      setError(err.response?.data?.message || "Inventory load nahi ho paayi.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const totalStock = products.reduce((sum, product) => sum + Number(product.quantity || 0), 0)

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0d211a]">Inventory</h1>
          <p className="mt-1 text-sm text-[#557064]">View your products, prices and available stock.</p>
        </div>
        <button
          type="button"
          onClick={fetchInventory}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-[#c9dfd1] bg-white px-4 py-2.5 text-sm font-semibold text-[#285641] transition hover:bg-[#dff4e7] disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#0d211a] p-5 text-[#edf8f2]">
          <div className="flex items-center gap-3 text-sm text-[#9bb9aa]">
            <div className="rounded-xl bg-[#19372a] p-3 text-[#42dda0]">
              <Package size={21} />
            </div>
            Total Products
          </div>
          <p className="mt-3 text-3xl font-bold">{products.length}</p>
        </div>

        <div className="rounded-2xl bg-[#0d211a] p-5 text-[#edf8f2]">
          <div className="flex items-center gap-3 text-sm text-[#9bb9aa]">
            <div className="rounded-xl bg-[#19372a] p-3 text-[#42dda0]">
              <Boxes size={21} />
            </div>
            Total Available Units
          </div>
          <p className="mt-3 text-3xl font-bold">{totalStock.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#557064]">
          <RefreshCw size={18} className="animate-spin text-[#16865b]" />
          Loading inventory...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
          {error}
          <button type="button" onClick={fetchInventory} className="ml-2 font-semibold underline">
            Try again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl bg-[#0d211a] p-10 text-center text-[#edf8f2]">
          <Package className="mx-auto mb-3 text-[#42dda0]" size={32} />
          <p className="font-semibold">No products found</p>
          <p className="mt-1 text-sm text-[#9bb9aa]">Add your first product using the Add Product page.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-[#0d211a]">
          <div className="flex items-center gap-2 border-b border-[#19372a] px-5 py-4">
            <Package size={19} className="text-[#42dda0]" />
            <h2 className="font-semibold text-[#edf8f2]">Product Inventory</h2>
            <span className="ml-auto rounded-full bg-[#19372a] px-3 py-1 text-xs font-medium text-[#42dda0]">
              {products.length} Products
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-[#10271e] text-[#9bb9aa]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Description</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Available Stock</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#19372a] text-[#edf8f2]">
                {products.map((product) => (
                  <tr key={product._id} className="transition hover:bg-[#10271e]">
                    <td className="px-4 py-4 font-medium">{product.name}</td>
                    <td className="max-w-xs px-4 py-4 text-[#9bb9aa]">{product.description}</td>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1 font-medium text-[#42dda0]">
                        <IndianRupee size={14} />
                        {Number(product.price || 0).toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-medium">{product.quantity ?? 0}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${Number(product.quantity) > 0 ? "bg-[#dff4e7] text-[#285641]" : "bg-red-500/10 text-red-400"}`}>
                        {Number(product.quantity) > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
