import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../../services/userService";
import { getExpenses } from "../../services/expenseService";
import { getIncomes } from "../../services/incomeService";
import { getBudgets, getBudgetProgress } from "../../services/budgetService";
import { getGoals } from "../../services/goalService";
import {
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlinePencil,
  HiOutlineCheck,
  HiOutlineCurrencyDollar,
  HiOutlineWallet,
  HiOutlineChartBar,
  HiOutlineShieldCheck,
  HiOutlineCalendarDays,
  HiOutlineArrowTrendingUp,
} from "react-icons/hi2";
import {
  FiMail,
  FiX,
  FiTrendingUp,
  FiTrendingDown,
  FiTarget,
} from "react-icons/fi";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

const glassCard = "bg-[#0B2B26]/60 backdrop-blur-xl border border-[#235347]/40 rounded-2xl";

const formatUSD = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);

function StrengthMeter({ password }) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = ["#ef4444", "#f59e0b", "#0d9488", "#10b981"];
  const widths = ["25%", "50%", "75%", "100%"];

  return (
    <div className="mt-2">
      <div className="flex gap-1.5 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full bg-[#163832] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: score > i ? widths[score - 1] : "0%" }}
              transition={{ duration: 0.3 }}
              style={{ backgroundColor: score > i ? colors[score - 1] : "#163832" }}
            />
          </div>
        ))}
      </div>
      {password.length > 0 && (
        <p className="text-xs" style={{ color: colors[score - 1] || "#8EB69B" }}>
          {labels[score - 1] || "Too short"}
        </p>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [editForm, setEditForm] = useState({ ...profile });

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    getProfile()
      .then((data) => {
        if (!data) return;
        const p = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
        };
        setProfile(p);
        setEditForm(p);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([
      getExpenses().catch(() => []),
      getIncomes().catch(() => []),
      getBudgets().catch(() => []),
      getBudgetProgress().catch(() => []),
      getGoals().catch(() => []),
    ]).then(([expenseList, incomeList, budgetList, progressList, goalList]) => {
      const expenses = Array.isArray(expenseList) ? expenseList : [];
      const incomes = Array.isArray(incomeList) ? incomeList : [];
      const budgets = Array.isArray(budgetList) ? budgetList : [];
      const progress = Array.isArray(progressList) ? progressList : [];
      const goals = Array.isArray(goalList) ? goalList : [];

      const totalIncome = incomes.reduce((s, i) => s + (Number(i.amount) || 0), 0);
      const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

      const now = new Date();
      const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const txThisMonth = [...expenses, ...incomes].filter(
        (t) => t.date && String(t.date).startsWith(monthPrefix)
      ).length;

      const avgBudgetUse =
        progress.length > 0
          ? Math.round(
              progress.reduce((s, b) => s + (Number(b.percentage) || 0), 0) /
                progress.length
            )
          : null;

      const goalsCompleted = goals.filter(
        (g) =>
          g.completed ||
          (Number(g.currentAmount) || 0) >= (Number(g.targetAmount) || 1)
      ).length;

      setStats([
        { label: "Total Income", value: formatUSD(totalIncome), icon: FiTrendingUp, color: "#10b981" },
        { label: "Total Expenses", value: formatUSD(totalExpenses), icon: FiTrendingDown, color: "#ef4444" },
        { label: "Net Savings", value: formatUSD(totalIncome - totalExpenses), icon: HiOutlineWallet, color: "#0d9481" },
        { label: "Active Budgets", value: String(budgets.length), icon: HiOutlineChartBar, color: "#8EB69B" },
      ]);

      setActivities([
        { label: "Transactions this month", value: String(txThisMonth), icon: HiOutlineArrowTrendingUp },
        { label: "Goals completed", value: goals.length > 0 ? `${goalsCompleted}` : "—", icon: FiTarget },
        { label: "Budget adherence", value: avgBudgetUse != null ? `${avgBudgetUse}%` : "—", icon: HiOutlineShieldCheck },
      ]);
    });
  }, []);

  const handleSave = () => {
    setProfile({ ...editForm });
    setEditing(false);
    updateProfile({ ...editForm })
      .then((data) => {
        if (data) {
          const p = {
            firstName: data.firstName || editForm.firstName,
            lastName: data.lastName || editForm.lastName,
            email: data.email || editForm.email,
          };
          setProfile(p);
          setEditForm(p);
        }
      })
      .catch(() => {});
  };

  const handlePasswordChange = () => {
    changePassword({
      oldPassword: passwords.current,
      newPassword: passwords.newPass,
    })
      .then(() => {
        setPasswords({ current: "", newPass: "", confirm: "" });
        setShowPasswordSection(false);
      })
      .catch(() => {});
  };

  const handleCancel = () => {
    setEditForm({ ...profile });
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-[#051F20] text-[#DAF1DE] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Profile Header ── */}
        <motion.div
          className={`${glassCard} p-8 flex flex-col sm:flex-row items-center gap-6`}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <div className="relative">
            <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-br from-[#10b981] via-[#0d9488] to-[#235347]">
              <div className="w-full h-full rounded-full bg-[#0B2B26] flex items-center justify-center">
                <span className="text-3xl font-bold bg-gradient-to-br from-[#10b981] to-[#8EB69B] bg-clip-text text-transparent">
                  {profile.firstName[0]}{profile.lastName[0]}
                </span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#10b981] flex items-center justify-center">
              <HiOutlineUser className="w-4 h-4 text-[#051F20]" />
            </div>
          </div>

          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold text-[#DAF1DE]">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="text-[#8EB69B] flex items-center justify-center sm:justify-start gap-2 mt-1">
              <FiMail className="w-4 h-4" />
              {profile.email}
            </p>
            <p className="text-sm text-[#235347] mt-2 flex items-center justify-center sm:justify-start gap-2">
              <HiOutlineCalendarDays className="w-4 h-4" />
              Member since Jan 2025
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#163832] border border-[#235347]/50 text-[#8EB69B] hover:bg-[#235347]/60 transition-all text-sm"
            >
              <HiOutlineLockClosed className="w-4 h-4" />
              Change Password
            </button>
          </div>
        </motion.div>

        {/* ── Personal Info ── */}
        <motion.div
          className={`${glassCard} p-6`}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <HiOutlineUser className="w-5 h-5 text-[#10b981]" />
              Personal Information
            </h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#8EB69B] hover:bg-[#163832] transition-all"
              >
                <HiOutlinePencil className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-[#8EB69B] hover:bg-[#163832] transition-all"
                >
                  <FiX className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-[#10b981] text-[#051F20] font-medium hover:bg-[#0d9488] transition-all"
                >
                  <HiOutlineCheck className="w-4 h-4" />
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "First Name", key: "firstName", icon: HiOutlineUser },
              { label: "Last Name", key: "lastName", icon: HiOutlineUser },
              { label: "Email", key: "email", icon: FiMail, full: true },
            ].map((field) => (
              <div key={field.key} className={field.full ? "sm:col-span-2" : ""}>
                <label className="block text-sm text-[#8EB69B] mb-1.5">{field.label}</label>
                {editing ? (
                  <div className="relative">
                    <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#235347]" />
                    <input
                      type={field.key === "email" ? "email" : "text"}
                      value={editForm[field.key]}
                      onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#051F20]/80 border border-[#235347]/40 text-[#DAF1DE] focus:outline-none focus:border-[#10b981]/60 transition-all"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#051F20]/40">
                    <field.icon className="w-4 h-4 text-[#235347]" />
                    <span className="text-[#DAF1DE]">{profile[field.key]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Financial Overview ── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <HiOutlineChartBar className="w-5 h-5 text-[#10b981]" />
            Financial Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className={`${glassCard} p-5`}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={2 + i * 0.1}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${stat.color}30, ${stat.color}10)` }}
                  >
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#DAF1DE]">{stat.value}</p>
                <p className="text-sm text-[#8EB69B] mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Activity Summary ── */}
        <motion.div
          className={`${glassCard} p-6`}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={3}
        >
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
            <FiTrendingUp className="w-5 h-5 text-[#10b981]" />
            Activity Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {activities.map((item, i) => (
              <div
                key={item.label}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#051F20]/40 border border-[#235347]/20"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#10b981]/20 to-[#0d9488]/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-[#10b981]" />
                </div>
                <div>
                  <p className="text-xl font-bold text-[#DAF1DE]">{item.value}</p>
                  <p className="text-xs text-[#8EB69B]">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Change Password ── */}
        {showPasswordSection && (
          <motion.div
            className={`${glassCard} p-6`}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <HiOutlineLockClosed className="w-5 h-5 text-[#10b981]" />
              Change Password
            </h2>

            <div className="space-y-4 max-w-md">
              {[
                { label: "Current Password", key: "current", icon: HiOutlineLockClosed },
                { label: "New Password", key: "newPass", icon: HiOutlineShieldCheck },
                { label: "Confirm New Password", key: "confirm", icon: HiOutlineShieldCheck },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm text-[#8EB69B] mb-1.5">{field.label}</label>
                  <div className="relative">
                    <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#235347]" />
                    <input
                      type="password"
                      value={passwords[field.key]}
                      onChange={(e) => setPasswords({ ...passwords, [field.key]: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#051F20]/80 border border-[#235347]/40 text-[#DAF1DE] focus:outline-none focus:border-[#10b981]/60 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  {field.key === "newPass" && <StrengthMeter password={passwords.newPass} />}
                </div>
              ))}

              {passwords.newPass &&
                passwords.confirm &&
                passwords.newPass !== passwords.confirm && (
                  <p className="text-sm text-red-400">Passwords do not match</p>
                )}

              <button
                onClick={handlePasswordChange}
                disabled={
                  !passwords.current ||
                  !passwords.newPass ||
                  passwords.newPass !== passwords.confirm
                }
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#0d9488] text-[#051F20] font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Update Password
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
