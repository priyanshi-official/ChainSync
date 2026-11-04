
import { NavLink, useNavigate } from "react-router-dom";
import { Link2, LayoutDashboard, Users, ClipboardList, Package, Truck, Bell, Settings, LogOut, Search, Boxes, ShoppingBag, UserRound, UserCheck, GitBranch, FileText, PlusCircle , PackagePlus} from "lucide-react";


const menus = {
  manufacturer: [
    { label: "Overview", path: "/manufacturer", icon: LayoutDashboard },
    { label: "Find Suppliers", path: "/manufacturer/suppliers", icon: Search },
    { label: "My Suppliers", path: "/manufacturer/my-suppliers", icon: Users },
    { label: "Supplier Products", path: "/manufacturer/supplier-products", icon: Package },
    { label: "Add Product", path: "/manufacturer/add-product", icon: PlusCircle },
    { label: "Inventory", path: "/manufacturer/inventory", icon: Boxes },
    { label: "Purchase Orders", path: "/manufacturer/purchase-orders", icon: ClipboardList },
    { label: "Distributor Requests", path: "/manufacturer/distributor-requests", icon: UserCheck },
    { label: "My Distributors", path: "/manufacturer/my-distributors", icon: GitBranch },
    { label: "Distributor Orders", path: "/manufacturer/orders", icon: ShoppingBag },
    { label: "Shipments", path: "/manufacturer/shipments", icon: Truck },
    { label: "Invoices", path: "/manufacturer/invoices", icon: FileText },
  ],

  supplier: [
    { label: "Overview", path: "/supplier", icon: LayoutDashboard },
    { label: "My Products", path: "/supplier/products", icon: PackagePlus },
    { label: "Connection Requests", path: "/supplier/requests", icon: Users },
    { label: "Manufacturers", path: "/supplier/manufacturers", icon: UserRound },
    { label: "Purchase Orders", path: "/supplier/purchase-orders", icon: ClipboardList },
    { label: "Shipments", path: "/supplier/shipments", icon: Truck },
    { label: "Invoices", path: "/supplier/invoices", icon: FileText },
  ],

  distributor: [
    { label: "Overview", path: "/distributor", icon: LayoutDashboard },
    { label: "Find Manufacturers", path: "/distributor/manufacturers", icon: Search },
    { label: "My Connections", path: "/distributor/connections", icon: Users },
    { label: "Browse Products", path: "/distributor/products", icon: Package },
    { label: "My Orders", path: "/distributor/orders", icon: ShoppingBag },
    { label: "Track Shipments", path: "/distributor/shipments", icon: Truck },
    { label: "Invoices", path: "/distributor/invoices", icon: FileText },
  ],
};

function Sidebar({ role, onNavigate }) {
  const navigate = useNavigate();
  const links = menus[role] || [];

  const handleLogout = () => {
    localStorage.removeItem("chainsync-token");
    localStorage.removeItem("chainsync-user");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-[#19372a] bg-[#0d211a] text-[#edf8f2]">
      <NavLink to="/" className="flex items-center gap-3 border-b border-[#19372a] px-5 py-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#19372a] text-[#42dda0]">
          <Link2 size={24} />
        </span>
        <span>
          <span className="block text-medium font-bold">ChainSync</span>
          <span className="text-xs text-[#a4f5d0]">Business Platform</span>
        </span>
      </NavLink>

      <div className="px-5 pb-3 pt-6 text-xs font-bold uppercase tracking-widest text-[#a4f5d0]">
        {role} workspace
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {links.map(({ label, path, icon: Icon }) => (
          <NavLink key={path} to={path} end={path === `/${role}`} onClick={onNavigate}
            className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? "bg-[#19372a] text-[#42dda0]" : "text-[#c5d8d0] hover:bg-[#14382b] hover:text-white"}`}>
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-[#19372a] p-3">
        <NavLink to={`/${role}/notifications`} onClick={onNavigate} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#c5d8d0] hover:bg-[#14382b]">
          <Bell size={19} /> Notifications
        </NavLink>
        
        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#c5d8d0] transition hover:bg-red-950/40 hover:text-red-300">
          <LogOut size={19} /> Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
