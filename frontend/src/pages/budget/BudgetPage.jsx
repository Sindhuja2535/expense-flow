import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiDollarSign,
  FiPocket,
  FiTrendingUp,
  FiAlertTriangle,
  FiCalendar,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toast } from "react-toastify";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetProgress,
} from "../../services/budgetService";
import { getCategories } from "../../services/categoryService";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalContent = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

const defaultFormState = {
  amount: "",
  period: "MONTHLY",
  category: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
};

const PERIODS = [
  { label: "Weekly", value: "WEEKLY" },
  { label: "Monthly", value: "MONTHLY" },
  { label: "Yearly", value: "YEARLY" },
];

function CircularProgress({ percent, size = 80, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(percent, 100) / 100);

  const color = percent > 90 ? "#ef4444" : percent > 70 ? "#f59e0b" : "#10b981";

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(142,182,155,0.1)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card p-6">
      <div className="skeleton h-4 w-32 mb-4" />
      <div className="skeleton h-8 w-24 mb-2" />
      <div className="skeleton h-3 w-20 mb-4" />
      <div className="skeleton h-2 w-full rounded-full mb-3" />
      <div className="flex justify-between">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-3 w-16" />
      </div>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-32 h-32 rounded-full bg-[#163832]/60 flex items-center justify-center mb-6 border border-[#8EB69B]/10">
        <FiPocket className="text-5xl text-[#8EB69B]/40" />
      </div>
      <h3 className="text-xl font-bold text-[#DAF1DE] mb-2">No budgets set</h3>
      <p className="text-sm text-[#8EB69B] mb-6 text-center max-w-sm">
        Create your first budget to start tracking spending limits.
      </p>
      <button onClick={onAdd} className="btn-primary inline-flex items-center gap-2 text-sm">
        <FiPlus size={16} /> Create Budget
      </button>
    </motion.div>
  );
}

