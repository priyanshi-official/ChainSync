import { useEffect, useState } from 'react'
import { Bell, CheckCheck, Clock } from 'lucide-react'
import { getMyNotifications, markNotificationAsRead } from '../../services/notificationService'

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [readingId, setReadingId] = useState(null)

  const fetchNotifications = async () => {
    try {
      setError('')
      const data = await getMyNotifications()
      setNotifications(data.notifications || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load notifications. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (notificationId) => {
    try {
      setReadingId(notificationId)
      await markNotificationAsRead(notificationId)

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      )
      window.dispatchEvent(new Event('notifications-updated'))
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to mark notification as read.')
    } finally {
      setReadingId(null)
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[#0d211a]">Notifications</h2>
        <p className="mt-1 text-sm text-[#557064]">Stay updated with your supply chain activities.</p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-[#0d211a] p-4 text-[#edf8f2]">
        <div className="rounded-xl bg-[#19372a] p-3 text-[#42dda0]">
          <Bell size={22} />
        </div>
        <div>
          <p className="font-semibold">Your Updates</p>
          <p className="text-sm text-[#c5d8d0]">{unreadCount} unread notification{unreadCount === 1 ? '' : 's'}</p>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="rounded-2xl bg-[#f1f7f3] p-10 text-center text-[#557064]">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#b9d5c3] bg-[#f1f7f3] px-6 py-12 text-center">
          <Bell size={34} className="mx-auto mb-3 text-[#16865b]" />
          <h3 className="font-semibold text-[#0d211a]">No notifications yet</h3>
          <p className="mt-1 text-sm text-[#648074]">Updates about your activities will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification._id} className={`rounded-2xl p-4 transition ${notification.isRead ? 'bg-[#f1f7f3]' : 'bg-[#dff4e7]'}`}>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-xl bg-white/70 p-2 text-[#16865b]">
                  {notification.isRead ? <CheckCheck size={18} /> : <Bell size={18} />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[#0d211a]">
                      {String(notification.type || 'update').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                    </p>

                    {!notification.isRead && (
                      <span className="rounded-full bg-[#16865b] px-2 py-0.5 text-xs font-medium text-white">New</span>
                    )}
                  </div>

                  <p className="mt-1 break-words text-sm text-[#285641]">{notification.message}</p>

                  <p className="mt-2 flex items-center gap-1 text-xs text-[#557064]">
                    <Clock size={13} />
                    {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Date unavailable'}
                  </p>
                </div>

                {!notification.isRead && (
                  <button
                    type="button"
                    disabled={readingId === notification._id}
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-[#146b45] transition hover:bg-[#c3e9d1] disabled:opacity-50"
                  >
                    {readingId === notification._id ? 'Saving...' : 'Mark as read'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
