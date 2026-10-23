import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import CountUp from "../../utils/CountUpWrapper";
import {
  FiBarChart2,
  FiPieChart,
  FiZap,
  FiTarget,
  FiLock,
  FiFileText,
  FiArrowRight,
  FiCheck,
  FiX,
  FiChevronDown,
  FiStar,
  FiMenu,
  FiX as FiClose,
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiInstagram,
  FiMail,
  FiDollarSign,
  FiUsers,
  FiActivity,
  FiTrendingUp,
} from "react-icons/fi";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const FloatingOrb = ({ className, delay = 0 }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
    animate={{
      y: [0, -40, 0],
      x: [0, 20, 0],
      scale: [1, 1.15, 1],
    }}
    transition={{ duration: 8, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

function SectionHeading({ title, subtitle, gradient = true }) {
  return (
    <motion.div
      className="text-center mb-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
    >
      <h2 className="text-4xl md:text-5xl font-bold text-[#DAF1DE] mb-4">
        {gradient ? (
          <>
            {title.split(" ").map((word, i) => (
              <span key={i}>
                {i === 0 || i === Math.floor(title.split(" ").length / 2) ? (
                  <span className="gradient-text">{word} </span>
                ) : (
                  <span>{word} </span>
                )}
              </span>
            ))}
          </>
        ) : (
          title
        )}
      </h2>
      {subtitle && (
        <p className="text-[#8EB69B] text-lg max-w-2xl mx-auto">{subtitle}</p>
      )}
    </motion.div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = ["Features", "Pricing", "FAQ"];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#051F20]/80 backdrop-blur-xl border-b border-[#8EB69B]/10"
          : "bg-transparent"
      }`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0d9488] to-[#10b981] flex items-center justify-center">
            <span className="text-white font-bold">E</span>
          </div>
          <span className="text-xl font-bold text-[#DAF1DE]">ExpenseFlow</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-sm text-[#8EB69B] hover:text-[#DAF1DE] transition-colors font-medium"
            >
              {link}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-semibold text-[#8EB69B] hover:text-[#DAF1DE] transition-colors px-4 py-2"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold text-white bg-gradient-to-r from-[#0d9488] to-[#10b981] px-5 py-2.5 rounded-xl hover:shadow-[0_8px_25px_rgba(13,148,136,0.4)] transition-all duration-300 hover:-translate-y-0.5"
          >
            Get Started
          </Link>
        </div>

        <button
          className="md:hidden text-[#DAF1DE]"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <FiClose size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          className="md:hidden bg-[#0B2B26]/95 backdrop-blur-xl border-b border-[#8EB69B]/10 px-6 py-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-[#8EB69B] hover:text-[#DAF1DE] transition-colors font-medium py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link}
              </a>
            ))}
            <hr className="border-[#8EB69B]/10" />
            <Link to="/login" className="text-[#DAF1DE] font-semibold py-2" onClick={() => setMobileOpen(false)}>
              Login
            </Link>
            <Link
              to="/register"
              className="text-white bg-gradient-to-r from-[#0d9488] to-[#10b981] px-5 py-2.5 rounded-xl text-center font-semibold"
              onClick={() => setMobileOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      <div className="absolute inset-0">
        <FloatingOrb className="w-[600px] h-[600px] bg-[#0d9488] -top-40 -left-40" delay={0} />
        <FloatingOrb className="w-[500px] h-[500px] bg-[#10b981] -bottom-20 -right-40" delay={2} />
        <FloatingOrb className="w-[300px] h-[300px] bg-[#8EB69B] top-1/3 right-1/3" delay={4} />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(142,182,155,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(142,182,155,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-full px-4 py-1.5 mb-8">
            <FiZap className="text-[#10b981] text-sm" />
            <span className="text-sm text-[#10b981] font-medium">Now with AI-powered insights</span>
          </div>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="text-[#DAF1DE]">Master Your Money,</span>
          <br />
          <span className="gradient-text">Shape Your Future</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-[#8EB69B] max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          The smartest way to track expenses, manage budgets, and grow your
          savings. All in one beautifully designed platform.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0d9488] to-[#10b981] text-white font-semibold px-8 py-3.5 rounded-xl text-base hover:shadow-[0_8px_30px_rgba(13,148,136,0.4)] transition-all duration-300 hover:-translate-y-0.5"
          >
            Get Started Free
            <FiArrowRight />
          </Link>
          <button className="inline-flex items-center gap-2 border border-[#8EB69B]/20 text-[#DAF1DE] font-semibold px-8 py-3.5 rounded-xl text-base hover:border-[#8EB69B]/40 hover:bg-[#8EB69B]/5 transition-all duration-300">
            <FiActivity />
            Watch Demo
          </button>
        </motion.div>

        {/* Mock Dashboard Card */}
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 60, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          style={{ perspective: 1000 }}
        >
          <div className="glass-card p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[#8EB69B] text-sm">Total Balance</p>
                <p className="text-3xl font-bold text-[#DAF1DE]">$24,563.00</p>
              </div>
              <div className="text-right">
                <p className="text-[#10b981] text-sm font-medium">+12.5%</p>
                <p className="text-[#8EB69B] text-xs">vs last month</p>
              </div>
            </div>
            <div className="flex gap-3 mb-6">
              {["Income", "Expenses", "Savings"].map((label, i) => (
                <div key={label} className="flex-1 bg-[#163832]/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-[#8EB69B]">{label}</p>
                  <p className="text-sm font-bold text-[#DAF1DE]">
                    ${[18240, 8437, 9826][i].toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="h-32 flex items-end gap-2">
              {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t-md"
                  style={{
                    background: `linear-gradient(to top, #0d9488, #10b981)`,
                    opacity: 0.6 + (h / 100) * 0.4,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.8, delay: 1 + i * 0.05 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { icon: <FiUsers className="text-2xl" />, value: 50000, suffix: "+", label: "Active Users" },
    { icon: <FiDollarSign className="text-2xl" />, value: 2, suffix: "M+", label: "Tracked", prefix: "$" },
    { icon: <FiActivity className="text-2xl" />, value: 99.9, suffix: "%", label: "Uptime", decimals: 1 },
    { icon: <FiStar className="text-2xl" />, value: 4.9, suffix: "", label: "User Rating", decimals: 1 },
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} className="glass-card p-6 text-center" variants={fadeInUp}>
              <div className="w-12 h-12 rounded-xl bg-[#0d9488]/10 flex items-center justify-center mx-auto mb-4 text-[#10b981]">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-[#DAF1DE] mb-1">
                {stat.prefix || ""}
                <CountUp
                  end={stat.value}
                  duration={2.5}
                  decimals={stat.decimals || 0}
                  separator=","
                />
                {stat.suffix}
              </div>
              <p className="text-sm text-[#8EB69B]">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: <FiBarChart2 />, title: "Smart Analytics", desc: "Visualize your spending patterns with beautiful charts and AI-powered insights." },
    { icon: <FiPieChart />, title: "Budget Management", desc: "Set budgets, track progress, and get alerts before you overspend." },
    { icon: <FiZap />, title: "AI Assistant", desc: "Get personalized financial advice and automated categorization." },
    { icon: <FiTarget />, title: "Goal Tracking", desc: "Set savings goals and watch your progress in real-time." },
    { icon: <FiLock />, title: "Secure & Private", desc: "Bank-level encryption keeps your financial data completely safe." },
    { icon: <FiFileText />, title: "Beautiful Reports", desc: "Generate detailed reports you can share with your accountant." },
  ];

  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          title="Everything You Need"
          subtitle="Powerful features designed to give you complete control over your finances."
        />

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              className="glass-card p-8 group cursor-default"
              variants={fadeInUp}
              whileHover={{
                y: -5,
                rotateX: 3,
                rotateY: -3,
                transition: { duration: 0.3 },
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0d9488]/20 to-[#10b981]/20 flex items-center justify-center text-[#10b981] mb-5 text-xl group-hover:scale-110 transition-transform duration-300">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-[#DAF1DE] mb-3">{f.title}</h3>
              <p className="text-[#8EB69B] text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { num: "01", title: "Create Your Account", desc: "Sign up in seconds. No credit card required." },
    { num: "02", title: "Connect Your Accounts", desc: "Link your bank accounts or manually add transactions." },
    { num: "03", title: "Watch Your Wealth Grow", desc: "Get insights, set goals, and achieve financial freedom." },
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading title="How It Works" subtitle="Three simple steps to financial clarity." />

        <motion.div
          className="grid md:grid-cols-3 gap-8 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-[#0d9488] via-[#10b981] to-[#0d9488] opacity-30" />

          {steps.map((step, i) => (
            <motion.div key={step.num} className="text-center relative" variants={fadeInUp}>
              <motion.div
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0d9488] to-[#10b981] flex items-center justify-center mx-auto mb-6 text-white font-bold text-lg relative z-10"
                whileHover={{ scale: 1.1 }}
              >
                {step.num}
              </motion.div>
              <h3 className="text-xl font-bold text-[#DAF1DE] mb-3">{step.title}</h3>
              <p className="text-[#8EB69B] text-sm max-w-xs mx-auto">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Freelance Designer",
      quote: "ExpenseFlow completely transformed how I manage my business finances. The analytics are incredible.",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "Startup Founder",
      quote: "Finally a finance app that doesn't look like it's from 2010. Beautiful, fast, and incredibly smart.",
      rating: 5,
    },
    {
      name: "Emily Watson",
      role: "Financial Advisor",
      quote: "I recommend ExpenseFlow to all my clients. The budgeting tools are best-in-class.",
      rating: 5,
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          title="Loved by Thousands"
          subtitle="See what our users have to say about their experience."
        />

        <motion.div
          className="grid md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {testimonials.map((t) => (
            <motion.div key={t.name} className="glass-card p-8" variants={fadeInUp}>
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <FiStar key={i} className="text-[#f59e0b] fill-[#f59e0b]" />
                ))}
              </div>
              <p className="text-[#DAF1DE] text-sm leading-relaxed mb-6 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0d9488] to-[#10b981] flex items-center justify-center text-white font-bold text-sm">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#DAF1DE]">{t.name}</p>
                  <p className="text-xs text-[#8EB69B]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "0",
      desc: "Perfect for getting started",
      features: ["50 transactions/mo", "Basic analytics", "1 budget", "Email support"],
      missing: ["AI insights", "Goal tracking", "Priority support"],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "9",
      desc: "For serious money managers",
      features: ["Unlimited transactions", "Advanced analytics", "Unlimited budgets", "AI insights", "Goal tracking", "Priority support"],
      missing: [],
      cta: "Start Pro Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "29",
      desc: "For teams and businesses",
      features: ["Everything in Pro", "Team accounts", "API access", "Custom reports", "Dedicated manager", "SSO & compliance"],
      missing: [],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          title="Simple, Transparent Pricing"
          subtitle="No hidden fees. No surprises. Just great value."
        />

        <motion.div
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              className={`glass-card p-8 relative ${
                plan.popular
                  ? "border-[#0d9488]/50 shadow-[0_0_40px_rgba(13,148,136,0.15)]"
                  : ""
              }`}
              variants={fadeInUp}
              whileHover={{ y: -5 }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0d9488] to-[#10b981] text-white text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-[#DAF1DE] mb-2">{plan.name}</h3>
              <p className="text-sm text-[#8EB69B] mb-6">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#DAF1DE]">${plan.price}</span>
                <span className="text-[#8EB69B]">/mo</span>
              </div>
              <button
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 mb-6 ${
                  plan.popular
                    ? "bg-gradient-to-r from-[#0d9488] to-[#10b981] text-white hover:shadow-[0_8px_25px_rgba(13,148,136,0.4)] hover:-translate-y-0.5"
                    : "border border-[#8EB69B]/20 text-[#DAF1DE] hover:border-[#8EB69B]/40 hover:bg-[#8EB69B]/5"
                }`}
              >
                {plan.cta}
              </button>
              <div className="space-y-3">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <FiCheck className="text-[#10b981] text-sm shrink-0" />
                    <span className="text-sm text-[#8EB69B]">{f}</span>
                  </div>
                ))}
                {plan.missing.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <FiX className="text-[#8EB69B]/30 text-sm shrink-0" />
                    <span className="text-sm text-[#8EB69B]/40">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    {
      q: "Is my financial data secure?",
      a: "Absolutely. We use bank-level 256-bit encryption, and your data is never shared with third parties. We are SOC 2 Type II certified.",
    },
    {
      q: "Can I connect multiple bank accounts?",
      a: "Yes! Pro and Enterprise users can connect unlimited bank accounts, credit cards, and investment accounts.",
    },
    {
      q: "How does the AI assistant work?",
      a: "Our AI analyzes your spending patterns, identifies trends, and provides personalized recommendations to help you save more money.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes, there are no contracts or commitments. You can cancel your subscription at any time from your account settings.",
    },
    {
      q: "Do you offer a mobile app?",
      a: "ExpenseFlow is fully responsive and works beautifully on all devices. A native mobile app is coming soon!",
    },
  ];

  return (
    <section id="faq" className="py-24 relative">
      <div className="max-w-3xl mx-auto px-6">
        <SectionHeading title="Frequently Asked Questions" subtitle="Got questions? We've got answers." />

        <motion.div
          className="space-y-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {faqs.map((faq, i) => (
            <motion.div key={i} className="glass-card overflow-hidden" variants={fadeInUp}>
              <button
                className="w-full flex items-center justify-between p-6 text-left"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span className="text-sm font-semibold text-[#DAF1DE] pr-4">{faq.q}</span>
                <motion.div
                  animate={{ rotate: openIdx === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[#8EB69B] shrink-0"
                >
                  <FiChevronDown size={18} />
                </motion.div>
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: openIdx === i ? "auto" : 0,
                  opacity: openIdx === i ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <p className="px-6 pb-6 text-sm text-[#8EB69B] leading-relaxed">
                  {faq.a}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  const [email, setEmail] = useState("");

  return (
    <section className="py-24 relative">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          className="relative overflow-hidden rounded-3xl p-12 md:p-16 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d9488] to-[#10b981] opacity-20" />
          <FloatingOrb className="w-64 h-64 bg-[#10b981] -top-20 -right-20 opacity-30" delay={0} />
          <FloatingOrb className="w-48 h-48 bg-[#0d9488] -bottom-10 -left-10 opacity-30" delay={2} />
          <div className="absolute inset-0 border border-[#10b981]/20 rounded-3xl" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-[#DAF1DE] mb-4">
              Ready to take control?
            </h2>
            <p className="text-[#8EB69B] text-lg mb-8 max-w-xl mx-auto">
              Join 50,000+ users who are already mastering their finances with ExpenseFlow.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                className="flex-1 bg-[#0B2B26]/80 border border-[#8EB69B]/20 rounded-xl px-5 py-3 text-sm text-[#DAF1DE] placeholder-[#8EB69B]/50 outline-none focus:border-[#10b981] transition-colors"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Link
                to="/register"
                className="bg-gradient-to-r from-[#0d9488] to-[#10b981] text-white font-semibold px-6 py-3 rounded-xl hover:shadow-[0_8px_25px_rgba(13,148,136,0.4)] transition-all duration-300 hover:-translate-y-0.5 text-sm whitespace-nowrap"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  const columns = {
    Product: ["Features", "Pricing", "Integrations", "API", "Changelog"],
    Company: ["About", "Blog", "Careers", "Press Kit", "Partners"],
    Resources: ["Documentation", "Help Center", "Community", "Templates", "Webinars"],
    Legal: ["Privacy", "Terms", "Security", "Cookies", "GDPR"],
  };

  return (
    <footer className="border-t border-[#8EB69B]/10 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0d9488] to-[#10b981] flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="text-xl font-bold text-[#DAF1DE]">ExpenseFlow</span>
            </div>
            <p className="text-sm text-[#8EB69B] max-w-xs mb-6">
              The smartest way to track expenses, manage budgets, and grow your savings.
            </p>
            <div className="flex gap-3">
              {[FiTwitter, FiGithub, FiLinkedin, FiInstagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-[#163832]/50 flex items-center justify-center text-[#8EB69B] hover:text-[#DAF1DE] hover:bg-[#163832] transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(columns).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-[#DAF1DE] mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-[#8EB69B] hover:text-[#DAF1DE] transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#8EB69B]/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#8EB69B]/60">
            &copy; {new Date().getFullYear()} ExpenseFlow. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-[#8EB69B]/60 hover:text-[#8EB69B] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-[#8EB69B]/60 hover:text-[#8EB69B] transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#051F20] overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
