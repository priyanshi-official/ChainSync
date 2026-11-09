// import { useCallback, useEffect, useState } from 'react'
// import { Link } from 'react-router-dom'
// import {
//   Building2, Search, Users, Clock, CheckCircle2, XCircle,
//   Save, AlertCircle, ArrowRight, LoaderCircle, UserRound
// } from 'lucide-react'

// import {
//   getMyDistributorProfile,
//   saveDistributorProfile,
//   getDistributorConnectionRequests
// } from '../../services/manufacturerDistributorService'

// const emptyProfile = {
//   companyName: '', contactPerson: '', email: '', phone: '',
//   address: '', city: '', country: '', description: ''
// }

// const getErrorMessage = (error) =>
//   error.response?.data?.message ||
//   error.response?.data?.error ||
//   error.message ||
//   'Something went wrong. Please try again.'

// const cardClass =
//   'rounded-2xl border border-[#19372a] bg-[#0d211a] p-5 text-[#edf8f2] shadow-sm transition-colors'

// const inputClass =
//   'w-full rounded-xl border border-[#29483a] bg-[#10271e] px-3 py-2.5 text-sm text-[#edf8f2] placeholder:text-[#8da99b] outline-none transition focus:border-[#42dda0] focus:ring-2 focus:ring-[#42dda0]/20'

// const Dashboard = () => {
//   const [profile, setProfile] = useState(emptyProfile)
//   const [hasProfile, setHasProfile] = useState(false)
//   const [showProfileForm, setShowProfileForm] = useState(false)
//   const [requests, setRequests] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [saving, setSaving] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')

//   const loadDashboard = useCallback(async () => {
//     setLoading(true)
//     setError('')

//     try {
//       const results = await Promise.allSettled([
//         getMyDistributorProfile(),
//         getDistributorConnectionRequests()
//       ])

//       const [profileResult, requestsResult] = results

//       if (profileResult.status === 'fulfilled') {
//         const data = profileResult.value
//         const savedProfile = data?.profile || data?.distributor || data

//         if (
//           savedProfile &&
//           typeof savedProfile === 'object' &&
//           (savedProfile.companyName || savedProfile.contactPerson ||
//             savedProfile.email || savedProfile._id)
//         ) {
//           setProfile({ ...emptyProfile, ...savedProfile })
//           setHasProfile(true)
//         } else {
//           setProfile(emptyProfile)
//           setHasProfile(false)
//         }
//       } else {
//         setProfile(emptyProfile)
//         setHasProfile(false)
//       }

//       if (requestsResult.status === 'fulfilled') {
//         const data = requestsResult.value
//         const list = Array.isArray(data)
//           ? data
//           : data?.requests || data?.connections || data?.data || []

//         setRequests(Array.isArray(list) ? list : [])
//       } else {
//         setRequests([])
//       }

