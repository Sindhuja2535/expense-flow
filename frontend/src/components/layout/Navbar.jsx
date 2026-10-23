import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ onMobileMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const unreadCount = 3;
  const userName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "U";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (searchValue.trim()) {
        navigate(`/dashboard/search?q=${encodeURIComponent(searchValue.trim())}`);
        setSearchValue("");
        searchInputRef.current?.blur();
      }
    },
    [searchValue, navigate]
  );

  const handleLogout = useCallback(() => {
    setDropdownOpen(false);
    logout();
    navigate("/login");
  }, [logout, navigate]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-[#051F20]/[0.82] backdrop-blur-xl border-b border-[#8EB69B]/8">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#10b981]/10 via-[#10b981]/30 to-[#10b981]/10" />

      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left side: hamburger for mobile */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-[#8EB69B] hover:text-[#DAF1DE] hover:bg-[#163832]/60 transition-all duration-200 cursor-pointer"
            aria-label="Toggle menu"
          >
            <FiMenu size={20} />
          </button>

          <Link
            to="/dashboard"
            className="hidden md:flex items-center gap-2 text-[#8EB69B] hover:text-[#DAF1DE] transition-colors"
          >
            <span className="text-sm font-semibold tracking-wide">ExpenseFlow</span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <motion.div
              animate={{
                width: searchFocused ? 260 : 200,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`
                relative flex items-center overflow-hidden rounded-xl
                bg-[#0B2B26]/60 border transition-colors duration-300
                ${
                  searchFocused
                    ? "border-[#8EB69B]/30 shadow-[0_0_15px_rgba(142,182,155,0.08)]"
                    : "border-[#8EB69B]/10"
                }
              `}
            >
              <FiSearch
                size={15}
                className={`ml-3 shrink-0 transition-colors duration-200 ${
                  searchFocused ? "text-[#10b981]" : "text-[#8EB69B]/40"
                }`}
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full bg-transparent border-none outline-none px-2.5 py-2 text-sm text-[#DAF1DE] placeholder-[#8EB69B]/30"
              />
            </motion.div>
          </form>

          {/* Mobile search icon */}
          <Link
            to="/dashboard/search"
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl text-[#8EB69B]/60 hover:text-[#DAF1DE] hover:bg-[#163832]/60 transition-all duration-200"
          >
            <FiSearch size={18} />
          </Link>

          {/* Notifications */}
          <Link
            to="/dashboard/notifications"
            className="relative flex items-center justify-center w-9 h-9 rounded-xl text-[#8EB69B]/60 hover:text-[#DAF1DE] hover:bg-[#163832]/60 transition-all duration-200"
          >
            <FiBell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[#ef4444] text-white text-[9px] font-bold leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-[#163832]/50 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#0d9488] to-[#10b981] text-white text-sm font-bold shadow-md shadow-[#10b981]/15">
                {userInitial}
              </div>
              <span className="hidden md:block text-sm font-medium text-[#8EB69B] group-hover:text-[#DAF1DE]">
                {userName}
              </span>
              <FiChevronDown
                size={14}
                className={`hidden md:block text-[#8EB69B]/50 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#0B2B26]/[0.97] backdrop-blur-xl border border-[#8EB69B]/12 shadow-2xl shadow-black/40 overflow-hidden"
                >
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-[#8EB69B]/8">
                    <p className="text-sm font-semibold text-[#DAF1DE] truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-[#8EB69B]/50 truncate mt-0.5">
                      {user?.email || "user@expenseflow.com"}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1.5">
                    {[
                      {
                        icon: FiUser,
                        label: "Profile",
                        to: "/dashboard/profile",
                        onClick: () => setDropdownOpen(false),
                      },
                      {
                        icon: FiSettings,
                        label: "Settings",
                        to: "/dashboard/settings",
                        onClick: () => setDropdownOpen(false),
                      },
                    ].map((item) => (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={item.onClick}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#8EB69B]/70 hover:text-[#DAF1DE] hover:bg-[#163832]/50 transition-colors duration-150"
                      >
                        <item.icon size={16} className="shrink-0" />
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-[#8EB69B]/8 py-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#ef4444]/80 hover:text-[#ef4444] hover:bg-[#ef4444]/8 transition-colors duration-150 cursor-pointer"
                    >
                      <FiLogOut size={16} className="shrink-0" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
