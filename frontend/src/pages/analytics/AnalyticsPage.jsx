import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiBarChart2, FiPieChart } from 'react-icons/fi';
import { refreshAnalytics, getAnalyticsResults } from '../../services/analyticsService';
import { toast } from 'react-toastify';

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await getAnalyticsResults();
      setResults(r);
      toast.success('Fetched analytics from MySQL');
    } catch (e) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await refreshAnalytics();
      toast.success(res?.message || 'Analytics refresh triggered');
      await fetchData();
    } catch (e) {
      toast.error('Failed to refresh analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#051F20] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#DAF1DE] flex items-center gap-2">
              <FiBarChart2 className="text-[#8EB69B]" /> Analytics
            </h1>
            <p className="text-[#8EB69B] mt-1">Real-time analytics powered by PySpark (JDBC)</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[#163832] text-[#DAF1DE] border border-[#8EB69B]/30 hover:bg-[#1a423c] disabled:opacity-50 flex items-center gap-2"
            >
              <FiPieChart /> Fetch Results
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#8EB69B] to-[#163832] text-[#DAF1DE] border border-[#8EB69B]/40 hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh Analytics
            </button>
          </div>
        </div>

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 space-y-6"
          >
            <div>
              <h2 className="text-lg font-semibold text-[#DAF1DE] mb-2">Monthly Trends ({results.monthlyCount})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-[#DAF1DE]">
                  <thead className="text-[#8EB69B]">
                    <tr>
                      <th className="text-left py-2 px-3">Month</th>
                      <th className="text-left py-2 px-3">Total Spent</th>
                      <th className="text-left py-2 px-3">Transactions</th>
                      <th className="text-left py-2 px-3">Avg Expense</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.monthly.map((m) => (
                      <tr key={m.id} className="border-t border-[#8EB69B]/20">
                        <td className="py-2 px-3">{m.month}</td>
                        <td className="py-2 px-3"></td>
                        <td className="py-2 px-3">{m.transactions}</td>
                        <td className="py-2 px-3"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#DAF1DE] mb-2">Category Trends ({results.categoryCount})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-[#DAF1DE]">
                  <thead className="text-[#8EB69B]">
                    <tr>
                      <th className="text-left py-2 px-3">Category</th>
                      <th className="text-left py-2 px-3">Total Spent</th>
                      <th className="text-left py-2 px-3">Transactions</th>
                      <th className="text-left py-2 px-3">Avg Expense</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.category.map((c) => (
                      <tr key={c.id} className="border-t border-[#8EB69B]/20">
                        <td className="py-2 px-3">{c.category}</td>
                        <td className="py-2 px-3"></td>
                        <td className="py-2 px-3">{c.transactions}</td>
                        <td className="py-2 px-3"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-xs text-[#8EB69B]/70">
              PySpark reads from MySQL via JDBC, computes monthly/category trends, and writes summaries back to MySQL (analytics_monthly_trends, analytics_category_trends).
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