//       if (
//         profileResult.status === 'rejected' &&
//         requestsResult.status === 'rejected'
//       ) {
//         setError(getErrorMessage(profileResult.reason))
//       } else if (requestsResult.status === 'rejected') {
//         setError('Company profile loaded, but connection requests could not be loaded.')
//       }
//     } catch (err) {
//       setError(getErrorMessage(err))
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   useEffect(() => {
//     loadDashboard()
//   }, [loadDashboard])

//   const handleChange = (event) => {
//     const { name, value } = event.target
//     setProfile((current) => ({ ...current, [name]: value }))
//     setSuccess('')
//   }

//   const handleSave = async (event) => {
//     event.preventDefault()
//     setSaving(true)
//     setError('')
//     setSuccess('')

//     try {
//       const result = await saveDistributorProfile(profile)
//       const savedProfile = result?.profile || result?.distributor

//       if (savedProfile && typeof savedProfile === 'object') {
//         setProfile((current) => ({ ...current, ...savedProfile }))
//       }

//       setHasProfile(true)
//       setShowProfileForm(false)
//       setSuccess('Company profile saved successfully.')
//     } catch (err) {
//       setError(getErrorMessage(err))
//     } finally {
//       setSaving(false)
//     }
//   }

//   const getStatus = (request) =>
//     String(request.status || 'pending').toLowerCase()

//   const getManufacturerName = (request) => {
//     const manufacturer =
//       request.manufacturer || request.manufacturerId || request.sender

//     if (manufacturer && typeof manufacturer === 'object') {
//       return manufacturer.companyName || manufacturer.name ||
//         manufacturer.email || 'Manufacturer'
//     }

//     return 'Manufacturer'
//   }

//   const pendingCount = requests.filter((r) => getStatus(r) === 'pending').length
//   const acceptedCount = requests.filter((r) => getStatus(r) === 'accepted').length
//   const rejectedCount = requests.filter((r) => getStatus(r) === 'rejected').length

//   const stats = [
//     { label: 'Total Requests', value: requests.length, icon: Users },
//     { label: 'Pending', value: pendingCount, icon: Clock },
//     { label: 'Accepted', value: acceptedCount, icon: CheckCircle2 },
//     { label: 'Rejected', value: rejectedCount, icon: XCircle }
//   ]

//   const labelClass = 'mb-1.5 block text-sm font-medium text-[#c5d8d0]'
//   const mutedClass = 'text-sm text-[#c5d8d0]'

//   if (loading) {
//     return (
//       <div className="flex min-h-80 items-center justify-center">
//         <div className="flex items-center gap-3 text-sm text-gray-500">
//           <LoaderCircle size={22} className="animate-spin" />
//           Loading distributor dashboard...
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6 p-4 sm:p-6">
//       <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
//         <div>
//           <p className="text-sm font-medium text-[#42dda0]">Distributor Workspace</p>
//           <h1 className="mt-1 text-2xl font-bold text-[#0d211a] dark:text-[#edf8f2]">
//             Distributor Dashboard
//           </h1>
//           <p className="mt-1 text-sm text-[#557064] dark:text-[#c5d8d0]">
//             Manage your company profile and manufacturer connections.
//           </p>
//         </div>
//       </div>

//       {error && (
//         <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//           <AlertCircle size={19} className="mt-0.5 shrink-0" />
//           <span>{error}</span>
//         </div>
//       )}

//       {success && (
//         <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
//           {success}
//         </div>
//       )}

//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         {stats.map(({ label, value, icon: Icon }) => (
//           <div key={label} className={cardClass}>
//             <div className="flex items-center justify-between">
//               <p className={mutedClass}>{label}</p>
//               <span className="rounded-xl bg-[#19372a] p-2.5 text-[#42dda0]">
//                 <Icon size={20} />
//               </span>
//             </div>
//             <p className="mt-4 text-3xl font-bold text-[#edf8f2]">{value}</p>
//           </div>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
//         <section className={`${cardClass} xl:col-span-3`}>
//           <div className="mb-5 flex items-center gap-3">
//             <span className="rounded-xl bg-[#19372a] p-3 text-[#42dda0]">
//               <Building2 size={22} />
//             </span>
//             <div>
//               <h2 className="text-lg font-bold text-[#edf8f2]">Company Profile</h2>
//               <p className={mutedClass}>
//                 {hasProfile ? 'Manage your business information.' : 'Complete your profile to represent your business.'}
//               </p>
//             </div>
//           </div>

//           {!showProfileForm ? (
//             <div className="rounded-xl bg-[#10271e] p-5">
//               <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//                 <div className="flex items-center gap-3">
//                   <span className="rounded-xl bg-[#19372a] p-3 text-[#42dda0]">
//                     <UserRound size={22} />
//                   </span>
//                   <div>
//                     <p className="font-semibold text-[#edf8f2]">
//                       {hasProfile ? 'Your company profile is saved' : 'Complete your company profile'}
//                     </p>
//                     <p className="mt-1 text-xs text-[#9bb9aa]">
//                       {hasProfile ? 'You can update your business details anytime.' : 'Add your company details to get started.'}
//                     </p>
//                   </div>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowProfileForm(true)
//                     setError('')
//                     setSuccess('')
//                   }}
//                   className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16865b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#106e49]"
//                 >
//                   <Building2 size={17} />
//                   Update Your Profile
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <form onSubmit={handleSave} className="space-y-4">
//               <div>
//                 <label className={labelClass}>Company Name *</label>
//                 <input className={inputClass} name="companyName" value={profile.companyName || ''} onChange={handleChange} placeholder="Enter company name" required />
//               </div>

//               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                 <div>
//                   <label className={labelClass}>Contact Person *</label>
//                   <input className={inputClass} name="contactPerson" value={profile.contactPerson || ''} onChange={handleChange} placeholder="Contact person's name" required />
//                 </div>
//                 <div>
//                   <label className={labelClass}>Email</label>
//                   <input className={inputClass} type="email" name="email" value={profile.email || ''} onChange={handleChange} placeholder="company@example.com" />
//                 </div>
//                 <div>
//                   <label className={labelClass}>Phone</label>
//                   <input className={inputClass} name="phone" value={profile.phone || ''} onChange={handleChange} placeholder="Contact number" />
//                 </div>
//                 <div>
//                   <label className={labelClass}>City</label>
//                   <input className={inputClass} name="city" value={profile.city || ''} onChange={handleChange} placeholder="City" />
//                 </div>
//               </div>

//               <div>
//                 <label className={labelClass}>Country</label>
//                 <input className={inputClass} name="country" value={profile.country || ''} onChange={handleChange} placeholder="Country" />
//               </div>

//               <div>
//                 <label className={labelClass}>Business Address</label>
//                 <textarea className={inputClass} name="address" value={profile.address || ''} onChange={handleChange} placeholder="Enter your business address" rows={2} />
//               </div>

//               <div>
//                 <label className={labelClass}>Company Description</label>
//                 <textarea className={inputClass} name="description" value={profile.description || ''} onChange={handleChange} placeholder="Describe your business and the products you source." rows={3} />
//               </div>

//               <div className="flex flex-wrap gap-2">
//                 <button
//                   type="submit"
//                   disabled={saving}
//                   className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16865b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#106e49] disabled:cursor-not-allowed disabled:opacity-60"
//                 >
//                   {saving ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />}
//                   {saving ? 'Saving...' : 'Save Company Profile'}
//                 </button>

//                 <button
//                   type="button"
//                   disabled={saving}
//                   onClick={() => {
//                     setShowProfileForm(false)
//                     setError('')
//                   }}
//                   className="rounded-xl border border-[#29483a] px-4 py-3 text-sm font-semibold text-[#c5d8d0] transition hover:bg-[#19372a] disabled:opacity-50"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           )}
//         </section>

//         <section className={`${cardClass} xl:col-span-2`}>
//           <h2 className="text-lg font-bold text-[#edf8f2]">Quick Actions</h2>
//           <p className={`mt-1 ${mutedClass}`}>Find manufacturers and manage your requests.</p>

//           <div className="mt-5 space-y-3">
//             <Link to="/distributor/manufacturers" className="flex items-center gap-3 rounded-xl border border-[#29483a] bg-[#10271e] p-4 transition hover:border-[#42dda0] hover:bg-[#19372a]">
//               <span className="rounded-xl bg-[#19372a] p-3 text-[#42dda0]"><Search size={21} /></span>
//               <span className="flex-1">
//                 <span className="block text-sm font-semibold text-[#edf8f2]">Find Manufacturers</span>
//                 <span className="mt-1 block text-xs text-[#c5d8d0]">Browse companies and send connection requests.</span>
//               </span>
//               <ArrowRight size={18} className="text-[#8da99b]" />
//             </Link>

//             <Link to="/distributor/connections" className="flex items-center gap-3 rounded-xl border border-[#29483a] bg-[#10271e] p-4 transition hover:border-[#42dda0] hover:bg-[#19372a]">
//               <span className="rounded-xl bg-[#19372a] p-3 text-[#42dda0]"><Users size={21} /></span>
//               <span className="flex-1">
//                 <span className="block text-sm font-semibold text-[#edf8f2]">My Connections</span>
//                 <span className="mt-1 block text-xs text-[#c5d8d0]">Check pending, accepted and rejected requests.</span>
//               </span>
//               <ArrowRight size={18} className="text-[#8da99b]" />
//             </Link>
//           </div>

//           {!hasProfile && (
//             <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
//               <p className="text-sm font-semibold text-amber-800">Complete your profile first</p>
//               <p className="mt-1 text-xs leading-5 text-amber-700">
//                 Add your company details before starting business connections.
//               </p>
//             </div>
//           )}
//         </section>
//       </div>

//       <section className={cardClass}>
//         <div className="mb-5 flex items-center justify-between gap-3">
//           <div>
//             <h2 className="text-lg font-bold text-[#edf8f2]">Recent Connection Requests</h2>
//             <p className={`mt-1 ${mutedClass}`}>Your latest requests to manufacturers.</p>
//           </div>
//           <Link to="/distributor/connections" className="shrink-0 text-sm font-semibold text-[#42dda0] hover:text-[#68e9b5]">
//             View all
//           </Link>
//         </div>

//         {requests.length === 0 ? (
//           <div className="rounded-xl border border-dashed border-[#29483a] bg-[#10271e] py-10 text-center">
//             <Users size={30} className="mx-auto text-[#8da99b]" />
//             <p className="mt-3 text-sm font-semibold text-[#edf8f2]">No connection requests yet</p>
//             <p className={`mt-1 ${mutedClass}`}>Find manufacturers to start building your network.</p>
//             <Link to="/distributor/manufacturers" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#16865b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#106e49]">
//               Find Manufacturers <ArrowRight size={16} />
//             </Link>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {requests.slice(0, 5).map((request, index) => {
//               const status = getStatus(request)
//               const requestId = request._id || request.id || index

//               const statusClasses = {
//                 pending: 'bg-amber-50 text-amber-700',
//                 accepted: 'bg-emerald-50 text-emerald-700',
//                 rejected: 'bg-red-50 text-red-700'
//               }

//               return (
//                 <div key={requestId} className="flex flex-col justify-between gap-3 rounded-xl border border-[#29483a] bg-[#10271e] p-4 sm:flex-row sm:items-center">
//                   <div>
//                     <p className="font-semibold text-[#edf8f2]">{getManufacturerName(request)}</p>
//                     <p className="mt-1 text-xs text-[#c5d8d0]">Connection request</p>
//                   </div>

//                   <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${statusClasses[status] || 'bg-gray-100 text-gray-700'}`}>
//                     {status === 'accepted' && <CheckCircle2 size={14} />}
//                     {status === 'rejected' && <XCircle size={14} />}
//                     {status === 'pending' && <Clock size={14} />}
//                     {status.charAt(0).toUpperCase() + status.slice(1)}
//                   </span>
//                 </div>
//               )
//             })}
//           </div>
//         )}
//       </section>
//     </div>
//   )
// }

// export default Dashboard




















import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2, Search, Users, Clock, CheckCircle2, XCircle,
  Save, AlertCircle, ArrowRight, LoaderCircle, UserRound
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts'

import {
  getMyDistributorProfile,
  saveDistributorProfile,
  getDistributorConnectionRequests
} from '../../services/manufacturerDistributorService'

import { getMyDistributorOrders } from '../../services/distributorWorkflowService'

const emptyProfile = {
  companyName: '', contactPerson: '', email: '', phone: '',
  address: '', city: '', country: '', description: ''
}

const STATUS_COLORS = {
  pending: '#FACC15',
  accepted: '#A78BFA',
  rejected: '#FF6B6B'
}

const STATUS_LABELS = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected'
}

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.message ||
  'Something went wrong. Please try again.'

const cardClass =
  'rounded-2xl border border-[#19372a] bg-[#0d211a] p-4 text-[#edf8f2] shadow-sm transition-colors'

const inputClass =
  'w-full rounded-xl border border-[#29483a] bg-[#10271e] px-3 py-2.5 text-sm text-[#edf8f2] placeholder:text-[#8da99b] outline-none transition focus:border-[#42dda0] focus:ring-2 focus:ring-[#42dda0]/20'

const Dashboard = () => {
  const [profile, setProfile] = useState(emptyProfile)
  const [hasProfile, setHasProfile] = useState(false)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [requests, setRequests] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const results = await Promise.allSettled([
        getMyDistributorProfile(),
        getDistributorConnectionRequests(),
        getMyDistributorOrders()
      ])

      const [profileResult, requestsResult, ordersResult] = results

      if (profileResult.status === 'fulfilled') {
        const data = profileResult.value
        const savedProfile = data?.profile || data?.distributor || data

        if (
          savedProfile &&
          typeof savedProfile === 'object' &&
          (savedProfile.companyName || savedProfile.contactPerson ||
            savedProfile.email || savedProfile._id)
        ) {
          setProfile({ ...emptyProfile, ...savedProfile })
          setHasProfile(true)
        } else {
          setProfile(emptyProfile)
          setHasProfile(false)
        }
      } else {
        setProfile(emptyProfile)
        setHasProfile(false)
      }

      if (requestsResult.status === 'fulfilled') {
        const data = requestsResult.value
        const list = Array.isArray(data)
          ? data
          : data?.requests || data?.connections || data?.data || []

        setRequests(Array.isArray(list) ? list : [])
      } else {
        setRequests([])
      }

      if (ordersResult.status === 'fulfilled') {
        const orders = ordersResult.value?.orders || []

        setChartData(
          ['pending', 'accepted', 'rejected'].map((status) => ({
            status,
            name: STATUS_LABELS[status],
            value: orders.filter(
              (order) => String(order.status).toLowerCase() === status
            ).length,
            color: STATUS_COLORS[status]
          }))
        )
      } else {
        setChartData([])
      }

      if (
        profileResult.status === 'rejected' &&
        requestsResult.status === 'rejected'
      ) {
        setError(getErrorMessage(profileResult.reason))
      } else if (requestsResult.status === 'rejected') {
        setError('Company profile loaded, but connection requests could not be loaded.')
      } else if (ordersResult.status === 'rejected') {
        setError('Dashboard loaded, but order statistics could not be loaded.')
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const handleChange = (event) => {
    const { name, value } = event.target
    setProfile((current) => ({ ...current, [name]: value }))
    setSuccess('')
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const result = await saveDistributorProfile(profile)
      const savedProfile = result?.profile || result?.distributor

      if (savedProfile && typeof savedProfile === 'object') {
        setProfile((current) => ({ ...current, ...savedProfile }))
      }

      setHasProfile(true)
      setShowProfileForm(false)
      setSuccess('Company profile saved successfully.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const getStatus = (request) =>
    String(request.status || 'pending').toLowerCase()

  const getManufacturerName = (request) => {
    const manufacturer =
      request.manufacturer || request.manufacturerId || request.sender

    if (manufacturer && typeof manufacturer === 'object') {
      return manufacturer.companyName || manufacturer.name ||
        manufacturer.email || 'Manufacturer'
    }

    return 'Manufacturer'
  }

  const pendingCount = requests.filter((r) => getStatus(r) === 'pending').length
  const acceptedCount = requests.filter((r) => getStatus(r) === 'accepted').length
  const rejectedCount = requests.filter((r) => getStatus(r) === 'rejected').length

  const totalOrders = chartData.reduce((sum, item) => sum + item.value, 0)

  const stats = [
    { label: 'Total Requests', value: requests.length, icon: Users },
    { label: 'Pending', value: pendingCount, icon: Clock },
    { label: 'Accepted', value: acceptedCount, icon: CheckCircle2 },
    { label: 'Rejected', value: rejectedCount, icon: XCircle }
  ]

  const labelClass = 'mb-1.5 block text-sm font-medium text-[#c5d8d0]'
  const mutedClass = 'text-sm text-[#c5d8d0]'

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <LoaderCircle size={22} className="animate-spin" />
          Loading distributor dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-4 pb-4 pt-2 sm:px-6 sm:pb-6 sm:pt-3">
      <div>
        <p className="text-sm font-medium text-[#42dda0]">Distributor Workspace</p>
        <h1 className="mt-1 text-2xl font-bold text-[#0d211a] dark:text-[#edf8f2]">
          Distributor Dashboard
        </h1>
        <p className="mt-1 text-sm text-[#557064] dark:text-[#c5d8d0]">
          Manage your supply chain operations.
        </p>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className={cardClass}>
            <div className="flex items-center justify-between">
              <p className={mutedClass}>{label}</p>
              <span className="rounded-xl bg-[#19372a] p-2.5 text-[#42dda0]">
                <Icon size={20} />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#edf8f2]">{value}</p>
          </div>
        ))}
      </div>

      {/* Chart and Company Profile */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">

        <section className={`${cardClass} xl:col-span-3`}>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#edf8f2]">
              Distributor Order Status
            </h2>
            <p className={`mt-1 ${mutedClass}`}>
              Overview of your orders placed with manufacturers.
            </p>
          </div>

          <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-2">
            <div className="relative h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.status} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#10271e',
                      border: '1px solid #29483a',
                      borderRadius: '10px',
                      color: '#edf8f2'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[#edf8f2]">
                  {totalOrders}
                </span>
                <span className="text-sm text-[#9bb9aa]">Total Orders</span>
              </div>
            </div>

            <div className="space-y-5">
              {chartData.map((item) => (
                <div key={item.status} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-[#c5d8d0]">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-[#edf8f2]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${cardClass} xl:col-span-2`}>
          <div className="mb-3 flex items-center gap-3">
            <span className="rounded-xl bg-[#19372a] p-3 text-[#42dda0]">
              <Building2 size={22} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-[#edf8f2]">Company Profile</h2>
              <p className={mutedClass}>
                {hasProfile ? 'Manage your business information.' : 'Complete your profile to represent your business.'}
              </p>
            </div>
          </div>

          {!showProfileForm ? (
            <div className="rounded-xl bg-[#10271e] p-3">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-[#19372a] p-3 text-[#42dda0]">
                    <UserRound size={22} />
                  </span>
                  <div>
                    <p className="font-semibold text-[#edf8f2]">
                      {hasProfile ? 'Your company profile is saved' : 'Complete your company profile'}
                    </p>
                    <p className="mt-1 text-xs text-[#9bb9aa]">
                      {hasProfile ? 'You can update your business details anytime.' : 'Add your company details to get started.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileForm(true)
                    setError('')
                    setSuccess('')
                  }}
                  className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-[#16865b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#106e49]"
                >
                  <Building2 size={17} />
                  Update Your Profile
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className={labelClass}>Company Name *</label>
                <input className={inputClass} name="companyName" value={profile.companyName || ''} onChange={handleChange} placeholder="Enter company name" required />
              </div>

              <div>
                <label className={labelClass}>Contact Person *</label>
                <input className={inputClass} name="contactPerson" value={profile.contactPerson || ''} onChange={handleChange} placeholder="Contact person's name" required />
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input className={inputClass} type="email" name="email" value={profile.email || ''} onChange={handleChange} placeholder="company@example.com" />
              </div>

              <div>
                <label className={labelClass}>Phone</label>
                <input className={inputClass} name="phone" value={profile.phone || ''} onChange={handleChange} placeholder="Contact number" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>City</label>
                  <input className={inputClass} name="city" value={profile.city || ''} onChange={handleChange} placeholder="City" />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <input className={inputClass} name="country" value={profile.country || ''} onChange={handleChange} placeholder="Country" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Business Address</label>
                <textarea className={inputClass} name="address" value={profile.address || ''} onChange={handleChange} placeholder="Enter your business address" rows={2} />
              </div>

              <div>
                <label className={labelClass}>Company Description</label>
                <textarea className={inputClass} name="description" value={profile.description || ''} onChange={handleChange} placeholder="Describe your business and the products you source." rows={2} />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#16865b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#106e49] disabled:opacity-60"
                >
                  {saving ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />}
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setShowProfileForm(false)
                    setError('')
                  }}
                  className="rounded-xl border border-[#29483a] px-4 py-2.5 text-sm font-semibold text-[#c5d8d0] hover:bg-[#19372a] disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      </div>

      {/* Quick Actions */}
      <section className={cardClass}>
        <h2 className="text-lg font-bold text-[#edf8f2]">Quick Actions</h2>
        <p className={`mt-1 ${mutedClass}`}>Find manufacturers and manage your requests.</p>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Link to="/distributor/manufacturers" className="flex items-center gap-3 rounded-xl border border-[#29483a] bg-[#10271e] p-4 transition hover:border-[#42dda0] hover:bg-[#19372a]">
            <span className="rounded-xl bg-[#19372a] p-3 text-[#42dda0]"><Search size={21} /></span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-[#edf8f2]">Find Manufacturers</span>
              <span className="mt-1 block text-xs text-[#c5d8d0]">Browse companies and send connection requests.</span>
            </span>
            <ArrowRight size={18} className="text-[#8da99b]" />
          </Link>

          <Link to="/distributor/connections" className="flex items-center gap-3 rounded-xl border border-[#29483a] bg-[#10271e] p-4 transition hover:border-[#42dda0] hover:bg-[#19372a]">
            <span className="rounded-xl bg-[#19372a] p-3 text-[#42dda0]"><Users size={21} /></span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-[#edf8f2]">My Connections</span>
              <span className="mt-1 block text-xs text-[#c5d8d0]">Check pending, accepted and rejected requests.</span>
            </span>
            <ArrowRight size={18} className="text-[#8da99b]" />
          </Link>
        </div>

        {!hasProfile && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-800">Complete your profile first</p>
            <p className="mt-1 text-xs leading-5 text-amber-700">
              Add your company details before starting business connections.
            </p>
          </div>
        )}
      </section>

      {/* Recent Connection Requests */}
      <section className={cardClass}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#edf8f2]">Recent Connection Requests</h2>
            <p className={`mt-1 ${mutedClass}`}>Your latest requests to manufacturers.</p>
          </div>
          <Link to="/distributor/connections" className="shrink-0 text-sm font-semibold text-[#42dda0] hover:text-[#68e9b5]">
            View all
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#29483a] bg-[#10271e] py-10 text-center">
            <Users size={30} className="mx-auto text-[#8da99b]" />
            <p className="mt-3 text-sm font-semibold text-[#edf8f2]">No connection requests yet</p>
            <p className={`mt-1 ${mutedClass}`}>Find manufacturers to start building your network.</p>
            <Link to="/distributor/manufacturers" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#16865b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#106e49]">
              Find Manufacturers <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.slice(0, 5).map((request, index) => {
              const status = getStatus(request)
              const requestId = request._id || request.id || index

              const statusClasses = {
                pending: 'bg-amber-50 text-amber-700',
                accepted: 'bg-emerald-50 text-emerald-700',
                rejected: 'bg-red-50 text-red-700'
              }

              return (
                <div key={requestId} className="flex flex-col justify-between gap-3 rounded-xl border border-[#29483a] bg-[#10271e] p-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-semibold text-[#edf8f2]">{getManufacturerName(request)}</p>
                    <p className="mt-1 text-xs text-[#c5d8d0]">Connection request</p>
                  </div>

                  <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${statusClasses[status] || 'bg-gray-100 text-gray-700'}`}>
                    {status === 'accepted' && <CheckCircle2 size={14} />}
                    {status === 'rejected' && <XCircle size={14} />}
                    {status === 'pending' && <Clock size={14} />}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default Dashboard
