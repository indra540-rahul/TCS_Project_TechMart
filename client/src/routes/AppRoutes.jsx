import { Route, Routes } from "react-router-dom";
import CustomerProtectedRoute from "../components/CustomerProtectedRoute";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleBasedRoute from "../components/RoleBasedRoute";
import AddProduct from "../pages/AddProduct";
import Categories from "../pages/Categories";
import Cart from "../pages/Cart";
import Customers from "../pages/Customers";
import Dashboard from "../pages/Dashboard";
import EditProduct from "../pages/EditProduct";
import HelpCenter from "../pages/HelpCenter";
import Inventory from "../pages/Inventory";
import Login from "../pages/Login";
import Notifications from "../pages/Notifications";
import Orders from "../pages/Orders";
import Products from "../pages/Products";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import Shop from "../pages/Shop";
import StoreCategories from "../pages/StoreCategories";
import TrackOrder from "../pages/TrackOrder";
import UserManagement from "../pages/UserManagement";
import AuditLogs from "../pages/AuditLogs";
import Contact from "../pages/Contact";
import CustomerAccount from "../pages/CustomerAccount";
import Checkout from "../pages/Checkout";
import OrderHistory from "../pages/OrderHistory";
import Layout from "../pages/Layout";

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<Shop />} />
    <Route path="/browse/categories" element={<StoreCategories />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/track-order" element={<TrackOrder />} />
    <Route path="/order-history" element={<OrderHistory />} />
    <Route path="/help-center" element={<HelpCenter />} />

    <Route element={<CustomerProtectedRoute />}>
      <Route path="/account" element={<CustomerAccount />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/new" element={<AddProduct />} />
        <Route path="/products/:id/edit" element={<EditProduct />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />

        <Route element={<RoleBasedRoute allowedRoles={["admin"]} />}>
          <Route path="/categories" element={<Categories />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
    </Route>
  </Routes>
);

export default AppRoutes;
