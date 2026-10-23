import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiSend, FiMic, FiUser, FiCpu, FiStar } from 'react-icons/fi';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const suggestedQuestions = [
  "How much did I spend this month?",
  "Give me saving tips",
  "Where am I overspending?",
  "Predict next month's expenses",
  "What's my financial health score?"
];

const quickActions = [
  { label: "This Month's Summary", icon: "📊" },
  { label: "Saving Tips", icon: "💡" },
  { label: "Budget Analysis", icon: "📈" },
  { label: "Predict Next Month", icon: "🔮" }
];

const spendingData = [
  { month: 'Jan', amount: 2400 },
  { month: 'Feb', amount: 2100 },
  { month: 'Mar', amount: 2800 },
  { month: 'Apr', amount: 2200 },
  { month: 'May', amount: 2600 },
  { month: 'Jun', amount: 2300 }
];

const categoryData = [
  { name: 'Food', value: 450 },
  { name: 'Transport', value: 280 },
  { name: 'Shopping', value: 350 },
  { name: 'Bills', value: 520 }
];

const COLORS = ['#0d9488', '#10b981', '#3b82f6', '#f59e0b'];

const aiResponses = {
  "How much did I spend this month?": {
    text: "You spent $2,847 this month across 42 transactions. Here's a breakdown of your spending trend over the last 6 months:",
    chart: 'area'
  },
  "Give me saving tips": {
    text: "Based on your spending patterns, here are 3 personalized tips:\n\n1. **Dining out**: You spent $450 on food delivery. Cooking 2 more meals at home could save ~$200/month.\n\n2. **Subscriptions**: I detected 3 unused subscriptions costing $45/month.\n\n3. **Transport**: Carpooling 2 days/week could save ~$120/month.\n\nTotal potential savings: **$365/month** 💰"
  },
  "Where am I overspending?": {
    text: "Your biggest spending categories this month. Bills are 18% above your average:",
    chart: 'pie'
  },
  "Predict next month's expenses": {
    text: "Based on your historical data, I predict you'll spend approximately **$2,650** next month (±$200). Your spending tends to increase in the last week of each month due to recurring subscriptions and weekend activities."
  },
  "What's my financial health score?": {
    text: "Your financial health score is **78/100** 🟢\n\n✅ Emergency fund covers 4.2 months\n✅ Debt-to-income ratio: 12% (healthy)\n⚠️ Savings rate: 15% (aim for 20%)\n⚠️ Irregular spending detected in 'Shopping' category"
  }
};

const defaultResponse = {
  text: "I'd be happy to help with that! Based on your recent financial data, I can provide insights. Could you be more specific about what you'd like to know? You can ask about spending, savings, budgets, or predictions."
};

