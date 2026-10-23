import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getExpenses } from '../../services/expenseService';
import { getIncomes } from '../../services/incomeService';
import { getBudgetProgress } from '../../services/budgetService';
import {
  FiCalendar, FiTrendingUp, FiPieChart, FiSliders,
  FiDownload, FiMail, FiFileText, FiClock, FiCheck
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

const reportTypes = [
  {
    id: 'monthly',
    icon: FiCalendar,
    title: 'Monthly Report',
    description: 'Detailed breakdown of income and expenses for a specific month',
    color: '#0d9488'
  },
  {
    id: 'yearly',
    icon: FiTrendingUp,
    title: 'Yearly Report',
    description: 'Comprehensive annual financial overview with trends and comparisons',
    color: '#10b981'
  },
  {
    id: 'category',
    icon: FiPieChart,
    title: 'Category Report',
    description: 'Analyze spending patterns across different expense categories',
    color: '#3b82f6'
  },
  {
    id: 'custom',
    icon: FiSliders,
    title: 'Custom Report',
    description: 'Build a tailored report with your selected date range and filters',
    color: '#f59e0b'
  }
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);

const tooltipStyle = {
  contentStyle: {
    background: '#0B2B26',
    border: '1px solid #235347',
    borderRadius: '8px',
    color: '#DAF1DE',
    fontSize: '12px'
  }
};

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getExpenses().catch(() => []),
      getIncomes().catch(() => []),
      getBudgetProgress().catch(() => []),
    ])
      .then(([exp, inc, bud]) => {
        setExpenses(Array.isArray(exp) ? exp : []);
        setIncomes(Array.isArray(inc) ? inc : []);
        setBudgets(Array.isArray(bud) ? bud : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalIncome = useMemo(
    () => incomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0),
    [incomes]
  );
  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    [expenses]
  );
  const netSavings = totalIncome - totalExpenses;

  const summaryStats = [
    { label: 'Total Income', value: formatCurrency(totalIncome), change: '—', positive: true },
    { label: 'Total Expenses', value: formatCurrency(totalExpenses), change: '—', positive: false },
    { label: 'Net Savings', value: formatCurrency(netSavings), change: '—', positive: netSavings >= 0 },
    { label: 'Transactions', value: String(expenses.length + incomes.length), change: '—', positive: false },
  ];

  const categorySpend = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const name = e.category || 'Other';
      map[name] = (map[name] || 0) + (Number(e.amount) || 0);
    });
    return Object.entries(map)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const topCategories = useMemo(() => {
    const colors = ['#0d9488', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
    return budgets.slice(0, 5).map((b, i) => ({
      name: b.categoryName || 'Budget',
      amount: Number(b.spent) || 0,
      percent: Math.min(100, Math.round(Number(b.percentage) || 0)),
      color: colors[i % colors.length],
    }));
  }, [budgets]);

  const recentReports = [];

  const handleGenerate = (reportId) => {
    setIsGenerating(true);
    setActiveReport(reportId);
    setGenerated(false);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
    }, 2000);
  };

  const reportTitle = reportTypes.find((r) => r.id === activeReport)?.title || '';

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: '#051F20' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#DAF1DE' }}>
            Reports & Exports
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#8EB69B' }}>
            Generate, preview, and download your financial reports
          </p>
        </motion.div>

        {/* Report Types Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {reportTypes.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-5 flex flex-col"
              style={{
                background: 'rgba(11, 43, 38, 0.4)',
                border: activeReport === report.id
                  ? `1px solid ${report.color}`
                  : '1px solid rgba(35, 83, 71, 0.4)'
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${report.color}20` }}
              >
                <report.icon size={22} color={report.color} />
              </div>
              <h3 className="font-semibold mb-1" style={{ color: '#DAF1DE' }}>
                {report.title}
              </h3>
              <p className="text-xs mb-4 flex-1" style={{ color: '#8EB69B' }}>
                {report.description}
              </p>
              <button
                onClick={() => handleGenerate(report.id)}
                disabled={isGenerating}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{
                  background: activeReport === report.id && generated
                    ? report.color
                    : 'rgba(35, 83, 71, 0.5)',
                  color: '#DAF1DE',
                  border: '1px solid rgba(35, 83, 71, 0.6)'
                }}
              >
                {isGenerating && activeReport === report.id ? (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    Generating...
                  </motion.span>
                ) : generated && activeReport === report.id ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <FiCheck size={14} /> Generated
                  </span>
                ) : (
                  'Generate'
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Report Preview Area */}
        <AnimatePresence>
          {(isGenerating || generated) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div
                className="rounded-2xl p-6"
                style={{
                  background: 'rgba(11, 43, 38, 0.4)',
                  border: '1px solid rgba(35, 83, 71, 0.4)'
                }}
              >
                {/* Preview Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <FiFileText size={20} color="#0d9488" />
                    <div>
                      <h2 className="font-semibold" style={{ color: '#DAF1DE' }}>
                        {reportTitle} — Preview
                      </h2>
                      <p className="text-xs" style={{ color: '#8EB69B' }}>
                        Generated on{' '}
                        {new Date().toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105"
                      style={{ background: 'rgba(35, 83, 71, 0.5)', color: '#DAF1DE' }}
                    >
                      <FiDownload size={14} /> PDF
                    </button>
                    <button
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105"
                      style={{ background: 'rgba(35, 83, 71, 0.5)', color: '#DAF1DE' }}
                    >
                      <FiDownload size={14} /> Excel
                    </button>
                    <button
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105"
                      style={{ background: 'rgba(13, 148, 136, 0.2)', color: '#0d9488', border: '1px solid rgba(13,148,136,0.3)' }}
                    >
                      <FiMail size={14} /> Email
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <motion.div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: 'rgba(13, 148, 136, 0.15)' }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <FiFileText size={28} color="#0d9488" />
                    </motion.div>
                    <p className="text-sm font-medium" style={{ color: '#DAF1DE' }}>
                      Loading your financial data...
                    </p>
                  </div>
                ) : isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <motion.div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: 'rgba(13, 148, 136, 0.15)' }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <FiFileText size={28} color="#0d9488" />
                    </motion.div>
                    <p className="text-sm font-medium" style={{ color: '#DAF1DE' }}>
                      Generating your report...
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#8EB69B' }}>
                      Analyzing your financial data
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      {summaryStats.map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="rounded-xl p-4"
                          style={{ background: 'rgba(5, 31, 32, 0.5)' }}
                        >
                          <p className="text-xs mb-1" style={{ color: '#8EB69B' }}>
                            {stat.label}
                          </p>
                          <p className="text-lg font-bold" style={{ color: '#DAF1DE' }}>
                            {stat.value}
                          </p>
                          <span
                            className="text-xs font-medium"
                            style={{ color: stat.positive ? '#10b981' : '#ef4444' }}
                          >
                            {stat.change}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Bar Chart */}
                    <div
                      className="rounded-xl p-4 mb-6"
                      style={{ background: 'rgba(5, 31, 32, 0.5)' }}
                    >
                      <h3 className="text-sm font-semibold mb-4" style={{ color: '#DAF1DE' }}>
                        Expense Breakdown by Category
                      </h3>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={categorySpend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(35,83,71,0.3)" />
                          <XAxis
                            dataKey="category"
                            tick={{ fill: '#8EB69B', fontSize: 11 }}
                            axisLine={{ stroke: 'rgba(35,83,71,0.3)' }}
                          />
                          <YAxis
                            tick={{ fill: '#8EB69B', fontSize: 11 }}
                            axisLine={{ stroke: 'rgba(35,83,71,0.3)' }}
                          />
                          <Tooltip {...tooltipStyle} />
                          <Bar
                            dataKey="amount"
                            fill="#0d9488"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Top Categories */}
                    <div
                      className="rounded-xl p-4"
                      style={{ background: 'rgba(5, 31, 32, 0.5)' }}
                    >
                      <h3 className="text-sm font-semibold mb-4" style={{ color: '#DAF1DE' }}>
                        Budget Progress
                      </h3>
                      <div className="space-y-3">
                        {topCategories.length === 0 ? (
                          <p className="text-sm" style={{ color: '#8EB69B' }}>
                            No budget data available
                          </p>
                        ) : (
                        topCategories.map((cat, i) => (
                          <motion.div
                            key={cat.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="flex items-center gap-3"
                          >
                            <span
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ background: cat.color }}
                            />
                            <span className="text-sm flex-1" style={{ color: '#DAF1DE' }}>
                              {cat.name}
                            </span>
                            <span className="text-sm font-medium" style={{ color: '#DAF1DE' }}>
                              ${cat.amount}
                            </span>
                            <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(35,83,71,0.3)' }}>
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: cat.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${cat.percent}%` }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                              />
                            </div>
                            <span className="text-xs w-10 text-right" style={{ color: '#8EB69B' }}>
                              {cat.percent}%
                            </span>
                          </motion.div>
                        )))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#DAF1DE' }}>
            <FiClock size={18} style={{ color: '#8EB69B' }} />
            Recent Reports
          </h2>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(11, 43, 38, 0.4)',
              border: '1px solid rgba(35, 83, 71, 0.4)'
            }}
          >
            {/* Table Header */}
            <div
              className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium"
              style={{ background: 'rgba(5, 31, 32, 0.5)', color: '#8EB69B' }}
            >
              <div className="col-span-5">Report Name</div>
              <div className="col-span-3">Date</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2 text-right">Action</div>
            </div>
            {/* Table Rows */}
            {recentReports.length === 0 ? (
              <div
                className="grid grid-cols-12 gap-4 px-6 py-8 text-sm"
                style={{ borderTop: '1px solid rgba(35, 83, 71, 0.3)', color: '#8EB69B' }}
              >
                <div className="col-span-12 text-center">No reports generated yet</div>
              </div>
            ) : (
            recentReports.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="grid grid-cols-12 gap-4 px-6 py-3.5 items-center text-sm transition-colors"
                style={{
                  borderTop: '1px solid rgba(35, 83, 71, 0.3)',
                  color: '#DAF1DE'
                }}
              >
                <div className="col-span-5 flex items-center gap-2">
                  <FiFileText size={14} style={{ color: '#0d9488' }} />
                  <span className="truncate">{report.name}</span>
                </div>
                <div className="col-span-3 text-sm" style={{ color: '#8EB69B' }}>
                  {report.date}
                </div>
                <div className="col-span-2">
                  <span
                    className="px-2 py-1 rounded-md text-xs"
                    style={{
                      background: 'rgba(13, 148, 136, 0.15)',
                      color: '#0d9488'
                    }}
                  >
                    {report.type}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end">
                  <button
                    className="p-2 rounded-lg transition-all hover:scale-110"
                    style={{ background: 'rgba(35, 83, 71, 0.5)', color: '#8EB69B' }}
                  >
                    <FiDownload size={14} />
                  </button>
                </div>
              </motion.div>
            )))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
