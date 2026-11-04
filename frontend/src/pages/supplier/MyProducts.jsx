import { useEffect, useState } from "react";
import { getMySupplierProducts, addSupplierProduct, updateSupplierProduct, deleteSupplierProduct } from "../../services/supplierService";
import { toast } from "sonner";
import { confirmAction } from "../../utils/alertUtils";

const emptyForm = { name: "", description: "", price: "", quantity: "" };

function MyProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadProducts = async () => {
    try {
      setError("");
      const data = await getMySupplierProducts();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      setSaving(true);
      const payload = { ...form, price: Number(form.price), quantity: Number(form.quantity) };

      if (editingId) {
        await updateSupplierProduct(editingId, payload);
        toast.success("Product updated successfully.");
      } else {
        await addSupplierProduct(payload);
        toast.success("Product added successfully.");
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({ name: product.name, description: product.description, price: String(product.price), quantity: String(product.quantity) });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const result = await confirmAction("Delete Product?", "Are you sure you want to delete this product? This action cannot be undone.", "Yes, delete");
    if (!result.isConfirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteSupplierProduct(id);
      toast.success("Product deleted successfully.");
      await loadProducts();
      if (editingId === id) resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete product.");
    }
  };

  const inputClass = "w-full rounded-lg border border-[#29483a] bg-[#10271e] px-3 py-2.5 text-sm text-[#edf8f2] outline-none placeholder:text-[#9bb9aa] focus:border-[#42dda0] focus:ring-2 focus:ring-[#42dda0]/15";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0d211a]">My Products</h1>
        <p className="mt-1 text-sm text-[#557064]">Add and manage your products, prices, and available stock.</p>
      </div>

      {error && <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-600">{error}</div>}
      {message && <div className="rounded-xl bg-[#dff4e7] p-3 text-sm text-[#146b45]">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-[#0d211a] p-5 text-[#edf8f2] sm:p-6">
        <h2 className="text-lg font-semibold">{editingId ? "Edit Product" : "Add New Product"}</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#c5d8d0]">Product Name</label>
            <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="e.g. Cotton Fabric" required />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#c5d8d0]">Price per unit (₹)</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} className={inputClass} min="0" step="0.01" placeholder="Enter price" required />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#c5d8d0]">Available Quantity</label>
            <input type="number" name="quantity" value={form.quantity} onChange={handleChange} className={inputClass} min="0" step="1" placeholder="Enter stock" required />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#c5d8d0]">Description</label>
            <input name="description" value={form.description} onChange={handleChange} className={inputClass} placeholder="Product details" required />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className="rounded-lg bg-[#42dda0] px-5 py-2.5 text-sm font-semibold text-[#071a12] transition hover:bg-[#68e9b5] disabled:opacity-60">
            {saving ? "Saving..." : editingId ? "Update Product" : "Add Product"}
          </button>

          {editingId && <button type="button" onClick={resetForm} className="rounded-lg border border-[#29483a] px-5 py-2.5 text-sm font-medium text-[#c5d8d0] transition hover:bg-[#19372a]">Cancel</button>}
        </div>
      </form>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#0d211a]">Your Products ({products.length})</h2>

        {loading ? (
          <p className="text-sm text-[#557064]">Loading products...</p>
        ) : products.length === 0 ? (
          <div className="rounded-2xl bg-[#dff4e7] p-8 text-center">
            <p className="font-semibold text-[#285641]">No products added yet</p>
            <p className="mt-1 text-sm text-[#557064]">Add your first product using the form above.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map(product => (
              <article key={product._id} className="overflow-hidden rounded-2xl bg-[#0d211a] p-5 text-[#edf8f2]">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#c5d8d0]">{product.description}</p>

                <div className="mx-0 mt-4 rounded-lg bg-[#dff4e7] px-3 py-3 text-sm text-[#285641]">
                  <p>Price: <strong>₹{product.price}</strong></p>
                  <p className="mt-1">Stock: <strong>{product.quantity}</strong></p>
                </div>

                <div className="mt-4 flex gap-3">
                  <button type="button" onClick={() => handleEdit(product)} className="rounded-lg bg-[#19372a] px-4 py-2 text-sm font-medium text-[#42dda0] transition hover:bg-[#29483a]">Edit</button>
                  <button type="button" onClick={() => handleDelete(product._id)} className="rounded-lg border border-red-400/30 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10">Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default MyProducts;
