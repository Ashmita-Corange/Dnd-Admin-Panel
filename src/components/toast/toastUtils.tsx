import { toast } from "react-hot-toast";
import React from "react";

/**
 * Success toast matching your module design
 */
export const showSuccessToast = (message: string | React.ReactNode) => {
  toast.success(message, {
    duration: 3500,
    position: "top-right",
    style: {
      background: "linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      color: "#ffffff",
      padding: "16px 20px",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.3), 0 10px 10px -5px rgba(16, 185, 129, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      maxWidth: "420px",
      minHeight: "60px",
      transform: "translateZ(0)",
      animation: "slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    },
    iconTheme: {
      primary: "#ffffff",
      secondary: "rgba(16, 185, 129, 0.2)",
    },
  });
};

/**
 * Error toast with module design aesthetics
 */
export const showErrorToast = (message: string | React.ReactNode) => {
  toast.error(message, {
    duration: 5000,
    position: "top-right",
    style: {
      background: "linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      color: "#ffffff",
      padding: "16px 20px",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 20px 25px -5px rgba(239, 68, 68, 0.3), 0 10px 10px -5px rgba(239, 68, 68, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      maxWidth: "420px",
      minHeight: "60px",
      transform: "translateZ(0)",
      animation: "slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    },
    iconTheme: {
      primary: "#ffffff",
      secondary: "rgba(239, 68, 68, 0.2)",
    },
  });
};

/**
 * Warning toast with blue-purple gradient theme
 */
export const showWarningToast = (message: string | React.ReactNode) => {
  toast(message, {
    duration: 4500,
    position: "top-right",
    icon: "⚠️",
    style: {
      background: "linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(217, 119, 6, 0.95) 100%)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      color: "#ffffff",
      padding: "16px 20px",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 20px 25px -5px rgba(245, 158, 11, 0.3), 0 10px 10px -5px rgba(245, 158, 11, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      maxWidth: "420px",
      minHeight: "60px",
      transform: "translateZ(0)",
      animation: "slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    },
  });
};

/**
 * Info toast with blue-purple gradient matching module cards
 */
export const showInfoToast = (message: string | React.ReactNode) => {
  toast(message, {
    duration: 4000,
    position: "top-right",
    icon: "ℹ️",
    style: {
      background: "linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(147, 51, 234, 0.95) 100%)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      color: "#ffffff",
      padding: "16px 20px",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(147, 51, 234, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      maxWidth: "420px",
      minHeight: "60px",
      transform: "translateZ(0)",
      animation: "slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    },
  });
};

/**
 * Loading toast with animated gradient
 */
export const showLoadingToast = (message: string): string => {
  return toast.loading(message, {
    style: {
      background: "linear-gradient(45deg, rgba(99, 102, 241, 0.95), rgba(139, 92, 246, 0.95), rgba(236, 72, 153, 0.95))",
      backgroundSize: "200% 200%",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      color: "#ffffff",
      padding: "16px 20px",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 20px 25px -5px rgba(99, 102, 241, 0.3), 0 10px 10px -5px rgba(139, 92, 246, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      maxWidth: "420px",
      minHeight: "60px",
      transform: "translateZ(0)",
      animation: "slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), gradientShift 3s ease infinite",
    },
  });
};

/**
 * Module action success toast (for specific module operations)
 */
export const showModuleSuccessToast = (action: string, moduleName?: string) => {
  const message = moduleName 
    ? `${action} "${moduleName}" successfully!`
    : `Module ${action} successfully!`;
    
  toast.success(message, {
    duration: 3500,
    position: "top-right",
    style: {
      background: "linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      color: "#ffffff",
      padding: "16px 24px",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.3), 0 10px 10px -5px rgba(16, 185, 129, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      maxWidth: "420px",
      minHeight: "60px",
      transform: "translateZ(0)",
      animation: "slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    },
    iconTheme: {
      primary: "#ffffff",
      secondary: "rgba(16, 185, 129, 0.2)",
    },
    icon: "🛡️", // Shield icon matching module theme
  });
};

/**
 * Module action error toast
 */
export const showModuleErrorToast = (action: string, moduleName?: string) => {
  const message = moduleName 
    ? `Failed to ${action.toLowerCase()} "${moduleName}". Please try again.`
    : `Failed to ${action.toLowerCase()} module. Please try again.`;
    
  toast.error(message, {
    duration: 5000,
    position: "top-right",
    style: {
      background: "linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      color: "#ffffff",
      padding: "16px 24px",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 20px 25px -5px rgba(239, 68, 68, 0.3), 0 10px 10px -5px rgba(239, 68, 68, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      maxWidth: "420px",
      minHeight: "60px",
      transform: "translateZ(0)",
      animation: "slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    },
    iconTheme: {
      primary: "#ffffff",
      secondary: "rgba(239, 68, 68, 0.2)",
    },
  });
};

/**
 * Permission toast (specific to module permissions)
 */
export const showPermissionToast = (type: "added" | "removed" | "updated", count?: number) => {
  const messages = {
    added: `${count ? `${count} permissions` : 'Permission'} added successfully!`,
    removed: `${count ? `${count} permissions` : 'Permission'} removed successfully!`,
    updated: `Permissions updated successfully!`
  };

  toast.success(messages[type], {
    duration: 3000,
    position: "top-right",
    icon: "🔐",
    style: {
      background: "linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(147, 51, 234, 0.95) 100%)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      color: "#ffffff",
      padding: "16px 20px",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(147, 51, 234, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      maxWidth: "420px",
      minHeight: "60px",
      transform: "translateZ(0)",
      animation: "slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    },
  });
};

/**
 * Dismiss functions
 */
export const dismissToast = (toastId?: string) => {
  toast.dismiss(toastId);
};

export const dismissAllToasts = () => {
  toast.dismiss();
};

/**
 * Add these styles to your CSS file for animations
 */
export const moduleToastStyles = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* Custom toast container styling */
  .toast-container {
    z-index: 9999;
  }

  /* Toast entrance animation */
  [data-sonner-toast] {
    transform: translateX(100%);
    animation: slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }

  /* Toast exit animation */
  [data-sonner-toast][data-removed="true"] {
    animation: slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  /* Dark mode compatibility */
  .dark [data-sonner-toast] {
    background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.95) 100%) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    color: #ffffff !important;
  }
`;

/**
 * Usage examples for your ModuleList component:
 * 
 * // Basic toasts
 * showSuccessToast("Module updated successfully!");
 * showErrorToast("Failed to save changes. Please try again.");
 * showWarningToast("Your session will expire in 5 minutes.");
 * showInfoToast("New features are now available!");
 * 
 * // Module-specific toasts
 * showModuleSuccessToast("Updated", "User Management");
 * showModuleErrorToast("Delete", "Authentication");
 * 
 * // Permission toasts
 * showPermissionToast("added", 3);
 * showPermissionToast("removed");
 * showPermissionToast("updated");
 * 
 * // Loading toast
 * const loadingId = showLoadingToast("Updating module...");
 * // Later: dismissToast(loadingId);
 */