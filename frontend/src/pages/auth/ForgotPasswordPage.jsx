import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../services/api";

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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#051F20] relative p-6">
      <div className="absolute inset-0 overflow-hidden">
        <FloatingOrb className="w-96 h-96 bg-[#0d9488] -top-20 -left-20" delay={0} />
        <FloatingOrb className="w-72 h-72 bg-[#10b981] -bottom-10 -right-10" delay={2} />
        <FloatingOrb className="w-64 h-64 bg-[#8EB69B] top-1/3 right-1/4" delay={4} />
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="flex items-center gap-3 mb-8 justify-center"
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
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <motion.h1
                  className="text-2xl font-bold text-[#DAF1DE] mb-2"
                  variants={formItemVariants}
                  custom={2}
                >
                  Forgot your password?
                </motion.h1>
                <motion.p
                  className="text-[#8EB69B] text-sm mb-8"
                  variants={formItemVariants}
                  custom={3}
                >
                  No worries, we&apos;ll send you reset instructions.
                </motion.p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <motion.div variants={formItemVariants} custom={4}>
                    <label className="block text-sm font-medium text-[#8EB69B] mb-2">
                      Email address
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

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#0d9488] to-[#10b981] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_8px_25px_rgba(13,148,136,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    variants={formItemVariants}
                    custom={5}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Send Reset Link"
                    )}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                className="text-center py-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <motion.div
                  className="w-20 h-20 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <FiCheckCircle className="text-[#10b981] text-4xl" />
                </motion.div>
                <motion.h2
                  className="text-2xl font-bold text-[#DAF1DE] mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Check your email
                </motion.h2>
                <motion.p
                  className="text-[#8EB69B] text-sm mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  We sent a password reset link to{" "}
                  <span className="text-[#DAF1DE] font-medium">{email}</span>
                </motion.p>
                <motion.p
                  className="text-[#8EB69B] text-xs mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Didn&apos;t receive the email? Check your spam folder or try again.
                </motion.p>
                <motion.button
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                  className="text-[#0d9488] hover:text-[#10b981] text-sm font-semibold transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  Try again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div className="mt-6 text-center" variants={formItemVariants} custom={6}>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-[#8EB69B] hover:text-[#DAF1DE] transition-colors"
            >
              <FiArrowLeft />
              Back to Login
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
