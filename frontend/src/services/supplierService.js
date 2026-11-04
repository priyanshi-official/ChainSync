import axios from 'axios'
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('chainsync-token')}`
  }
})

export const searchSuppliers = async (search) => {
  const res = await axios.get(`${API}/suppliers/search`, {
    ...getConfig(),
    params: { search }
  })
  return res.data
}

export const sendConnectionRequest = async (supplierId) => {
  const res = await axios.post(
    `${API}/connections/request`,
    { supplierId },
    getConfig()
  )
  return res.data
}

export const getMySuppliers = async () => {
  const res = await axios.get(
    `${API}/connections/my-suppliers`,
    getConfig()
  )
  return res.data
}


export const getSupplierRequests = async () => {
  const res = await axios.get(`${API}/connections/requests`, getConfig())
  return res.data
}

export const updateConnectionStatus = async (connectionId, status) => {
  const res = await axios.put(`${API}/connections/update-status`, { connectionId, status }, getConfig())
  return res.data
}

//Profile check and then creation
export const getMySupplierProfile = async () => {
  const res = await axios.get(`${API}/suppliers/my-profile`, getConfig())
  return res.data
}

export const createSupplierProfile = async (profileData) => {
  const res = await axios.post(`${API}/suppliers/profile`, profileData, getConfig())
  return res.data
}



export const getMyConnectionRequests = async () => {
  const res = await axios.get(`${API}/connections/my-requests`,getConfig())
  return res.data
}



export const getMySupplierProducts = async () => {
  const res = await axios.get(
    `${API}/supplier-products/my-products`,
    getConfig()
  )
  return res.data
}

export const addSupplierProduct = async (productData) => {
  const res = await axios.post(
    `${API}/supplier-products`,
    productData,
    getConfig()
  )
  return res.data
}

export const updateSupplierProduct = async (id, productData) => {
  const res = await axios.put(
    `${API}/supplier-products/${id}`,
    productData,
    getConfig()
  )
  return res.data
}

export const deleteSupplierProduct = async (id) => {
  const res = await axios.delete(
    `${API}/supplier-products/${id}`,
    getConfig()
  )
  return res.data
}


export const getConnectedSupplierProducts = async (supplierId) => {
  const res = await axios.get(
    `${API}/manufacturer-supplier-products/${supplierId}`,
    getConfig()
  )
  return res.data
}

export const createSupplierPurchaseOrder = async (orderData) => {
  const res = await axios.post(
    `${API}/purchase-orders/create`,
    orderData,
    getConfig()
  )
  return res.data
}


export const getMySupplierPurchaseOrders = async () => {
  const res = await axios.get(`${API}/purchase-orders/my-orders`, getConfig())
  return res.data
}

export const decideSupplierQuotation = async (purchaseOrderId, status) => {
  const res = await axios.put(
    `${API}/purchase-orders/quotation-decision`,
    { purchaseOrderId, status },
    getConfig()
  )
  return res.data
}

export const getReceivedSupplierPurchaseOrders = async () => {
  const res = await axios.get(`${API}/purchase-orders/received`, getConfig())
  return res.data
}


export const getMyManufacturers = async () => {
  const res = await axios.get(
    `${API}/connections/my-manufacturers`,
    getConfig()
  );
  return res.data;
}



export const updateReceivedPurchaseOrderStatus = async (purchaseOrderId, status) => {
  const res = await axios.put(
    `${API}/purchase-orders/update-status`,
    { purchaseOrderId, status },
    getConfig()
  )
  return res.data
}

export const submitSupplierQuotation = async (purchaseOrderId, unitPrice) => {
  const res = await axios.put(
    `${API}/purchase-orders/quotation`,
    { purchaseOrderId, unitPrice },
    getConfig()
  )
  return res.data
}

