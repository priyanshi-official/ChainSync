import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Package, ClipboardList, Building2, RefreshCw, ArrowUpRight } from 'lucide-react'
import { getSupplierRequests, getMySupplierProfile, createSupplierProfile, getMySupplierProducts, getReceivedSupplierPurchaseOrders, getMyManufacturers } from '../../services/supplierService'

function Dashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ companyName: '', phone: '', address: '', description: '' })
  const [stats, setStats] = useState({ requests: 0, products: 0, manufacturers: 0, orders: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProfile = useCallback(async () => {
    setError('')
    try {
      const data = await getMySupplierProfile()
      setProfile(data.supplier || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load supplier profile.')
    } finally {
      setProfileLoading(false)
    }
  }, [])

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const results = await Promise.allSettled([
        getSupplierRequests(),
        getMySupplierProducts(),
        getMyManufacturers(),
        getReceivedSupplierPurchaseOrders()
      ])

      const [requests, products, manufacturers, orders] = results

      setStats({
        requests: requests.status === 'fulfilled' ? (requests.value.requests || []).length : 0,
        products: products.status === 'fulfilled' ? (products.value.products || []).length : 0,
        manufacturers: manufacturers.status === 'fulfilled' ? (manufacturers.value.manufacturers || []).length : 0,
        orders: orders.status === 'fulfilled' ? (orders.value.purchaseOrders || []).length : 0
      })

      if (results.some(result => result.status === 'rejected')) {
        setError('Some dashboard details could not be loaded. Try refreshing.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProfile() }, [loadProfile])
  useEffect(() => {
    if (profile) loadDashboard()
  }, [profile, loadDashboard])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const data = await createSupplierProfile(form)
      setProfile(data.supplier)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create company profile.')
    } finally {
      setSaving(false)
    }
  }

  if (profileLoading) {
    return <div className="p-6 text-sm text-[#557064]">Checking company profile...</div>
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-[#0d211a]">Complete Your Company Profile</h2>
          <p className="mt-1 text-sm text-[#557064]">Add your business details so manufacturers can find and connect with you.</p>
        </div>

        {error && <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-600">{error}</p>}

        <form onSubmit={handleProfileSubmit} className="space-y-4 rounded-2xl bg-[#0d211a] p-5 text-[#edf8f2] sm:p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-[#19372a] p-2.5 text-[#42dda0]">
              <Building2 size={22} />
            </span>
            <h3 className="text-lg font-semibold">Company Details</h3>
          </div>

          {[
            { name: 'companyName', label: 'Company Name', type: 'text' },
            { name: 'phone', label: 'Phone Number', type: 'tel' },
            { name: 'address', label: 'Business Address', type: 'text' }
          ].map(field => (
            <div key={field.name}>
              <label className="mb-1.5 block text-sm font-medium text-[#c5d8d0]" htmlFor={field.name}>{field.label}</label>
              <input id={field.name} type={field.type} required value={form[field.name]}
                onChange={e => setForm({ ...form, [field.name]: e.target.value })}
                className="w-full rounded-xl border border-[#29483a] bg-[#10271e] px-4 py-3 text-sm text-[#edf8f2] outline-none placeholder:text-[#9bb9aa] focus:border-[#42dda0]" />
            </div>
          ))}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#c5d8d0]" htmlFor="description">Company Description</label>
            <textarea id="description" required rows={4} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-[#29483a] bg-[#10271e] px-4 py-3 text-sm text-[#edf8f2] outline-none placeholder:text-[#9bb9aa] focus:border-[#42dda0]" />
          </div>

          <button disabled={saving} className="w-full rounded-xl bg-[#42dda0] px-4 py-3 text-sm font-semibold text-[#071a12] transition hover:bg-[#68e9b5] disabled:opacity-60">
            {saving ? 'Saving Profile...' : 'Save Company Profile'}
          </button>
        </form>
      </div>
    )
  }

  const cards = [
    { label: 'Pending Requests', value: stats.requests, icon: Users, path: '/supplier/requests' },
    { label: 'My Products', value: stats.products, icon: Package, path: '/supplier/products' },
    { label: 'Manufacturers', value: stats.manufacturers, icon: Building2, path: '/supplier/manufacturers' },
    { label: 'Purchase Orders', value: stats.orders, icon: ClipboardList, path: '/supplier/purchase-orders' }
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#16865b]">Supplier Workspace</p>
          <h2 className="mt-1 text-2xl font-bold text-[#0d211a]">Welcome, {profile.companyName || 'Supplier'}</h2>
          <p className="mt-1 text-sm text-[#557064]">Here is an overview of your business activity.</p>
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(card => {
          const Icon = card.icon
          return (
            <button key={card.label} onClick={() => navigate(card.path)}
              className="rounded-2xl bg-[#0d211a] p-5 text-left text-[#edf8f2] transition hover:-translate-y-0.5 hover:bg-[#10271e] hover:shadow-lg">
              <div className="flex items-center justify-between">
                <span className="rounded-xl bg-[#19372a] p-3 text-[#42dda0]">
                  <Icon size={22} />
                </span>
                <ArrowUpRight size={18} className="text-[#9bb9aa]" />
              </div>
              <p className="mt-5 text-sm text-[#c5d8d0]">{card.label}</p>
              <p className="mt-1 text-3xl font-bold">{loading ? '—' : card.value}</p>
              <p className="mt-2 text-xs text-[#9bb9aa]">View details</p>
            </button>
          )
        })}
      </div>

      <div className="rounded-2xl bg-[#0d211a] p-5 text-[#edf8f2]">
        <h3 className="text-lg font-semibold">Quick Overview</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#c5d8d0]">
          Manage your product catalogue, review manufacturer requests and process incoming purchase orders from your sidebar.
        </p>
      </div>
    </div>
  )
}

export default Dashboard
