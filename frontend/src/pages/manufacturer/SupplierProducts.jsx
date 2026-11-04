import { useEffect, useState } from "react"
import { Package, RefreshCw, ShoppingCart } from "lucide-react"
import { getMySuppliers, getConnectedSupplierProducts, createSupplierPurchaseOrder } from "../../services/supplierService"

function SupplierProducts() {
  const [suppliers, setSuppliers] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState("")
  const [products, setProducts] = useState([])
  const [quantities, setQuantities] = useState({})
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const [submitting, setSubmitting] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const data = await getMySuppliers()
        const list = data.suppliers || []
        setSuppliers(list)

        if (list.length > 0) {
          const firstId = String(list[0].supplier?._id || list[0].supplier)
          setSelectedSupplier(firstId)
        }
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load connected suppliers.")
      } finally {
        setLoading(false)
      }
    }

    loadSuppliers()
  }, [])

  useEffect(() => {
    if (!selectedSupplier) {
      setProducts([])
      return
    }

    const loadProducts = async () => {
      setProductsLoading(true)
      setError("")
      setMessage("")

      try {
        const data = await getConnectedSupplierProducts(selectedSupplier)
        setProducts(data.products || [])
      } catch (err) {
        setProducts([])
        setError(err.response?.data?.message || "Unable to load supplier products.")
      } finally {
        setProductsLoading(false)
      }
    }

    loadProducts()
  }, [selectedSupplier])

  const handleCreateOrder = async (product) => {
    const quantity = Number(quantities[product._id] || 0)

    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("Enter a valid quantity of at least 1.")
      return
    }

    if (quantity > product.quantity) {
      setError(`Only ${product.quantity} units are available.`)
      return
    }

    setSubmitting(product._id)
    setError("")
    setMessage("")

    try {
      await createSupplierPurchaseOrder({
        supplierId: selectedSupplier,
        productId: product._id,
        quantity
      })

      setMessage(`Purchase order created for ${product.name}.`)
      setQuantities((prev) => ({ ...prev, [product._id]: "" }))
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create purchase order.")
    } finally {
      setSubmitting("")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm font-medium text-[#285641]">
        <RefreshCw size={18} className="animate-spin text-[#16865b]" />
        Loading connected suppliers...
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[#0d211a]">Supplier Products</h2>
        <p className="mt-1 text-sm text-[#557064]">
          Browse products from suppliers you are connected with and place purchase orders.
        </p>
      </div>

      {suppliers.length === 0 ? (
        <div className="rounded-2xl bg-[#0d211a] p-8 text-center text-[#edf8f2]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#19372a] text-[#42dda0]">
            <Package size={28} />
          </div>
          <h3 className="mt-4 font-semibold">No connected suppliers yet</h3>
          <p className="mt-2 text-sm text-[#9bb9aa]">
            Connect with a supplier first to browse their products.
          </p>
        </div>
      ) : (
        <>
          <div className="max-w-md space-y-2">
            <label className="text-sm font-semibold text-[#285641]" htmlFor="supplier-select">
              Select Supplier
            </label>
            <select
              id="supplier-select"
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full rounded-lg border border-[#c9dfd1] bg-white px-3 py-2.5 text-sm text-[#0d211a] outline-none transition focus:border-[#16865b] focus:ring-2 focus:ring-[#42dda0]/20"
            >
              {suppliers.map((item) => {
                const supplier = item.supplier
                const id = String(supplier?._id || supplier)
                const name = supplier?.name || supplier?.companyName || "Connected supplier"

                return <option key={id} value={id}>{name}</option>
              })}
            </select>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-[#b8e4c9] bg-[#dff4e7] p-3 text-sm font-medium text-[#285641]">
              {message}
            </div>
          )}

          {productsLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-[#285641]">
              <RefreshCw size={18} className="animate-spin text-[#16865b]" />
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl bg-[#0d211a] p-8 text-center text-sm text-[#c5d8d0]">
              No products available for this supplier.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <div key={product._id} className="rounded-2xl bg-[#0d211a] p-5 text-[#edf8f2]">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 rounded-xl bg-[#19372a] p-3 text-[#42dda0]">
                      <Package size={22} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="break-words font-semibold">{product.name}</h3>
                      <p className="mt-1 text-sm text-[#9bb9aa]">{product.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-[#10271e] px-3 py-3">
                    <div>
                      <p className="text-xs text-[#9bb9aa]">Price</p>
                      <p className="mt-1 font-bold text-[#42dda0]">₹{product.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#9bb9aa]">Available Stock</p>
                      <p className="mt-1 text-sm font-semibold text-[#edf8f2]">{product.quantity} units</p>
                    </div>
                  </div>

                  <label className="mt-4 block text-sm font-medium text-[#c5d8d0]">
                    Order Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={product.quantity}
                    value={quantities[product._id] || ""}
                    onChange={(e) => setQuantities((prev) => ({ ...prev, [product._id]: e.target.value }))}
                    className="mt-2 w-full rounded-lg border border-[#29483a] bg-[#10271e] px-3 py-2.5 text-sm text-[#edf8f2] outline-none placeholder:text-[#789487] focus:border-[#42dda0] focus:ring-2 focus:ring-[#42dda0]/20"
                    placeholder="Enter quantity"
                  />

                  <button
                    type="button"
                    onClick={() => handleCreateOrder(product)}
                    disabled={submitting === product._id || product.quantity < 1}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#42dda0] px-4 py-2.5 text-sm font-semibold text-[#0d211a] transition hover:bg-[#68e9b5] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingCart size={17} />
                    {submitting === product._id ? "Creating..." : "Create Purchase Order"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SupplierProducts
