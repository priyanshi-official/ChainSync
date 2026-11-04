import { useCallback, useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { Search, Factory, Package, Send, CheckCircle2, RefreshCw, Users } from "lucide-react"
import {
  searchManufacturers, getMyDistributorProfile, getDistributorConnectionRequests,
  getManufacturerDistributorConnections, sendManufacturerConnectionRequest,
} from "../../services/manufacturerDistributorService"

function FindManufacturers() {
  const location = useLocation()

  const [search, setSearch] = useState(
    location.state?.manufacturerName || ""
  )
  const [manufacturers, setManufacturers] = useState([])
  const [profileReady, setProfileReady] = useState(false)
  const [statuses, setStatuses] = useState({})
  const [quantities, setQuantities] = useState({})
  const [messages, setMessages] = useState({})
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [pageError, setPageError] = useState("")

  const loadStatuses = useCallback(async () => {
    try {
      const [p, r, c] = await Promise.all([
        getMyDistributorProfile(),
        getDistributorConnectionRequests(),
        getManufacturerDistributorConnections(),
      ])

      setProfileReady(Boolean(p.distributor))

      const next = {}

      ;(r.requests || []).forEach(x => {
        next[String(x.manufacturer?._id || x.manufacturer)] = x.status
      })

      ;(c.connections || []).forEach(x => {
        next[String(x.manufacturer?._id || x.manufacturer)] = "accepted"
      })

      setStatuses(next)
    } catch (e) {
      setPageError(
        e.response?.data?.message || "Unable to load connection statuses."
      )
    } finally {
      setInitialLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStatuses()
  }, [loadStatuses])

  const handleSearch = useCallback(async (e, searchTerm) => {
    e?.preventDefault()

    const term = searchTerm.trim()

    if (!term) {
      setManufacturers([])
      return
    }

    setLoading(true)
    setPageError("")

    try {
      const d = await searchManufacturers(term)
      setManufacturers(d.manufacturers || [])
    } catch (e) {
      setPageError(
        e.response?.data?.message || "Unable to search manufacturers."
      )
      setManufacturers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const manufacturerName = location.state?.manufacturerName

    if (manufacturerName) {
      setSearch(manufacturerName)
      handleSearch(null, manufacturerName)
    }
  }, [location.state?.manufacturerName, handleSearch])

  const setQuantity = (manufacturerId, productId, value) => {
    const key = `${manufacturerId}_${productId}`
    setQuantities(prev => ({ ...prev, [key]: value }))
  }

  const handleRequest = async manufacturer => {
    const id = String(manufacturer._id)

    if (!profileReady) {
      setErrors(p => ({
        ...p,
        [id]: "Create your company profile from Distributor Overview first."
      }))
      return
    }

    const requestedProducts = manufacturer.products
      .map(p => ({
        productId: String(p._id),
        quantity: Number(quantities[`${id}_${p._id}`] || 0),
        available: Number(p.quantity || 0),
      }))
      .filter(p => p.quantity > 0)

    if (!requestedProducts.length) {
      setErrors(p => ({
        ...p,
        [id]: "Enter a required quantity for at least one product."
      }))
      return
    }

    const invalid = requestedProducts.find(
      p =>
        !Number.isInteger(p.quantity) ||
        p.quantity < 1 ||
        p.quantity > p.available
    )

    if (invalid) {
      setErrors(p => ({
        ...p,
        [id]: `Enter a whole quantity between 1 and available stock (${invalid.available}).`
      }))
      return
    }

    setStatuses(p => ({ ...p, [id]: "sending" }))
    setErrors(p => ({ ...p, [id]: "" }))

    try {
      await sendManufacturerConnectionRequest({
        manufacturerId: id,
        requestedProducts: requestedProducts.map(
          ({ productId, quantity }) => ({ productId, quantity })
        ),
        productIds: requestedProducts.map(p => p.productId),
        message: messages[id] || "",
      })

      setStatuses(p => ({ ...p, [id]: "pending" }))
    } catch (e) {
      setStatuses(p => ({
        ...p,
        [id]: e.response?.data?.status || "idle"
      }))

      setErrors(p => ({
        ...p,
        [id]: e.response?.data?.message || "Unable to send request."
      }))
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-[#526d60] dark:text-[#c5d8d0]">
        <RefreshCw size={18} className="animate-spin" />
        Loading manufacturers...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-[#16865b] dark:text-[#42dda0]">
          Find wholesale suppliers
        </p>

        <h2 className="mt-1 text-2xl font-bold text-[#183b2c] dark:text-[#edf8f2]">
          Find Manufacturers
        </h2>

        <p className="mt-1 text-sm text-[#526d60] dark:text-[#c5d8d0]">
          Choose required quantities and request a business connection.
        </p>
      </div>

      {!profileReady && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
          Create your company profile from Distributor Overview before sending requests.
        </div>
      )}

      {pageError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
          {pageError}
        </div>
      )}

      <form
        onSubmit={e => handleSearch(e, search)}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-[#d5e7dc] bg-white px-4 dark:border-[#19372a] dark:bg-[#0d211a]">
          <Search size={20} className="text-[#16865b] dark:text-[#42dda0]" />

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search manufacturer name or email..."
            className="w-full bg-transparent py-3 text-sm text-[#183b2c] outline-none placeholder:text-[#789184] dark:text-[#edf8f2] dark:placeholder:text-[#8da99b]"
          />
        </div>

        <button
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#42dda0] px-6 py-3 font-semibold text-[#071a12] transition hover:bg-[#68e9b5] disabled:opacity-60"
        >
          {loading
            ? <RefreshCw size={18} className="animate-spin" />
            : <Search size={18} />}

          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {!loading && manufacturers.length === 0 && (
        <div className="rounded-2xl border border-[#19372a] bg-[#0d211a] px-6 py-12 text-center">
          <Users size={36} className="mx-auto text-[#42dda0]" />

          <h3 className="mt-4 font-semibold text-[#edf8f2]">
            Discover manufacturers
          </h3>

          <p className="mt-2 text-sm text-[#c5d8d0]">
            Search to see manufacturers and their products.
          </p>
        </div>
      )}

      {manufacturers.length > 0 && (
        <p className="text-sm text-[#526d60] dark:text-[#c5d8d0]">
          {manufacturers.length} manufacturer
          {manufacturers.length !== 1 ? "s" : ""} found
        </p>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        {manufacturers.map(m => {
          const id = String(m._id)
          const status = statuses[id] || "idle"
          const disabled = ["pending", "accepted", "sending"].includes(status)

          const total = (m.products || []).reduce(
            (sum, p) =>
              sum +
              Number(quantities[`${id}_${p._id}`] || 0) *
              Number(p.price || 0),
            0
          )

          return (
            <article
              key={id}
              className="rounded-2xl border border-[#19372a] bg-[#0d211a] p-5 text-[#edf8f2] shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-[#19372a] p-3 text-[#42dda0]">
                  <Factory size={23} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[#edf8f2]">{m.name}</h3>
                  <p className="mt-1 text-sm text-[#c5d8d0]">
                    {m.email}
                  </p>
                </div>

                {status === "accepted" ? (
                  <span className="text-xs font-semibold text-[#42dda0]">
                    Connected
                  </span>
                ) : status === "pending" ? (
                  <span className="text-xs text-amber-400">
                    Pending
                  </span>
                ) : status === "rejected" ? (
                  <span className="text-xs text-red-400">
                    Rejected
                  </span>
                ) : null}
              </div>

              <div className="mt-5">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-[#edf8f2]">
                  <Package size={17} className="text-[#42dda0]" />
                  Available products
                </h4>

                {!m.products?.length ? (
                  <p className="mt-3 rounded-xl bg-[#10271e] p-4 text-sm text-[#c5d8d0]">
                    No products listed yet.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {m.products.map(p => {
                      const key = `${id}_${p._id}`

                      return (
                        <div
                          key={p._id}
                          className="rounded-xl border border-[#29483a] bg-[#10271e] p-3"
                        >
                          <div className="text-sm font-semibold text-[#edf8f2]">
                            {p.name}
                          </div>

                          {p.description && (
                            <p className="mt-1 text-xs text-[#c5d8d0]">
                              {p.description}
                            </p>
                          )}

                          <p className="mt-2 text-sm text-[#edf8f2]">
                            ₹{Number(p.price).toLocaleString("en-IN")} each
                            <span className="text-[#c5d8d0]">
                              {" "}· Stock: {p.quantity}
                            </span>
                          </p>

                          <label className="mt-3 flex items-center justify-between gap-3 text-sm text-[#edf8f2]">
                            <span>Required quantity</span>

                            <input
                              type="number"
                              min="0"
                              max={p.quantity}
                              step="1"
                              disabled={disabled}
                              value={quantities[key] || ""}
                              onChange={e =>
                                setQuantity(id, p._id, e.target.value)
                              }
                              placeholder="0"
                              className="w-24 rounded-lg border border-[#29483a] bg-[#0d211a] px-3 py-2 text-[#edf8f2] outline-none placeholder:text-[#8da99b] focus:border-[#42dda0] disabled:opacity-60"
                            />
                          </label>

                          <p className="mt-2 text-right text-xs text-[#c5d8d0]">
                            Subtotal: ₹
                            {(Number(quantities[key] || 0) * Number(p.price || 0)).toLocaleString("en-IN")}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-xl bg-[#10271e] p-3">
                <div className="flex justify-between gap-3 text-sm text-[#edf8f2]">
                  <span>Estimated request total</span>
                  <strong className="text-[#42dda0]">
                    ₹{total.toLocaleString("en-IN")}
                  </strong>
                </div>

                <p className="mt-1 text-xs text-[#c5d8d0]">
                  Estimate only; this is not a confirmed order.
                </p>
              </div>

              <label className="mt-4 block text-sm font-medium text-[#edf8f2]">
                Message / purchase requirements (optional)

                <textarea
                  rows={2}
                  disabled={disabled}
                  maxLength={1000}
                  value={messages[id] || ""}
                  onChange={e =>
                    setMessages(p => ({ ...p, [id]: e.target.value }))
                  }
                  placeholder="Describe your purchase requirements..."
                  className="mt-1.5 w-full rounded-xl border border-[#29483a] bg-[#10271e] px-3 py-2.5 text-sm font-normal text-[#edf8f2] outline-none placeholder:text-[#8da99b] focus:border-[#42dda0] disabled:opacity-60"
                />
              </label>

              {errors[id] && (
                <p className="mt-3 text-sm text-red-400">
                  {errors[id]}
                </p>
              )}

              {status === "rejected" && (
                <p className="mt-3 text-sm text-red-400">
                  Request rejected. You can send it again.
                </p>
              )}

              {["cancelled", "disconnected"].includes(status) && (
                <p className="mt-3 text-sm text-[#c5d8d0]">
                  Previous request ended. You can request again.
                </p>
              )}

              <button
                type="button"
                disabled={disabled || !m.products?.length}
                onClick={() => handleRequest(m)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#42dda0] px-4 py-3 text-sm font-semibold text-[#071a12] transition hover:bg-[#68e9b5] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "sending" ? (
                  <>
                    <RefreshCw size={17} className="animate-spin" />
                    Sending...
                  </>
                ) : status === "accepted" ? (
                  <>
                    <CheckCircle2 size={17} />
                    Connected
                  </>
                ) : status === "pending" ? (
                  <>
                    <CheckCircle2 size={17} />
                    Request Sent
                  </>
                ) : (
                  <>
                    <Send size={17} />
                    {["rejected", "cancelled", "disconnected"].includes(status)
                      ? "Send Again"
                      : "Request Connection"}
                  </>
                )}
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default FindManufacturers
