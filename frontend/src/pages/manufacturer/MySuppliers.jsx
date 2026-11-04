import { useEffect, useState } from "react"
import { Building2, Mail, Package, RefreshCw, Users } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getMySuppliers } from "../../services/supplierService"

function MySuppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const data = await getMySuppliers()
        setSuppliers((data.suppliers || []).filter((item) => item.status === "accepted" && item.supplier))
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load your connected suppliers.")
      } finally {
        setLoading(false)
      }
    }

    loadSuppliers()
  }, [])

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
        <h2 className="text-2xl font-bold text-[#0d211a]">My Suppliers</h2>
        <p className="mt-1 text-sm text-[#557064]">Manage suppliers who have accepted your connection requests.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!error && suppliers.length === 0 ? (
        <div className="rounded-2xl bg-[#0d211a] p-8 text-center text-[#edf8f2]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#19372a] text-[#42dda0]">
            <Users size={28} />
          </div>
          <h3 className="mt-4 font-semibold">No connected suppliers yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#9bb9aa]">
            Find suppliers and send connection requests to build your supplier network.
          </p>
          <button
            type="button"
            onClick={() => navigate("/manufacturer/suppliers")}
            className="mt-5 rounded-lg bg-[#42dda0] px-5 py-2.5 text-sm font-semibold text-[#0d211a] transition hover:bg-[#68e9b5]"
          >
            Find Suppliers
          </button>
        </div>
      ) : (
        suppliers.length > 0 && (
          <>
            <div className="rounded-2xl bg-[#0d211a] p-4 text-[#edf8f2] sm:p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#19372a] p-3 text-[#42dda0]">
                  <Users size={22} />
                </div>
                <div>
                  <p className="text-sm text-[#9bb9aa]">Total Connected Suppliers</p>
                  <p className="mt-1 text-2xl font-bold">{suppliers.length}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {suppliers.map((item) => {
                const supplier = item.supplier

                return (
                  <div key={item._id} className="rounded-2xl bg-[#0d211a] p-5 text-[#edf8f2]">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-[#19372a] p-3 text-[#42dda0]">
                        <Building2 size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="break-words font-semibold">{supplier.name || "Supplier"}</h3>
                        <span className="mt-2 inline-flex rounded-full bg-[#dff4e7] px-3 py-1 text-xs font-semibold text-[#285641]">
                          Connected
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-start gap-2 text-sm text-[#c5d8d0]">
                      <Mail size={17} className="mt-0.5 shrink-0 text-[#42dda0]" />
                      <span className="break-all">{supplier.email || "Email not available"}</span>
                    </div>

                    <div className="mt-4 border-t border-[#19372a] pt-4">
                      <p className="text-xs text-[#9bb9aa]">Connected since</p>
                      <p className="mt-1 text-sm font-medium text-[#edf8f2]">
                        {item.updatedAt
                          ? new Date(item.updatedAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })
                          : "Date unavailable"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/manufacturer/supplier-products")}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#42dda0] px-4 py-2.5 text-sm font-semibold text-[#0d211a] transition hover:bg-[#68e9b5]"
                    >
                      <Package size={17} />
                      Browse Supplier Products
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )
      )}
    </div>
  )
}

export default MySuppliers
