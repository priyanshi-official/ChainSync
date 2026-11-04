import { useCallback, useEffect, useState } from 'react'
import { Users, CheckCircle2, XCircle, RefreshCw, Inbox } from 'lucide-react'
import { toast } from 'sonner'
import { confirmAction } from '../../utils/alertUtils'
import { getSupplierRequests, updateConnectionStatus } from '../../services/supplierService'

function ConnectionRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState({})

  const loadRequests = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getSupplierRequests()
      setRequests(data.requests || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load connection requests.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadRequests() }, [loadRequests])

  const handleStatus = async (connectionId, status) => {
    if (status === 'rejected') {
      const result = await confirmAction('Reject Connection Request?', 'Are you sure you want to reject this manufacturer request?', 'Yes, reject')
      if (!result.isConfirmed) return
    }

    setUpdating(prev => ({ ...prev, [connectionId]: status }))
    setError('')

    try {
      await updateConnectionStatus(connectionId, status)
      setRequests(prev => prev.filter(request => request._id !== connectionId))
      toast.success(`Connection request ${status} successfully`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update request.')
    } finally {
      setUpdating(prev => ({ ...prev, [connectionId]: '' }))
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#0d211a]">Connection Requests</h2>
          <p className="mt-1 text-sm text-[#557064]">Review manufacturers who want to connect with your company.</p>
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-600">{error}</p>}

      {!loading && (
        <div className="rounded-2xl bg-[#0d211a] p-5 text-[#edf8f2]">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#dff4e7] p-3 text-[#146b45]">
              <Users size={22} />
            </div>
            <div>
              <p className="text-sm text-[#c5d8d0]">Pending Requests</p>
              <p className="text-2xl font-bold">{requests.length}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-[#557064]">
          <RefreshCw size={18} className="animate-spin" /> Loading requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl bg-[#dff4e7] px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#16865b]">
            <Inbox size={30} />
          </div>
          <p className="mt-3 font-semibold text-[#285641]">No pending requests</p>
          <p className="mt-1 text-sm text-[#557064]">New manufacturer requests will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map(request => (
            <div key={request._id} className="rounded-2xl bg-[#0d211a] p-5 text-[#edf8f2]">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-[#19372a] p-3 text-[#42dda0]">
                  <Users size={22} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold">{request.manufacturer?.name || 'Manufacturer'}</h3>
                  <p className="mt-1 break-all text-sm text-[#c5d8d0]">{request.manufacturer?.email || 'No email provided'}</p>
                  <span className="mt-2 inline-flex rounded-full bg-[#dff4e7] px-2.5 py-1 text-xs font-medium text-[#146b45]">Pending</span>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button type="button" onClick={() => handleStatus(request._id, 'accepted')} disabled={!!updating[request._id]} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#42dda0] px-3 py-2.5 text-sm font-semibold text-[#071a12] transition hover:bg-[#68e9b5] disabled:opacity-60">
                  {updating[request._id] === 'accepted' ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Accept
                </button>
                <button type="button" onClick={() => handleStatus(request._id, 'rejected')} disabled={!!updating[request._id]} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-400/30 px-3 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/10 disabled:opacity-60">
                  {updating[request._id] === 'rejected' ? <RefreshCw size={16} className="animate-spin" /> : <XCircle size={16} />} Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ConnectionRequests
