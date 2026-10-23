import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getExpenses } from '../../services/expenseService';
import { getIncomes } from '../../services/incomeService';
import { getCategories } from '../../services/categoryService';
import {
  FiSearch, FiX, FiClock, FiTrendingUp, FiCreditCard,
  FiDollarSign, FiTag, FiArrowRight, FiCoffee, FiShoppingBag,
  FiHome, FiZap, FiHeart, FiFilm, FiBriefcase
} from 'react-icons/fi';

const PALETTE = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

function iconFor(name) {
  const key = String(name || '').toLowerCase();
  if (key.includes('food') || key.includes('dining') || key.includes('coffee')) return FiCoffee;
  if (key.includes('entertain') || key.includes('film')) return FiFilm;
  if (key.includes('bill') || key.includes('utilit') || key.includes('electric')) return FiZap;
  if (key.includes('shopping') || key.includes('cloth')) return FiShoppingBag;
  if (key.includes('house') || key.includes('rent') || key.includes('home')) return FiHome;
  if (key.includes('health') || key.includes('gym') || key.includes('medic')) return FiHeart;
  if (key.includes('transport') || key.includes('uber') || key.includes('gas') || key.includes('car') || key.includes('travel')) return FiCreditCard;
  if (key.includes('salary') || key.includes('freelance') || key.includes('busi') || key.includes('consult') || key.includes('work')) return FiBriefcase;
  if (key.includes('invest') || key.includes('dividend') || key.includes('stock')) return FiTrendingUp;
  if (key.includes('income') || key.includes('deposit') || key.includes('bonus')) return FiDollarSign;
  return FiCreditCard;
}

