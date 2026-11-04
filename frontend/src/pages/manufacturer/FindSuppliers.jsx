import { useEffect, useState } from "react";
import { Search, Building2, MapPin, Phone, RefreshCw, Users, Send, CheckCircle2 } from "lucide-react";
import { searchSuppliers, sendConnectionRequest, getMySuppliers, getMyConnectionRequests } from "../../services/supplierService";

function FindSuppliers() {
  const [search, setSearch] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [connectedIds, setConnectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestStatus, setRequestStatus] = useState({});
  const [requestErrors, setRequestErrors] = useState({});

  useEffect(() => {
    const loadConnections = async () => {
      try {
        const [connectionsData, requestsData] = await Promise.all([
          getMySuppliers(),
          getMyConnectionRequests(),
        ]);

        setConnectedIds(
          (connectionsData.suppliers || []).map((item) =>
            String(item.supplier?._id || item.supplier),
          ),
        );

        const statuses = {};

        (requestsData.requests || []).forEach((item) => {
          const id = String(item.supplier?._id || item.supplier);
          statuses[id] = item.status;
        });

        setRequestStatus((prev) => ({ ...prev, ...statuses }));
      } catch (err) {
        console.error(
          "Unable to load connection requests:",
          err.response?.data || err.message,
        );
      }
    };

    loadConnections();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await searchSuppliers(search.trim());
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load suppliers. Please try again.",
      );
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (supplier) => {
    const supplierId = String(supplier.user?._id || supplier.user || "");

    if (!supplierId) {
      setRequestErrors((prev) => ({
        ...prev,
        [supplier._id]: "Supplier user ID is missing.",
      }));
      return;
    }

    const previousStatus = requestStatus[supplierId] || "idle";

    setRequestStatus((prev) => ({
      ...prev,
      [supplierId]: "sending",
    }));

    setRequestErrors((prev) => ({
      ...prev,
      [supplier._id]: "",
    }));

    try {
      await sendConnectionRequest(supplierId);

      setRequestStatus((prev) => ({
        ...prev,
        [supplierId]: "pending",
      }));
    } catch (err) {
      setRequestStatus((prev) => ({
        ...prev,
        [supplierId]: previousStatus,
      }));

      setRequestErrors((prev) => ({
        ...prev,
        [supplier._id]:
          err.response?.data?.message || "Request failed. Please try again.",
      }));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[#0d211a]">Find Suppliers</h2>
        <p className="mt-1 text-sm text-[#557064]">
          Discover suppliers and build your supply chain network.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-xl bg-[#0d211a] px-4">
          <Search size={20} className="shrink-0 text-[#42dda0]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company name..."
            className="w-full bg-transparent py-3 text-sm text-[#edf8f2] outline-none placeholder:text-[#9bb9aa]"
          />
        </div>

        <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 rounded-xl bg-[#42dda0] px-6 py-3 font-semibold text-[#071a12] transition hover:bg-[#68e9b5] disabled:opacity-60">
          {loading ? <RefreshCw size={18} className="animate-spin" /> : <Search size={18} />}
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <div className="rounded-xl bg-red-100 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && suppliers.length === 0 && (
        <div className="rounded-2xl bg-[#dff4e7] px-6 py-12 text-center">
          <Users size={36} className="mx-auto text-[#16865b]" />
          <h3 className="mt-4 font-semibold text-[#0d211a]">Find your next supplier</h3>
          <p className="mt-2 text-sm text-[#557064]">
            Search by company name to find matching suppliers.
          </p>
        </div>
      )}

      {suppliers.length > 0 && (
        <>
          <p className="text-sm font-medium text-[#557064]">
            {suppliers.length} supplier{suppliers.length !== 1 ? "s" : ""} found
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {suppliers.map((supplier) => {
              const id = String(supplier.user?._id || supplier.user || "");

              const status = connectedIds.includes(id)
                ? "accepted"
                : requestStatus[id] || "idle";

              return (
                <div key={supplier._id} className="flex flex-col rounded-2xl bg-[#0d211a] p-4 text-[#edf8f2] sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#19372a] text-[#42dda0]">
                      <Building2 size={23} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-semibold">{supplier.companyName}</h3>
                      <p className="mt-1 flex items-start gap-2 text-sm text-[#c5d8d0]">
                        <MapPin size={16} className="mt-0.5 shrink-0 text-[#42dda0]" />
                        <span>{supplier.address}</span>
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#c5d8d0]">
                    {supplier.description || "No company description provided."}
                  </p>

                  {supplier.phone && (
                    <p className="mt-3 flex items-center gap-2 text-sm text-[#c5d8d0]">
                      <Phone size={15} className="text-[#42dda0]" />
                      {supplier.phone}
                    </p>
                  )}

                  {requestErrors[supplier._id] && (
                    <p className="mt-3 text-sm text-red-400">
                      {requestErrors[supplier._id]}
                    </p>
                  )}

                  {status === "rejected" && (
                    <p className="mt-3 text-sm font-medium text-red-400">
                      Request Rejected
                    </p>
                  )}

                  <button type="button" onClick={() => handleRequest(supplier)} disabled={status === "accepted" || status === "pending" || status === "sending"} className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${status === "accepted" || status === "pending" ? "bg-[#dff4e7] text-[#146b45]" : "bg-[#42dda0] text-[#071a12] hover:bg-[#68e9b5]"}`}>
                    {status === "sending" ? (
                      <>
                        <RefreshCw size={17} className="animate-spin" />
                        Sending...
                      </>
                    ) : status === "accepted" ? (
                      <>
                        <CheckCircle2 size={17} />
                        Connected
                      </>
                    ) : status === "pending" ? (
                      <>
                        <CheckCircle2 size={17} />
                        Request Sent
                      </>
                    ) : status === "rejected" ? (
                      <>
                        <Send size={17} />
                        Send Again
                      </>
                    ) : (
                      <>
                        <Send size={17} />
                        Send Request
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default FindSuppliers;
