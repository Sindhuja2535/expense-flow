import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCalendar,
  FiFilter,
  FiGrid,
  FiList,
  FiRepeat,
  FiDollarSign,
  FiChevronLeft,
  FiChevronRight,
  FiSliders,
} from "react-icons/fi";
import { toast } from "react-toastify";
import {
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
} from "../../services/incomeService";

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
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
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

const SOURCE_COLORS = {
  SALARY: "#10b981",
  FREELANCING: "#3b82f6",
  BUSINESS: "#f59e0b",
  INVESTMENTS: "#8b5cf6",
  OTHER: "#8EB69B",
};

const SOURCES = ["SALARY", "FREELANCING", "BUSINESS", "INVESTMENTS", "OTHER"];

const ITEMS_PER_PAGE = 8;

const defaultFormState = {
  amount: "",
  description: "",
  source: "",
  date: new Date().toISOString().split("T")[0],
  recurring: false,
};

function EmptyState({ onAdd }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-32 h-32 rounded-full bg-[#163832]/60 flex items-center justify-center mb-6 border border-[#8EB69B]/10">
        <FiDollarSign className="text-5xl text-[#8EB69B]/40" />
      </div>
      <h3 className="text-xl font-bold text-[#DAF1DE] mb-2">No income found</h3>
      <p className="text-sm text-[#8EB69B] mb-6 text-center max-w-sm">
        Start tracking by adding your first income or adjust your filters.
      </p>
      <button onClick={onAdd} className="btn-primary inline-flex items-center gap-2 text-sm">
        <FiPlus size={16} /> Add Income
      </button>
    </motion.div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-[#8EB69B]/5">
      <div className="skeleton w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1">
        <div className="skeleton h-4 w-36 mb-1.5" />
        <div className="skeleton h-3 w-20" />
      </div>
      <div className="skeleton h-3 w-20" />
      <div className="skeleton h-4 w-16" />
      <div className="flex gap-2">
        <div className="skeleton w-8 h-8 rounded-lg" />
        <div className="skeleton w-8 h-8 rounded-lg" />
      </div>
    </div>
  );
}

function DeleteModal({ income, onConfirm, onCancel }) {
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
            <h3 className="text-base font-bold text-[#DAF1DE]">Delete Income</h3>
            <p className="text-xs text-[#8EB69B]">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-[#8EB69B] mb-6">
          Are you sure you want to delete &quot;{income?.description}&quot;? This will permanently remove this income record.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="btn-ghost !py-2 !px-4 text-sm"
          >
            Cancel
          </button>
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

function IncomeModal({ isOpen, income, onSave, onCancel }) {
  const [form, setForm] = useState(defaultFormState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (income) {
      setForm({
        amount: income.amount?.toString() || "",
        description: income.description || "",
        source: income.source || "",
        date: income.date
          ? new Date(income.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        recurring: income.recurring || false,
      });
    } else {
      setForm(defaultFormState);
    }
  }, [income, isOpen]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.description || !form.source) {
      toast.error("Please fill in amount, description, and source");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        amount: parseFloat(form.amount),
        description: form.description,
        source: form.source,
        date: form.date,
        recurring: form.recurring,
      };

      if (income?._id || income?.id) {
        await updateIncome(income._id || income.id, payload);
        toast.success("Income updated successfully");
      } else {
        await createIncome(payload);
        toast.success("Income added successfully");
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to save income");
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
            {income ? "Edit Income" : "Add Income"}
          </h3>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg bg-[#163832]/60 flex items-center justify-center text-[#8EB69B] hover:text-[#DAF1DE] hover:bg-[#163832] transition-colors cursor-pointer"
          >
            <FiX size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#8EB69B] mb-1.5 block">
                Amount *
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
              <label className="text-xs font-medium text-[#8EB69B] mb-1.5 block">
                Date *
              </label>
              <div className="relative">
                <FiCalendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8EB69B]" />
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="input-field !pl-9"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#8EB69B] mb-1.5 block">
              Description *
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="input-field"
              placeholder="e.g. Monthly salary"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#8EB69B] mb-1.5 block">
              Source *
            </label>
            <select
              value={form.source}
              onChange={(e) => handleChange("source", e.target.value)}
              className="input-field appearance-none"
              required
            >
              <option value="" disabled>Select source</option>
              {SOURCES.map((src) => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleChange("recurring", !form.recurring)}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                form.recurring
                  ? "bg-gradient-to-r from-[#0d9488] to-[#10b981]"
                  : "bg-[#163832]"
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  form.recurring ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <FiRepeat size={14} className="text-[#8EB69B]" />
              <span className="text-sm text-[#8EB69B]">Recurring income</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="btn-ghost flex-1 !py-2.5 text-sm"
            >
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
                  {income ? "Update" : "Save"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function IncomePage() {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchIncomes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getIncomes();
      setIncomes(Array.isArray(data) ? data : data?.incomes || []);
    } catch (err) {
      toast.error("Failed to load incomes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  const filteredIncomes = useMemo(() => {
    let result = [...incomes];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (inc) =>
          inc.description?.toLowerCase().includes(q) ||
          inc.source?.toLowerCase().includes(q)
      );
    }

    if (sourceFilter) {
      result = result.filter((inc) => inc.source === sourceFilter);
    }

    if (dateFrom) {
      result = result.filter((inc) => new Date(inc.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      result = result.filter((inc) => new Date(inc.date) <= new Date(dateTo));
    }

    switch (sortBy) {
      case "date-desc":
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "date-asc":
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "amount-desc":
        result.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
        break;
      case "amount-asc":
        result.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
        break;
      case "source":
        result.sort((a, b) => (a.source || "").localeCompare(b.source || ""));
        break;
      default:
        break;
    }

    return result;
  }, [incomes, searchQuery, sourceFilter, dateFrom, dateTo, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredIncomes.length / ITEMS_PER_PAGE));
  const paginatedIncomes = filteredIncomes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sourceFilter, dateFrom, dateTo, sortBy]);

  const handleAdd = () => {
    setEditingIncome(null);
    setModalOpen(true);
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteIncome(deleteTarget._id || deleteTarget.id);
      toast.success("Income deleted");
      setDeleteTarget(null);
      fetchIncomes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete income");
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    setEditingIncome(null);
    fetchIncomes();
  };

  const totalAmount = filteredIncomes.reduce((sum, inc) => sum + Math.abs(inc.amount), 0);

  return (
    <div className="space-y-6 pb-4">
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#DAF1DE]">Income</h1>
          <p className="text-sm text-[#8EB69B] mt-1">
            {filteredIncomes.length} income{filteredIncomes.length !== 1 ? "s" : ""} &middot; Total: ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <motion.button
          onClick={handleAdd}
          className="btn-primary inline-flex items-center gap-2 text-sm shrink-0"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiPlus size={16} /> Add Income
        </motion.button>
      </motion.div>

      <motion.div
        className="glass-card p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8EB69B]/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field !pl-10 !py-2.5 text-sm"
              placeholder="Search income..."
            />
          </div>

          <div className="relative min-w-[160px]">
            <FiFilter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8EB69B]/60 pointer-events-none" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="input-field !pl-9 !py-2.5 text-sm appearance-none"
            >
              <option value="">All Sources</option>
              {SOURCES.map((src) => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <FiCalendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8EB69B]/60 pointer-events-none" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input-field !pl-9 !py-2.5 text-sm !w-[150px]"
                placeholder="From"
              />
            </div>
            <div className="relative">
              <FiCalendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8EB69B]/60 pointer-events-none" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input-field !pl-9 !py-2.5 text-sm !w-[150px]"
                placeholder="To"
              />
            </div>
          </div>

          <div className="relative min-w-[150px]">
            <FiSliders size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8EB69B]/60 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field !pl-9 !py-2.5 text-sm appearance-none"
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="amount-desc">Amount (High)</option>
              <option value="amount-asc">Amount (Low)</option>
              <option value="source">Source</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-[#163832]/60 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#235347] text-[#DAF1DE] shadow-sm"
                  : "text-[#8EB69B] hover:text-[#DAF1DE]"
              }`}
            >
              <FiList size={16} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#235347] text-[#DAF1DE] shadow-sm"
                  : "text-[#8EB69B] hover:text-[#DAF1DE]"
              }`}
            >
              <FiGrid size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="glass-card overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : filteredIncomes.length === 0 ? (
        <EmptyState onAdd={handleAdd} />
      ) : viewMode === "table" ? (
        <motion.div
          className="glass-card overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#8EB69B]/10 text-xs font-medium text-[#8EB69B] uppercase tracking-wider">
            <div className="col-span-4 sm:col-span-3">Source</div>
            <div className="col-span-4 sm:col-span-3">Description</div>
            <div className="col-span-2 hidden sm:block">Date</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 sm:col-span-2 text-right">Actions</div>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            {paginatedIncomes.map((inc) => {
              const srcColor = SOURCE_COLORS[inc.source] || "#8EB69B";
              return (
                <motion.div
                  key={inc._id || inc.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#8EB69B]/5 last:border-0 hover:bg-[#163832]/20 transition-colors items-center"
                  variants={fadeInUp}
                >
                  <div className="col-span-4 sm:col-span-3 flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: srcColor }}
                    />
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: `${srcColor}15`,
                        color: srcColor,
                        border: `1px solid ${srcColor}30`,
                      }}
                    >
                      {inc.source}
                    </span>
                  </div>

                  <div className="col-span-4 sm:col-span-3">
                    <p className="text-sm text-[#DAF1DE] truncate">{inc.description}</p>
                    {inc.recurring && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#10b981] mt-0.5">
                        <FiRepeat size={9} /> Recurring
                      </span>
                    )}
                  </div>

                  <div className="col-span-2 hidden sm:block">
                    <span className="text-sm text-[#8EB69B]">
                      {new Date(inc.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    <span className="text-sm font-semibold text-[#10b981] tabular-nums">
                      +${Math.abs(inc.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="col-span-2 sm:col-span-2 flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleEdit(inc)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8EB69B] hover:text-[#DAF1DE] hover:bg-[#163832]/80 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(inc)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8EB69B] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {paginatedIncomes.map((inc) => {
            const srcColor = SOURCE_COLORS[inc.source] || "#8EB69B";
            return (
              <motion.div
                key={inc._id || inc.id}
                className="glass-card p-5 group cursor-default"
                variants={fadeInUp}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: srcColor }}
                    />
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{
                        background: `${srcColor}15`,
                        color: srcColor,
                        border: `1px solid ${srcColor}30`,
                      }}
                    >
                      {inc.source}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(inc)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-[#8EB69B] hover:text-[#DAF1DE] hover:bg-[#163832]/80 transition-colors cursor-pointer"
                    >
                      <FiEdit2 size={12} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(inc)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-[#8EB69B] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-medium text-[#DAF1DE] truncate mb-1">
                  {inc.description}
                </p>
                <p className="text-xs text-[#8EB69B] mb-3">
                  {new Date(inc.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#10b981] tabular-nums">
                    +${Math.abs(inc.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {inc.recurring && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-full">
                      <FiRepeat size={9} /> Recurring
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {!loading && filteredIncomes.length > ITEMS_PER_PAGE && (
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs text-[#8EB69B]">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredIncomes.length)} of{" "}
            {filteredIncomes.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8EB69B] hover:text-[#DAF1DE] hover:bg-[#163832]/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <FiChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (totalPages <= 5) return true;
                if (p === 1 || p === totalPages) return true;
                if (Math.abs(p - currentPage) <= 1) return true;
                return false;
              })
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-[#8EB69B]/40">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors cursor-pointer ${
                      currentPage === p
                        ? "bg-gradient-to-r from-[#0d9488] to-[#10b981] text-white"
                        : "text-[#8EB69B] hover:text-[#DAF1DE] hover:bg-[#163832]/60"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8EB69B] hover:text-[#DAF1DE] hover:bg-[#163832]/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <IncomeModal
            isOpen={modalOpen}
            income={editingIncome}
            onSave={handleSave}
            onCancel={() => {
              setModalOpen(false);
              setEditingIncome(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            income={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
