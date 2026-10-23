import { useState, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaLeaf,
} from "react-icons/fa";
import {
  FiLayout,
  FiTrendingDown,
  FiTrendingUp,
  FiBarChart2,
  FiPieChart,
  FiTarget,
  FiCalendar,
  FiBell,
  FiZap,
  FiFileText,
  FiSearch,
  FiSettings,
  FiUser,
  FiX,
  FiChevronLeft,
} from "react-icons/fi";

const NAV_ITEMS = [
  { to: "/dashboard", icon: FiLayout, label: "Dashboard" },
  { to: "/dashboard/expenses", icon: FiTrendingDown, label: "Expenses" },
  { to: "/dashboard/income", icon: FiTrendingUp, label: "Income" },
  { to: "/dashboard/analytics", icon: FiBarChart2, label: "Analytics" },
  { to: "/dashboard/budget", icon: FiPieChart, label: "Budget" },
  { to: "/dashboard/goals", icon: FiTarget, label: "Goals" },
  { to: "/dashboard/calendar", icon: FiCalendar, label: "Calendar" },
  { to: "/dashboard/notifications", icon: FiBell, label: "Notifications", badge: 3 },
  { to: "/dashboard/ai", icon: FiZap, label: "AI Assistant" },
  { to: "/dashboard/reports", icon: FiFileText, label: "Reports" },
  { to: "/dashboard/search", icon: FiSearch, label: "Search" },
];

const BOTTOM_ITEMS = [
  { to: "/dashboard/settings", icon: FiSettings, label: "Settings" },
  { to: "/dashboard/profile", icon: FiUser, label: "Profile" },
];

const EXPANDED_WIDTH = 250;
const COLLAPSED_WIDTH = 80;

function SidebarLink({ item, collapsed }) {
  const Icon = item.icon;

  const linkContent = (
    <NavLink
      to={item.to}
      end={item.to === "/dashboard"}
      className={({ isActive }) =>
        `sidebar-link group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? "active bg-[#235347]/40 text-[#DAF1DE] border-l-[3px] border-[#10b981]"
            : "text-[#8EB69B]/70 hover:text-[#DAF1DE] hover:bg-[#163832]/60 border-l-[3px] border-transparent"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`flex items-center justify-center w-5 h-5 shrink-0 ${
              isActive ? "text-[#10b981]" : "text-[#8EB69B]/70 group-hover:text-[#DAF1DE]"
            }`}
          >
            <Icon size={18} />
          </span>

          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap overflow-hidden"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          {item.badge && item.badge > 0 && (
            <span
              className={`absolute flex items-center justify-center rounded-full bg-[#ef4444] text-white text-[10px] font-bold leading-none ${
                collapsed
                  ? "top-1 right-1 w-4 h-4"
                  : "ml-auto w-5 h-5"
              }`}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );

  if (collapsed) {
    return (
      <div className="relative group">
        {linkContent}
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg bg-[#163832] text-[#DAF1DE] text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-lg border border-[#8EB69B]/15">
          {item.label}
          {item.badge && item.badge > 0 && (
            <span className="ml-1.5 text-[10px] text-[#ef4444]">({item.badge})</span>
          )}
        </div>
      </div>
    );
  }

  return linkContent;
}

export default function Sidebar({ expanded, onToggle, mobileOpen, onMobileClose }) {
  const [isHovering, setIsHovering] = useState(false);
  const location = useLocation();

  const currentWidth = expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  const handleCollapseToggle = useCallback(() => {
    if (onToggle) onToggle();
  }, [onToggle]);

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile close button */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onMobileClose}
            className="fixed top-4 left-[218px] z-[60] md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-[#163832]/90 border border-[#8EB69B]/20 text-[#8EB69B] hover:text-[#DAF1DE] hover:border-[#8EB69B]/40 transition-colors cursor-pointer"
          >
            <FiX size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: currentWidth,
          x: 0,
        }}
        transition={{
          width: { type: "spring", stiffness: 300, damping: 30 },
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`
          fixed top-0 left-0 h-screen z-50
          flex flex-col
          bg-[#051F20]/[0.97]
          backdrop-blur-xl
          border-r border-[#8EB69B]/10
          shadow-[2px_0_20px_rgba(142,182,155,0.06)]
          transition-shadow duration-300
          max-md:hidden
          ${mobileOpen ? "!flex max-md:translate-x-0" : "max-md:-translate-x-full"}
          ${isHovering ? "shadow-[4px_0_30px_rgba(142,182,155,0.12)]" : ""}
        `}
      >
        {/* Top glowing accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#10b981]/40 to-transparent" />

        {/* Logo section */}
        <div className="flex items-center px-4 py-5 border-b border-[#8EB69B]/8">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#0d9488] to-[#10b981] shrink-0 shadow-lg shadow-[#10b981]/20">
              <FaLeaf size={16} className="text-white" />
            </div>

            <AnimatePresence mode="wait">
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <span className="text-base font-bold bg-gradient-to-r from-[#8EB69B] to-[#10b981] bg-clip-text text-transparent whitespace-nowrap">
                    ExpenseFlow
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={!expanded} />
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-3 border-t border-[#8EB69B]/8" />

        {/* Bottom section */}
        <div className="px-2.5 py-3 space-y-0.5">
          {BOTTOM_ITEMS.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={!expanded} />
          ))}
        </div>

        {/* Collapse toggle */}
        <div className="px-2.5 pb-4 hidden md:block">
          <button
            onClick={handleCollapseToggle}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[#8EB69B]/60 hover:text-[#DAF1DE] hover:bg-[#163832]/50 transition-all duration-200 cursor-pointer"
          >
            <motion.span
              animate={{ rotate: expanded ? 0 : 180 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            >
              <FiChevronLeft size={16} />
            </motion.span>

            <AnimatePresence mode="wait">
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-xs font-medium whitespace-nowrap overflow-hidden"
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Bottom glowing accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#10b981]/20 to-transparent" />
      </motion.aside>
    </>
  );
}
