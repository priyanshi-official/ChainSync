import { useEffect, useState } from "react"
import { getMyInvoices, getMyPayments, createPayment } from "../../services/distributorWorkflowService"
import { toast } from "sonner"

export default function InvoicePayments({ allowPayment = false }) {
  const [invoices, setInvoices] = useState([])
  const [payments, setPayments] = useState([])
  const [amounts, setAmounts] = useState({})
  const [methods, setMethods] = useState({})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState("")

  const user = JSON.parse(localStorage.getItem("chainsync-user") || "{}")
  const role = user.role

  const load = async () => {
    try {
      setError("")
      const [invoiceData, paymentData] = await Promise.all([getMyInvoices(), getMyPayments()])
      setInvoices(Array.isArray(invoiceData) ? invoiceData : invoiceData?.invoices || [])
      setPayments(Array.isArray(paymentData) ? paymentData : paymentData?.payments || [])
    } catch (e) {
      setError(e.response?.data?.message || "Invoice/payment data load nahi hua.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const pay = async (invoice) => {
    const amount = Number(amounts[invoice._id])
    const total = Number(invoice.totalAmount)
    const paid = Number(invoice.paidAmount || 0)
    const remaining = Math.max(0, total - paid)

    if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(remaining) || amount > remaining) {
      toast.error(`Payment amount must be greater than 0 and cannot exceed the remaining balance of ₹${remaining.toFixed(2)}`)
      return
    }

    setBusy(invoice._id)
    setError("")

    try {
      await createPayment({
        invoiceId: invoice._id,
        amount,
        paymentMethod: methods[invoice._id] || "upi",
      })

      toast.success("Payment recorded successfully!")
      setAmounts((prev) => ({ ...prev, [invoice._id]: "" }))
      await load()
    } catch (e) {
      const message = e.response?.data?.message || "Failed to record payment."
      setError(message)
      toast.error(message)
    } finally {
      setBusy("")
    }
  }

  if (loading) return <p className="p-6 text-[#557064]">Loading invoices and payments...</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0d211a]">Invoices & Payments</h1>
        <p className="mt-1 text-sm text-[#557064]">View invoices, outstanding balances and payment history.</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#0d211a]">Invoices</h2>

        {!invoices.length && (
          <div className="rounded-xl bg-white p-4 text-sm text-[#557064]">
            No invoices found. Manufacturer ko pehle accepted order ke liye invoice generate karna hoga.
          </div>
        )}

        {invoices.map((invoice) => {
          const total = Number(invoice.totalAmount || 0)
          const paid = Number(invoice.paidAmount || 0)
          const remaining = Math.max(0, total - paid)

          const canPay =
            allowPayment &&
            (
              (role === "manufacturer" && !!invoice.purchaseOrder) ||
              (role === "distributor" && !!invoice.order) ||
              role === "supplier"
            )

          return (
            <article key={invoice._id} className="overflow-hidden rounded-2xl bg-[#0d211a] text-[#edf8f2]">
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#9bb9aa]">Invoice Number</p>
                  <h3 className="mt-0.5 text-sm font-semibold">{invoice.invoiceNumber}</h3>
                </div>
                <span className="rounded-full bg-[#10271e] px-3 py-1 text-xs font-medium capitalize text-[#42dda0]">
                  {invoice.paymentStatus || "pending"}
                </span>
              </div>

              <div className="mx-4 space-y-2 rounded-lg bg-[#10271e] px-3 py-3">
                <div className="flex justify-between gap-2 text-sm">
                  <span className="text-[#9bb9aa]">Order</span>
                  <span className="text-right">
                    {invoice.order?._id
                      ? `#${invoice.order._id.slice(-6).toUpperCase()}`
                      : invoice.purchaseOrder?._id
                        ? `#${invoice.purchaseOrder._id.slice(-6).toUpperCase()}`
                        : "Order details unavailable"}
                  </span>
                </div>

                {invoice.manufacturer?.name && (
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="text-[#9bb9aa]">Manufacturer</span>
                    <span className="text-right">{invoice.manufacturer.name}</span>
                  </div>
                )}

                {invoice.distributor?.name && (
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="text-[#9bb9aa]">Distributor</span>
                    <span className="text-right">{invoice.distributor.name}</span>
                  </div>
                )}

                {invoice.invoiceDate && (
                  <div className="flex justify-between gap-2 border-t border-[#29483a] pt-2 text-xs">
                    <span className="text-[#9bb9aa]">Invoice Date</span>
                    <span>{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 px-4 py-3 text-center">
                <div>
                  <p className="text-[10px] text-[#9bb9aa]">Total</p>
                  <p className="mt-1 text-sm font-semibold">₹{total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#9bb9aa]">Paid</p>
                  <p className="mt-1 text-sm font-semibold text-[#42dda0]">₹{paid.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#9bb9aa]">Balance</p>
                  <p className="mt-1 text-sm font-semibold">₹{remaining.toFixed(2)}</p>
                </div>
              </div>

              {canPay && remaining > 0 && (
                <div className="mx-4 mb-3 flex flex-wrap gap-2 rounded-lg bg-[#10271e] p-3">
                  <input
                    type="number"
                    min="0.01"
                    max={remaining}
                    step="0.01"
                    value={amounts[invoice._id] || ""}
                    onChange={(e) => setAmounts((prev) => ({ ...prev, [invoice._id]: e.target.value }))}
                    placeholder="Payment amount"
                    className="min-w-0 flex-1 rounded-lg border border-[#29483a] bg-[#07120f] px-3 py-2 text-sm text-white outline-none focus:border-[#42dda0]"
                  />

                  <select
                    value={methods[invoice._id] || "upi"}
                    onChange={(e) => setMethods((prev) => ({ ...prev, [invoice._id]: e.target.value }))}
                    className="rounded-lg border border-[#29483a] bg-[#07120f] px-3 py-2 text-sm text-white outline-none focus:border-[#42dda0]"
                  >
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="other">Other</option>
                  </select>

                  <button
                    disabled={!!busy}
                    onClick={() => pay(invoice)}
                    className="rounded-lg bg-[#16865b] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#106e49] disabled:opacity-50"
                  >
                    {busy === invoice._id ? "Saving..." : "Record Payment"}
                  </button>
                </div>
              )}

              {remaining === 0 && (
                <div className="mx-4 mb-3 rounded-lg bg-[#dff4e7] px-3 py-2 text-sm font-semibold text-[#146b45]">
                  Invoice fully paid
                </div>
              )}
            </article>
          )
        })}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#0d211a]">Payment History</h2>

        {!payments.length && (
          <div className="rounded-xl bg-white p-4 text-sm text-[#557064]">No payment records found.</div>
        )}

        {payments.map((payment) => (
          <article key={payment._id} className="overflow-hidden rounded-2xl bg-[#0d211a] text-[#edf8f2]">
            <div className="flex items-center justify-between gap-2 px-4 py-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#9bb9aa]">Payment Amount</p>
                <p className="mt-0.5 text-base font-bold text-[#42dda0]">₹{Number(payment.amount || 0).toFixed(2)}</p>
              </div>
              <span className="rounded-full bg-[#10271e] px-3 py-1 text-xs capitalize text-[#42dda0]">
                {payment.status || "Recorded"}
              </span>
            </div>

            <div className="mx-4 mb-3 space-y-2 rounded-lg bg-[#10271e] px-3 py-3 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-[#9bb9aa]">Method</span>
                <span>{payment.paymentMethod || "N/A"}</span>
              </div>

              {payment.invoice?.invoiceNumber && (
                <div className="flex justify-between gap-2">
                  <span className="text-[#9bb9aa]">Invoice</span>
                  <span>{payment.invoice.invoiceNumber}</span>
                </div>
              )}

              {payment.transactionId && (
                <div className="flex justify-between gap-2">
                  <span className="text-[#9bb9aa]">Transaction</span>
                  <span>{payment.transactionId}</span>
                </div>
              )}
            </div>

            {payment.createdAt && (
              <div className="mx-4 mb-3 rounded-lg bg-[#dff4e7] px-3 py-2 text-xs text-[#285641]">
                <span className="font-semibold">Date:</span> {new Date(payment.createdAt).toLocaleString()}
              </div>
            )}
          </article>
        ))}
      </section>
    </div>
  )
}