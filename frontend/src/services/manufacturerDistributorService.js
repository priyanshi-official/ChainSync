//Centralizes Axios calls for distributor profiles and manufacturer–distributor connections
import axios from "axios"
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const getConfig = () => ({
  headers: {Authorization: `Bearer ${localStorage.getItem("chainsync-token")}`,},
})

export const getMyDistributorProfile = async () => {
  const res = await axios.get(`${API}/distributors/my-profile`, getConfig())
  return res.data
}

export const saveDistributorProfile = async (profile) => {
  const res = await axios.put(`${API}/distributors/my-profile`, profile, getConfig())
  return res.data
}

export const searchManufacturers = async (search = "") => {
  const res = await axios.get(`${API}/distributors/manufacturers`, {
    ...getConfig(),
    params: { search },
  })
  return res.data
}

export const sendManufacturerConnectionRequest = async (payload) => {
  const res = await axios.post(`${API}/manufacturer-distributor/request`, payload, getConfig())
  return res.data
}

export const getDistributorConnectionRequests = async () => {
  const res = await axios.get(`${API}/manufacturer-distributor/my-requests`, getConfig())
  return res.data
}

export const getManufacturerConnectionRequests = async () => {
  const res = await axios.get(`${API}/manufacturer-distributor/manufacturer-requests`, getConfig())
  return res.data
}

export const updateManufacturerConnectionStatus = async (connectionId, status) => {
  const res = await axios.put(
    `${API}/manufacturer-distributor/update-status`,
    { connectionId, status },
    getConfig(),
  )
  return res.data
}

export const cancelManufacturerConnectionRequest = async (connectionId) => {
  const res = await axios.put(
    `${API}/manufacturer-distributor/cancel`,
    { connectionId },
    getConfig(),
  )
  return res.data
}

export const disconnectManufacturerDistributor = async (connectionId) => {
  const res = await axios.put(
    `${API}/manufacturer-distributor/disconnect`,
    { connectionId },
    getConfig(),
  )
  return res.data
}

export const getManufacturerDistributorConnections = async () => {
  const res = await axios.get(`${API}/manufacturer-distributor/my-connections`, getConfig())
  return res.data
}