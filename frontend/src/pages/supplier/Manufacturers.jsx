import { useCallback, useEffect, useState } from 'react'
import { Building2, RefreshCw, Users, Mail, Inbox } from 'lucide-react'
import { getMyManufacturers } from '../../services/supplierService'

function Manufacturers() {
  const [manufacturers, setManufacturers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadManufacturers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getMyManufacturers()
      setManufacturers(data.manufacturers || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load manufacturers.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadManufacturers() }, [loadManufacturers])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#0d211a]">My Manufacturers</h2>
          <p className="mt-1 text-sm text-[#557064]">Manufacturers connected with your company.</p>
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-[#557064]">
          <RefreshCw size={18} className="animate-spin" />
          Loading manufacturers...
        </div>
      ) : manufacturers.length === 0 ? (
        <div className="rounded-2xl bg-[#dff4e7] px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#16865b]">
            <Inbox size={30} />
          </div>
          <p className="mt-3 font-semibold text-[#285641]">No connected manufacturers yet</p>
          <p className="mt-1 text-sm text-[#557064]">Manufacturers will appear here after you accept their requests.</p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl bg-[#0d211a] p-5 text-[#edf8f2]">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#dff4e7] p-3 text-[#146b45]">
                <Users size={22} />
              </div>
              <div>
                <p className="text-sm text-[#c5d8d0]">Connected Manufacturers</p>
                <p className="text-2xl font-bold">{manufacturers.length}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {manufacturers.map(connection => {
              const manufacturer = connection.manufacturer || {}

              return (
                <div key={connection._id} className="rounded-2xl bg-[#0d211a] p-5 text-[#edf8f2]">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-[#19372a] p-3 text-[#42dda0]">
                      <Building2 size={24} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold">{manufacturer.name || 'Manufacturer'}</h3>
                      <span className="mt-2 inline-block rounded-full bg-[#dff4e7] px-3 py-1 text-xs font-semibold text-[#146b45]">
                        Connected
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-start gap-2 text-sm text-[#c5d8d0]">
                    <Mail size={16} className="mt-0.5 shrink-0 text-[#42dda0]" />
                    <span className="break-all">{manufacturer.email || 'No email available'}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default Manufacturers
