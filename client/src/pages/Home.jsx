import { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Smartphone,
  ArrowRight,
  ShieldAlert,
  History,
  Search,
  CheckCircle2,
  Users,
  Star,
  MapPin,
  Zap,
  Award,
  Eye,
  Globe,
  X,
  Sparkles,
  Building2,
  ChevronRight,
  Lock,
  Loader2,
  AlertTriangle,
  Fingerprint
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PublicLayout from "@/components/PublicLayout";
import axios from "axios";

// --- Reusable Components ---

function WordCarousel({ words, interval = 3000, className = "" }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % words.length);
        setVisible(true);
      }, 350);
    }, interval);
    return () => clearInterval(cycle);
  }, [words, interval]);

  return (
    <span
      className={`inline-block transition-all duration-350 ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-14px)",
      }}
    >
      {words[index]}
    </span>
  );
}

function CountUp({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const step = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const FAQ_ITEMS = [
  {
    q: "What exactly is TraceIt?",
    a: "TraceIt is Nigeria's first verified national gadget registry. Think of it like a Land Registry — but for electronic devices. Every phone, laptop, tablet, or computer registered on TraceIt is permanently linked to its NIN-verified owner.",
  },
  {
    q: "Why should I register my device on TraceIt?",
    a: "Registering your device establishes verifiable proof of ownership, makes recovery possible if stolen, and massively increases your device's resale value in the secondary market.",
  },
  {
    q: "Why am I paying ₦500 for identity verification?",
    a: "The ₦500 identity verification fee is a one-time lifetime charge that connects your profile to official NIMC NIN verification, keeping fraudsters off the platform and giving your ownership certificate legal weight.",
  },
  {
    q: "Can I check a device before buying without registering?",
    a: "Yes — public device lookups by serial number or IMEI can be checked instantly to confirm if a device has clean status or is flagged stolen.",
  },
  {
    q: "How do I transfer ownership when I sell a device?",
    a: "Log into your dashboard, select your device, and initiate a Transfer by entering the buyer's TraceIt email. Once accepted by the buyer, ownership is permanently moved and a digital receipt is generated.",
  },
];

function FaqItem({ q, a, isOpen, onClick }) {
  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
        isOpen ? "border-orange-300 shadow-sm bg-orange-50/30" : "border-neutral-200 bg-white"
      }`}
    >
      <button
        onClick={onClick}
        className="w-full flex items-start justify-between gap-4 px-7 py-5 text-left group"
      >
        <span className={`text-base font-black leading-snug transition-colors ${isOpen ? "text-orange-600" : "text-neutral-900 group-hover:text-orange-500"}`}>
          {q}
        </span>
        <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-lg font-black transition-all duration-200 mt-0.5 ${isOpen ? "bg-orange-500 text-white rotate-45" : "bg-neutral-100 text-neutral-500"}`}>
          +
        </span>
      </button>
      <div
        style={{
          maxHeight: isOpen ? "600px" : "0px",
          overflow: "hidden",
          transition: "max-height 0.35s ease",
        }}
      >
        <div className="px-7 pb-6 text-neutral-600 text-sm leading-relaxed font-medium border-t border-neutral-100 pt-4">
          {a}
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---
export default function Home() {
  const { user, API_URL } = useAuth();
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const handleHeroSearchSubmit = async (e) => {
    e.preventDefault();
    if (!heroSearch.trim()) return;

    try {
      setSearchLoading(true);
      setSearchError(null);
      setSearchResult(null);
      const res = await axios.get(`${API_URL}/devices/search/${encodeURIComponent(heroSearch.trim())}`);
      setSearchResult(res.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setSearchResult({ found: false, serialNumber: heroSearch.trim() });
      } else {
        setSearchError("Could not perform lookup. Please try again or sign in.");
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const features = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Device Registry",
      description: "Register smartphones, laptops, and tablets to establish verified proof of ownership on a secure national database.",
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      icon: <ShieldAlert className="w-6 h-6" />,
      title: "Theft Reporting",
      description: "Flag stolen or lost devices instantly. Our nationwide alert system alerts buyers, technicians, and law enforcement.",
      color: "text-red-500",
      bg: "bg-red-50",
    },
    {
      icon: <History className="w-6 h-6" />,
      title: "Full Device History",
      description: "Trace the complete ownership history of any registered device before you buy — know exactly what you're getting.",
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Secure Transfers",
      description: "Transfer device ownership digitally with a paper trail that protects both buyer and seller in every transaction.",
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Public Device Search",
      description: "Check any device's registration status, theft flag, and transaction history with a simple serial number search.",
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Identity Verification",
      description: "NIN-backed identity verification ensures every user on TraceIt is real, accountable, and legally traceable.",
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Create Your Account",
      description: "Sign up as an individual, vendor, or technician. Complete NIN identity verification to unlock all platform features.",
    },
    {
      step: "02",
      title: "Register Your Devices",
      description: "Add your gadgets with their IMEI or Serial Number. Upload a photo and link them to your verified identity.",
    },
    {
      step: "03",
      title: "Manage and Transfer",
      description: "Monitor your device fleet, report issues instantly, and perform legally-traceable digital ownership transfers.",
    },
  ];

  const roles = [
    {
      icon: <Users className="w-6 h-6 text-orange-600" />,
      title: "Individuals",
      subtitle: "Protect Your Devices",
      perks: [
        "Register & verify ownership",
        "Report theft instantly",
        "Secure device transfers",
        "Full history access",
      ],
      color: "border-orange-200 hover:border-orange-400 bg-white",
      badge: "bg-orange-100 text-orange-700",
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-600" />,
      title: "Vendors",
      subtitle: "Build Customer Trust",
      perks: [
        "Bulk device registration",
        "Sub-store management",
        "Sales verification receipts",
        "Analytics & reports",
      ],
      color: "border-blue-200 hover:border-blue-400 bg-white",
      badge: "bg-blue-100 text-blue-700",
    },
    {
      icon: <Eye className="w-6 h-6 text-green-600" />,
      title: "Technicians",
      subtitle: "Serve with Confidence",
      perks: [
        "Verify devices before repair",
        "Access ownership records",
        "Report suspicious devices",
        "Earn with verifications",
      ],
      color: "border-green-200 hover:border-green-400 bg-white",
      badge: "bg-green-100 text-green-700",
    },
  ];

  return (
    <PublicLayout>
      {/* ── FULL SCREEN & FULL WIDTH HERO SECTION (WHITE BACKGROUND) ── */}
      <section className="w-full min-h-[calc(100vh-4rem)] lg:min-h-screen flex flex-col justify-center pt-24 pb-16 px-5 lg:px-12 relative overflow-hidden bg-gradient-to-b from-orange-50/50 via-white to-white text-neutral-900 border-b border-neutral-100">
        {/* Soft Background Accents */}
        <div className="absolute top-0 right-0 w-[650px] h-[650px] bg-orange-100/60 rounded-full blur-[140px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-amber-100/40 rounded-full blur-[120px] translate-y-1/4 -translate-x-1/4 pointer-events-none" />

        <div className="w-full max-w-7xl mx-auto relative z-10 my-auto">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 bg-white text-orange-600 border border-orange-200 text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-full mb-8 shadow-sm">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
            Nigeria's #1 National Gadget Registry &amp; Anti-Theft Network
          </div>

          {/* FULL SCREEN HERO TEXT */}
          <div className="w-full">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.02] mb-8 text-neutral-900">
              Don't Buy A Stolen{" "}
              <WordCarousel
                words={["Phone", "MacBook", "Laptop", "iPad", "Camera", "Gadget"]}
                interval={3000}
                className="text-orange-500 underline decoration-orange-300 decoration-wavy"
              />
              <br />
              <span className="text-neutral-700">And End Up</span>{" "}
              <WordCarousel
                words={[
                  "Behind Bars.",
                  "in Police Custody.",
                  "with a Criminal Record.",
                  "in Court.",
                  "Paying a Bail Bond.",
                ]}
                interval={3000}
                className="text-red-500"
              />
            </h1>

            <p className="text-xl sm:text-2xl text-neutral-600 max-w-3xl mb-10 leading-relaxed font-medium">
              In Nigeria, buying a stolen gadget — <strong className="text-neutral-900 font-bold">even unknowingly</strong> — makes you an accessory to crime. TraceIt gives you legal protection and instant identity verification <strong className="text-orange-600 font-bold">before you spend a single Naira</strong>.
            </p>

            {/* INSTANT LIVE SEARCH BAR */}
            <div className="max-w-3xl mb-10">
              <form onSubmit={handleHeroSearchSubmit} className="relative">
                <div className="flex flex-col sm:flex-row items-stretch gap-2.5 bg-white p-2.5 rounded-3xl border-2 border-orange-200 shadow-xl shadow-orange-100/60 hover:border-orange-400 transition-all">
                  <div className="flex-1 flex items-center gap-3.5 px-4 py-2">
                    <Search className="w-6 h-6 text-orange-500 shrink-0" />
                    <input
                      type="text"
                      value={heroSearch}
                      onChange={(e) => setHeroSearch(e.target.value)}
                      placeholder="Enter IMEI or Serial Number to run instant status check..."
                      className="w-full text-neutral-900 placeholder-neutral-400 text-base font-semibold focus:outline-none bg-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searchLoading}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-black text-base px-8 py-4 rounded-2xl transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                  >
                    {searchLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    Instant Verify
                  </button>
                </div>
              </form>

              {/* Live Search Result Inline */}
              {searchResult && (
                <div className="mt-4 bg-white border border-neutral-200 rounded-3xl p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                  {searchResult.found ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${searchResult.status === 'stolen' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                            {searchResult.status === 'stolen' ? '🚨 STOLEN / FLAGGED' : '✅ REGISTERED & CLEAN'}
                          </span>
                        </div>
                        <h4 className="text-xl font-black text-neutral-900">{searchResult.brand} {searchResult.model}</h4>
                        <p className="text-xs text-neutral-500 font-mono">SN/IMEI: {searchResult.serialNumber || searchResult.imei}</p>
                      </div>
                      <Link
                        to={user ? "/dashboard" : "/register"}
                        className="bg-orange-500 text-white text-xs font-bold px-5 py-3 rounded-xl hover:bg-orange-600 transition-colors shrink-0"
                      >
                        View Full History Certificate
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 text-amber-800 text-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-neutral-900">No Registration Record Found for "{searchResult.serialNumber}"</p>
                        <p className="text-xs text-neutral-600 mt-1">This device is not yet registered on TraceIt. Ask the owner to register it before you buy, or register it under your account once purchased!</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {searchError && (
                <p className="text-xs text-red-500 mt-2 font-bold pl-4">{searchError}</p>
              )}
            </div>

            {/* HERO CTA BUTTONS */}
            <div className="flex flex-wrap items-center gap-4 mb-16">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="inline-flex items-center gap-3 bg-orange-500 text-white font-black text-lg px-9 py-4.5 rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-200 group"
              >
                {user ? "Go to Dashboard" : "Register Your Device Free"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/features?tab=howItWorks"
                className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-base px-7 py-4.5 rounded-2xl border border-neutral-200 transition-all"
              >
                See How It Works
                <ChevronRight className="w-5 h-5 text-orange-500" />
              </Link>
            </div>

            {/* TRUST BAR */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 pt-6 border-t border-neutral-200 text-xs sm:text-sm font-semibold text-neutral-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" /> NIMC NIN Verified Platform
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-green-600" /> Paystack Encrypted
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-600" /> Cloudinary Media Storage
              </div>
            </div>
          </div>
        </div>

        {/* HERO STATS BAR (WHITE BACKGROUND) */}
        <div className="w-full max-w-7xl mx-auto mt-16 pt-8 border-t border-neutral-200">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { value: 12000, suffix: "+", label: "Registered Gadgets" },
              { value: 3400, suffix: "+", label: "NIN-Verified Users" },
              { value: 850, suffix: "+", label: "Stolen Reports Solved" },
              { value: 99.9, suffix: "%", label: "Platform Availability" },
            ].map(({ value, suffix, label }) => (
              <div key={label} className="bg-white border border-neutral-200 rounded-2xl p-5 text-center shadow-sm hover:border-orange-300 transition-colors">
                <div className="text-2xl sm:text-3xl font-black text-orange-500 mb-1">
                  <CountUp target={value} suffix={suffix} />
                </div>
                <div className="text-xs font-semibold text-neutral-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM / SOLUTION SECTION ── */}
      <section className="py-24 px-5 lg:px-8 bg-neutral-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-red-400 mb-5 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> The Legal Risk Nobody Tells You
            </div>
            <h2 className="text-3xl sm:text-5xl font-black leading-tight mb-6">
              Buying a stolen gadget
              <span className="text-red-400"> can put you behind bars.</span>
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg leading-relaxed mb-8">
              Under Nigerian criminal law, buying or possessing a stolen device — even if you paid full price and bought it in good faith — makes you an accessory to theft. Police regularly raid markets and checkpoints to seize unverified devices. <strong className="text-white font-bold">Ignorance is not a defence under the law.</strong>
            </p>
            <div className="space-y-4">
              {[
                "Buyers caught with stolen devices face police detention & prosecution",
                "Paper receipts and seller stories are easily faked and hold zero legal weight",
                "Police impound devices with no guarantee of return to innocent buyers",
                "Technicians servicing stolen devices can be prosecuted as co-conspirators",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3 text-neutral-300 text-sm font-medium">
                  <div className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 lg:p-10 shadow-2xl relative">
            <div className="text-xs font-black uppercase tracking-widest text-orange-400 mb-5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-orange-500" /> The Solution — Verify First, Buy Safe
            </div>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-6 text-white">
              TraceIt is your
              <span className="text-orange-500"> 5-second legal defense</span>
              {" "}before every purchase.
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed mb-8">
              Just enter the device Serial Number or IMEI into TraceIt before paying. In seconds, you will know if the device is stolen, flagged, or clear — with an official digital ownership record.
            </p>
            <div className="space-y-4 mb-8">
              {[
                "Instantly check if a device is flagged stolen anywhere in Nigeria",
                "View the complete chain of NIN-verified previous owners",
                "Receive a digital Proof of Ownership Certificate upon transfer",
                "Protect yourself legally — a TraceIt lookup establishes proof of due diligence",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3 text-neutral-300 text-sm font-medium">
                  <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />
                  </div>
                  {point}
                </div>
              ))}
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4.5 text-xs sm:text-sm text-orange-200 font-semibold leading-relaxed">
              💡 <strong className="text-orange-400">Pro tip:</strong> Always ask the seller for the device's Serial Number or IMEI before meeting them. If they hesitate or refuse — walk away.
            </div>
          </div>
        </div>
      </section>

      {/* ── DEDICATED FEATURES SECTION ── */}
      <section className="py-24 px-5 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-widest mb-4">
                <Zap className="w-3.5 h-3.5" /> Platform Capabilities
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-neutral-900">
                Everything you need to own tech safely.
              </h2>
            </div>
            <Link
              to="/features?tab=features"
              className="inline-flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-sm px-6 py-3.5 rounded-2xl transition-colors shrink-0"
            >
              Explore All Dedicated Features <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group p-8 rounded-3xl border border-neutral-200 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-100/50 hover:-translate-y-1 transition-all duration-300 bg-white flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 ${f.bg} ${f.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-black text-neutral-900 mb-3">{f.title}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed font-medium mb-6">{f.description}</p>
                </div>
                <Link
                  to="/features?tab=features"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
                >
                  Learn details <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <section className="py-24 px-5 lg:px-8 bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Step-by-Step Workflow
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-neutral-900">
                Up and running in 3 simple steps.
              </h2>
            </div>
            <Link
              to="/features?tab=howItWorks"
              className="inline-flex items-center gap-2 bg-white border border-neutral-200 hover:border-orange-300 text-neutral-700 hover:text-orange-600 font-bold text-sm px-6 py-3.5 rounded-2xl transition-all shadow-sm shrink-0"
            >
              View Full "How It Works" Guide <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {howItWorks.map((step, i) => (
              <div key={i} className="relative bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center text-lg font-black mb-6 shadow-lg shadow-orange-200">
                  {step.step}
                </div>
                <h3 className="text-xl font-black text-neutral-900 mb-3">{step.title}</h3>
                <p className="text-neutral-500 font-medium text-sm leading-relaxed mb-6">{step.description}</p>
                <Link to="/features?tab=howItWorks" className="text-xs font-bold text-orange-500 hover:underline flex items-center gap-1">
                  Read step guide <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR WHO SECTION ── */}
      <section className="py-24 px-5 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-widest mb-4">
                <Users className="w-3.5 h-3.5" /> Tailored Ecosystem
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-neutral-900">
                Who uses TraceIt?
              </h2>
            </div>
            <Link
              to="/features?tab=forWho"
              className="inline-flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-sm px-6 py-3.5 rounded-2xl transition-colors shrink-0"
            >
              Explore "For Who" Details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {roles.map((role, i) => (
              <div
                key={i}
                className={`p-8 rounded-3xl border-2 ${role.color} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between`}
              >
                <div>
                  <div className={`inline-flex items-center gap-2 ${role.badge} text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-6`}>
                    {role.icon}
                    <span>{role.title}</span>
                  </div>
                  <h3 className="text-xl font-black text-neutral-900 mb-2">{role.subtitle}</h3>
                  <ul className="space-y-3 mt-5 mb-8">
                    {role.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-3 text-sm font-semibold text-neutral-600">
                        <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to="/features?tab=forWho"
                  className="inline-flex items-center gap-2 text-sm font-black text-orange-500 hover:text-orange-600 transition-colors"
                >
                  Learn how TraceIt protects {role.title} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MERCHANTS & INFLUENCERS SPOTLIGHT PREVIEW ── */}
      <section className="py-20 px-5 lg:px-8 bg-neutral-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 hover:border-orange-500/50 transition-all">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
                <Building2 className="w-3.5 h-3.5" /> Verified Vendor Directory
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Confirm Registered Merchants</h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                Search and confirm the identity of authorized phone stores, laptop sellers, and gadget dealers registered on the TraceIt National Registry before transacting.
              </p>
              <Link
                to="/merchants"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors shadow-lg shadow-orange-500/20"
              >
                Browse Merchant Directory <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 hover:border-orange-500/50 transition-all">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Tech Advocates
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Meet Our Brand Ambassadors</h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                See the top Nigerian tech creators, industry champions, and brand ambassadors backing TraceIt to make gadget theft a thing of the past.
              </p>
              <Link
                to="/influencers"
                className="inline-flex items-center gap-2 bg-white text-neutral-900 font-bold text-xs px-6 py-3 rounded-xl hover:bg-neutral-100 transition-colors shadow-lg"
              >
                Meet Ambassadors <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section className="py-24 px-5 lg:px-8 bg-neutral-50 border-t border-neutral-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-black uppercase tracking-widest text-orange-500 mb-4">Real Stories</div>
            <h2 className="text-4xl lg:text-5xl font-black text-neutral-900 mb-5">
              Trusted by Nigerians.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Emeka Okonkwo",
                role: "Electronics Vendor, Lagos",
                text: "TraceIt transformed how I run my shop. My customers now know every device I sell is clean and legitimate. Sales confidence went up 100%.",
                avatar: "EO",
              },
              {
                name: "Amina Bello",
                role: "IT Professional, Abuja",
                text: "I checked a used MacBook's serial number before buying — TraceIt showed it was flagged stolen. Saved me over ₦350,000. Amazing service.",
                avatar: "AB",
              },
              {
                name: "Chukwudi Eze",
                role: "University Student, Enugu",
                text: "My phone was stolen and I flagged it on TraceIt. A week later, a technician spotted it and I got it back. This platform is a game changer.",
                avatar: "CE",
              },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-neutral-700 text-sm leading-relaxed font-medium mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-black">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-black text-neutral-900">{t.name}</div>
                    <div className="text-xs font-semibold text-neutral-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-orange-500" /> {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section id="faq" className="py-24 px-5 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-black uppercase tracking-widest text-orange-500 mb-4">Got Questions?</div>
            <h2 className="text-4xl lg:text-5xl font-black text-neutral-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-neutral-500 text-lg">Everything you need to know about TraceIt — honest, plain answers.</p>
          </div>
          
          <div className="space-y-3 mb-10">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem
                key={i}
                q={item.q}
                a={item.a}
                isOpen={openFaqIndex === i}
                onClick={() => setOpenFaqIndex(openFaqIndex === i ? -1 : i)}
              />
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 font-black text-sm px-8 py-4 rounded-2xl transition-colors shadow-sm"
            >
              View Full FAQ Directory <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA SECTION ── */}
      <section className="py-24 px-5 lg:px-8 bg-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="text-xs font-black uppercase tracking-widest text-orange-100 mb-5">Don't Risk It — Check First, Buy Safe</div>
          <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-tight">
            A stolen gadget check<br />costs ₦500. A police case doesn't.
          </h2>
          <p className="text-orange-100 text-lg mb-10 max-w-2xl mx-auto">
            Thousands of Nigerians have already avoided police trouble, recovered stolen devices, and sold their gadgets faster by using TraceIt. Join them — it takes less than 2 minutes to register.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2.5 bg-white text-orange-600 font-black text-base px-8 py-4 rounded-2xl hover:bg-orange-50 transition-all shadow-2xl group"
            >
              {user ? "Open Dashboard" : "Get Started for Free"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-white font-bold text-base px-6 py-4 rounded-2xl border-2 border-white/30 hover:border-white/60 transition-all"
            >
              Sign in to my account
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
