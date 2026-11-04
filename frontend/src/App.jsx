import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./context/ThemeContext"

import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Signup from "./pages/Signup"

import ProtectedRoute from "./components/ProtectedRoute"
import DashboardLayout from "./components/DashboardLayout"

import ManufacturerDashboard from "./pages/manufacturer/Dashboard"
import SupplierDashboard from "./pages/supplier/Dashboard"
import DistributorDashboard from "./pages/distributor/Dashboard"
import FindSuppliers from "./pages/manufacturer/FindSuppliers"

// Manufacturer–Distributor pages
import DistributorRequests from "./pages/manufacturer/DistributorRequests"
import MyDistributors from "./pages/manufacturer/MyDistributors"
import FindManufacturers from "./pages/distributor/FindManufacturers"
import MyConnections from "./pages/distributor/MyConnections"
import BrowseProducts from "./pages/distributor/BrowseProducts"


// Distributor workflow pages
import DistributorOrders from "./pages/distributor/DistributorOrders";
import DistributorShipments from "./pages/distributor/DistributorShipments";

// Manufacturer workflow pages
import ManufacturerDistributorOrders from "./pages/manufacturer/DistributorOrders";
import ManufacturerShipments from "./pages/manufacturer/ManufacturerShipments";
import InvoicePayments from "./pages/shared/InvoicePayments";
import AddProduct from "./pages/manufacturer/AddProduct";
import Inventory from "./pages/manufacturer/Inventory";
import SupplierProducts from "./pages/manufacturer/SupplierProducts"
import SupplierPurchaseOrders from "./pages/manufacturer/SupplierPurchaseOrders"
import MySuppliers from "./pages/manufacturer/MySuppliers"

//supplier 
import MyProducts from "./pages/supplier/MyProducts"
import ConnectionRequests from './pages/supplier/ConnectionRequests'
import Manufacturers from './pages/supplier/Manufacturers'
import PurchaseOrders from './pages/supplier/PurchaseOrders'
import SupplierShipments from "./pages/supplier/Shipments"

import Notifications from './pages/shared/Notifications'



function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Manufacturer workspace */}
          <Route element={<ProtectedRoute allowedRole="manufacturer" />}>
            <Route path="/manufacturer" element={<DashboardLayout role="manufacturer" />}>
              <Route index element={<ManufacturerDashboard />} />
              <Route path="suppliers" element={<FindSuppliers />} />
              <Route path="my-suppliers" element={<MySuppliers />} />
              <Route path="supplier-products" element={<SupplierProducts />} />
              <Route path="add-product" element={<AddProduct />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="distributor-requests" element={<DistributorRequests />} />
              <Route path="my-distributors" element={<MyDistributors />} />
              <Route path="orders" element={<ManufacturerDistributorOrders />} />
              <Route path="shipments" element={<ManufacturerShipments />} />
              <Route path="invoices" element={<InvoicePayments allowPayment />} />
              <Route path="purchase-orders" element={<SupplierPurchaseOrders />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>
          </Route>

          {/* Supplier workspace — preserved */}
          <Route element={<ProtectedRoute allowedRole="supplier" />}>
            <Route path="/supplier" element={<DashboardLayout role="supplier" />}>
              <Route index element={<SupplierDashboard />} />
              <Route path="products" element={<MyProducts />} />
              <Route path="requests" element={<ConnectionRequests />} />
              <Route path="manufacturers" element={<Manufacturers />} />
              <Route path="purchase-orders" element={<PurchaseOrders />} />
              <Route path="shipments" element={<SupplierShipments />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="invoices" element={<InvoicePayments />} />
            </Route>
          </Route>

          {/* Distributor workspace */}
          <Route element={<ProtectedRoute allowedRole="distributor" />}>
            <Route path="/distributor" element={<DashboardLayout role="distributor" />}>
              <Route index element={<DistributorDashboard />} />
              <Route path="products" element={<BrowseProducts />} />
              <Route path="manufacturers" element={<FindManufacturers />} />
              <Route path="connections" element={<MyConnections />} />
              <Route path="orders" element={<DistributorOrders />} />
              <Route path="shipments" element={<DistributorShipments />} />
              <Route path="invoices" element={<InvoicePayments allowPayment />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>
          </Route>

          {/* Unknown paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
