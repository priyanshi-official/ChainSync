import axios from "axios"
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("chainsync-token")}`
  }
})

export const getMyNotifications = async () => {
  const res = await axios.get(
    `${API}/notifications/my-notifications`,
    getConfig()
  )
  return res.data
}

export const markNotificationAsRead = async (notificationId) => {
  const res = await axios.put(
    `${API}/notifications/read`,
    { notificationId },
    getConfig()
  )
  return res.data
}
