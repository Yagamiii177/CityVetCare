import {
  HomeIcon,
  ClipboardDocumentListIcon,
  PlusCircleIcon,
  ClockIcon,
  MapPinIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export const Drawer = ({ isOpen, onItemClick, setIsDrawerOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const hoverAreaRef = useRef(null);
  const drawerRef = useRef(null);
  const [isHoveringItem, setIsHoveringItem] = useState(false);

  // 🔶 Incident Report Navigation
  const navItems = [
    {
      name: "Dashboard",
      icon: <HomeIcon className="h-5 w-5 mr-3" />,
      path: "/report-dashboard",
    },
    {
      name: "All Incident Reports",
      icon: <ClipboardDocumentListIcon className="h-5 w-5 mr-3" />,
      path: "/all-incident-report",
    },
    {
      name: "Submit Report",
      icon: <PlusCircleIcon className="h-5 w-5 mr-3" />,
      path: "/submit-report",
    },
    {
      name: "Pending Verification",
      icon: <ClockIcon className="h-5 w-5 mr-3" />,
      path: "/pending-verification",
    },
    {
      name: "Patrol Assignments",
      icon: <MapPinIcon className="h-5 w-5 mr-3" />,
      path: "/catcher-schedule",
    },
    {
      name: "Report History",
      icon: <DocumentCheckIcon className="h-5 w-5 mr-3" />,
      path: "/report-history",
    },
     {
      name: "Monitoring Incidents",
      icon: <MapPinIcon className="h-5 w-5 mr-3" />,
      path: "/monitoring-incidents",
    },
    
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (onItemClick) {
      onItemClick();
    }
  };

  // Drawer hover behavior
  useEffect(() => {
    const hoverArea = hoverAreaRef.current;
    const drawer = drawerRef.current;
    let hoverTimeout;

    const handleMouseEnter = () => {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        setIsDrawerOpen(true);
      }, 300);
    };

    const handleMouseLeave = () => {
      clearTimeout(hoverTimeout);
      if (!isHoveringItem) {
        hoverTimeout = setTimeout(() => {
          setIsDrawerOpen(false);
        }, 200);
      }
    };

    if (hoverArea) {
      hoverArea.addEventListener("mouseenter", handleMouseEnter);
      hoverArea.addEventListener("mouseleave", handleMouseLeave);
    }

    if (drawer) {
      drawer.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (hoverArea) {
        hoverArea.removeEventListener("mouseenter", handleMouseEnter);
        hoverArea.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (drawer) {
        drawer.removeEventListener("mouseleave", handleMouseLeave);
      }
      clearTimeout(hoverTimeout);
    };
  }, [setIsDrawerOpen, isHoveringItem]);

  return (
    <>
      {/* Invisible hover trigger area */}
      <div
        ref={hoverAreaRef}
        className="fixed left-0 top-0 h-full w-4 z-20 hover:w-8 transition-all duration-200"
      />

      {/* Sidebar Drawer */}
      <div
        ref={drawerRef}
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } fixed h-full w-72 bg-white shadow-md transition-transform duration-300 ease-in-out z-10`}
      >
        <div className="p-4 border-b border-[#E8E8E8]">
          <h2 className="text-lg font-semibold text-[#FA8630]">
            Incident Report
          </h2>
        </div>

        <nav className="p-4 overflow-y-auto h-[calc(100%-60px)]">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li
                  key={item.path}
                  onMouseEnter={() => setIsHoveringItem(true)}
                  onMouseLeave={() => setIsHoveringItem(false)}
                >
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full text-left flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                      isActive
                        ? "bg-[#FA8630]/10 text-[#FA8630] font-medium"
                        : "text-gray-700 hover:bg-[#FA8630]/10 hover:text-[#FA8630]"
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};
