import { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const EXPANDED_WIDTH = 250;
const COLLAPSED_WIDTH = 80;

export default function DashboardLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarExpanded((prev) => !prev);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setMobileSidebarOpen((prev) => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  const sidebarWidth = sidebarExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  return (
    <div className="flex min-h-screen bg-[#051F20]">
      <Sidebar
        expanded={sidebarExpanded}
        onToggle={toggleSidebar}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar onMobileMenuToggle={toggleMobileSidebar} />

        {/* Content area */}
        <motion.main
          initial={false}
          animate={{
            paddingLeft: sidebarWidth,
          }}
          transition={{
            paddingLeft: { type: "spring", stiffness: 300, damping: 30 },
          }}
          className="flex-1 pt-16 max-md:!pl-0"
        >
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </motion.main>
      </div>

      {/* Ambient background glow */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-[#10b981]/[0.03] rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[#0d9488]/[0.03] rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}
