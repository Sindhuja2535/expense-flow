import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getNotifications,
  markAsRead as markNotificationRead,
  markAllAsRead as markAllNotificationsRead,
} from "../../services/notificationService";
import {
  FiCheck,
  FiAlertTriangle,
  FiTarget,
  FiFileText,
  FiClock,
  FiInfo,
  FiBell,
  FiCheckCircle,
} from "react-icons/fi";

const TYPE_CONFIG = {
  budget: {
    icon: FiAlertTriangle,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    label: "Budget Alert",
  },
  goal: {
    icon: FiTarget,
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    label: "Goal Completed",
  },
  report: {
    icon: FiFileText,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    label: "Monthly Report",
  },
  bill: {
    icon: FiClock,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    label: "Upcoming Bill",
  },
  system: {
    icon: FiInfo,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    label: "System",
  },
};

const DEFAULT_TYPE_CONFIG = {
  icon: FiInfo,
  color: "#3b82f6",
  bg: "rgba(59,130,246,0.12)",
  label: "Notification",
};

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "budget", label: "Budget Alerts" },
  { key: "goal", label: "Goals" },
  { key: "system", label: "System" },
];

function getRelativeTime(date) {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return `${weeks}w ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    let mounted = true;
    getNotifications()
      .then((data) => {
        if (!mounted) return;
        const list = Array.isArray(data) ? data : data?.notifications || [];
        setNotifications(
          list.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: String(n.type || "general").toLowerCase(),
            read: !!n.isRead,
            time: n.createdAt ? new Date(n.createdAt) : new Date(),
          }))
        );
      })
      .catch(() => {
        if (mounted) setNotifications([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "unread") return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    markNotificationRead(id).catch(() => {});
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    markAllNotificationsRead().catch(() => {});
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8" style={{ backgroundColor: "#051F20" }}>
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <h1
              className="text-3xl font-bold"
              style={{ color: "#DAF1DE" }}
            >
              Notifications
            </h1>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex h-7 min-w-[28px] items-center justify-center rounded-full px-2 text-xs font-semibold"
                style={{ backgroundColor: "#0d9488", color: "#DAF1DE" }}
              >
                {unreadCount}
              </motion.span>
            )}
          </div>
          {unreadCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={markAllRead}
              className="flex items-center gap-2 self-start rounded-xl px-4 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: "rgba(14,182,147,0.15)",
                color: "#8EB69B",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(14,182,147,0.25)";
                e.currentTarget.style.color = "#DAF1DE";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(14,182,147,0.15)";
                e.currentTarget.style.color = "#8EB69B";
              }}
            >
              <FiCheck size={16} />
              Mark All Read
            </motion.button>
          )}
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6 flex flex-wrap gap-2"
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className="relative rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: isActive
                    ? "rgba(13,148,136,0.25)"
                    : "rgba(255,255,255,0.04)",
                  color: isActive ? "#DAF1DE" : "#8EB69B",
                  border: isActive
                    ? "1px solid rgba(13,148,136,0.4)"
                    : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      backgroundColor: "rgba(13,148,136,0.15)",
                      border: "1px solid rgba(13,148,136,0.35)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Notification List */}
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {!loading && filteredNotifications.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center rounded-2xl py-20 text-center"
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: "rgba(142,182,155,0.1)" }}
                >
                  <FiBell size={28} style={{ color: "#8EB69B" }} />
                </div>
                <p className="text-lg font-semibold" style={{ color: "#8EB69B" }}>
                  No notifications
                </p>
                <p className="mt-1 text-sm" style={{ color: "rgba(142,182,155,0.6)" }}>
                  You're all caught up! Check back later.
                </p>
              </motion.div>
            ) : (
              filteredNotifications.map((notification, index) => {
                const config = TYPE_CONFIG[notification.type] || DEFAULT_TYPE_CONFIG;
                const Icon = config.icon;

                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                    transition={{
                      duration: 0.35,
                      delay: index * 0.04,
                      layout: { type: "spring", stiffness: 300, damping: 30 },
                    }}
                    onClick={() => markAsRead(notification.id)}
                    className="group cursor-pointer rounded-2xl p-4 transition-all duration-200 sm:p-5"
                    style={{
                      backgroundColor: notification.read
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(255,255,255,0.06)",
                      borderLeft: notification.read
                        ? "3px solid transparent"
                        : "3px solid #10b981",
                      border: notification.read
                        ? "1px solid rgba(255,255,255,0.06)"
                        : "1px solid rgba(16,185,129,0.2)",
                      borderLeftWidth: notification.read ? "1px" : "3px",
                      borderLeftColor: notification.read
                        ? "rgba(255,255,255,0.06)"
                        : "#10b981",
                      opacity: notification.read ? 0.65 : 1,
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = notification.read
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(255,255,255,0.09)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = notification.read
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(255,255,255,0.06)";
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: config.bg }}
                      >
                        <Icon size={18} style={{ color: config.color }} />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3
                                className="text-sm font-semibold leading-snug"
                                style={{
                                  color: notification.read ? "#8EB69B" : "#DAF1DE",
                                }}
                              >
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="h-2 w-2 flex-shrink-0 rounded-full"
                                  style={{ backgroundColor: "#10b981" }}
                                />
                              )}
                            </div>
                            <p
                              className="mt-1 text-sm leading-relaxed"
                              style={{
                                color: notification.read
                                  ? "rgba(142,182,155,0.5)"
                                  : "#8EB69B",
                              }}
                            >
                              {notification.message}
                            </p>
                          </div>

                          {/* Time + Check */}
                          <div className="flex flex-shrink-0 flex-col items-end gap-2">
                            <span
                              className="whitespace-nowrap text-xs"
                              style={{ color: "rgba(142,182,155,0.5)" }}
                            >
                              {getRelativeTime(notification.time)}
                            </span>
                            {notification.read && (
                              <FiCheckCircle
                                size={14}
                                style={{ color: "rgba(16,185,129,0.4)" }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Type Label */}
                        <div className="mt-2">
                          <span
                            className="inline-block rounded-lg px-2 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: config.bg,
                              color: config.color,
                            }}
                          >
                            {config.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
