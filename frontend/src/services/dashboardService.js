import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('chainsync-token')}`
  }
})

export const getSupplyChainHealth = async () => {
  const res = await axios.get(`${API}/supply-chain-health`, getConfig())
  return res.data
}

export const getInventory = async () => {
  const res = await axios.get(`${API}/inventory/my-inventory`, getConfig())
  return res.data
}

export const getPurchaseOrders = async () => {
  const res = await axios.get(`${API}/purchase-orders/my-orders`, getConfig())
  return res.data
}

export const getDistributorOrders = async () => {
  const res = await axios.get(`${API}/distributor-orders/manufacturer-orders`, getConfig())
  return res.data
}
