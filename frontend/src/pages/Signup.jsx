import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, UserRound, Mail, Eye, EyeOff, Factory, Package, Truck } from 'lucide-react'
import { registerUser } from '../services/authService'
import AuthLayout from '../components/AuthLayout'

const roles = [
  { value: 'manufacturer', label: 'Manufacturer', description: 'Manage procurement and production', Icon: Factory },
  { value: 'supplier', label: 'Supplier', description: 'Manage requests and supply orders', Icon: Package },
  { value: 'distributor', label: 'Distributor', description: 'Place orders and track deliveries', Icon: Truck }
]

function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'manufacturer' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (form.password.length < 6) {
      setError('Password must contain at least 6 characters.')
      return
    }

    try {
      setLoading(true)
      const response = await registerUser(form)
      setSuccess(response.message || 'Account created successfully!')
      setTimeout(() => navigate('/login', { state: { email: form.email } }), 1200)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full rounded-xl border border-[#c8ded1] bg-[#f8fcf9] px-4 py-2.5 text-sm outline-none transition focus:border-[#16865b] focus:ring-2 focus:ring-[#42dda0]/20 dark:border-[#29483a] dark:bg-[#07120f] dark:text-white dark:placeholder:text-[#71877c] dark:focus:border-[#42dda0]"

  return (
    <AuthLayout
      badge="CREATE ACCOUNT"
      title="Join ChainSync"
      subtitle="Create your account and connect with your business network."
      footer={<>Already have an account? <Link to="/login" className="font-bold text-[#16865b] hover:underline dark:text-[#42dda0]">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} autoComplete="on" className="space-y-3">

        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-semibold">Full name</label>
          <div className="relative">
            <UserRound size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#526d60] dark:text-[#a4c8b9]" />
            <input id="name" name="name" type="text" autoComplete="name" required value={form.name} onChange={handleChange} placeholder="Enter your full name" className={`${inputClass} pl-11`} />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-semibold">Email address</label>
          <div className="relative">
            <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#526d60] dark:text-[#a4c8b9]" />
            <input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={handleChange} placeholder="you@company.com" className={`${inputClass} pl-11`} />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-semibold">Password</label>
          <div className="relative">
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={6} required value={form.password} onChange={handleChange} placeholder="Create a password (minimum 6 characters)" className={`${inputClass} pr-12`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#526d60] dark:text-[#c5d8d0]">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold">Choose your business role</h3>
          <div className="grid grid-cols-3 gap-2">
            {roles.map(({ value, label, description, Icon }) => {
              const selected = form.role === value
              return (
                <button
                  type="button"
                  key={value}
                  onClick={() => setForm({ ...form, role: value })}
                  aria-pressed={selected}
                  className={`flex min-h-[100px] flex-col items-center justify-center rounded-xl border p-2 text-center transition ${selected ? 'border-[#16865b] bg-[#e1f3e8] shadow-[inset_0_0_0_1px_#16865b] dark:border-[#42dda0] dark:bg-[#0c2b20]' : 'border-[#c8ded1] bg-[#f8fcf9] hover:border-[#16865b] dark:border-[#29483a] dark:bg-[#07120f] dark:hover:border-[#42dda0]'}`}
                >
                  <Icon size={21} className={selected ? 'text-[#16865b] dark:text-[#42dda0]' : 'text-[#526d60] dark:text-[#a4c8b9]'} />
                  <span className="mt-1.5 text-xs font-semibold sm:text-sm">{label}</span>
                  <span className="mt-1 text-[10px] leading-3 text-[#526d60] dark:text-[#a4c8b9]">{description}</span>
                </button>
              )
            })}
          </div>
        </div>

        {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
        {success && <p role="status" className="rounded-xl bg-[#e1f3e8] px-3 py-2 text-xs text-[#16865b] dark:bg-[#0c2b20] dark:text-[#42dda0]">{success} Redirecting to login...</p>}

        <button type="submit" disabled={loading || Boolean(success)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#16865b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#106e49] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#42dda0] dark:text-[#07120f] dark:hover:bg-[#68e9b5]">
          {loading ? 'Creating account...' : 'Create Account'} {!loading && <ArrowRight size={18} />}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Signup
