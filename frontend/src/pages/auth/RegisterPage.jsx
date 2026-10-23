import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiUser,
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
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return score;
}

const strengthColors = ["#ef4444", "#f59e0b", "#f59e0b", "#10b981", "#10b981"];
const strengthLabels = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!terms) {
      toast.error("Please accept the terms");
      return;
    }
    setLoading(true);
    try {
      await register({ firstName, lastName, email, password });
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#051F20]">
      {/* Left Branding */}
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
            Start your{" "}
            <span className="gradient-text">financial journey</span>
          </motion.p>

          <motion.p
            className="text-lg text-[#8EB69B] max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            Join thousands of users who are already mastering their finances
            with ExpenseFlow.
          </motion.p>
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
              Create your account
            </motion.h1>
            <motion.p
              className="text-[#8EB69B] text-sm mb-8"
              variants={formItemVariants}
              custom={3}
            >
              Get started with ExpenseFlow for free
            </motion.p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div className="grid grid-cols-2 gap-4" variants={formItemVariants} custom={4}>
                <div>
                  <label className="block text-sm font-medium text-[#8EB69B] mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8EB69B] text-lg" />
                    <input
                      type="text"
                      className="input-field pl-11"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8EB69B] mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8EB69B] text-lg" />
                    <input
                      type="text"
                      className="input-field pl-11"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div variants={formItemVariants} custom={5}>
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

              <motion.div variants={formItemVariants} custom={6}>
                <label className="block text-sm font-medium text-[#8EB69B] mb-2">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8EB69B] text-lg" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field pl-11 pr-11"
                    placeholder="Create a strong password"
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
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: i < strength ? strengthColors[strength - 1] : "rgba(142, 182, 155, 0.15)",
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: strengthColors[strength - 1] || "#8EB69B" }}>
                      {strengthLabels[strength - 1] || "Too short"}
                    </p>
                  </div>
                )}
              </motion.div>

              <motion.div variants={formItemVariants} custom={7}>
                <label className="block text-sm font-medium text-[#8EB69B] mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8EB69B] text-lg" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="input-field pl-11 pr-11"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8EB69B] hover:text-[#DAF1DE] transition-colors"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-[#ef4444] mt-1">Passwords do not match</p>
                )}
              </motion.div>

              <motion.div className="flex items-start gap-2" variants={formItemVariants} custom={8}>
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-0.5 rounded border-[#8EB69B]/30 bg-[#0B2B26] text-[#0d9488] focus:ring-[#0d9488] focus:ring-offset-0 cursor-pointer"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                />
                <span className="text-sm text-[#8EB69B]">
                  I agree to the{" "}
                  <span className="text-[#0d9488] cursor-pointer hover:text-[#10b981]">Terms of Service</span>{" "}
                  and{" "}
                  <span className="text-[#0d9488] cursor-pointer hover:text-[#10b981]">Privacy Policy</span>
                </span>
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#0d9488] to-[#10b981] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_8px_25px_rgba(13,148,136,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                variants={formItemVariants}
                custom={9}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <FiArrowRight />
                  </>
                )}
              </motion.button>
            </form>

            <motion.p
              className="text-center text-sm text-[#8EB69B] mt-8"
              variants={formItemVariants}
              custom={10}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#0d9488] hover:text-[#10b981] font-semibold transition-colors"
              >
                Login
              </Link>
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