function colorFor(name) {
  const key = String(name || '').toLowerCase();
  if (key.includes('food') || key.includes('dining')) return '#10b981';
  if (key.includes('shopping')) return '#3b82f6';
  if (key.includes('house') || key.includes('rent') || key.includes('home')) return '#0d9488';
  if (key.includes('bill') || key.includes('utilit')) return '#f59e0b';
  if (key.includes('health') || key.includes('gym')) return '#ef4444';
  if (key.includes('entertain')) return '#8b5cf6';
  if (key.includes('transport')) return '#ec4899';
  if (key.includes('salary') || key.includes('income') || key.includes('invest') || key.includes('dividend')) return '#0d9488';
  const hash = key.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

const recentSearches = [
  'Grocery Store',
  'Netflix',
  'Electric Bill',
  'Amazon',
  'Salary'
];

const filters = ['All', 'Expenses', 'Income', 'Categories'];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(() => searchParams.get("q") || "");
  const [activeFilter, setActiveFilter] = useState('All');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const q = debouncedQuery.toLowerCase().trim();

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    Promise.all([
      getExpenses().catch(() => []),
      getIncomes().catch(() => []),
      getCategories().catch(() => []),
    ]).then(([exp, inc, cat]) => {
      setExpenses(Array.isArray(exp) ? exp : []);
      setIncomes(Array.isArray(inc) ? inc : []);
      setCategories(Array.isArray(cat) ? cat : []);
    });
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = {};
    expenses.forEach((e) => {
      const key = e.category || 'Other';
      counts[key] = (counts[key] || 0) + 1;
    });
    incomes.forEach((i) => {
      const key = i.source || i.category || 'Income';
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [expenses, incomes]);

  const categoryItems = useMemo(
    () =>
      categories.map((c) => ({
        ...c,
        count: categoryCounts[c.name] || 0,
        color: c.color || colorFor(c.name),
        icon: iconFor(c.name),
      })),
    [categories, categoryCounts]
  );

  const popularCategories = categoryItems.slice(0, 6);

  const filteredExpenses = q
    ? expenses
        .filter((e) => {
          const title = (e.description || '').toLowerCase();
          const cat = (e.category || '').toLowerCase();
          const notes = (e.notes || '').toLowerCase();
          return title.includes(q) || cat.includes(q) || notes.includes(q);
        })
        .map((e) => ({
          id: e.id,
          title: e.description || 'Expense',
          amount: Number(e.amount) || 0,
          date: e.date,
          category: e.category || 'Other',
          color: colorFor(e.category),
          icon: iconFor(e.category),
        }))
    : [];

  const filteredIncomes = q
    ? incomes
        .filter((i) => {
          const title = (i.description || '').toLowerCase();
          const source = (i.source || '').toLowerCase();
          const cat = (i.category || '').toLowerCase();
          return title.includes(q) || source.includes(q) || cat.includes(q);
        })
        .map((i) => ({
          id: i.id,
          title: i.description || 'Income',
          amount: Number(i.amount) || 0,
          date: i.date,
          category: i.source || i.category || 'Income',
          color: colorFor(i.source || i.category),
          icon: iconFor(i.source || i.category),
        }))
    : [];

  const filteredCategories = q
    ? categoryItems.filter((c) => (c.name || '').toLowerCase().includes(q))
    : [];

  const hasResults = filteredExpenses.length > 0 || filteredIncomes.length > 0 || filteredCategories.length > 0;

  const showExpenses = activeFilter === 'All' || activeFilter === 'Expenses';
  const showIncome = activeFilter === 'All' || activeFilter === 'Income';
  const showCategories = activeFilter === 'All' || activeFilter === 'Categories';

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: '#051F20' }}>
      <div className="max-w-4xl mx-auto">
        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-2xl"
            style={{
              background: 'rgba(11, 43, 38, 0.5)',
              border: '1px solid rgba(35, 83, 71, 0.5)'
            }}
          >
            <FiSearch size={22} style={{ color: '#8EB69B' }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search expenses, income, categories..."
              className="flex-1 bg-transparent outline-none text-base"
              style={{ color: '#DAF1DE' }}
            />
            {query && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setQuery('')}
                className="p-1.5 rounded-lg transition-colors"
                style={{ background: 'rgba(35, 83, 71, 0.5)', color: '#8EB69B' }}
              >
                <FiX size={16} />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Filter Chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-8"
        >
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: activeFilter === f
                  ? 'linear-gradient(135deg, #0d9488, #10b981)'
                  : 'rgba(35, 83, 71, 0.3)',
                color: activeFilter === f ? '#fff' : '#8EB69B',
                border: activeFilter === f
                  ? 'none'
                  : '1px solid rgba(35, 83, 71, 0.5)'
              }}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* Empty State — No Query */}
        {!q && (
          <div>
            {/* Recent Searches */}
            <div className="mb-8">
              <h2
                className="text-sm font-semibold mb-3 flex items-center gap-2"
                style={{ color: '#8EB69B' }}
              >
                <FiClock size={14} />
                Recent Searches
              </h2>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setQuery(s)}
                    className="px-3.5 py-2 rounded-xl text-sm transition-all hover:translate-x-1"
                    style={{
                      background: 'rgba(35, 83, 71, 0.3)',
                      border: '1px solid rgba(35, 83, 71, 0.5)',
                      color: '#DAF1DE'
                    }}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Popular Categories */}
            <div>
              <h2
                className="text-sm font-semibold mb-3 flex items-center gap-2"
                style={{ color: '#8EB69B' }}
              >
                <FiTrendingUp size={14} />
                Popular Categories
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {popularCategories.map((cat, i) => (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    onClick={() => setQuery(cat.name)}
                    className="flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:scale-[1.02]"
                    style={{
                      background: 'rgba(11, 43, 38, 0.4)',
                      border: '1px solid rgba(35, 83, 71, 0.4)'
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `${cat.color}20` }}
                    >
                      <cat.icon size={18} color={cat.color} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#DAF1DE' }}>
                        {cat.name}
                      </p>
                      <p className="text-xs" style={{ color: '#8EB69B' }}>
                        {cat.count} items
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {q && (
          <div>
            {!hasResults ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(35, 83, 71, 0.3)' }}
                >
                  <FiSearch size={28} style={{ color: '#8EB69B' }} />
                </div>
                <p className="text-base font-medium mb-1" style={{ color: '#DAF1DE' }}>
                  No results found
                </p>
                <p className="text-sm" style={{ color: '#8EB69B' }}>
                  Try searching for something else
                </p>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {/* Expenses Section */}
                {showExpenses && filteredExpenses.length > 0 && (
                  <div>
                    <h3
                      className="text-sm font-semibold mb-3 flex items-center gap-2"
                      style={{ color: '#8EB69B' }}
                    >
                      <FiCreditCard size={14} />
                      Expenses
                      <span className="text-xs" style={{ color: 'rgba(142,182,155,0.5)' }}>
                        ({filteredExpenses.length})
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {filteredExpenses.map((item, i) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:translate-x-1"
                          style={{
                            background: 'rgba(11, 43, 38, 0.4)',
                            border: '1px solid rgba(35, 83, 71, 0.4)'
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `${item.color}20` }}
                          >
                            <item.icon size={18} color={item.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: '#DAF1DE' }}>
                              {item.title}
                            </p>
                            <p className="text-xs" style={{ color: '#8EB69B' }}>
                              {item.date} · {item.category}
                            </p>
                          </div>
                          <span className="text-sm font-semibold" style={{ color: '#ef4444' }}>
                            -${item.amount.toFixed(2)}
                          </span>
                          <FiArrowRight size={14} style={{ color: '#8EB69B' }} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Income Section */}
                {showIncome && filteredIncomes.length > 0 && (
                  <div>
                    <h3
                      className="text-sm font-semibold mb-3 flex items-center gap-2"
                      style={{ color: '#8EB69B' }}
                    >
                      <FiDollarSign size={14} />
                      Income
                      <span className="text-xs" style={{ color: 'rgba(142,182,155,0.5)' }}>
                        ({filteredIncomes.length})
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {filteredIncomes.map((item, i) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:translate-x-1"
                          style={{
                            background: 'rgba(11, 43, 38, 0.4)',
                            border: '1px solid rgba(35, 83, 71, 0.4)'
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `${item.color}20` }}
                          >
                            <item.icon size={18} color={item.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: '#DAF1DE' }}>
                              {item.title}
                            </p>
                            <p className="text-xs" style={{ color: '#8EB69B' }}>
                              {item.date} · {item.category}
                            </p>
                          </div>
                          <span className="text-sm font-semibold" style={{ color: '#10b981' }}>
                            +${item.amount.toFixed(2)}
                          </span>
                          <FiArrowRight size={14} style={{ color: '#8EB69B' }} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories Section */}
                {showCategories && filteredCategories.length > 0 && (
                  <div>
                    <h3
                      className="text-sm font-semibold mb-3 flex items-center gap-2"
                      style={{ color: '#8EB69B' }}
                    >
                      <FiTag size={14} />
                      Categories
                      <span className="text-xs" style={{ color: 'rgba(142,182,155,0.5)' }}>
                        ({filteredCategories.length})
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredCategories.map((cat, i) => (
                        <motion.button
                          key={cat.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:translate-x-1"
                          style={{
                            background: 'rgba(11, 43, 38, 0.4)',
                            border: '1px solid rgba(35, 83, 71, 0.4)'
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `${cat.color}20` }}
                          >
                            <cat.icon size={18} color={cat.color} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium" style={{ color: '#DAF1DE' }}>
                              {cat.name}
                            </p>
                            <p className="text-xs" style={{ color: '#8EB69B' }}>
                              {cat.count} items
                            </p>
                          </div>
                          <FiArrowRight size={14} style={{ color: '#8EB69B' }} />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
