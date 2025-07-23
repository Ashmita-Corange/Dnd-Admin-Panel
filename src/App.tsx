import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import React from "react";
import { lazy, Suspense, useState } from "react";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { ScrollToTop } from "./components/common/ScrollToTop";

import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "./store/slices/authslice";
import AddCategory from "./pages/category/AddCategory";
import CategoryList from "./pages/category/CategoryList";
import AddModule from "./pages/module/AddModule";
import ModuleList from "./pages/module/ModuleList";
import AddTenant from "./pages/Tenant/AddTenant";
import TenantList from "./pages/Tenant/TenantList";
import EditTenant from "./pages/Tenant/EditTenant";
import AddRole from "./pages/Role/AddRole";
import RoleList from "./pages/Role/RoleList";
import EditRole from "./pages/Role/EditRole";

// Lazy load pages

const SignIn = lazy(() => import("./pages/AuthPages/SignIn"));
const NotFound = lazy(() => import("./pages/OtherPage/NotFound"));
const UserProfiles = lazy(() => import("./pages/UserProfiles"));

const Calendar = lazy(() => import("./pages/Calendar"));

const AppLayout = lazy(() => import("./layout/AppLayout"));
const Home = lazy(() => import("./pages/Dashboard/Home"));

// Simple modal wrapper for SignIn
function SignInModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        zIndex: 9999,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 32,
          minWidth: 350,
          boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <SignIn />
        </Suspense>
      </div>
    </div>
  );
}

export default function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [showSignIn, setShowSignIn] = useState(false);

  // Show popup if not authenticated and not on /signin or /signup
  // (You may want to refine this logic based on your routing needs)
  React.useEffect(() => {
    if (!isAuthenticated) {
      setShowSignIn(true);
    } else {
      setShowSignIn(false);
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
        <Routes>
          {/* Public Routes - Only accessible when NOT authenticated */}
          <Route
            path="/signin"
            element={
              !isAuthenticated ? <SignIn /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/signin"
            element={
              !isAuthenticated ? <SignIn /> : <Navigate to="/" replace />
            }
          />

          {/* Protected Routes - Only accessible when authenticated */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />

              {/* Category Management Routes */}
              <Route path="/category/add" element={<AddCategory />} />
              <Route path="/category/list" element={<CategoryList />} />

              {/* Module Management Routes */}
              <Route path="/module/add" element={<AddModule />} />
              <Route path="/module/list" element={<ModuleList />} />

              {/* Module Management Routes */}
              <Route path="/tenant/add" element={<AddTenant />} />
              <Route path="/tenant/list" element={<TenantList />} />
              <Route path="/tenant/edit/:id" element={<EditTenant />} />

              {/* Role Management Routes */}
              <Route path="/role/add" element={<AddRole />} />
              <Route path="/role/list" element={<RoleList />} />
              <Route path="/role/edit/:id" element={<EditRole />} />
            </Route>
          </Route>

          {/* Redirect unauthenticated users to signup instead of signin */}
          <Route
            path="*"
            element={
              !isAuthenticated ? (
                <Navigate to="/signup" replace />
              ) : (
                <NotFound />
              )
            }
          />
        </Routes>
        {/* SignIn Popup */}
        <SignInModal
          open={
            showSignIn &&
            window.location.pathname !== "/signin" &&
            window.location.pathname !== "/signup"
          }
          onClose={() => setShowSignIn(false)}
        />
      </Suspense>
    </Router>
  );
}
