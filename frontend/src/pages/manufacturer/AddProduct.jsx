import { useState } from "react"
import axios from "axios"
import { PackagePlus } from "lucide-react"

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export default function AddProduct() {
  const [form, setForm] = useState({ name: "", description: "", price: "", quantity: "" })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    try {
      const token = localStorage.getItem("chainsync-token")
      const response = await axios.post(`${API}/products/create`, {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity)
      }, { headers: { Authorization: `Bearer ${token}` } })

      setMessage(response.data.message || "Product added successfully.")
      setForm({ name: "", description: "", price: "", quantity: "" })
    } catch (err) {
      setError(err.response?.data?.message || "Product add nahi ho paaya.")
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full rounded-lg border border-[#29483a] bg-[#10271e] px-3 py-2.5 text-sm text-[#edf8f2] outline-none placeholder:text-[#789487] transition focus:border-[#42dda0] focus:ring-2 focus:ring-[#42dda0]/20"

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0d211a]">Add Product</h1>
        <p className="mt-1 text-sm text-[#557064]">Add a product to your catalogue and set its initial stock.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-[#0d211a] p-5 text-[#edf8f2] sm:p-6">
        <div className="flex items-center gap-3 border-b border-[#19372a] pb-4">
          <div className="rounded-xl bg-[#19372a] p-3 text-[#42dda0]">
            <PackagePlus size={23} />
          </div>
          <div>
            <h2 className="font-semibold">Product Information</h2>
            <p className="text-xs text-[#9bb9aa]">Enter the details of your new product.</p>
          </div>
        </div>

        {message && <p className="rounded-lg border border-[#42dda0]/20 bg-[#dff4e7] p-3 text-sm font-medium text-[#285641]">{message}</p>}
        {error && <p className="rounded-lg border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}

        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-[#c5d8d0]">Product Name</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} required maxLength={100} placeholder="e.g. Steel Sheets" className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className="text-sm font-medium text-[#c5d8d0]">Description</label>
          <textarea id="description" name="description" value={form.description} onChange={handleChange} required maxLength={500} rows={3} placeholder="Describe your product..." className={`${inputClass} resize-y`} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="price" className="text-sm font-medium text-[#c5d8d0]">Price (₹ per unit)</label>
            <input id="price" type="number" name="price" value={form.price} onChange={handleChange} required min="0" step="0.01" placeholder="e.g. 250" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="quantity" className="text-sm font-medium text-[#c5d8d0]">Initial Stock Quantity</label>
            <input id="quantity" type="number" name="quantity" value={form.quantity} onChange={handleChange} required min="0" step="1" placeholder="e.g. 100" className={inputClass} />
          </div>
        </div>

        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#42dda0] px-4 py-3 text-sm font-semibold text-[#0d211a] transition hover:bg-[#68e9b5] disabled:cursor-not-allowed disabled:opacity-50">
          <PackagePlus size={17} />
          {loading ? "Adding Product..." : "Add Product"}
        </button>
      </form>
    </div>
  )
}
