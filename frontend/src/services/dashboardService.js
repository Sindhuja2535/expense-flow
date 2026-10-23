import api from "./api";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_FULL = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

const monthIndex = (m) => {
  const n = Number(m);
  if (!Number.isNaN(n) && n >= 1 && n <= 12) return n - 1;
  const idx = MONTHS_FULL.indexOf(String(m || "").toUpperCase());
  return idx >= 0 ? idx : 0;
};

const toTransaction = (e) => ({
  id: e.id,
  description: e.description || "Untitled",
  category: e.categoryName,
  amount: -Math.abs(Number(e.amount) || 0),
  date: e.date,
  type: "expense",
});

const toIncomeTransaction = (e) => ({
  id: e.id,
  description: e.description || e.source || "Income",
  category: e.source || e.categoryName || "Income",
  amount: Math.abs(Number(e.amount) || 0),
  date: e.date,
  type: "income",
});

const groupWeeklySpending = (expenses) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const buckets = days.map((day) => ({ day, amount: 0 }));
  expenses.forEach((e) => {
    if (!e.date) return;
    const d = new Date(e.date);
    if (isNaN(d.getTime())) return;
    const idx = (d.getDay() + 6) % 7;
    buckets[idx].amount += Math.abs(Number(e.amount) || 0);
  });
  return buckets;
};

export const getDashboard = async () => {
  const res = await api.get("/dashboard");
  const d = res.data.data || {};

  const monthlyData = Array.isArray(d.monthlyData)
    ? d.monthlyData
        .map((m) => ({
          name: MONTHS[monthIndex(m.month)],
          income: Number(m.income) || 0,
          expense: Number(m.expense) || 0,
        }))
        .slice(-6)
    : [];

  const expenseBreakdown = d.categoryWiseExpenses
    ? Object.entries(d.categoryWiseExpenses)
        .map(([name, value]) => ({ name, value: Number(value) || 0 }))
        .sort((a, b) => b.value - a.value)
    : [];

  const recentExpenses = Array.isArray(d.recentExpenses) ? d.recentExpenses.map(toTransaction) : [];
  const recentIncomes = Array.isArray(d.recentIncomes) ? d.recentIncomes.map(toIncomeTransaction) : [];
  const recentTransactions = [...recentExpenses, ...recentIncomes]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 10);

  const monthlyExpense = Number(d.monthlyExpense) || 0;
  const monthlyIncome = Number(d.monthlyIncome) || 0;
  const savings = Number(d.savings) || 0;
  const totalBalance = Number(d.totalBalance) || 0;
  const remainingBudget = Number(d.remainingBudget) || 0;

  const hasAnyData =
    recentExpenses.length > 0 ||
    recentIncomes.length > 0 ||
    expenseBreakdown.length > 0 ||
    monthlyExpense > 0 ||
    monthlyIncome > 0;

  return {
    stats: {
      totalBalance,
      balanceChange: null,
      monthlyIncome,
      incomeChange: null,
      monthlyExpense,
      expenseChange: null,
      savings,
      savingsChange: null,
    },
    chartData: monthlyData,
    expenseBreakdown,
    recentTransactions,
    weeklySpending: groupWeeklySpending(recentExpenses),
    savingsGoal: {
      current: savings,
      target: monthlyIncome > 0 ? monthlyIncome : 1,
      name: "This month's savings rate",
    },
    topCategories: expenseBreakdown.slice(0, 5),
    remainingBudget,
    hasAnyData,
  };
};
