import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiTarget,
  FiHome,
  FiGlobe,
  FiTruck,
  FiHeart,
  FiStar,
  FiDollarSign,
  FiCheckCircle,
  FiCalendar,
} from "react-icons/fi";
import { toast } from "react-toastify";
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  updateProgress,
} from "../../services/goalService";

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
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
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

const GOAL_COLORS = [
  "#10b981",
  "#0d9488",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
];

const ICON_MAP = {
  FiHome: { icon: FiHome, label: "Home" },
  FiGlobe: { icon: FiGlobe, label: "Travel" },
  FiTruck: { icon: FiTruck, label: "Car" },
  FiHeart: { icon: FiHeart, label: "Health" },
  FiStar: { icon: FiStar, label: "Custom" },
};

const QUICK_AMOUNTS = [50, 100, 500];

const defaultGoalForm = {
  name: "",
  targetAmount: "",
  deadline: "",
  icon: "FiStar",
  color: "#10b981",
};

function CircularProgressRing({ current, target, size = 100, strokeWidth = 8, color = "#10b981", animate = true }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const offset = circumference * (1 - pct / 100);

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
        initial={animate ? { strokeDashoffset: circumference } : false}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
      />
    </svg>
  );
}

function Confetti() {
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10 - Math.random() * 20,
    size: 4 + Math.random() * 6,
    color: GOAL_COLORS[i % GOAL_COLORS.length],
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1.5,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            rotate: p.rotation,
          }}
          animate={{
            y: [0, 120],
            x: [0, (Math.random() - 0.5) * 60],
            opacity: [1, 0],
            rotate: [p.rotation, p.rotation + 360],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

function GoalCardSkeleton() {
  return (
    <div className="glass-card p-5">
      <div className="flex gap-4">
        <div className="skeleton w-[100px] h-[100px] rounded-full shrink-0" />
        <div className="flex-1">
          <div className="skeleton h-4 w-28 mb-2" />
          <div className="skeleton h-6 w-20 mb-2" />
          <div className="skeleton h-2 w-full mb-1" />
          <div className="skeleton h-3 w-24" />
        </div>
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
        <FiTarget className="text-5xl text-[#8EB69B]/40" />
      </div>
      <h3 className="text-xl font-bold text-[#DAF1DE] mb-2">No savings goals</h3>
      <p className="text-sm text-[#8EB69B] mb-6 text-center max-w-sm">
        Set your first savings goal and start tracking your progress.
      </p>
      <button onClick={onAdd} className="btn-primary inline-flex items-center gap-2 text-sm">
        <FiPlus size={16} /> New Goal
      </button>
    </motion.div>
  );
}

function DeleteModal({ goal, onConfirm, onCancel }) {
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
            <h3 className="text-base font-bold text-[#DAF1DE]">Delete Goal</h3>
            <p className="text-xs text-[#8EB69B]">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-[#8EB69B] mb-6">
          Are you sure you want to delete &quot;{goal?.name}&quot;? All progress will be lost.
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

function AddFundsModal({ isOpen, goal, onSave, onCancel }) {
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      setSaving(true);
      await updateProgress(goal._id || goal.id, parseFloat(amount));
      toast.success(`Added $${parseFloat(amount).toFixed(2)} to "${goal.name}"`);
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add funds");
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
        className="relative w-full max-w-sm glass-card p-6 shadow-2xl"
        variants={modalContent}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#DAF1DE]">Add Funds</h3>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg bg-[#163832]/60 flex items-center justify-center text-[#8EB69B] hover:text-[#DAF1DE] hover:bg-[#163832] transition-colors cursor-pointer"
          >
            <FiX size={16} />
          </button>
        </div>
        <p className="text-xs text-[#8EB69B] mb-4">
          Adding to &quot;{goal?.name}&quot; ({goal ? `$${goal.currentAmount || 0} of $${goal.targetAmount || 0}` : ""})
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#8EB69B] mb-1.5 block">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8EB69B] text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field !pl-7"
                placeholder="0.00"
                required
                autoFocus
              />
            </div>
          </div>
          <div className="flex gap-2">
            {QUICK_AMOUNTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(q.toString())}
                className="flex-1 py-2 rounded-lg bg-[#163832]/60 text-[#8EB69B] hover:text-[#DAF1DE] hover:bg-[#163832] transition-colors text-sm font-medium cursor-pointer"
              >
                +${q}
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onCancel} className="btn-ghost flex-1 !py-2 text-sm">Cancel</button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 !py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Add Funds"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function GoalModal({ isOpen, goal, onSave, onCancel }) {
  const [form, setForm] = useState(defaultGoalForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (goal) {
      setForm({
        name: goal.name || "",
        targetAmount: goal.targetAmount?.toString() || "",
        deadline: goal.deadline ? new Date(goal.deadline).toISOString().split("T")[0] : "",
        icon: goal.icon || "FiStar",
        color: goal.color || "#10b981",
      });
    } else {
      setForm(defaultGoalForm);
    }
  }, [goal, isOpen]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.targetAmount) {
      toast.error("Please fill in name and target amount");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: form.name,
        targetAmount: parseFloat(form.targetAmount),
        deadline: form.deadline || undefined,
        icon: form.icon,
        color: form.color,
      };

      if (goal?._id || goal?.id) {
        await updateGoal(goal._id || goal.id, payload);
        toast.success("Goal updated successfully");
      } else {
        await createGoal(payload);
        toast.success("Goal created successfully");
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to save goal");
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
            {goal ? "Edit Goal" : "New Goal"}
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
            <label className="text-xs font-medium text-[#8EB69B] mb-1.5 block">Goal Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="input-field"
              placeholder="e.g. Emergency Fund"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#8EB69B] mb-1.5 block">Target Amount *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8EB69B] text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.targetAmount}
                  onChange={(e) => handleChange("targetAmount", e.target.value)}
                  className="input-field !pl-7"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[#8EB69B] mb-1.5 block">Deadline</label>
              <div className="relative">
                <FiCalendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8EB69B]" />
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => handleChange("deadline", e.target.value)}
                  className="input-field !pl-9"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#8EB69B] mb-1.5 block">Icon</label>
            <div className="flex gap-3">
              {Object.entries(ICON_MAP).map(([key, { icon: Icon, label }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleChange("icon", key)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    form.icon === key
                      ? "bg-gradient-to-br from-[#0d9488] to-[#10b981] text-white shadow-lg"
                      : "bg-[#163832]/60 text-[#8EB69B] hover:text-[#DAF1DE] border border-[#8EB69B]/10"
                  }`}
                  title={label}
                >
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#8EB69B] mb-1.5 block">Color</label>
            <div className="flex gap-3">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleChange("color", c)}
                  className={`w-8 h-8 rounded-full transition-all cursor-pointer ${
                    form.color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#0B2B26] scale-110" : ""
                  }`}
                  style={{ background: c }}
                />
              ))}
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
                  {goal ? "Update" : "Create"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [fundsTarget, setFundsTarget] = useState(null);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getGoals();
      setGoals(Array.isArray(data) ? data : data?.goals || []);
    } catch (err) {
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleAdd = () => {
    setEditingGoal(null);
    setModalOpen(true);
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteGoal(deleteTarget._id || deleteTarget.id);
      toast.success("Goal deleted");
      setDeleteTarget(null);
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete goal");
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    setEditingGoal(null);
    fetchGoals();
  };

  const handleFundsSave = () => {
    setFundsTarget(null);
    fetchGoals();
  };

  const getGoalIcon = (iconKey) => {
    const entry = ICON_MAP[iconKey];
    return entry ? entry.icon : FiStar;
  };

  const getDaysLeft = (deadline) => {
    if (!deadline) return null;
    const now = new Date();
    const end = new Date(deadline);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-4">
        <div className="skeleton h-8 w-48 mb-2" />
        <div className="skeleton h-4 w-40 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <GoalCardSkeleton key={i} />
          ))}
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
          <h1 className="text-2xl md:text-3xl font-bold text-[#DAF1DE]">Savings Goals</h1>
          <p className="text-sm text-[#8EB69B] mt-1">
            {goals.length} goal{goals.length !== 1 ? "s" : ""} &middot; Track your savings targets
          </p>
        </div>
        <motion.button
          onClick={handleAdd}
          className="btn-primary inline-flex items-center gap-2 text-sm shrink-0"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiPlus size={16} /> New Goal
        </motion.button>
      </motion.div>

      {goals.length === 0 ? (
        <EmptyState onAdd={handleAdd} />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {goals.map((goal) => {
            const current = Math.abs(goal.currentAmount || 0);
            const target = Math.abs(goal.targetAmount || 1);
            const pct = Math.min(100, Math.round((current / target) * 100));
            const isCompleted = current >= target;
            const daysLeft = getDaysLeft(goal.deadline);
            const GoalIcon = getGoalIcon(goal.icon);
            const accentColor = goal.color || "#10b981";

            return (
              <motion.div
                key={goal._id || goal.id}
                className="glass-card p-5 relative overflow-hidden group"
                variants={fadeInUp}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                {isCompleted && <Confetti />}

                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ background: accentColor }}
                />

                <div className="flex items-start justify-between mb-4 pl-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${accentColor}20`,
                        color: accentColor,
                      }}
                    >
                      <GoalIcon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#DAF1DE]">{goal.name}</h4>
                      {daysLeft !== null && !isCompleted && (
                        <p className="text-[10px] text-[#8EB69B] flex items-center gap-1 mt-0.5">
                          <FiCalendar size={9} />
                          {daysLeft > 0 ? `${daysLeft} days left` : "Past deadline"}
                        </p>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.5 rounded-full mt-0.5">
                          <FiCheckCircle size={9} /> Completed
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-[#8EB69B] hover:text-[#DAF1DE] hover:bg-[#163832]/80 transition-colors cursor-pointer"
                    >
                      <FiEdit2 size={12} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(goal)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-[#8EB69B] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-5 pl-4">
                  <div className="shrink-0">
                    <CircularProgressRing
                      current={current}
                      target={target}
                      color={accentColor}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-2xl font-bold text-[#DAF1DE] tabular-nums">
                      ${current.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-[#8EB69B]">
                      of ${target.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <div className="w-full h-2 rounded-full bg-[#163832]/80 overflow-hidden mt-2">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: isCompleted
                            ? "linear-gradient(90deg, #0d9488, #10b981)"
                            : `linear-gradient(90deg, ${accentColor}cc, ${accentColor})`,
                        }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs font-semibold" style={{ color: accentColor }}>
                        {pct}%
                      </span>
                      {!isCompleted && (
                        <button
                          onClick={() => setFundsTarget(goal)}
                          className="text-[10px] font-medium text-[#10b981] hover:text-[#0d9488] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <FiDollarSign size={10} /> Add Funds
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <GoalModal
            isOpen={modalOpen}
            goal={editingGoal}
            onSave={handleSave}
            onCancel={() => {
              setModalOpen(false);
              setEditingGoal(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            goal={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {fundsTarget && (
          <AddFundsModal
            isOpen={!!fundsTarget}
            goal={fundsTarget}
            onSave={handleFundsSave}
            onCancel={() => setFundsTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
