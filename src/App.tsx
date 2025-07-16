import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import React from "react";
import { lazy, Suspense, useState }from "react";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AddFilter from "./components/filters/AddFilter";
import FilterList from "./components/filters/FilterList";

import { Edit } from "lucide-react";
import AddBundle from "./pages/bundles/AddBundle";
import BundleList from "./pages/bundles/bundleList";
import EditBundleForm from "./pages/bundles/EditBundle";
import QuizList from "./pages/Quiz/QuizList";
import AssignmentList from "./pages/Assignmets/AssignmentList";
import FileList from "./pages/Files/FileList";
import Session from "./pages/Files/Session";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "./store/slices/authslice";

import AssignmentSubmissionReview from "./pages/Assignmets/AssignmentDetails";
import HelpDesk from "./pages/HelpDesk/RequestList";
import TicketDetails from "./pages/HelpDesk/TicketDetails";
import CertificationList from "./pages/Certification/CertificationList";
import EditCreateCertificateTemplate from "./pages/Certification/EditeCertification";
import IssueCertification from "./pages/Certification/IssueCertification";
import UserList from "./pages/user/user-list";

// Lazy load pages
const SignIn = lazy(() => import("./pages/AuthPages/SignIn"));
const NotFound = lazy(() => import("./pages/OtherPage/NotFound"));

const UserProfiles = lazy(() => import("./pages/UserProfiles"));
const Videos = lazy(() => import("./pages/UiElements/Videos"));
const Images = lazy(() => import("./pages/UiElements/Images"));
const Alerts = lazy(() => import("./pages/UiElements/Alerts"));
const Badges = lazy(() => import("./pages/UiElements/Badges"));
const Avatars = lazy(() => import("./pages/UiElements/Avatars"));
const Buttons = lazy(() => import("./pages/UiElements/Buttons"));
const LineChart = lazy(() => import("./pages/Charts/LineChart"));
const BarChart = lazy(() => import("./pages/Charts/BarChart"));
const Calendar = lazy(() => import("./pages/Calendar"));
const BasicTables = lazy(() => import("./pages/Tables/BasicTables"));
const FormElements = lazy(() => import("./pages/Forms/FormElements"));
const AddCategory = lazy(() => import("./pages/AddCategory"));
const CategoryList = lazy(() => import("./pages/CategoryList"));
const AppLayout = lazy(() => import("./layout/AppLayout"));
const Home = lazy(() => import("./pages/Dashboard/Home"));
const CreateCertificateTemplate = lazy(
  () => import("./pages/Certification/CreateCertificateTemplate")
);

// Simple modal wrapper for SignIn
function SignInModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
        onClick={e => e.stopPropagation()}
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
              <Route path="/add-category" element={<AddCategory />} />
              <Route path="/categories" element={<CategoryList />} />

              {/* Filters */}
              <Route path="/filters/add" element={<AddFilter />} />
              <Route path="/filters/all" element={<FilterList />} />

              
             

              {/* Bundles */}
              <Route path="/bundles/create" element={<AddBundle />} />
              <Route path="/bundles/all" element={<BundleList />} />
              <Route path="/bundles/:bundleId" element={<EditBundleForm />} />

              {/* Quiz */}
              <Route path="/quiz/all" element={<QuizList />} />

              {/* Assignments */}
              <Route path="/assignments/all" element={<AssignmentList />} />
            
              <Route
                path="/assignments/submissions"
                element={<AssignmentList />}
              />
              <Route
                path="/assignments/submissions/:id"
                element={<AssignmentSubmissionReview />}
              />

              {/* Support Tickets */}
              <Route
                path="/support-tickets/view/:ticketId"
                element={<TicketDetails isEditMode={false} />}
              />
              <Route
                path="/support-tickets/edit/:ticketId"
                element={<TicketDetails isEditMode={true} />}
              />
              <Route path="/requests" element={<HelpDesk />} />

              {/* Certificates */}
              <Route
                path="/certificates-template/add"
                element={<CreateCertificateTemplate />}
              />
              <Route
                path="/certificates-template/all"
                element={<CertificationList />}
              />
              <Route
                path="/certificates-template/edit/:certificateId"
                element={<EditCreateCertificateTemplate />}
              />
              <Route
                path="/certificates/issue"
                element={<IssueCertification />}
              />

              {/* Files */}
              <Route path="/files/all" element={<FileList />} />
              <Route path="/files/sessions" element={<Session />} />

              {/* Students */}
              {/* Users */}
              <Route path="/users/all" element={<UserList />} />

              {/* Forms */}
              <Route path="/form-elements" element={<FormElements />} />

              {/* Tables */}
              <Route path="/basic-tables" element={<BasicTables />} />

              {/* UI Elements */}
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />

              {/* Charts */}
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
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
        <SignInModal open={showSignIn && window.location.pathname !== "/signin" && window.location.pathname !== "/signup"} onClose={() => setShowSignIn(false)} />
      </Suspense>
    </Router>
  );
}
