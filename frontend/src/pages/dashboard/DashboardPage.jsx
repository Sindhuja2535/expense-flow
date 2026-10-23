import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "../../utils/CountUpWrapper";
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiPocket,
  FiArrowUp,
  FiArrowDown,
  FiPlus,
  FiTarget,
  FiArrowRight,
  FiRefreshCw,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { getDashboard } from "../../services/dashboardService";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const COLORS = ["#10b981", "#0d9488", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4"];

function StatCardSkeleton() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="skeleton h-4 w-24 mb-3" />
          <div className="skeleton h-8 w-32 mb-2" />
          <div className="skeleton h-3 w-20" />
        </div>
        <div className="skeleton w-12 h-12 rounded-full" />
      </div>
    </div>
  );
}

function ChartSkeleton({ height = "h-72" }) {
  return (
    <div className="glass-card p-6">
      <div className="skeleton h-5 w-40 mb-6" />
      <div className={`${height} skeleton rounded-xl`} />
    </div>
  );
}

function TransactionSkeleton() {
  return (
    <div className="glass-card p-6">
      <div className="skeleton h-5 w-40 mb-6" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-[#8EB69B]/5 last:border-0">
          <div className="skeleton w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1">
            <div className="skeleton h-4 w-32 mb-1.5" />
            <div className="skeleton h-3 w-20" />
          </div>
          <div className="skeleton h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

function CustomAreaTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card !rounded-xl p-4 shadow-2xl border border-[#8EB69B]/20">
      <p className="text-xs text-[#8EB69B] mb-2 font-medium">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-[#8EB69B]">{entry.name}:</span>
          <span className="text-[#DAF1DE] font-semibold">${Number(entry.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function CustomPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card !rounded-xl p-3 shadow-2xl border border-[#8EB69B]/20">
      <p className="text-sm text-[#DAF1DE] font-semibold">{payload[0].name}</p>
      <p className="text-xs text-[#8EB69B]">${Number(payload[0].value).toLocaleString()}</p>
    </div>
  );
}

function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card !rounded-xl p-3 shadow-2xl border border-[#8EB69B]/20">
      <p className="text-xs text-[#8EB69B] mb-1 font-medium">{label}</p>
      <p className="text-sm text-[#DAF1DE] font-semibold">${Number(payload[0].value).toLocaleString()}</p>
    </div>
  );
}

const CATEGORY_ICONS = {
  Food: "🍔",
  Transport: "🚗",
  Shopping: "🛍️",
  Bills: "📄",
  Entertainment: "🎬",
  Health: "💊",
  Education: "📚",
  Travel: "✈️",
  Salary: "💰",
  Freelance: "💻",
  Investment: "📈",
  Other: "📌",
};

function getCategoryIcon(category) {
  if (!category) return "📌";
  const name = typeof category === "string" ? category : category.name;
  return CATEGORY_ICONS[name] || "📌";
}

function EmptyState() {
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
      <h3 className="text-xl font-bold text-[#DAF1DE] mb-2">No data yet</h3>
      <p className="text-sm text-[#8EB69B] mb-6 text-center max-w-sm">
        Start tracking your finances by adding your first income or expense.
      </p>
      <div className="flex gap-3">
        <Link
          to="/dashboard/expenses"
          className="btn-primary inline-flex items-center gap-2 !py-2.5 !px-5 text-sm"
        >
          <FiPlus size={16} /> Add Expense
        </Link>
        <Link
          to="/dashboard/income"
          className="btn-ghost inline-flex items-center gap-2 !py-2.5 !px-5 text-sm"
        >
          <FiPlus size={16} /> Add Income
        </Link>
      </div>
    </motion.div>
  );
}

const QUICK_ACTIONS = [
  { label: "Add Expense", icon: FiTrendingDown, to: "/dashboard/expenses", gradient: "from-red-500/20 to-red-600/20", iconColor: "text-red-400" },
  { label: "Add Income", icon: FiTrendingUp, to: "/dashboard/income", gradient: "from-blue-500/20 to-blue-600/20", iconColor: "text-blue-400" },
  { label: "Set Budget", icon: FiPocket, to: "/dashboard/budget", gradient: "from-purple-500/20 to-purple-600/20", iconColor: "text-purple-400" },
  { label: "New Goal", icon: FiTarget, to: "/dashboard/goals", gradient: "from-amber-500/20 to-amber-600/20", iconColor: "text-amber-400" },
];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await getDashboard();
        if (!cancelled) {
          setData(res);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load dashboard");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchDashboard();
    return () => { cancelled = true; };
  }, []);

  const stats = data?.stats || {
    totalBalance: 0,
    balanceChange: null,
    monthlyIncome: 0,
    incomeChange: null,
    monthlyExpense: 0,
    expenseChange: null,
    savings: 0,
    savingsChange: null,
  };

  const chartData = data?.chartData || [];
  const pieData = data?.expenseBreakdown || [];
  const transactions = data?.recentTransactions || [];
  const weeklySpending = data?.weeklySpending || [];
  const savingsGoal = data?.savingsGoal || { current: 0, target: 1, name: "" };
  const topCategories = data?.topCategories || [];

  const isEmpty = !loading && data && !data.hasAnyData;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48 mb-2" />
        <div className="skeleton h-4 w-72 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ChartSkeleton />
          </div>
          <ChartSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <TransactionSkeleton />
          </div>
          <ChartSkeleton height="h-64" />
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return <EmptyState />;
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-red-400 text-sm mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="btn-ghost inline-flex items-center gap-2 text-sm"
        >
          <FiRefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Balance",
      value: stats.totalBalance,
      prefix: "$",
      change: stats.balanceChange,
      icon: FiDollarSign,
      bg: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/20",
      iconBg: "bg-gradient-to-br from-[#0d9488] to-[#10b981]",
      iconColor: "text-white",
    },
    {
      label: "Monthly Income",
      value: stats.monthlyIncome,
      prefix: "$",
      change: stats.incomeChange,
      icon: FiTrendingUp,
      bg: "bg-gradient-to-br from-blue-500/20 to-blue-600/20",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
      iconColor: "text-white",
    },
    {
      label: "Monthly Expense",
      value: stats.monthlyExpense,
      prefix: "$",
      change: stats.expenseChange,
      icon: FiTrendingDown,
      bg: "bg-gradient-to-br from-red-500/20 to-red-600/20",
      iconBg: "bg-gradient-to-br from-red-500 to-red-600",
      iconColor: "text-white",
    },
    {
      label: "Savings",
      value: stats.savings,
      prefix: "$",
      change: stats.savingsChange,
      icon: FiPocket,
      bg: "bg-gradient-to-br from-purple-500/20 to-purple-600/20",
      iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
      iconColor: "text-white",
    },
  ];

  const savingsPercent = Math.min(
    100,
    Math.round((savingsGoal.current / savingsGoal.target) * 100)
  );

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-[#DAF1DE]">
          Dashboard
        </h1>
        <p className="text-sm text-[#8EB69B] mt-1">
          Welcome back. Here&apos;s your financial overview.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          const isPositive = card.change >= 0;
          return (
            <motion.div
              key={card.label}
              className="glass-card p-5 relative overflow-hidden group cursor-default"
              variants={fadeInUp}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full ${card.bg} blur-2xl -translate-y-8 translate-x-8 opacity-60 group-hover:opacity-100 transition-opacity`} />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-[#8EB69B] uppercase tracking-wider mb-1">
                    {card.label}
                  </p>
                  <div className="text-2xl font-bold text-[#DAF1DE] mb-1">
                    {card.prefix}
                    <CountUp
                      end={card.value}
                      duration={1.8}
                      separator=","
                      decimals={0}
                      decimal="."
                    />
                  </div>
                  {card.change != null && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                      isPositive && card.label !== "Monthly Expense"
                        ? "text-[#10b981]"
                        : card.label === "Monthly Expense"
                          ? isPositive ? "text-[#10b981]" : "text-red-400"
                          : "text-red-400"
                    }`}>
                      {isPositive ? (
                        <FiArrowUp size={12} />
                      ) : (
                        <FiArrowDown size={12} />
                      )}
                      <span>{Math.abs(card.change)}%</span>
                      <span className="text-[#8EB69B]/60 ml-0.5">vs last month</span>
                    </div>
                  )}
                </div>
                <div className={`w-11 h-11 rounded-full ${card.iconBg} flex items-center justify-center shrink-0 shadow-lg`}>
                  <Icon size={20} className={card.iconColor} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Second Row: Income vs Expense + Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <motion.div
          className="lg:col-span-2 glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#DAF1DE]">Income vs Expense</h3>
              <p className="text-xs text-[#8EB69B] mt-0.5">Last 6 months overview</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                <span className="text-[#8EB69B]">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                <span className="text-[#8EB69B]">Expense</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomAreaTooltip />} />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#incomeGrad)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#051F20", fill: "#10b981" }}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Expense"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fill="url(#expenseGrad)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#051F20", fill: "#ef4444" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-base font-bold text-[#DAF1DE] mb-1">Expense Breakdown</h3>
          <p className="text-xs text-[#8EB69B] mb-4">By category</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-[#8EB69B] ml-1">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Third Row: Recent Transactions + Weekly Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Transactions */}
        <motion.div
          className="lg:col-span-2 glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-[#DAF1DE]">Recent Transactions</h3>
            <Link
              to="/dashboard/expenses"
              className="text-xs text-[#10b981] hover:text-[#0d9488] transition-colors font-medium flex items-center gap-1"
            >
              View all <FiArrowRight size={12} />
            </Link>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-0"
          >
            {transactions.slice(0, 10).map((tx) => {
              const isExpense = tx.amount < 0;
              return (
                <motion.div
                  key={`${tx.type}-${tx.id}`}
                  className="flex items-center gap-3 py-3 border-b border-[#8EB69B]/5 last:border-0 hover:bg-[#163832]/30 -mx-3 px-3 rounded-lg transition-colors"
                  variants={fadeInUp}
                >
                  <div className="w-9 h-9 rounded-full bg-[#163832]/80 flex items-center justify-center text-sm shrink-0">
                    {getCategoryIcon(tx.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#DAF1DE] truncate">
                      {tx.description}
                    </p>
                    <p className="text-xs text-[#8EB69B]">
                      {tx.category ? (typeof tx.category === "string" ? tx.category : tx.category.name) : "Uncategorized"} &middot; {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums shrink-0 ${
                    isExpense ? "text-red-400" : "text-[#10b981]"
                  }`}>
                    {isExpense ? "-" : "+"}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Weekly Spending Bar Chart */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-base font-bold text-[#DAF1DE] mb-1">Weekly Spending</h3>
          <p className="text-xs text-[#8EB69B] mb-4">This week</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySpending} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(142,182,155,0.06)" vertical={false} />
                <XAxis
                  dataKey="day"
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
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(142,182,155,0.05)" }} />
                <Bar
                  dataKey="amount"
                  fill="url(#barGrad)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Fourth Row: Savings Goal + Upcoming Bills + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Savings Goal */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-base font-bold text-[#DAF1DE] mb-1">Savings Rate</h3>
          <p className="text-xs text-[#8EB69B] mb-5">{savingsGoal.name}</p>

          <div className="flex items-center justify-center mb-5">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="rgba(142,182,155,0.1)"
                  strokeWidth="10"
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="url(#savingsGrad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                  whileInView={{
                    strokeDashoffset: 2 * Math.PI * 52 * (1 - savingsPercent / 100),
                  }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                />
                <defs>
                  <linearGradient id="savingsGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0d9488" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-[#DAF1DE]">{savingsPercent}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#8EB69B]">Current</span>
              <span className="text-[#DAF1DE] font-semibold">
                ${savingsGoal.current.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#8EB69B]">Target</span>
              <span className="text-[#DAF1DE] font-semibold">
                ${savingsGoal.target.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#163832]/80 mt-1">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#0d9488] to-[#10b981]"
                initial={{ width: 0 }}
                whileInView={{ width: `${savingsPercent}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Top Categories */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          <h3 className="text-base font-bold text-[#DAF1DE] mb-1">Top Categories</h3>
          <p className="text-xs text-[#8EB69B] mb-4">Biggest expense areas</p>
          {topCategories.length === 0 ? (
            <p className="text-sm text-[#8EB69B]/70 py-8 text-center">
              No expenses yet. Add one to see a breakdown here.
            </p>
          ) : (
            <div className="space-y-3">
              {topCategories.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#163832]/30 hover:bg-[#163832]/50 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-[#8EB69B]/10"
                    style={{ color: COLORS[i % COLORS.length] }}
                  >
                    <span className="text-base">{getCategoryIcon(cat.name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#DAF1DE] truncate">{cat.name}</p>
                    <div className="w-full h-1 rounded-full bg-[#163832]/80 mt-1.5">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round((cat.value / Math.max(topCategories[0].value, 1)) * 100))}%`,
                          background: COLORS[i % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[#DAF1DE] tabular-nums shrink-0">
                    ${cat.value.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.16 }}
        >
          <h3 className="text-base font-bold text-[#DAF1DE] mb-1">Quick Actions</h3>
          <p className="text-xs text-[#8EB69B] mb-4">Shortcuts</p>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  to={action.to}
                  className={`flex flex-col items-center gap-2.5 p-4 rounded-xl bg-gradient-to-br ${action.gradient} border border-[#8EB69B]/10 hover:border-[#8EB69B]/25 transition-all duration-300 group hover:-translate-y-0.5`}
                >
                  <div className={`w-10 h-10 rounded-full bg-[#051F20]/60 flex items-center justify-center ${action.iconColor} group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-xs font-medium text-[#DAF1DE]">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
