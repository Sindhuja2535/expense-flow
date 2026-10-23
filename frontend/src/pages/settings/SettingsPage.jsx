import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getProfile, updateProfile } from "../../services/userService";
import {
  HiOutlinePaintBrush,
  HiOutlineBell,
  HiOutlineCurrencyDollar,
  HiOutlineLanguage,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineArrowDownTray,
  HiOutlineTrash,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineCheck,
} from "react-icons/hi2";
import { FiX } from "react-icons/fi";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: "easeOut" },
  }),
};

const glassCard = "bg-[#0B2B26]/60 backdrop-blur-xl border border-[#235347]/40 rounded-2xl";

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 ${
        checked
          ? "bg-gradient-to-r from-[#10b981] to-[#0d9488] shadow-[0_0_12px_#10b98130]"
          : "bg-[#163832] border border-[#235347]/60"
      }`}
    >
      <motion.div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
        animate={{ left: checked ? "calc(100% - 22px)" : "2px" }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

function SectionCard({ icon: Icon, title, index, children }) {
  return (
    <motion.div
      className={`${glassCard} p-6`}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      custom={index}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10b981]/20 to-[#0d9488]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#10b981]" />
        </div>
        <h2 className="text-lg font-semibold text-[#DAF1DE]">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: "dark",
    accentColor: "emerald",
    currency: "USD",
    language: "English",
    timezone: "America/New_York",
    notifications: {
      budgetAlerts: true,
      largeExpenses: true,
      monthlyReports: false,
      goalUpdates: true,
      billsReminder: true,
    },
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile()
      .then((data) => {
        if (!data) return;
        setProfile(data);
        setSettings((prev) => ({
          ...prev,
          currency: data.currency || prev.currency,
          language: data.language || prev.language,
          timezone: data.timezone || prev.timezone,
        }));
      })
      .catch(() => {});
  }, []);

  const persistProfile = (patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    if (profile) {
      updateProfile({ ...profile, ...patch })
        .then((updated) => {
          if (updated) setProfile(updated);
        })
        .catch(() => {});
    }
  };

  const toggleNotif = (key) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }));
  };

  const accentColors = [
    { name: "emerald", bg: "bg-[#10b981]", ring: "ring-[#10b981]" },
    { name: "blue", bg: "bg-[#3b82f6]", ring: "ring-[#3b82f6]" },
    { name: "purple", bg: "bg-[#a855f7]", ring: "ring-[#a855f7]" },
    { name: "rose", bg: "bg-[#f43f5e]", ring: "ring-[#f43f5e]" },
  ];

  const currencies = ["USD", "EUR", "GBP", "INR", "JPY"];
  const languages = ["English", "Spanish", "French", "Hindi"];
  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Asia/Kolkata",
  ];

  const notifOptions = [
    { key: "budgetAlerts", label: "Budget Alerts", desc: "When you exceed budget limits" },
    { key: "largeExpenses", label: "Large Expenses", desc: "Transactions over $500" },
    { key: "monthlyReports", label: "Monthly Reports", desc: "Auto-generated summaries" },
    { key: "goalUpdates", label: "Goal Updates", desc: "Progress on savings goals" },
    { key: "billsReminder", label: "Bills Reminder", desc: "Upcoming bill due dates" },
  ];

  return (
    <div className="min-h-screen bg-[#051F20] text-[#DAF1DE] p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-[#8EB69B] text-sm mt-1">Manage your app preferences</p>
        </motion.div>

        {/* ── Appearance ── */}
        <SectionCard icon={HiOutlinePaintBrush} title="Appearance" index={1}>
          {/* Theme */}
          <div className="mb-5">
            <p className="text-sm text-[#8EB69B] mb-3">Theme</p>
            <div className="flex gap-3">
              {[
                { key: "dark", icon: HiOutlineMoon, label: "Dark" },
                { key: "light", icon: HiOutlineSun, label: "Light" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setSettings({ ...settings, theme: t.key })}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    settings.theme === t.key
                      ? "bg-[#10b981]/15 border-[#10b981]/50 text-[#10b981]"
                      : "bg-[#051F20]/40 border-[#235347]/30 text-[#8EB69B] hover:border-[#235347]"
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <p className="text-sm text-[#8EB69B] mb-3">Accent Color</p>
            <div className="flex gap-3">
              {accentColors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSettings({ ...settings, accentColor: c.name })}
                  className={`relative w-10 h-10 rounded-full ${c.bg} transition-all ${
                    settings.accentColor === c.name
                      ? `ring-2 ${c.ring} ring-offset-2 ring-offset-[#0B2B26]`
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  {settings.accentColor === c.name && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <HiOutlineCheck className="w-5 h-5 text-white drop-shadow" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ── Notifications ── */}
        <SectionCard icon={HiOutlineBell} title="Notifications" index={2}>
          <div className="divide-y divide-[#235347]/20">
            {notifOptions.map((opt) => (
              <div key={opt.key} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-[#DAF1DE]">{opt.label}</p>
                  <p className="text-xs text-[#8EB69B] mt-0.5">{opt.desc}</p>
                </div>
                <Toggle
                  checked={settings.notifications[opt.key]}
                  onChange={() => toggleNotif(opt.key)}
                />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Currency ── */}
        <SectionCard icon={HiOutlineCurrencyDollar} title="Currency" index={3}>
          <div className="relative max-w-xs">
            <select
              value={settings.currency}
              onChange={(e) => persistProfile({ currency: e.target.value })}
              className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl bg-[#051F20]/80 border border-[#235347]/40 text-[#DAF1DE] focus:outline-none focus:border-[#10b981]/60 transition-all text-sm cursor-pointer"
            >
              {currencies.map((c) => (
                <option key={c} value={c} className="bg-[#0B2B26] text-[#DAF1DE]">
                  {c}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-[#8EB69B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </SectionCard>

        {/* ── Language ── */}
        <SectionCard icon={HiOutlineLanguage} title="Language" index={4}>
          <div className="relative max-w-xs">
            <select
              value={settings.language}
              onChange={(e) => persistProfile({ language: e.target.value })}
              className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl bg-[#051F20]/80 border border-[#235347]/40 text-[#DAF1DE] focus:outline-none focus:border-[#10b981]/60 transition-all text-sm cursor-pointer"
            >
              {languages.map((l) => (
                <option key={l} value={l} className="bg-[#0B2B26] text-[#DAF1DE]">
                  {l}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-[#8EB69B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </SectionCard>

        {/* ── Timezone ── */}
        <SectionCard icon={HiOutlineClock} title="Timezone" index={5}>
          <div className="relative max-w-sm">
            <select
              value={settings.timezone}
              onChange={(e) => persistProfile({ timezone: e.target.value })}
              className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl bg-[#051F20]/80 border border-[#235347]/40 text-[#DAF1DE] focus:outline-none focus:border-[#10b981]/60 transition-all text-sm cursor-pointer"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz} className="bg-[#0B2B26] text-[#DAF1DE]">
                  {tz.replace("_", " ")}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-[#8EB69B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </SectionCard>

        {/* ── Data & Privacy ── */}
        <SectionCard icon={HiOutlineShieldCheck} title="Data & Privacy" index={6}>
          <div className="space-y-4">
            <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-[#051F20]/40 border border-[#235347]/30 text-[#DAF1DE] hover:bg-[#163832]/50 transition-all text-sm font-medium">
              <HiOutlineArrowDownTray className="w-5 h-5 text-[#10b981]" />
              Export My Data
            </button>

            <button
              onClick={() => {
                setDeleteInput("");
                setShowDeleteModal(true);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm font-medium"
            >
              <HiOutlineTrash className="w-5 h-5" />
              Delete Account
            </button>
          </div>
        </SectionCard>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-[#051F20]/80 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(false)}
            />

            <motion.div
              className="relative w-full max-w-md bg-[#0B2B26] border border-[#235347]/40 rounded-2xl p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 right-4 text-[#8EB69B] hover:text-[#DAF1DE] transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <HiOutlineTrash className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-[#DAF1DE]">Delete Account</h3>
              </div>

              <p className="text-sm text-[#8EB69B] mb-4">
                This action is irreversible. All your data, transactions, and history will be
                permanently deleted. Type <span className="font-mono text-red-400">DELETE</span> to
                confirm.
              </p>

              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder='Type "DELETE" to confirm'
                className="w-full px-4 py-2.5 rounded-xl bg-[#051F20]/80 border border-red-500/30 text-[#DAF1DE] focus:outline-none focus:border-red-500/60 transition-all text-sm mb-4 placeholder:text-[#235347]"
              />

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl text-sm text-[#8EB69B] hover:bg-[#163832] transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={deleteInput !== "DELETE"}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Permanently Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
