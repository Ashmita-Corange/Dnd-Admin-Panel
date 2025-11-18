import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet, useLocation } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import PopupAlert from "../components/popUpAlert";
import { useDispatch, useSelector } from "react-redux";
import { hideAlert } from "../store/slices/alertSlice";

import type { RootState } from "../store";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const location = useLocation();

  // Check if current path contains 'custom-temple/'
  const isCustomTemplePage =
    location.pathname.includes("custom-temple/add") ||
    location.pathname.includes("custom-temple/edit");

  return (
    <div className="min-h-screen xl:flex">
      {!isCustomTemplePage && (
        <div>
          <AppSidebar />
          <Backdrop />
        </div>
      )}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isCustomTemplePage
            ? "ml-0"
            : isExpanded || isHovered
            ? "lg:ml-[290px]"
            : "lg:ml-[90px]"
        } ${isMobileOpen && !isCustomTemplePage ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div
          className={` mx-auto    ${
            isCustomTemplePage
              ? "max-w-full p-2 pt-0"
              : "p-4 md:p-6 max-w-[--breakpoint-2xl]"
          }`}
        >
          <Outlet />
        </div>
        {/* Global popup alert (connected to redux) */}
        <AlertRenderer />
      </div>
    </div>
  );
};

const AlertRenderer: React.FC = () => {
  const dispatch = useDispatch();
  const alert = useSelector((state: RootState) => state.alert);

  if (!alert) return null;

  return (
    <PopupAlert
      isVisible={alert.isVisible}
      message={alert.message}
      type={alert.type}
      onClose={() => dispatch(hideAlert())}
    />
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
