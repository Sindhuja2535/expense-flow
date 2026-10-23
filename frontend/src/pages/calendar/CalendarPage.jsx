import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getExpenses } from '../../services/expenseService';
import { getIncomes } from '../../services/incomeService';
import {
  HiChevronLeft,
  HiChevronRight,
  HiPlus,
  HiCalendarDays,
  HiClock,
} from 'react-icons/hi2';
import {
  FiX,
  FiTrendingUp,
  FiTrendingDown,
} from 'react-icons/fi';
import {
  GiReceiveMoney,
  GiPayMoney,
} from 'react-icons/gi';
import { FiFilter } from 'react-icons/fi';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const TYPE_COLORS = {
  expense: 'bg-[#ef4444]',
  income:  'bg-[#10b981]',
  bill:    'bg-[#f59e0b]',
};

const TYPE_BG_COLORS = {
  expense: 'bg-[#ef4444]/10',
  income:  'bg-[#10b981]/10',
  bill:    'bg-[#f59e0b]/10',
};

const TYPE_TEXT_COLORS = {
  expense: 'text-[#ef4444]',
  income:  'text-[#10b981]',
  bill:    'text-[#f59e0b]',
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year, month, day) {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.95,
  }),
};

const panelVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 25, stiffness: 200 },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const mobilePanelVariants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 25, stiffness: 200 },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, type: 'spring', damping: 20 },
  }),
};

