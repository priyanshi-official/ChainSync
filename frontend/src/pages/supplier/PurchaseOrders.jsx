import { useCallback, useEffect, useState } from 'react'
import { ClipboardList, RefreshCw, Inbox, CheckCircle2, XCircle, Send, Truck, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { confirmAction } from '../../utils/alertUtils'
import { getReceivedSupplierPurchaseOrders, updateReceivedPurchaseOrderStatus, submitSupplierQuotation } from '../../services/supplierService'
import { createSupplierShipment, createSupplierInvoice } from '../../services/distributorWorkflowService'

function PurchaseOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [prices, setPrices] = useState({})
  const [busy, setBusy] = useState({})
  const [shipmentOrder, setShipmentOrder] = useState(null)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [creatingShipment, setCreatingShipment] = useState(false)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getReceivedSupplierPurchaseOrders()
      setOrders(data.purchaseOrders || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load purchase orders.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadOrders() }, [loadOrders])

  const runAction = async (orderId, action, successMessage) => {
    setBusy(prev => ({ ...prev, [orderId]: true }))
    setError('')
    try {
      await action()
      toast.success(successMessage)
      await loadOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update purchase order.')
    } finally {
      setBusy(prev => ({ ...prev, [orderId]: false }))
    }
  }

  const handleReject = async (orderId) => {
    const result = await confirmAction('Reject Purchase Order?', 'Are you sure you want to reject this purchase order?', 'Yes, reject')
    if (!result.isConfirmed) return
    runAction(orderId, () => updateReceivedPurchaseOrderStatus(orderId, 'rejected'), 'Purchase order rejected successfully.')
  }

  const handleQuotation = (order) => {
    const unitPrice = Number(prices[order._id])
    if (prices[order._id] === undefined || prices[order._id] === '' || !Number.isFinite(unitPrice) || unitPrice <= 0) {
      toast.error('Enter a valid quotation price greater than zero.')
      return
    }
    runAction(order._id, () => submitSupplierQuotation(order._id, unitPrice), 'Quotation submitted successfully.')
  }

  const handleCreateShipment = async (e) => {
    e.preventDefault()
    if (!trackingNumber.trim() || !shippingAddress.trim()) {
      toast.error('Please enter tracking number and shipping address.')
      return
    }
    try {
      setCreatingShipment(true)
      await createSupplierShipment({ purchaseOrderId: shipmentOrder._id, trackingNumber: trackingNumber.trim(), shippingAddress: shippingAddress.trim() })
      toast.success('Shipment created successfully.')
      setShipmentOrder(null)
      setTrackingNumber('')
      setShippingAddress('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to create shipment.')
    } finally {
      setCreatingShipment(false)
    }
  }

  const handleCreateInvoice = async (order) => {
    try {
      setBusy(prev => ({ ...prev, [order._id]: true }))
      await createSupplierInvoice(order._id)
      toast.success('Invoice created successfully.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to create invoice.')
    } finally {
      setBusy(prev => ({ ...prev, [order._id]: false }))
    }
  }

  const statusStyle = {
    pending: 'bg-[#dff4e7] text-[#285641]',
    accepted: 'bg-[#dff4e7] text-[#146b45]',
    rejected: 'bg-red-100 text-red-700',
    quotation_received: 'bg-[#dff4e7] text-[#285641]',
    confirmed: 'bg-[#dff4e7] text-[#146b45]',
    cancelled: 'bg-[#e8eee9] text-[#557064]'
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#0d211a]">Purchase Orders</h2>
          <p className="mt-1 text-sm text-[#557064]">Review incoming orders and send your quotations.</p>
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-100 p-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-[#557064]"><RefreshCw size={18} className="animate-spin" /> Loading purchase orders...</div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl bg-[#dff4e7] px-6 py-12 text-center">
          <Inbox size={36} className="mx-auto text-[#16865b]" />
          <p className="mt-3 font-semibold text-[#0d211a]">No purchase orders yet</p>
          <p className="mt-1 text-sm text-[#557064]">Orders from connected manufacturers will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {orders.map(order => {
            const status = order.status || 'pending'
            const isBusy = !!busy[order._id]

            return (
              <div key={order._id} className="rounded-2xl bg-[#0d211a] p-4 sm:p-5 text-[#edf8f2]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-[#19372a] p-3 text-[#42dda0]"><ClipboardList size={22} /></div>
                    <div>
                      <h3 className="font-semibold">{order.material || order.product?.name || 'Product'}</h3>
                      <p className="mt-1 text-sm text-[#c5d8d0]">Manufacturer: {order.manufacturer?.name || order.manufacturer?.email || 'Manufacturer'}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle[status] || 'bg-[#e8eee9] text-[#557064]'}`}>{status.replaceAll('_', ' ')}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl bg-[#10271e] p-3 sm:p-4">
                  <div><p className="text-xs text-[#9bb9aa]">Quantity</p><p className="mt-1 font-semibold">{order.quantity}</p></div>
                  <div><p className="text-xs text-[#9bb9aa]">Listed Unit Price</p><p className="mt-1 font-semibold">{order.listedPrice != null ? `₹${order.listedPrice}` : '—'}</p></div>
                  <div><p className="text-xs text-[#9bb9aa]">Listed Total</p><p className="mt-1 font-semibold">{order.listedPrice != null ? `₹${order.listedPrice * order.quantity}` : '—'}</p></div>
                  <div><p className="text-xs text-[#9bb9aa]">Your Quotation</p><p className="mt-1 font-semibold">{order.unitPrice != null ? `₹${order.unitPrice}/unit` : 'Not submitted'}</p></div>
                </div>

                {status === 'pending' && (
                  <div className="mt-4 flex gap-3">
                    <button disabled={isBusy} onClick={() => runAction(order._id, () => updateReceivedPurchaseOrderStatus(order._id, 'accepted'), 'Purchase order accepted successfully.')} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#42dda0] px-3 py-2.5 text-sm font-semibold text-[#071a12] transition hover:bg-[#68e9b5] disabled:opacity-60"><CheckCircle2 size={16} /> Accept</button>
                    <button disabled={isBusy} onClick={() => handleReject(order._id)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-400/40 px-3 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"><XCircle size={16} /> Reject</button>
                  </div>
                )}

                {status === 'accepted' && (
                  <div className="mt-4 space-y-3">
                    <label htmlFor={`price-${order._id}`} className="block text-sm font-medium text-[#c5d8d0]">Quotation price per unit (₹)</label>
                    <input id={`price-${order._id}`} type="number" min="0.01" step="0.01" value={prices[order._id] ?? ''} onChange={e => setPrices(prev => ({ ...prev, [order._id]: e.target.value }))} placeholder="Enter your unit price" className="w-full rounded-xl border border-[#29483a] bg-[#10271e] px-4 py-3 text-sm text-[#edf8f2] outline-none placeholder:text-[#9bb9aa] focus:border-[#42dda0]" />
                    <button disabled={isBusy} onClick={() => handleQuotation(order)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#42dda0] px-4 py-3 text-sm font-semibold text-[#071a12] transition hover:bg-[#68e9b5] disabled:opacity-60"><Send size={16} /> Submit Quotation</button>
                  </div>
                )}

                {status === 'quotation_received' && <p className="mt-4 rounded-lg bg-[#10271e] p-3 text-sm text-[#42dda0]">Quotation sent. Waiting for the manufacturer to confirm or cancel.</p>}

                {status === 'confirmed' && (
                  <div className="mt-4 space-y-3">
                    <p className="rounded-lg bg-[#10271e] p-3 text-sm text-[#42dda0]">Order confirmed by the manufacturer.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setShipmentOrder(order)} disabled={isBusy} className="flex items-center justify-center gap-2 rounded-xl bg-[#42dda0] px-3 py-3 text-sm font-semibold text-[#071a12] transition hover:bg-[#68e9b5] disabled:opacity-60"><Truck size={16} /> Create Shipment</button>
                      <button onClick={() => handleCreateInvoice(order)} disabled={isBusy} className="flex items-center justify-center gap-2 rounded-xl bg-[#19372a] px-3 py-3 text-sm font-semibold text-[#edf8f2] transition hover:bg-[#29483a] disabled:opacity-60"><FileText size={16} /> Create Invoice</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {shipmentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleCreateShipment} className="w-full max-w-md space-y-4 rounded-2xl bg-[#0d211a] p-5 sm:p-6 text-[#edf8f2] shadow-xl">
            <div>
              <h3 className="text-xl font-bold">Create Shipment</h3>
              <p className="mt-1 text-sm text-[#9bb9aa]">{shipmentOrder.material || shipmentOrder.product?.name}</p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#c5d8d0]">Tracking Number</label>
              <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} required placeholder="Enter tracking number" className="w-full rounded-xl border border-[#29483a] bg-[#10271e] px-4 py-3 text-sm text-[#edf8f2] outline-none placeholder:text-[#9bb9aa] focus:border-[#42dda0]" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#c5d8d0]">Shipping Address</label>
              <textarea value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} required rows={3} placeholder="Enter shipping address" className="w-full rounded-xl border border-[#29483a] bg-[#10271e] px-4 py-3 text-sm text-[#edf8f2] outline-none placeholder:text-[#9bb9aa] focus:border-[#42dda0]" />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShipmentOrder(null)} disabled={creatingShipment} className="flex-1 rounded-xl border border-[#29483a] px-4 py-3 text-sm font-medium text-[#c5d8d0] transition hover:bg-[#10271e] disabled:opacity-60">Cancel</button>
              <button type="submit" disabled={creatingShipment} className="flex-1 rounded-xl bg-[#42dda0] px-4 py-3 text-sm font-semibold text-[#071a12] transition hover:bg-[#68e9b5] disabled:opacity-60">{creatingShipment ? 'Creating...' : 'Create Shipment'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default PurchaseOrders
