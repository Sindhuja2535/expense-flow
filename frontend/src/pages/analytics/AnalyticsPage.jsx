import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { FiCalendar, FiTrendingUp, FiPieChart } from "react-icons/fi";
import {
  LineChart,
  Line,
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
} from "recharts";
import { getDashboard } from "../../services/dashboardService";
import { getExpenses } from "../../services/expenseService";
import { getIncomes } from "../../services/incomeService";
import { getBudgetProgress } from "../../services/budgetService";

const COLORS = ["#10b981", "#0d9488", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4"];

const DATE_RANGES = [
  { label: "This Month", value: "1m" },
  { label: "Last 3 Months", value: "3m" },
  { label: "Last 6 Months", value: "6m" },
  { label: "This Year", value: "1y" },
  { label: "Custom", value: "custom" },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function ChartSkeleton({ height = "h-72" }) {
  return (
    <div className="glass-card p-6">
      <div className="skeleton h-5 w-40 mb-6" />
      <div className={`${height} skeleton rounded-xl`} />
    </div>
  );
}

function CustomLineTooltip({ active, payload, label }) {
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
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.fill || entry.color }} />
          <span className="text-[#8EB69B]">{entry.name}:</span>
          <span className="text-[#DAF1DE] font-semibold">${Number(entry.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function CustomRadarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card !rounded-xl p-3 shadow-2xl border border-[#8EB69B]/20">
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

function SpendingHeatMap({ data }) {
  const weeks = Array.isArray(data) && data.length ? data : [];

  const maxVal = Math.max(1, ...weeks.flat());

  const getColor = (val) => {
    if (val === 0) return "rgba(142,182,155,0.03)";
    const intensity = val / maxVal;
    if (intensity < 0.3) return `rgba(16,185,129,${0.15 + intensity * 0.5})`;
    if (intensity < 0.6) return `rgba(245,158,11,${0.15 + intensity * 0.5})`;
    return `rgba(239,68,68,${0.15 + intensity * 0.6})`;
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-base font-bold text-[#DAF1DE] mb-1">Spending Heat Map</h3>
      <p className="text-xs text-[#8EB69B] mb-4">Weekly spending intensity</p>
      {weeks.length === 0 ? (
        <p className="text-sm text-[#8EB69B]/70 py-8 text-center">
          No expense data yet. Add some expenses to see your spending heat map.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <div className="inline-block min-w-[300px]">
            <div className="grid grid-cols-7 gap-1.5 mb-1.5">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-[10px] text-[#8EB69B]/60 text-center font-medium">{d}</div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1.5 mb-1.5">
                {week.map((val, di) => (
                  <motion.div
                    key={`${wi}-${di}`}
                    className="aspect-square rounded-md flex items-center justify-center text-[9px] font-medium cursor-default"
                    style={{ background: getColor(val) }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (wi * 7 + di) * 0.015, duration: 0.3 }}
                    whileHover={{ scale: 1.3, zIndex: 10 }}
                  >
                    <span className={`${val > 0 ? "text-[#DAF1DE]/80" : "text-transparent"}`}>
                      {val > 0 ? `$${val}` : ""}
                    </span>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TopCategories({ data }) {
  const categories = Array.isArray(data) && data.length ? data : [];

  const total = categories.reduce((s, c) => s + c.amount, 0) || 1;

  return (
    <div className="glass-card p-6">
      <h3 className="text-base font-bold text-[#DAF1DE] mb-1">Top Categories</h3>
      <p className="text-xs text-[#8EB69B] mb-4">Spending breakdown</p>
      {categories.length === 0 ? (
        <p className="text-sm text-[#8EB69B]/70 py-8 text-center">
          No expense data yet.
        </p>
      ) : (
      <div className="space-y-4">
        {categories.map((cat, i) => {
          const pct = ((cat.amount / total) * 100).toFixed(1);
          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                  <span className="text-xs text-[#DAF1DE]">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#8EB69B]">${cat.amount.toLocaleString()}</span>
                  <span className="text-[10px] font-semibold text-[#DAF1DE] min-w-[36px] text-right">{pct}%</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-[#163832]/80 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: cat.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1 * i, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
      )}
    </div>
  );
}

function BudgetAnalysisCards({ data }) {
  const budgets = Array.isArray(data) && data.length ? data : [];

  return (
    <div className="glass-card p-6">
      <h3 className="text-base font-bold text-[#DAF1DE] mb-1">Budget Analysis</h3>
      <p className="text-xs text-[#8EB69B] mb-4">Category vs budget comparison</p>
      {budgets.length === 0 ? (
        <p className="text-sm text-[#8EB69B]/70 py-8 text-center">
          No budgets set yet. Create a budget to see analysis here.
        </p>
      ) : (
      <div className="space-y-3">
        {budgets.map((b, i) => {
          const pct = b.budget > 0 ? Math.round((b.spent / b.budget) * 100) : 0;
          const isOver = pct > 100;
          return (
            <motion.div
              key={b.category}
              className="p-3.5 rounded-xl bg-[#163832]/30"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#DAF1DE]">{b.category}</span>
                <span className={`text-xs font-semibold ${isOver ? "text-red-400" : "text-[#10b981]"}`}>
                  {pct}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#163832]/80 overflow-hidden mb-1.5">
                <motion.div
                  className={`h-full rounded-full ${isOver ? "bg-gradient-to-r from-red-500 to-red-400" : "bg-gradient-to-r from-[#0d9488] to-[#10b981]"}`}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.min(pct, 100)}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1 * i }}
                />
              </div>
              <div className="flex justify-between text-xs text-[#8EB69B]">
                <span>${b.spent.toLocaleString()} spent</span>
                <span>${b.budget.toLocaleString()} budget</span>
              </div>
            </motion.div>
          );
        })}
      </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [budgetProgress, setBudgetProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("6m");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      try {
        setLoading(true);
        const [dash, exp, inc, bgt] = await Promise.all([
          getDashboard(),
          getExpenses().catch(() => []),
          getIncomes().catch(() => []),
          getBudgetProgress().catch(() => []),
        ]);
        if (!cancelled) {
          setData(dash);
          setExpenses(exp);
          setIncomes(inc);
          setBudgetProgress(bgt);
        }
      } catch (err) {
        if (!cancelled) console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  }, []);

  const monthlyTrend = data?.chartData || [];

  const categoryBreakdown = data?.expenseBreakdown || [];

  const dailySpending = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const buckets = days.map((day) => ({ day, income: 0, expense: 0 }));
    const idx = (d) => (d.getDay() + 6) % 7;
    expenses.forEach((e) => {
      if (!e.date) return;
      const d = new Date(e.date);
      if (isNaN(d.getTime())) return;
      buckets[idx(d)].expense += Math.abs(Number(e.amount) || 0);
    });
    incomes.forEach((i) => {
      if (!i.date) return;
      const d = new Date(i.date);
      if (isNaN(d.getTime())) return;
      buckets[idx(d)].income += Math.abs(Number(i.amount) || 0);
    });
    return buckets;
  }, [expenses, incomes]);

  const radarData = useMemo(() => {
    const map = {};
    categoryBreakdown.forEach((c) => {
      map[c.name] = { category: c.name, income: 0, expense: Number(c.value) || 0 };
    });
    incomes.forEach((i) => {
      const name = i.source || i.categoryName || "Other";
      if (!map[name]) map[name] = { category: name, income: 0, expense: 0 };
      map[name].income += Math.abs(Number(i.amount) || 0);
    });
    return Object.values(map);
  }, [categoryBreakdown, incomes]);

  const netSavings = monthlyTrend.map((m) => ({
    name: m.name,
    savings: (m.income || 0) - (m.expense || 0),
  }));

  const topCategories = categoryBreakdown.map((c, i) => ({
    name: c.name,
    amount: c.value,
    color: COLORS[i % COLORS.length],
  }));

  const heatMapData = useMemo(() => {
    const byWeek = {};
    expenses.forEach((e) => {
      if (!e.date) return;
      const d = new Date(e.date);
      if (isNaN(d.getTime())) return;
      const start = new Date(d.getFullYear(), 0, 1);
      const week = Math.floor((d - start) / (7 * 24 * 3600 * 1000)) + 1;
      if (!byWeek[week]) byWeek[week] = [0, 0, 0, 0, 0, 0, 0];
      byWeek[week][d.getDay()] += Math.abs(Number(e.amount) || 0);
    });
    return Object.keys(byWeek)
      .map(Number)
      .sort((a, b) => a - b)
      .slice(-6)
      .map((w) => byWeek[w]);
  }, [expenses]);

  const budgetData = useMemo(
    () =>
      budgetProgress.map((b) => ({
        category: b.categoryName || "Overall",
        budget: Number(b.amount) || 0,
        spent: Number(b.spent) || 0,
      })),
    [budgetProgress]
  );

  if (loading) {
    return (
      <div className="space-y-6 pb-4">
        <div className="skeleton h-8 w-48 mb-2" />
        <div className="skeleton h-4 w-72 mb-6" />
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-8 w-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton height="h-64" />
          <ChartSkeleton height="h-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton />
          <ChartSkeleton />
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
          <h1 className="text-2xl md:text-3xl font-bold text-[#DAF1DE]">Analytics</h1>
          <p className="text-sm text-[#8EB69B] mt-1">Comprehensive financial insights</p>
        </div>
      </motion.div>

      <motion.div
        className="flex flex-wrap gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {DATE_RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setDateRange(r.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              dateRange === r.value
                ? "bg-gradient-to-r from-[#0d9488] to-[#10b981] text-white shadow-lg"
                : "bg-[#163832]/60 text-[#8EB69B] hover:text-[#DAF1DE] border border-[#8EB69B]/10"
            }`}
          >
            {r.label}
          </button>
        ))}
        {dateRange === "custom" && (
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="input-field !py-1.5 !px-3 text-sm !w-[140px]"
            />
            <span className="text-[#8EB69B] text-xs">to</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="input-field !py-1.5 !px-3 text-sm !w-[140px]"
            />
          </div>
        )}
      </motion.div>

      {/* Row 1: Monthly Trend + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-base font-bold text-[#DAF1DE] mb-1">Monthly Trend</h3>
          <p className="text-xs text-[#8EB69B] mb-4">Income vs expense over time</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
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
                <Tooltip content={<CustomLineTooltip />} />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#051F20", fill: "#10b981" }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  name="Expense"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#051F20", fill: "#ef4444" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-base font-bold text-[#DAF1DE] mb-1">Category Breakdown</h3>
          <p className="text-xs text-[#8EB69B] mb-4">Expense distribution</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  animationBegin={200}
                  animationDuration={1200}
                >
                  {categoryBreakdown.map((_, i) => (
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

      {/* Row 2: Daily Spending + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-base font-bold text-[#DAF1DE] mb-1">Daily Spending</h3>
          <p className="text-xs text-[#8EB69B] mb-4">Income vs expense by day</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySpending} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="expenseBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity={0.6} />
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
                  dataKey="income"
                  name="Income"
                  fill="url(#incomeBarGrad)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={24}
                />
                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="url(#expenseBarGrad)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-base font-bold text-[#DAF1DE] mb-1">Income vs Expense Comparison</h3>
          <p className="text-xs text-[#8EB69B] mb-4">Multi-category radar view</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                <PolarGrid stroke="rgba(142,182,155,0.1)" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fill: "#8EB69B", fontSize: 10 }}
                />
                <PolarRadiusAxis
                  tick={{ fill: "#8EB69B", fontSize: 9 }}
                  angle={30}
                  domain={[0, "auto"]}
                />
                <Tooltip content={<CustomRadarTooltip />} />
                <Radar
                  name="Income"
                  dataKey="income"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Radar
                  name="Expense"
                  dataKey="expense"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Row 3: Heat Map + Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SpendingHeatMap data={heatMapData} />
        <TopCategories data={topCategories} />
      </div>

      {/* Row 4: Net Savings Area + Budget Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-base font-bold text-[#DAF1DE] mb-1">Financial Trends</h3>
          <p className="text-xs text-[#8EB69B] mb-4">Monthly net savings over time</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netSavings} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="netSavingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                <Tooltip content={<CustomLineTooltip />} />
                <Area
                  type="monotone"
                  dataKey="savings"
                  name="Net Savings"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#netSavingsGrad)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#051F20", fill: "#10b981" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <BudgetAnalysisCards data={budgetData} />
      </div>
    </div>
  );
}
