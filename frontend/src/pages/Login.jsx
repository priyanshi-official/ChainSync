import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { loginUser } from '../services/authService'
import AuthLayout from '../components/AuthLayout'

function Login() {
  const location = useLocation()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: location.state?.email || '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginUser(form)
      localStorage.setItem('chainsync-token', data.token)
      localStorage.setItem('chainsync-user', JSON.stringify(data.user))

      if (data.user.role === 'manufacturer') navigate('/manufacturer')
      else if (data.user.role === 'supplier') navigate('/supplier')
      else if (data.user.role === 'distributor') navigate('/distributor')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full rounded-xl border border-[#c8ded1] bg-[#f8fcf9] px-4 py-3 outline-none transition focus:border-[#16865b] focus:ring-2 focus:ring-[#42dda0]/20 dark:border-[#29483a] dark:bg-[#07120f] dark:text-white dark:placeholder:text-[#71877c] dark:focus:border-[#42dda0]"

  return (
    <AuthLayout
      badge="ACCOUNT LOGIN"
      title="Welcome back"
      subtitle="Sign in to manage your supply chain and business operations."
      footer={<>Don't have an account? <Link to="/signup" className="font-bold text-[#16865b] hover:underline dark:text-[#42dda0]">Create account</Link></>}
    >
      <form onSubmit={handleSubmit} autoComplete="on" className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold">Email address</label>
          <input id="email" name="email" type="email" autoComplete="username" required value={form.email} onChange={handleChange} placeholder="you@company.com" className={inputClass} />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-semibold">Password</label>
          <div className="relative">
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={form.password} onChange={handleChange} placeholder="Enter your password" className={`${inputClass} pr-12`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#526d60] dark:text-[#c5d8d0]">
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
        </div>

        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}

        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#16865b] px-5 py-3.5 font-bold text-white transition hover:bg-[#106e49] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#42dda0] dark:text-[#07120f] dark:hover:bg-[#68e9b5]">
          {loading ? 'Signing in...' : 'Sign In'} {!loading && <ArrowRight size={18} />}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Login
