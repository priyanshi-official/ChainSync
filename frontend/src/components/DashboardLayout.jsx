import { useState , useEffect} from 'react'
import { Menu, X, Bell, UserRound } from 'lucide-react'
import { Outlet , useNavigate} from 'react-router-dom'
import Sidebar from './Sidebar'
import ThemeToggle from './ThemeToggle'
import { getMyNotifications } from '../services/notificationService'


function DashboardLayout({ role }) {
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const user = JSON.parse(localStorage.getItem('chainsync-user') || '{}')
  const roleName = role.charAt(0).toUpperCase() + role.slice(1)
  const name = user.name || user.companyName || roleName


  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let active = true

    const fetchUnreadCount = async () => {
      try {
        const data = await getMyNotifications()

        if (active) {
          const unread = (data.notifications || []).filter(
            (notification) => !notification.isRead
          ).length

          setUnreadCount(unread)
        }
      } catch (error) {
        console.error('Unable to fetch unread notifications:', error)
      }
    }

    fetchUnreadCount()

    const handleNotificationUpdate = () => {
      fetchUnreadCount()
    }

    window.addEventListener('notifications-updated', handleNotificationUpdate)

    const intervalId = setInterval(fetchUnreadCount, 30000)

    return () => {
      active = false
      clearInterval(intervalId)
      window.removeEventListener('notifications-updated', handleNotificationUpdate)
    }
  }, [])


  return (
    <div className="flex h-screen overflow-hidden bg-[#f1f7f3] text-[#102a20] dark:bg-[#000000] dark:text-[#edf8f2]">
      <div className="hidden lg:block"><Sidebar role={role} /></div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="h-full"><Sidebar role={role} onNavigate={() => setMenuOpen(false)} /></div>
          <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="flex-1 bg-black/60" />
          <button type="button" aria-label="Close sidebar" onClick={() => setMenuOpen(false)} className="absolute left-64 top-4 rounded-lg bg-[#19372a] p-2 text-white"><X size={20} /></button>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[73px] items-center justify-between border-b border-[#d5e7dc] bg-white/95 px-4 backdrop-blur-md dark:border-[#19372a] dark:bg-[#000000]/95 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Open menu" onClick={() => setMenuOpen(true)} className="rounded-lg p-2 hover:bg-[#e4f2e9] dark:hover:bg-[#0d211a] lg:hidden">
              <Menu size={22} />
            </button>
            <div>
              <h1 className="text-lg font-bold sm:text-xl">{roleName} Dashboard</h1>
              <p className="hidden text-xs text-[#526d60] dark:text-[#c5d8d0] sm:block">Manage your supply chain operations</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
           
          <button
            type="button"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            onClick={() => navigate(`/${role}/notifications`)}
            className="relative rounded-xl border border-[#d5e7dc] p-2.5 hover:bg-[#f1f7f3] dark:border-[#19372a] dark:hover:bg-[#0d211a]"
          >
            <Bell size={19} />

            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

            <div className="hidden items-center gap-2 sm:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d7f1e3] text-[#16865b] dark:bg-[#19372a] dark:text-[#42dda0]"><UserRound size={19} /></span>
              <div className="max-w-36">
                <p className="truncate text-sm font-semibold">{name}</p>
                <p className="text-xs capitalize text-[#526d60] dark:text-[#c5d8d0]">{role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
