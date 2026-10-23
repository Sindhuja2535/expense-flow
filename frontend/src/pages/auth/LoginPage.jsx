import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const FloatingOrb = ({ className, delay = 0 }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
    animate={{
      y: [0, -30, 0],
      x: [0, 15, 0],
      scale: [1, 1.1, 1],
    }}
    transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

const formItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#051F20]">
      {/* Left Branding - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B2B26] via-[#051F20] to-[#163832]" />
        <FloatingOrb className="w-96 h-96 bg-[#0d9488] top-20 -left-20" delay={0} />
        <FloatingOrb className="w-72 h-72 bg-[#10b981] bottom-20 right-10" delay={2} />
        <FloatingOrb className="w-64 h-64 bg-[#8EB69B] top-1/2 left-1/3" delay={4} />

        <motion.div
          className="relative z-10 text-center px-12"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center gap-3 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0d9488] to-[#10b981] flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="text-3xl font-bold text-[#DAF1DE]">ExpenseFlow</span>
          </motion.div>

          <motion.p
            className="text-5xl font-bold text-[#DAF1DE] leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Take control of{" "}
            <span className="gradient-text">your finances</span>
          </motion.p>

          <motion.p
            className="text-lg text-[#8EB69B] max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            Track expenses, manage budgets, and grow your savings with the
            smartest financial tool.
          </motion.p>

          <motion.div
            className="mt-12 flex justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-[#0d9488]"
                style={{ opacity: 1 - i * 0.2 }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute inset-0 lg:hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B2B26] via-[#051F20] to-[#163832]" />
          <FloatingOrb className="w-72 h-72 bg-[#0d9488] -top-10 -right-10" delay={0} />
          <FloatingOrb className="w-48 h-48 bg-[#10b981] bottom-10 -left-10" delay={3} />
        </div>

        <motion.div
          className="w-full max-w-md relative z-10"
          initial="hidden"
          animate="visible"
        >
          {/* Mobile Logo */}
          <motion.div
            className="lg:hidden flex items-center gap-3 mb-8 justify-center"
            variants={formItemVariants}
            custom={0}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0d9488] to-[#10b981] flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-2xl font-bold text-[#DAF1DE]">ExpenseFlow</span>
          </motion.div>

          <motion.div
            className="glass-card p-8 sm:p-10"
            variants={formItemVariants}
            custom={1}
          >
            <motion.h1
              className="text-2xl font-bold text-[#DAF1DE] mb-2"
              variants={formItemVariants}
              custom={2}
            >
              Welcome back
            </motion.h1>
            <motion.p
              className="text-[#8EB69B] text-sm mb-8"
              variants={formItemVariants}
              custom={3}
            >
              Sign in to continue to your dashboard
            </motion.p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div variants={formItemVariants} custom={4}>
                <label className="block text-sm font-medium text-[#8EB69B] mb-2">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8EB69B] text-lg" />
                  <input
                    type="email"
                    className="input-field pl-11"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </motion.div>

              <motion.div variants={formItemVariants} custom={5}>
                <label className="block text-sm font-medium text-[#8EB69B] mb-2">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8EB69B] text-lg" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field pl-11 pr-11"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8EB69B] hover:text-[#DAF1DE] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center justify-between"
                variants={formItemVariants}
                custom={6}
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[#8EB69B]/30 bg-[#0B2B26] text-[#0d9488] focus:ring-[#0d9488] focus:ring-offset-0 cursor-pointer"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span className="text-sm text-[#8EB69B]">Remember me</span>
                </label>
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#0d9488] to-[#10b981] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_8px_25px_rgba(13,148,136,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                variants={formItemVariants}
                custom={7}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <FiArrowRight />
                  </>
                )}
              </motion.button>
            </form>

            <motion.p
              className="text-center text-sm text-[#8EB69B] mt-8"
              variants={formItemVariants}
              custom={8}
            >
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="text-[#0d9488] hover:text-[#10b981] font-semibold transition-colors"
              >
                Sign up
              </Link>
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
