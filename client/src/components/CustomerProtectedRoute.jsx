import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext";

const CustomerProtectedRoute = () => {
  const location = useLocation();
  const { customer, loading } = useCustomerAuth();

  if (loading) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-slate-700 shadow-sm">
          Loading your account...
        </div>
      </div>
    );
  }

  if (!customer) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default CustomerProtectedRoute;