function DeleteModal({ budget, onConfirm, onCancel }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      variants={modalOverlay}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        className="relative w-full max-w-md glass-card p-6 shadow-2xl"
        variants={modalContent}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center">
            <FiTrash2 size={18} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#DAF1DE]">Delete Budget</h3>
            <p className="text-xs text-[#8EB69B]">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-[#8EB69B] mb-6">
          Are you sure you want to delete the budget for &quot;{budget?.category || "Overall"}&quot;?
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-ghost !py-2 !px-4 text-sm">Cancel</button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition-colors border border-red-500/20 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function BudgetModal({ isOpen, budget, categories, onSave, onCancel }) {
  const [form, setForm] = useState(defaultFormState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (budget) {
      setForm({
        amount: budget.amount?.toString() || "",
        period: budget.period || "MONTHLY",
        category: budget.categoryId || "",
        startDate: budget.startDate
          ? new Date(budget.startDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        endDate: budget.endDate
          ? new Date(budget.endDate).toISOString().split("T")[0]
          : "",
      });
    } else {
      setForm(defaultFormState);
    }
  }, [budget, isOpen]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount) {
      toast.error("Please enter a budget amount");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        amount: parseFloat(form.amount),
        period: form.period,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        categoryId: form.category || undefined,
      };

      if (budget?._id || budget?.id) {
        await updateBudget(budget._id || budget.id, payload);
        toast.success("Budget updated successfully");
      } else {
        await createBudget(payload);
        toast.success("Budget created successfully");
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to save budget");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      variants={modalOverlay}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        className="relative w-full max-w-lg glass-card shadow-2xl max-h-[90vh] overflow-y-auto"
        variants={modalContent}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="flex items-center justify-between p-6 pb-0">
          <h3 className="text-lg font-bold text-[#DAF1DE]">
            {budget ? "Edit Budget" : "Create Budget"}
          </h3>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg bg-[#163832]/60 flex items-center justify-center text-[#8EB69B] hover:text-[#DAF1DE] hover:bg-[#163832] transition-colors cursor-pointer"
          >
            <FiX size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-[#8EB69B] mb-1.5 block">
              Budget Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8EB69B] text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                className="input-field !pl-7"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#8EB69B] mb-1.5 block">Period *</label>
            <div className="flex gap-2">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handleChange("period", p.value)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    form.period === p.value
                      ? "bg-gradient-to-r from-[#0d9488] to-[#10b981] text-white"
                      : "bg-[#163832]/60 text-[#8EB69B] hover:text-[#DAF1DE] border border-[#8EB69B]/10"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#8EB69B] mb-1.5 block">
              Category <span className="text-[#8EB69B]/50">(optional = overall)</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="input-field appearance-none"
            >
              <option value="">All Categories (Overall Budget)</option>
              {categories.map((cat) => (
                <option key={cat._id || cat.id || cat.name} value={cat._id || cat.id || cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#8EB69B] mb-1.5 block">Start Date *</label>
              <div className="relative">
                <FiCalendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8EB69B]" />
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="input-field !pl-9"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[#8EB69B] mb-1.5 block">End Date</label>
              <div className="relative">
                <FiCalendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8EB69B]" />
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  className="input-field !pl-9"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} className="btn-ghost flex-1 !py-2.5 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 !py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiPlus size={16} />
                  {budget ? "Update" : "Create"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [budgetData, categoryData, progressData] = await Promise.all([
        getBudgets(),
        getCategories().catch(() => []),
        getBudgetProgress().catch(() => null),
      ]);
      setBudgets(Array.isArray(budgetData) ? budgetData : budgetData?.budgets || []);
      setCategories(Array.isArray(categoryData) ? categoryData : categoryData?.categories || []);
      if (progressData) setProgress(progressData);
    } catch (err) {
      toast.error("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const budgetList = useMemo(() => {
    const progressMap = {};
    (Array.isArray(progress) ? progress : []).forEach((p) => {
      progressMap[p.id] = p;
    });
    return budgets.map((b) => ({
      ...b,
      spent: progressMap[b.id]?.spent != null ? progressMap[b.id].spent : b.spent || 0,
    }));
  }, [budgets, progress]);

  const overview = useMemo(() => {
    const totalBudget = budgetList.reduce((s, b) => s + Math.abs(b.amount || 0), 0);
    const totalSpent = budgetList.reduce((s, b) => s + Math.abs(b.spent || 0), 0);
    return {
      totalBudget,
      totalSpent,
      remaining: totalBudget - totalSpent,
      percentUsed: totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0,
    };
  }, [budgetList]);

  const handleAdd = () => {
    setEditingBudget(null);
    setModalOpen(true);
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBudget(deleteTarget._id || deleteTarget.id);
      toast.success("Budget deleted");
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete budget");
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    setEditingBudget(null);
    fetchData();
  };

  const getCategoryName = (cat) => {
    if (!cat) return "Overall";
    if (typeof cat === "string") return cat;
    return cat.name || cat.categoryName || "Overall";
  };

  const chartData = useMemo(() => {
    return budgetList.map((b) => ({
      name: getCategoryName(b.categoryName || b.category),
      budget: Math.abs(b.amount || 0),
      spent: Math.abs(b.spent || 0),
    }));
  }, [budgetList]);

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass-card !rounded-xl p-3 shadow-2xl border border-[#8EB69B]/20">
        <p className="text-xs text-[#8EB69B] mb-1 font-medium">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.fill }} />
            <span className="text-[#8EB69B]">{entry.name}:</span>
            <span className="text-[#DAF1DE] font-semibold">${Number(entry.value).toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-4">
        <div className="skeleton h-8 w-56 mb-2" />
        <div className="skeleton h-4 w-40 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card p-6"><div className="skeleton h-72" /></div>
          <div className="glass-card p-6 space-y-4">
            <div className="skeleton h-5 w-32 mb-4" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#DAF1DE]">Budget Management</h1>
          <p className="text-sm text-[#8EB69B] mt-1">
            {budgets.length} budget{budgets.length !== 1 ? "s" : ""} &middot; Track your spending limits
          </p>
        </div>
        <motion.button
          onClick={handleAdd}
          className="btn-primary inline-flex items-center gap-2 text-sm shrink-0"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiPlus size={16} /> Create Budget
        </motion.button>
      </motion.div>

      {/* Overview Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="glass-card p-5 flex items-center gap-4" variants={fadeInUp}>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0d9488] to-[#10b981] flex items-center justify-center shrink-0">
            <FiDollarSign size={22} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-[#8EB69B] font-medium uppercase tracking-wider">Total Budget</p>
            <p className="text-xl font-bold text-[#DAF1DE]">
              ${overview.totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </motion.div>

        <motion.div className="glass-card p-5 flex items-center gap-4" variants={fadeInUp}>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shrink-0">
            <FiTrendingUp size={22} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-[#8EB69B] font-medium uppercase tracking-wider">Total Spent</p>
            <p className="text-xl font-bold text-[#DAF1DE]">
              ${overview.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </motion.div>

        <motion.div className="glass-card p-5 flex items-center gap-4" variants={fadeInUp}>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shrink-0">
            <FiPocket size={22} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-[#8EB69B] font-medium uppercase tracking-wider">Remaining</p>
            <p className={`text-xl font-bold ${overview.remaining >= 0 ? "text-[#10b981]" : "text-red-400"}`}>
              ${overview.remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </motion.div>

        <motion.div className="glass-card p-5 flex items-center gap-4" variants={fadeInUp}>
          <div className="w-12 h-12 rounded-full bg-[#163832]/80 flex items-center justify-center shrink-0">
            <CircularProgress percent={overview.percentUsed} size={40} strokeWidth={4} />
          </div>
          <div>
            <p className="text-xs text-[#8EB69B] font-medium uppercase tracking-wider">% Used</p>
            <p className={`text-xl font-bold ${overview.percentUsed > 90 ? "text-red-400" : overview.percentUsed > 70 ? "text-[#f59e0b]" : "text-[#10b981]"}`}>
              {overview.percentUsed}%
            </p>
          </div>
        </motion.div>
      </motion.div>

      {budgetList.length === 0 ? (
        <EmptyState onAdd={handleAdd} />
      ) : (
        <>
          {/* Budget Chart */}
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-base font-bold text-[#DAF1DE] mb-1">Budget vs Actual</h3>
            <p className="text-xs text-[#8EB69B] mb-4">Comparison by category</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(142,182,155,0.06)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#8EB69B", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#8EB69B", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip content={CustomBarTooltip} cursor={{ fill: "rgba(142,182,155,0.05)" }} />
                  <Legend
                    verticalAlign="top"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-[#8EB69B]">{value}</span>}
                  />
                  <Bar dataKey="budget" name="Budget" fill="#0d9488" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="spent" name="Spent" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Budget Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {budgetList.map((budget) => {
              const catName = getCategoryName(budget.categoryName || budget.category);
              const bAmount = Math.abs(budget.amount);
              const bSpent = Math.abs(budget.spent || 0);
              const pct = bAmount > 0 ? Math.min(200, Math.round((bSpent / bAmount) * 100)) : 0;
              const isOver = pct > 100;
              const pctColor = pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#10b981";

              return (
                <motion.div
                  key={budget._id || budget.id}
                  className="glass-card p-5 relative overflow-hidden group"
                  variants={fadeInUp}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                >
                  {isOver && (
                    <motion.div
                      className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-[10px] font-semibold text-red-400 flex items-center gap-1"
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <FiAlertTriangle size={10} />
                      Over budget
                    </motion.div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-[#DAF1DE]">{catName}</h4>
                    <span className="text-xs text-[#8EB69B] capitalize">{budget.period || "monthly"}</span>
                  </div>

                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <p className="text-2xl font-bold text-[#DAF1DE]">
                        ${bSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-[#8EB69B]">
                        of ${bAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{ color: pctColor }}
                    >
                      {pct > 100 ? `+${pct - 100}%` : `${pct}%`}
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-[#163832]/80 overflow-hidden mb-1">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background:
                          pct > 90
                            ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                            : pct > 70
                              ? "linear-gradient(90deg, #10b981, #f59e0b)"
                              : "linear-gradient(90deg, #0d9488, #10b981)",
                      }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.min(pct, 100)}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-[#8EB69B] mb-4">
                    <span>${bSpent.toLocaleString()} spent</span>
                    <span>${bAmount.toLocaleString()} budget</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="flex-1 py-2 rounded-lg bg-[#163832]/60 text-[#8EB69B] hover:text-[#DAF1DE] hover:bg-[#163832] transition-colors text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FiEdit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(budget)}
                      className="flex-1 py-2 rounded-lg bg-[#163832]/60 text-[#8EB69B] hover:text-red-400 hover:bg-red-500/10 transition-colors text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FiTrash2 size={12} /> Delete
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </>
      )}

      <AnimatePresence>
        {modalOpen && (
          <BudgetModal
            isOpen={modalOpen}
            budget={editingBudget}
            categories={categories}
            onSave={handleSave}
            onCancel={() => {
              setModalOpen(false);
              setEditingBudget(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            budget={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
