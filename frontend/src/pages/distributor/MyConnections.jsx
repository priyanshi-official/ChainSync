import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users, RefreshCw, XCircle, Unplug, ArrowUpRight, Package,
} from "lucide-react";
import {
  getDistributorConnectionRequests,
  cancelManufacturerConnectionRequest,
  disconnectManufacturerDistributor,
} from "../../services/manufacturerDistributorService";

import { toast } from "sonner";
import { confirmAction } from "../../utils/alertUtils";

const statusClass = {
  pending: "bg-amber-950 text-amber-300",
  accepted: "bg-[#19372a] text-[#42dda0]",
  rejected: "bg-red-950 text-red-300",
  cancelled: "bg-gray-800 text-gray-300",
  disconnected: "bg-gray-800 text-gray-300",
};

function MyConnections() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState({});
  const navigate = useNavigate();

  const handleProceedToOrder = (request) => {
    navigate(`/distributor/products?connectionId=${request._id}`);
  };

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getDistributorConnectionRequests();
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load connection history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleAction = async (request, action) => {
    const label = request.manufacturer?.name || "this manufacturer";

    const confirmation =
      action === "cancel"
        ? `Cancel your pending request to ${label}?`
        : `Disconnect from ${label}?`;

    const result = await confirmAction(
      action === "cancel" ? "Cancel Request?" : "Disconnect Manufacturer?",
      confirmation,
      action === "cancel" ? "Yes, cancel" : "Yes, disconnect"
    );

    if (!result.isConfirmed) return;

    setUpdating((prev) => ({ ...prev, [request._id]: action }));
    setError("");

    try {
      if (action === "cancel") {
        await cancelManufacturerConnectionRequest(request._id);
        toast.success("Connection request cancelled.");
      } else {
        await disconnectManufacturerDistributor(request._id);
        toast.success("Manufacturer disconnected successfully.");
      }

      await loadRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to update connection.");
    } finally {
      setUpdating((prev) => ({ ...prev, [request._id]: "" }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#183b2c] dark:text-[#edf8f2]">
            My Manufacturer Connections
          </h2>
          <p className="mt-1 text-sm text-[#526d60] dark:text-[#c5d8d0]">
            Track all connection requests and active manufacturer relationships.
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-[#526d60] dark:text-[#c5d8d0]">
          <RefreshCw size={18} className="animate-spin" />
          Loading connection history...
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-[#19372a] bg-[#0d211a] px-6 py-12 text-center">
          <Users size={36} className="mx-auto text-[#42dda0]" />
          <h3 className="mt-4 font-semibold text-[#edf8f2]">
            No connection requests yet
          </h3>
          <p className="mt-2 text-sm text-[#c5d8d0]">
            Browse manufacturers and request a connection to get started.
          </p>
          <Link
            to="/distributor/manufacturers"
            className="mt-4 inline-flex items-center gap-2 font-semibold text-[#42dda0] hover:text-[#68e9b5]"
          >
            Find Manufacturers <ArrowUpRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {requests.map((request) => {
            const manufacturer = request.manufacturer || {};

            return (
              <article
                key={request._id}
                className="rounded-2xl border border-[#19372a] bg-[#0d211a] p-5 text-[#edf8f2] shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#edf8f2]">
                      {manufacturer.name || "Manufacturer"}
                    </h3>
                    <p className="mt-1 text-sm text-[#c5d8d0]">
                      {manufacturer.email || "No email provided"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      statusClass[request.status] || statusClass.pending
                    }`}
                  >
                    {request.status}
                  </span>
                </div>

                {request.productIds?.length > 0 && (
                  <div className="mt-4 rounded-xl border border-[#29483a] bg-[#10271e] p-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-[#edf8f2]">
                      <Package size={16} className="text-[#42dda0]" />
                      Products requested
                    </p>
                    <ul className="mt-2 space-y-2 text-sm text-[#c5d8d0]">
                      {request.productIds.map((product) => (
                        <li
                          key={product._id}
                          className="flex justify-between gap-3"
                        >
                          <span>{product.name}</span>
                          <span className="text-[#edf8f2]">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {request.message && (
                  <p className="mt-3 rounded-xl border border-[#29483a] bg-[#10271e] p-3 text-sm text-[#c5d8d0]">
                    {request.message}
                  </p>
                )}

                {request.status === "pending" && (
                  <button
                    disabled={!!updating[request._id]}
                    onClick={() => handleAction(request, "cancel")}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/40 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
                  >
                    {updating[request._id] ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <XCircle size={16} />
                    )}
                    Cancel Request
                  </button>
                )}

                {request.status === "accepted" && (
                  <div className="mt-5 space-y-3">
                    <button
                      onClick={() => handleProceedToOrder(request)}
                      className="w-full rounded-xl bg-[#42dda0] px-4 py-2.5 font-semibold text-[#071a12] transition hover:bg-[#68e9b5]"
                    >
                      Proceed to Order
                    </button>

                    <button
                      disabled={!!updating[request._id]}
                      onClick={() => handleAction(request, "disconnect")}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/40 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
                    >
                      {updating[request._id] ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Unplug size={16} />
                      )}
                      Disconnect
                    </button>
                  </div>
                )}

                {["rejected", "cancelled", "disconnected"].includes(
                  request.status
                ) && (
                  <Link
                    to="/distributor/manufacturers"
                    className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#42dda0] px-4 py-2.5 text-sm font-semibold text-[#071a12] transition hover:bg-[#68e9b5]"
                  >
                    <ArrowUpRight size={16} />
                    Browse Manufacturers to Request Again
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyConnections;
