import axios from "axios"

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const config = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("chainsync-token")}`,
  },
})

// Orders
export const createDistributorOrder = async (connectionId) => {
  const res = await axios.post(
    `${API}/distributor-orders/create`,
    { connectionId },
    config()
  )
  return res.data
}

export const createDirectOrder = async (connectionId, items) => {
  const res = await axios.post(
    `${API}/distributor-orders/create`,
    { connectionId, items },
    config()
  )
  return res.data
}

export const getMyDistributorOrders = async () => {
  const res = await axios.get(
    `${API}/distributor-orders/my-orders`,
    config()
  )
  return res.data
}

export const getManufacturerDistributorOrders = async () => {
  const res = await axios.get(
    `${API}/distributor-orders/manufacturer-orders`,
    config()
  )
  return res.data
}

export const updateDistributorOrderStatus = async (orderId, status) => {
  const res = await axios.put(
    `${API}/distributor-orders/update-status`,
    { orderId, status },
    config()
  )
  return res.data
}

// Shipments
export const createShipment = async (payload) => {
  const res = await axios.post(
    `${API}/shipments/create`,
    payload,
    config()
  )
  return res.data
}

export const getMyShipments = async () => {
  const res = await axios.get(
    `${API}/shipments/my-shipments`,
    config()
  )
  return res.data
}

export const updateShipmentStatus = async (shipmentId, status) => {
  const res = await axios.put(
    `${API}/shipments/update-status`,
    { shipmentId, status },
    config()
  )
  return res.data
}

// Invoices
export const createInvoice = async (orderId) => {
  const res = await axios.post(
    `${API}/invoices/create`,
    { orderId },
    config()
  )
  return res.data
}


export const createSupplierInvoice = async (purchaseOrderId) => {
  const res = await axios.post(
    `${API}/invoices/supplier/create`,
    { purchaseOrderId },
    config()
  )
  return res.data
}


export const getMyInvoices = async () => {
  const res = await axios.get(
    `${API}/invoices/my-invoices`,
    config()
  )
  return res.data
}

// Payments
export const createPayment = async (payload) => {
  const res = await axios.post(
    `${API}/payments/create`,
    payload,
    config()
  )
  return res.data
}

export const getMyPayments = async () => {
  const res = await axios.get(
    `${API}/payments/my-payments`,
    config()
  )
  return res.data
}

export const getManufacturerShipments = async () => {
  const res = await axios.get(
    `${API}/shipments/manufacturer-shipments`,
    config()
  )
  return res.data
}




//supplier-shipment related

export const createSupplierShipment = async (payload) => {
  const res = await axios.post(
    `${API}/shipments/supplier/create`,
    payload,
    config()
  )
  return res.data
}

export const getSupplierShipments = async () => {
  const res = await axios.get(
    `${API}/shipments/supplier/my-shipments`,
    config()
  )
  return res.data
}

export const updateSupplierShipmentStatus = async (shipmentId, status) => {
  const res = await axios.put(
    `${API}/shipments/supplier/update-status`,
    { shipmentId, status },
    config()
  )
  return res.data
}