function MiniAreaChart() {
  return (
    <div className="mt-3 rounded-lg overflow-hidden" style={{ background: 'rgba(5, 31, 32, 0.4)' }}>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={spendingData}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              background: '#0B2B26',
              border: '1px solid #235347',
              borderRadius: '8px',
              color: '#DAF1DE',
              fontSize: '12px'
            }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#0d9488"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAmount)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniPieChart() {
  return (
    <div className="mt-3 flex items-center gap-4" style={{ background: 'rgba(5, 31, 32, 0.4)', borderRadius: '8px', padding: '12px' }}>
      <ResponsiveContainer width={120} height={120}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={50}
            dataKey="value"
          >
            {categoryData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#0B2B26',
              border: '1px solid #235347',
              borderRadius: '8px',
              color: '#DAF1DE',
              fontSize: '12px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-1">
        {categoryData.map((item, i) => (
          <div key={item.name} className="flex items-center gap-2 text-xs" style={{ color: '#8EB69B' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
            {item.name}: ${item.value}
          </div>
        ))}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: '#8EB69B' }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (text) => {
    const question = text || input.trim();
    if (!question) return;

    const userMsg = { id: Date.now(), role: 'user', text: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = aiResponses[question] || defaultResponse;
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: response.text,
        chart: response.chart || null
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen" style={{ background: '#051F20' }}>
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)' }}
              >
                <FiZap size={24} color="#fff" />
              </div>
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FiStar size={14} color="#f59e0b" />
              </motion.div>
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#DAF1DE' }}>
                AI Financial Assistant
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs" style={{ color: '#8EB69B' }}>Powered by AI</span>
              </div>
            </div>
          </div>
          <motion.div
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: 'rgba(13, 148, 136, 0.15)', color: '#0d9488', border: '1px solid rgba(13, 148, 136, 0.3)' }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FiStar size={10} className="inline mr-1" /> AI Active
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 mb-6 overflow-x-auto pb-2"
          >
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleSend(action.label)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-medium transition-all hover:scale-105"
                style={{
                  background: 'rgba(35, 83, 71, 0.4)',
                  border: '1px solid rgba(35, 83, 71, 0.6)',
                  color: '#DAF1DE'
                }}
              >
                <span>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </motion.div>
        )}

        {/* Chat Area */}
        <div
          className="flex-1 overflow-y-auto rounded-2xl p-4 mb-4"
          style={{
            background: 'rgba(11, 43, 38, 0.3)',
            border: '1px solid rgba(35, 83, 71, 0.4)'
          }}
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: 'linear-gradient(135deg, rgba(13,148,136,0.2), rgba(16,185,129,0.2))' }}
              >
                <FiCpu size={36} color="#0d9488" />
              </motion.div>
              <h2 className="text-lg font-semibold mb-2" style={{ color: '#DAF1DE' }}>
                Ask me anything about your finances
              </h2>
              <p className="text-sm mb-6" style={{ color: '#8EB69B' }}>
                I can help with spending analysis, saving tips, and predictions
              </p>
              <div className="flex flex-col gap-2 w-full max-w-md">
                {suggestedQuestions.map((q, i) => (
                  <motion.button
                    key={q}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    onClick={() => handleSend(q)}
                    className="text-left px-4 py-3 rounded-xl text-sm transition-all hover:translate-x-1"
                    style={{
                      background: 'rgba(35, 83, 71, 0.3)',
                      border: '1px solid rgba(35, 83, 71, 0.5)',
                      color: '#DAF1DE'
                    }}
                  >
                    <FiZap size={12} className="inline mr-2" style={{ color: '#0d9488' }} />
                    {q}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 mt-1 flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)' }}
                  >
                    <FiZap size={14} color="#fff" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'
                  }`}
                  style={
                    msg.role === 'user'
                      ? { background: 'linear-gradient(135deg, #0d9488, #10b981)', color: '#fff' }
                      : { background: 'rgba(35, 83, 71, 0.4)', border: '1px solid rgba(35, 83, 71, 0.5)', color: '#DAF1DE' }
                  }
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  {msg.chart === 'area' && <MiniAreaChart />}
                  {msg.chart === 'pie' && <MiniPieChart />}
                </div>
                {msg.role === 'user' && (
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center ml-3 mt-1 flex-shrink-0"
                    style={{ background: 'rgba(35, 83, 71, 0.5)' }}
                  >
                    <FiUser size={14} color="#8EB69B" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex mb-4"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)' }}
              >
                <FiZap size={14} color="#fff" />
              </div>
              <div
                className="px-2 py-1 rounded-2xl rounded-bl-md"
                style={{ background: 'rgba(35, 83, 71, 0.4)', border: '1px solid rgba(35, 83, 71, 0.5)' }}
              >
                <TypingIndicator />
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: 'rgba(11, 43, 38, 0.5)',
            border: '1px solid rgba(35, 83, 71, 0.5)'
          }}
        >
          <button
            className="p-2 rounded-lg transition-colors"
            style={{ color: '#8EB69B' }}
          >
            <FiMic size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your finances..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: '#DAF1DE' }}
          />
          <button
            onClick={() => handleSend()}
            className="p-2.5 rounded-xl transition-all hover:scale-105"
            style={{
              background: input.trim() ? 'linear-gradient(135deg, #0d9488, #10b981)' : 'rgba(35, 83, 71, 0.5)',
              color: '#fff'
            }}
          >
            <FiSend size={18} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
