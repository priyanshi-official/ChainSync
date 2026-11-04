import { useEffect, useState } from "react"
import axios from "axios"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { getManufacturerDistributorConnections } from "../../services/manufacturerDistributorService"
import { createDirectOrder } from "../../services/distributorWorkflowService"
import { confirmAction } from "../../utils/alertUtils"

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export default function BrowseProducts() {
  const [products, setProducts] = useState([])
  const [connections, setConnections] = useState([])
  const [quantities, setQuantities] = useState({})
  const [loading, setLoading] = useState(true)
  const [placingOrder, setPlacingOrder] = useState("")

  const navigate = useNavigate()
  const location = useLocation()
  const connectionId = new URLSearchParams(location.search).get("connectionId")

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("chainsync-token")
        const config = { headers: { Authorization: `Bearer ${token}` } }

        const [productResponse, connectionResponse] = await Promise.all([
          axios.get(`${API}/products`, config),
          getManufacturerDistributorConnections(),
        ])

        setProducts(productResponse.data.products || [])
        setConnections(
          connectionResponse.connections ||
          connectionResponse.data?.connections || []
        )
      } catch (err) {
        toast.error(err.response?.data?.message || "Products load nahi ho paaye.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const getConnection = (manufacturerId) =>
    connections.find((connection) => {
      const id = connection.manufacturer?._id || connection.manufacturer
      return (
        String(id) === String(manufacturerId) &&
        connection.status === "accepted" &&
        (!connectionId || String(connection._id) === String(connectionId))
      )
    })

  const updateQuantity = (productId, value, stock) => {
    const quantity = value === "" ? "" : Number(value)

    if (quantity !== "" && (!Number.isInteger(quantity) || quantity < 1)) {
      setQuantities((prev) => ({ ...prev, [productId]: "" }))
      return
    }

    setQuantities((prev) => ({
      ...prev,
      [productId]: quantity === "" ? "" : Math.min(quantity, stock),
    }))
  }

  const placeOrder = async (manufacturerId, manufacturerProducts) => {
    const connection = getConnection(manufacturerId)

    if (!connection) {
      toast.error("Accepted manufacturer connection not found.")
      return
    }

    const items = manufacturerProducts
      .filter((product) => Number(quantities[product._id]) > 0)
      .map((product) => ({
        productId: product._id,
        quantity: Number(quantities[product._id]),
      }))

    if (!items.length) {
      toast.error("Order place karne ke liye quantity select karo.")
      return
    }

    const total = items.reduce((sum, item) => {
      const product = manufacturerProducts.find(
        (p) => p._id === item.productId
      )
      return sum + Number(product.price) * item.quantity
    }, 0)

    const result = await confirmAction(
      "Confirm Your Order?",
      `Are you sure you want to place this order? Total: ₹${total.toFixed(2)}`,
      "Yes, place order"
    )

    if (!result.isConfirmed) return

    setPlacingOrder(manufacturerId)

    try {
      const response = await createDirectOrder(connection._id, items)
      toast.success(response.message || "Order successfully submitted.")

      setQuantities((prev) => {
        const updated = { ...prev }
        manufacturerProducts.forEach((product) => {
          delete updated[product._id]
        })
        return updated
      })
    } catch (err) {
      toast.error(err.response?.data?.message || "Order place nahi ho paaya.")
    } finally {
      setPlacingOrder("")
    }
  }

  const groupedProducts = products.reduce((groups, product) => {
    const manufacturer = product.manufacturer
    const manufacturerId = manufacturer?._id

    if (!manufacturerId) return groups

    if (connectionId) {
      const selectedConnection = connections.find(
        (connection) =>
          String(connection._id) === String(connectionId) &&
          connection.status === "accepted"
      )

      const connectedManufacturerId =
        selectedConnection?.manufacturer?._id ||
        selectedConnection?.manufacturer

      if (
        !connectedManufacturerId ||
        String(connectedManufacturerId) !== String(manufacturerId)
      ) return groups
    }

    if (!groups[manufacturerId]) {
      groups[manufacturerId] = { manufacturer, products: [] }
    }

    groups[manufacturerId].products.push(product)
    return groups
  }, {})

  if (loading) {
    return (
      <p className="p-6 text-sm text-[#526d60] dark:text-[#c5d8d0]">
        Loading products...
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#183b2c] dark:text-[#edf8f2]">
          Browse Products
        </h1>
        <p className="mt-1 text-sm text-[#526d60] dark:text-[#c5d8d0]">
          Select products and quantities to place an order with a manufacturer.
        </p>
      </div>

      {!Object.keys(groupedProducts).length && (
        <div className="rounded-2xl border border-[#19372a] bg-[#0d211a] p-6 text-center text-sm text-[#c5d8d0]">
          {connectionId
            ? "No products are available for this manufacturer, or the connection is no longer accepted."
            : "No products are available yet."}
        </div>
      )}

      {Object.entries(groupedProducts).map(([manufacturerId, group]) => {
        const connection = getConnection(manufacturerId)
        const selectedProducts = group.products.filter(
          (product) => Number(quantities[product._id]) > 0
        )

        const total = selectedProducts.reduce(
          (sum, product) =>
            sum + Number(product.price) * Number(quantities[product._id]), 0
        )

        return (
          <section
            key={manufacturerId}
            className="space-y-4 rounded-2xl border border-[#19372a] bg-[#0d211a] p-5 text-[#edf8f2] shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#edf8f2]">
                  {group.manufacturer.name || "Manufacturer"}
                </h2>
                <p className="text-sm text-[#c5d8d0]">
                  {group.manufacturer.email || ""}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  connection
                    ? "bg-[#19372a] text-[#42dda0]"
                    : "bg-amber-950 text-amber-300"
                }`}
              >
                {connection ? "Connected" : "Connection required"}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {group.products.map((product) => (
                <article
                  key={product._id}
                  className="rounded-xl border border-[#29483a] bg-[#10271e] p-4 text-[#edf8f2]"
                >
                  <h3 className="font-semibold text-[#edf8f2]">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-[#c5d8d0]">
                    {product.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#42dda0]">
                        ₹{Number(product.price).toFixed(2)}
                      </p>
                      <p className="text-xs text-[#c5d8d0]">
                        Stock: {product.quantity}
                      </p>
                    </div>

                    <input
                      type="number"
                      min="1"
                      max={product.quantity}
                      value={quantities[product._id] ?? ""}
                      disabled={!connection || product.quantity < 1}
                      onChange={(event) =>
                        updateQuantity(
                          product._id,
                          event.target.value,
                          Number(product.quantity)
                        )
                      }
                      placeholder="Qty"
                      className="w-20 rounded-lg border border-[#29483a] bg-[#0d211a] px-3 py-2 text-sm text-[#edf8f2] placeholder:text-[#8da99b] focus:border-[#42dda0] focus:outline-none focus:ring-2 focus:ring-[#42dda0]/20 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </article>
              ))}
            </div>

            {connection ? (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#29483a] pt-4">
                <p className="text-sm text-[#c5d8d0]">
                  Estimated total:{" "}
                  <span className="font-bold text-[#42dda0]">
                    ₹{total.toFixed(2)}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={() => placeOrder(manufacturerId, group.products)}
                  disabled={
                    placingOrder === manufacturerId ||
                    !selectedProducts.length
                  }
                  className="rounded-xl bg-[#42dda0] px-5 py-2.5 text-sm font-semibold text-[#071a12] transition hover:bg-[#68e9b5] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {placingOrder === manufacturerId
                    ? "Placing Order..."
                    : "Place Order"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  navigate("/distributor/manufacturers", {
                    state: {
                      manufacturerName: group.manufacturer.name
                    }
                  })
                }
                className="rounded-xl border border-[#42dda0] px-4 py-2 text-sm font-medium text-[#42dda0] transition hover:bg-[#19372a]"
              >
                Find Manufacturer & Connect
              </button>
            )}
          </section>
        )
      })}
    </div>
  )
}
