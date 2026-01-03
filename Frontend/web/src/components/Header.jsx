import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import logo from "../assets/logo.png";

export const Header = ({ isDrawerOpen, toggleDrawer }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeManagement, setActiveManagement] = useState("");

  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  const handleSignout = () => navigate("/");

  const handleClickOutside = (e) => {
    if (!e.target.closest(".profile-menu")) {
      setIsProfileOpen(false);
    }
  };

  // Determine active management based on current route
  useEffect(() => {
    const path = location.pathname;

    if (path.includes("/vaccination")) {
      setActiveManagement("vaccination");
    } else if (
      path.includes("/stray") ||
      path.includes("/captured-animals") ||
      path.includes("/redemption-requests") ||
      path.includes("/adoption-list") ||
      path.includes("/statistics-logs") ||
      path.includes("/add-stray")
    ) {
      setActiveManagement("stray");
    } else if (
      path.includes("/report") ||
      path.includes("/incident") ||
      path.includes("/verification") ||
      path.includes("/catcher-schedule") ||
      path.includes("/monitoring")
    ) {
      setActiveManagement("reports");
    } else if (path.includes("/campaign")) {
      setActiveManagement("campaigns");
    } else {
      setActiveManagement("");
    }
  }, [location.pathname]);

  useState(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Helper function to determine button styles
  const getButtonStyles = (managementType) => {
    const baseStyles =
      "px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap";

    if (activeManagement === managementType) {
      return `${baseStyles} bg-[#FA8630] text-white hover:bg-[#FA8630]/90`;
    } else {
      return `${baseStyles} text-gray-700 hover:text-[#FA8630] hover:bg-[#FA8630]/10`;
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-30 border-b border-[#E8E8E8]">
      <div className="flex justify-between items-center h-16 px-4 sm:px-6">
        {/* Left side - Logo, Drawer button, navigation buttons and title */}
        <div className="flex items-center">
          <button
            onClick={toggleDrawer}
            className="p-2 rounded-md hover:bg-[#FA8630]/10 focus:outline-none transition-colors duration-200 mr-3"
            aria-label={isDrawerOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isDrawerOpen ? (
              <XMarkIcon className="h-5 w-5" />
            ) : (
              <Bars3Icon className="h-5 w-5" />
            )}
          </button>

          {/* Logo and Title */}
          <div className="flex items-center">
            <img
              src={logo}
              alt="Veterinary Office Logo"
              className="h-9 w-8 mr-3"
            />
            <span className="text-xl font-semibold text-[#FA8630] whitespace-nowrap">
              Naga City Veterinary Office
            </span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-2 mr-1 ml-75">
          <button
            onClick={() => navigate("/vaccination-dashboard")}
            className={getButtonStyles("vaccination")}
          >
            Vaccination Management
          </button>
          <button
            onClick={() => navigate("/stray-dashboard")}
            className={getButtonStyles("stray")}
          >
            Stray Management
          </button>
          <button
            onClick={() => navigate("/report-dashboard")}
            className={getButtonStyles("reports")}
          >
            Report Management
          </button>
          <button
            onClick={() => navigate("/campaign-dashboard")}
            className={getButtonStyles("campaigns")}
          >
            Campaign Management
          </button>
        </div>

        {/* Right side - User profile */}
        <div className="flex items-center relative profile-menu">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleProfile();
            }}
            className="flex items-center space-x-2 focus:outline-none hover:bg-[#FA8630]/10 px-3 py-1.5 rounded-md transition-colors duration-200 group"
            aria-label="User menu"
            aria-expanded={isProfileOpen}
          >
            <UserCircleIcon className="h-8 w-8 text-[#FA8630]" />
          </button>

          {isProfileOpen && (
            <div
              className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-[#E8E8E8] z-50 divide-y divide-[#E8E8E8] overflow-hidden max-h-[calc(100vh-4rem)] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxHeight: "calc(100vh - 4rem)",
                top: "100%",
                right: "0",
              }}
            >
              <div className="py-1" role="menu">
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full text-left flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-[#FA8630]/10 hover:text-[#FA8630] transition-colors duration-150"
                  role="menuitem"
                >
                  <UserCircleIcon className="h-5 w-5 mr-2.5" />
                  Profile
                </button>
                <button
                  onClick={() => navigate("/settings")}
                  className="w-full text-left flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-[#FA8630]/10 hover:text-[#FA8630] transition-colors duration-150"
                  role="menuitem"
                >
                  <Cog6ToothIcon className="h-5 w-5 mr-2.5" />
                  Settings
                </button>
              </div>
              <div className="py-1">
                <button
                  onClick={handleSignout}
                  className="w-full text-left flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-[#FA8630]/10 hover:text-[#FA8630] transition-colors duration-150"
                  role="menuitem"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2.5" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