export default function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [direction, setDirection] = useState(0);
  const [filterType, setFilterType] = useState('all');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    Promise.all([
      getExpenses().catch(() => []),
      getIncomes().catch(() => []),
    ]).then(([expenseList, incomeList]) => {
      const exp = (Array.isArray(expenseList) ? expenseList : []).map((e) => ({
        id: `exp-${e.id}`,
        title: e.description || 'Expense',
        amount: Number(e.amount) || 0,
        type: 'expense',
        category: e.category || 'Expense',
        date: e.date,
        icon: GiPayMoney,
      }));
      const inc = (Array.isArray(incomeList) ? incomeList : []).map((i) => ({
        id: `inc-${i.id}`,
        title: i.description || 'Income',
        amount: Number(i.amount) || 0,
        type: 'income',
        category: i.source || i.category || 'Income',
        date: i.date,
        icon: GiReceiveMoney,
      }));
      setTransactions([...exp, ...inc]);
    });
  }, []);

  const year = currentYear;
  const month = currentMonth;

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const calendarDays = useMemo(() => {
    const days = [];
    const prevMonthDays = getDaysInMonth(
      month === 0 ? year - 1 : year,
      month === 0 ? 11 : month - 1
    );

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        currentMonth: false,
        dateKey: '',
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        currentMonth: true,
        dateKey: formatDateKey(year, month, d),
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        currentMonth: false,
        dateKey: '',
      });
    }

    return days;
  }, [year, month, daysInMonth, firstDay]);

  const transactionsByDate = useMemo(() => {
    const map = {};
    transactions.forEach((tx) => {
      if (!tx.date) return;
      if (!map[tx.date]) map[tx.date] = [];
      map[tx.date].push(tx);
    });
    return map;
  }, [transactions]);

  const selectedTransactions = useMemo(() => {
    if (!selectedDate) return [];
    const txs = transactionsByDate[selectedDate] || [];
    if (filterType === 'all') return txs;
    return txs.filter((tx) => tx.type === filterType);
  }, [selectedDate, filterType, transactionsByDate]);

  const selectedDateTotal = useMemo(() => {
    return selectedTransactions.reduce((acc, tx) => {
      return tx.type === 'income' ? acc + tx.amount : acc - tx.amount;
    }, 0);
  }, [selectedTransactions]);

  const navigateMonth = (dir) => {
    setDirection(dir);
    setSelectedDate(null);
    let newMonth = currentMonth + dir;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const goToToday = () => {
    setDirection(0);
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(todayKey);
  };

  const handleDayClick = (dateKey) => {
    if (!dateKey) return;
    setSelectedDate(dateKey);
  };

  const getDots = (dateKey) => {
    if (!dateKey) return [];
    const txs = transactionsByDate[dateKey] || [];
    const types = new Set(txs.map((t) => t.type));
    return Array.from(types);
  };

  const dayNumber = selectedDate
    ? parseInt(selectedDate.split('-')[2], 10)
    : null;

  return (
    <div className="min-h-screen bg-[#051F20] text-[#DAF1DE] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

        {/* ── Header ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#0d9488]/20 border border-[#0d9488]/30">
              <HiCalendarDays className="w-6 h-6 text-[#0d9488]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Calendar
              </h1>
              <p className="text-[#8EB69B] text-sm mt-0.5">
                Track your finances day by day
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={goToToday}
              className="px-4 py-2 rounded-lg text-sm font-medium
                         bg-[#0d9488]/15 border border-[#0d9488]/30 text-[#0d9488]
                         hover:bg-[#0d9488]/25 transition-all duration-200
                         active:scale-95"
            >
              Today
            </button>
            <div className="flex items-center bg-[#0B2B26]/80 border border-[#235457]/40 rounded-xl overflow-hidden">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2.5 hover:bg-[#163832] transition-colors"
                aria-label="Previous month"
              >
                <HiChevronLeft className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-[#235457]/40" />
              <button
                onClick={() => navigateMonth(1)}
                className="p-2.5 hover:bg-[#163832] transition-colors"
                aria-label="Next month"
              >
                <HiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Main layout ────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Calendar grid ────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <div className="bg-[#0B2B26]/60 backdrop-blur-xl border border-[#235457]/40 rounded-2xl p-4 sm:p-6 shadow-lg shadow-black/20">

              {/* Month & year */}
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold">
                  {MONTHS[month]} {year}
                </h2>
              </div>

              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-semibold text-[#8EB69B]/70 uppercase tracking-wider py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar cells */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={`${year}-${month}`}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="grid grid-cols-7 gap-1.5 sm:gap-2"
                >
                  {calendarDays.map((cell, idx) => {
                    const isToday = cell.dateKey === todayKey;
                    const isSelected = cell.dateKey === selectedDate;
                    const isCurrentMonth = cell.currentMonth;
                    const dots = cell.currentMonth ? getDots(cell.dateKey) : [];

                    return (
                      <motion.button
                        key={`${cell.dateKey || `pad-${idx}`}`}
                        onClick={() => handleDayClick(cell.dateKey)}
                        disabled={!cell.currentMonth}
                        whileHover={cell.currentMonth ? { scale: 1.08 } : {}}
                        whileTap={cell.currentMonth ? { scale: 0.95 } : {}}
                        className={`
                          relative flex flex-col items-center justify-center
                          rounded-xl py-2.5 sm:py-3 transition-all duration-200
                          ${!isCurrentMonth ? 'opacity-20 cursor-default' : 'cursor-pointer'}
                          ${isToday && !isSelected
                            ? 'ring-2 ring-[#10b981] ring-offset-2 ring-offset-[#0B2B26] bg-[#10b981]/10'
                            : ''}
                          ${isSelected
                            ? 'bg-[#0d9488]/30 border border-[#0d9488]/50 shadow-lg shadow-[#0d9488]/10'
                            : isCurrentMonth
                              ? 'bg-[#163832]/40 hover:bg-[#235457]/40 border border-transparent hover:border-[#235457]/50'
                              : 'border border-transparent'}
                        `}
                      >
                        <span
                          className={`
                            text-sm sm:text-base font-medium
                            ${isToday ? 'text-[#10b981] font-bold' : ''}
                            ${isSelected && !isToday ? 'text-[#0d9488] font-bold' : ''}
                            ${!isToday && !isSelected && isCurrentMonth ? 'text-[#DAF1DE]' : ''}
                            ${!isCurrentMonth ? 'text-[#8EB69B]/30' : ''}
                          `}
                        >
                          {cell.day}
                        </span>

                        {dots.length > 0 && (
                          <div className="flex items-center gap-0.5 mt-1">
                            {dots.map((type) => (
                              <span
                                key={type}
                                className={`w-1.5 h-1.5 rounded-full ${TYPE_COLORS[type]}`}
                              />
                            ))}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              {/* Legend */}
              <div className="flex items-center gap-4 sm:gap-6 mt-6 pt-4 border-t border-[#235457]/30">
                <span className="text-xs text-[#8EB69B]/60 font-medium">Legend:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span className="text-xs text-[#8EB69B]/70">Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                  <span className="text-xs text-[#8EB69B]/70">Expense</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                  <span className="text-xs text-[#8EB69B]/70">Bill</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Side / bottom panel ─────────────────────────── */}
          <AnimatePresence mode="wait">
            {selectedDate && (
              <>
                {/* Desktop side panel */}
                <motion.div
                  key={`panel-${selectedDate}`}
                  variants={panelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="
                    hidden lg:flex
                    w-[360px] flex-shrink-0 flex-col
                    bg-[#0B2B26]/60 backdrop-blur-xl
                    border border-[#235457]/40 rounded-2xl
                    shadow-lg shadow-black/20
                    max-h-[calc(100vh-160px)] overflow-hidden
                  "
                >
                  <PanelContent
                    selectedDate={selectedDate}
                    transactions={selectedTransactions}
                    total={selectedDateTotal}
                    filterType={filterType}
                    setFilterType={setFilterType}
                    dayNumber={dayNumber}
                    month={month}
                    year={year}
                    onClose={() => setSelectedDate(null)}
                  />
                </motion.div>

                {/* Mobile bottom sheet */}
                <motion.div
                  key={`mobile-panel-${selectedDate}`}
                  variants={mobilePanelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="
                    fixed inset-x-0 bottom-0 z-50
                    lg:hidden
                    bg-[#0B2B26] border-t border-[#235457]/40
                    rounded-t-3xl shadow-2xl shadow-black/40
                    max-h-[75vh] overflow-hidden flex flex-col
                  "
                >
                  <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-[#235457]/60" />
                  </div>
                  <PanelContent
                    selectedDate={selectedDate}
                    transactions={selectedTransactions}
                    total={selectedDateTotal}
                    filterType={filterType}
                    setFilterType={setFilterType}
                    dayNumber={dayNumber}
                    month={month}
                    year={year}
                    onClose={() => setSelectedDate(null)}
                  />
                </motion.div>

                {/* Mobile backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedDate(null)}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                />
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ── Panel Content (shared between desktop & mobile) ──────── */
function PanelContent({
  selectedDate,
  transactions,
  total,
  filterType,
  setFilterType,
  dayNumber,
  month,
  year,
  onClose,
}) {
  const fullDate = new Date(year, month, dayNumber);
  const dayName = fullDate.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <>
      {/* Panel header */}
      <div className="flex items-start justify-between p-5 pb-3">
        <div>
          <p className="text-[#8EB69B]/60 text-xs font-medium uppercase tracking-wider">
            {dayName}
          </p>
          <h3 className="text-xl font-bold mt-0.5">
            {MONTHS[month]} {dayNumber}, {year}
          </h3>
          <p
            className={`text-sm font-semibold mt-1 ${
              total >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
            }`}
          >
            {total >= 0 ? '+' : ''}
            {formatCurrency(total)} net
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-[#163832] transition-colors"
        >
          <FiX className="w-5 h-5 text-[#8EB69B]" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 px-5 pb-3 overflow-x-auto">
        {['all', 'income', 'expense', 'bill'].map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap
              transition-all duration-200
              ${
                filterType === f
                  ? 'bg-[#0d9488]/25 text-[#0d9488] border border-[#0d9488]/40'
                  : 'bg-[#163832]/60 text-[#8EB69B]/70 border border-transparent hover:bg-[#235457]/40'
              }
            `}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-2">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#8EB69B]/50">
            <HiCalendarDays className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No transactions</p>
            <p className="text-xs mt-1 opacity-60">for this date</p>
          </div>
        ) : (
          <AnimatePresence>
            {transactions.map((tx, i) => {
              const Icon = tx.icon;
              return (
                <motion.div
                  key={tx.id}
                  custom={i}
                  variants={listItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className={`
                    flex items-center gap-3 p-3 rounded-xl
                    ${TYPE_BG_COLORS[tx.type]}
                    border border-[#235457]/20
                    hover:border-[#235457]/40 transition-all duration-200
                    group cursor-pointer
                  `}
                >
                  <div
                    className={`
                      w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                      ${TYPE_BG_COLORS[tx.type]}
                    `}
                  >
                    <Icon
                      className={`w-5 h-5 ${TYPE_TEXT_COLORS[tx.type]}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {tx.title}
                    </p>
                    <p className="text-xs text-[#8EB69B]/50 mt-0.5">
                      {tx.category}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-sm font-semibold ${
                        tx.type === 'income'
                          ? 'text-[#10b981]'
                          : 'text-[#DAF1DE]'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <HiClock className="w-3 h-3 text-[#8EB69B]/40" />
                      <span className="text-[10px] text-[#8EB69B]/40 capitalize">
                        {tx.type}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Add transaction button */}
      <div className="p-5 pt-3 border-t border-[#235457]/30">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="
            w-full py-3 rounded-xl
            bg-gradient-to-r from-[#0d9488] to-[#10b981]
            text-white font-semibold text-sm
            shadow-lg shadow-[#0d9488]/25
            hover:shadow-[#0d9488]/40
            transition-shadow duration-300
            flex items-center justify-center gap-2
          "
        >
          <HiPlus className="w-5 h-5" />
          Add Transaction
        </motion.button>
      </div>
    </>
  );
}
