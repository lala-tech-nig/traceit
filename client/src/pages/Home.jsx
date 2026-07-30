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
  ChevronDown,
  Menu,
  X,
  Zap,
  Lock,
  TrendingUp,
  Award,
  Eye,
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// --- Reusable Components ---

function WordCarousel({ words, interval = 2400 }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      // Fade out
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % words.length);
        // Fade in
        setVisible(true);
      }, 350);
    }, interval);
    return () => clearInterval(cycle);
  }, [words, interval]);

  return (
    <span
      style={{
        display: "inline-block",
        transition: "opacity 0.35s ease, transform 0.35s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-12px)",
        color: "#f97316",
        minWidth: "2ch",
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

// --- FAQ Accordion ---
const FAQ_ITEMS = [
  {
    q: "What exactly is TraceIt?",
    a: "TraceIt is Nigeria's first verified national gadget registry. Think of it like a Land Registry — but for electronic devices. Every phone, laptop, tablet, or computer registered on TraceIt is permanently linked to its NIN-verified owner. This creates an immutable digital record that proves ownership, tracks device history, and flags stolen gadgets across a nationwide database accessible to buyers, sellers, technicians, and law enforcement.",
  },
  {
    q: "Why should I register my device on TraceIt?",
    a: "Registering your device does three critical things: (1) It establishes verifiable proof of ownership — no receipt or box is needed. (2) It makes recovery far more likely if the device is ever stolen, because it's flagged in a national database that technicians and buyers check. (3) It massively increases your device's resale value — a registered, clean device commands a higher price because the buyer can independently verify it isn't stolen. Unregistered devices raise suspicion in the secondary market.",
  },
  {
    q: "How does TraceIt enhance my chances of finding a lost or stolen gadget?",
    a: "When you flag a device as stolen on TraceIt, it becomes instantly visible in our national registry as 'STOLEN'. Any buyer, technician, or verified user who checks that device's serial number or IMEI will see the flag. Our network includes repair shops, phone dealers, and individual buyers across Nigeria who run checks before transacting. Additionally, our Verificators — field agents who confirm addresses — create a verifiable chain of custody. Several users have had their devices recovered this way. The more active the TraceIt network grows, the higher recovery chances become.",
  },
  {
    q: "Why am I paying ₦500 for identity verification?",
    a: "The ₦500 identity verification fee is a one-time, lifetime charge — not a subscription. It covers the cost of connecting to the NIN verification infrastructure, running background checks, and maintaining a legally-accountable user database. Without verified identities, TraceIt would be exploitable — anyone could register a stolen device. This small fee is what separates TraceIt from a fake registry. It's also what gives your registered devices legal weight. Think of it as the cost of a certified stamp of authenticity for every device you'll ever own.",
  },
  {
    q: "Can I check a device before buying without registering?",
    a: "Yes — device lookup by serial number or IMEI is publicly accessible without an account, so you can check a device's stolen/clean status before making any payment. However, to register your own devices, report theft, or perform ownership transfers, you will need to create a verified account.",
  },
  {
    q: "How do I transfer ownership when I sell a device?",
    a: "Once you're registered and verified, go to your dashboard, select the device, and initiate a Transfer. The buyer receives a digital transfer request which they must accept on their own TraceIt account. Once accepted, the device is removed from your profile and permanently linked to the new owner — creating a traceable, tamper-proof transaction record that protects both parties.",
  },
  {
    q: "What if someone registers my device without my permission?",
    a: "Devices are registered under NIN-verified identities. Any fraudulent registration can be challenged and investigated using the verifiable identity trail. TraceIt's support team reviews ownership disputes using NIN records, purchase evidence, and device history. If you believe your device has been fraudulently registered, contact support immediately with your proof of purchase.",
  },
  {
    q: "I'm a phone technician — what's in TraceIt for me?",
    a: "As a technician, TraceIt protects you legally. Before accepting any device for repair, you can run a 5-second check to confirm it isn't stolen. Servicing a stolen device — even unknowingly — can make you legally liable. With TraceIt, you have a documented record that you performed due diligence. Additionally, technician accounts can flag suspicious devices brought in for repair, helping the entire community.",
  },
  {
    q: "Is my personal data safe on TraceIt?",
    a: "Yes. TraceIt stores all data on secured, encrypted servers. Your NIN is used only for one-time identity verification and is never shared with third parties or displayed publicly. Devices listed in the public registry only show verification status — not personal owner details. Full identity information is only visible to law enforcement with a valid request. Our platform is compliant with Nigeria's Data Protection Act (NDPA 2023).",
  },
  {
    q: "What if the platform is down when I want to check a device urgently?",
    a: "TraceIt maintains 99%+ uptime on cloud infrastructure. However, if you're unable to access the platform in an emergency, our general advice is simple: if you cannot verify a device before buying, do not buy it. The risk of purchasing a stolen gadget — and the legal consequences — far outweigh the inconvenience of postponing a transaction. A seller who pressures you to buy without checking should be treated as a red flag.",
  },
];

function FaqItem({ q, a, isOpen, onClick }) {
  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
        isOpen ? "border-orange-300 shadow-sm" : "border-neutral-100"
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

function FaqList() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, i) => (
        <FaqItem
          key={i}
          q={item.q}
          a={item.a}
          isOpen={openIndex === i}
          onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
        />
      ))}
    </div>
  );
}

// --- Main Page ---
export default function Home() {

  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const features = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Device Registry",
      description: "Register your smartphones, laptops, and tablets to establish verified proof of ownership on a secure national database.",
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      icon: <ShieldAlert className="w-6 h-6" />,
      title: "Theft Reporting",
      description: "Flag stolen or lost devices instantly. Our nationwide alert system helps buyers, technicians, and law enforcement.",
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
      description: "Check any device's registration status, theft flag, and full transaction history with a simple serial number search.",
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
      description: "Add your gadgets with their IMEI number or Serial Number. Upload a photo and link them to your verified identity.",
    },
    {
      step: "03",
      title: "Manage and Transfer",
      description: "Monitor your device fleet, report issues instantly, and perform legally-traceable digital ownership transfers.",
    },
  ];

  const testimonials = [
    {
      name: "Emeka Okonkwo",
      role: "Electronics Vendor, Lagos",
      text: "TraceIt transformed how I run my shop. My customers now know every device I sell is clean and legitimate. Sales confidence went up 100%.",
      rating: 5,
      avatar: "EO",
    },
    {
      name: "Amina Bello",
      role: "IT Professional, Abuja",
      text: "I checked a used MacBook's serial number before buying — TraceIt showed it was flagged stolen. Saved me over ₦350,000. Amazing service.",
      rating: 5,
      avatar: "AB",
    },
    {
      name: "Chukwudi Eze",
      role: "University Student, Enugu",
      text: "My phone was stolen and I flagged it on TraceIt. A week later, a technician spotted it and I got it back. This platform is a game changer.",
      rating: 5,
      avatar: "CE",
    },
  ];

  const roles = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Individuals",
      subtitle: "Protect Your Devices",
      perks: [
        "Register & verify ownership",
        "Report theft instantly",
        "Secure device transfers",
        "Full history access",
      ],
      color: "border-orange-200 hover:border-orange-400",
      badge: "bg-orange-100 text-orange-700",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Vendors",
      subtitle: "Build Customer Trust",
      perks: [
        "Bulk device registration",
        "Sub-store management",
        "Sales verification receipts",
        "Analytics & reports",
      ],
      color: "border-blue-200 hover:border-blue-400",
      badge: "bg-blue-100 text-blue-700",
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Technicians",
      subtitle: "Serve with Confidence",
      perks: [
        "Verify devices before repair",
        "Access ownership records",
        "Report suspicious devices",
        "Earn with verifications",
      ],
      color: "border-green-200 hover:border-green-400",
      badge: "bg-green-100 text-green-700",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* ── NAVBAR ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-100" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black text-neutral-900 tracking-tight">TraceIt</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {[
              ["Features", "#features"],
              ["How It Works", "#how-it-works"],
              ["For Who", "#for-who"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-sm font-semibold text-neutral-600 hover:text-orange-500 transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-bold text-neutral-700 hover:text-orange-500 transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              to={user ? "/dashboard" : "/register"}
              className="text-sm font-bold bg-orange-500 text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-colors"
            >
              {user ? "Dashboard" : "Get Started"}
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-700"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-neutral-100 px-5 py-4 space-y-1">
            {[["Features", "#features"], ["How It Works", "#how-it-works"], ["For Who", "#for-who"]].map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-semibold text-neutral-700 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                {label}
              </a>
            ))}
            <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2">
              <Link to="/login" className="px-4 py-3 text-sm font-bold text-neutral-700 rounded-xl hover:bg-neutral-50 text-center">Sign In</Link>
              <Link to={user ? "/dashboard" : "/register"} className="px-4 py-3 text-sm font-bold bg-orange-500 text-white rounded-xl text-center hover:bg-orange-600 transition-colors">
                {user ? "Dashboard" : "Get Started Free"}
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ── HERO ── */}
        <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 px-5 lg:px-8 overflow-hidden relative">
          {/* Background accents */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-50/50 rounded-full translate-y-1/2 -translate-x-1/2 -z-10" />

          <div className="max-w-7xl mx-auto">
            <div className="max-w-4xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                Nigeria's #1 Gadget Registry & Anti-Theft Platform
              </div>

              <h1 className="text-5xl lg:text-7xl font-black text-neutral-900 leading-[1.1] tracking-tight mb-7">
                Don't Buy a Stolen{" "}
                <WordCarousel
                  words={["Phone", "Laptop", "iPad", "MacBook", "Tablet", "Gadget"]}
                  interval={5000}
                />
                <br />
                <span className="text-neutral-700">and End Up</span>{" "}
                <WordCarousel
                  words={[
                    "in Police Custody.",
                    "Behind Bars.",
                    "with a Criminal Record.",
                    "in Legal Trouble.",
                    "in Court.",
                    "Paying a Bail Bond.",
                  ]}
                  interval={5000}
                />
              </h1>

              <p className="text-lg lg:text-xl text-neutral-500 max-w-2xl mb-6 leading-relaxed">
                In Nigeria, buying a stolen phone or laptop — even unknowingly — can get you arrested, prosecuted, and held as an accessory to theft. TraceIt lets you verify any device's status in seconds, <strong className="text-neutral-700">before</strong> you hand over your money.
              </p>

              {/* Urgent warning pill */}
              <div className="inline-flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm font-bold px-5 py-3.5 rounded-2xl mb-8 max-w-xl text-left">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                <span>A 5-second check on TraceIt is <em>always</em> safer than a ₦50,000 bail bond or a police interrogation room. Check first — buy with confidence.</span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-16">
                <Link
                  to={user ? "/dashboard" : "/register"}
                  className="inline-flex items-center gap-2.5 bg-orange-500 text-white font-bold text-base px-7 py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 group"
                >
                  {user ? "Go to Dashboard" : "Register Your Device Free"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 text-neutral-600 font-semibold text-base px-5 py-4 hover:text-orange-500 transition-colors"
                >
                  See how it works
                  <ChevronDown className="w-4 h-4" />
                </a>
              </div>

              {/* Trust bar */}
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                {[
                  { icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, text: "NIN Verified Identities" },
                  { icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, text: "Cloudinary Secured Media" },
                  { icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, text: "Paystack Payment Protected" },
                  { icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, text: "100% Nigerian Platform" },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
                    {icon}
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats bar */}
            <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-100">
              {[
                { value: 12000, suffix: "+", label: "Devices Registered" },
                { value: 3400, suffix: "+", label: "Verified Users" },
                { value: 850, suffix: "+", label: "Theft Reports Filed" },
                { value: 99, suffix: "%", label: "Platform Uptime" },
              ].map(({ value, suffix, label }) => (
                <div key={label} className="bg-white px-8 py-8 text-center">
                  <div className="text-3xl lg:text-4xl font-black text-orange-500 mb-1">
                    <CountUp target={value} suffix={suffix} />
                  </div>
                  <div className="text-sm font-semibold text-neutral-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROBLEM / SOLUTION ── */}
        <section className="py-20 px-5 lg:px-8 bg-neutral-950 text-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-red-400 mb-5">⚠ The Real Risk Nobody Talks About</div>
              <h2 className="text-4xl lg:text-5xl font-black leading-tight mb-6">
                Buying a stolen gadget
                <span className="text-red-400"> can land you in jail.</span>
              </h2>
              <p className="text-neutral-400 text-lg leading-relaxed mb-8">
                Under Nigerian law, being found with stolen property — even if you "didn't know" — can make you an accessory to theft. Police regularly arrest buyers of stolen phones at markets, checkpoints, and repair shops. <strong className="text-white">Ignorance is not a legal defence.</strong>
              </p>
              <div className="space-y-4">
                {[
                  "Buyers arrested with stolen devices face criminal charges",
                  "Receipts and 'seller stories' are easily faked and hold no legal weight",
                  "Police impound devices with no guarantee of return — even to innocent buyers",
                  "Technicians who service stolen phones can be prosecuted as accomplices",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3 text-neutral-300 text-sm font-medium">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-3 h-3" />
                    </div>
                    {point}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-orange-400 mb-5">✓ The Solution — Check Before You Buy</div>
              <h2 className="text-4xl lg:text-5xl font-black leading-tight mb-6">
                TraceIt is your
                <span className="text-orange-500"> 5-second safety check</span>
                {" "}before every purchase.
              </h2>
              <p className="text-neutral-400 text-lg leading-relaxed mb-8">
                Just enter the device Serial Number or IMEI into TraceIt before you pay. In seconds, you'll know if the device is stolen, flagged, or clear — with a verified ownership history that no fake receipt can replicate.
              </p>
              <div className="space-y-4">
                {[
                  "Instantly see if a device has been reported stolen or lost",
                  "View the full chain of verified previous owners",
                  "Get a clean-check certificate before finalising any purchase",
                  "Protect yourself legally — ignorance is not a defence, but a TraceIt check is",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3 text-neutral-300 text-sm font-medium">
                    <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    {point}
                  </div>
                ))}
              </div>
              <div className="mt-8 bg-orange-500/10 border border-orange-500/30 rounded-2xl p-5 text-sm text-orange-200 font-semibold leading-relaxed">
                💡 <strong className="text-orange-400">Pro tip:</strong> Always ask the seller for the device's Serial Number or IMEI before you meet them. If they hesitate or refuse — that's your first red flag.
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-24 px-5 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-xs font-black uppercase tracking-widest text-orange-500 mb-4">Platform Features</div>
              <h2 className="text-4xl lg:text-5xl font-black text-neutral-900 mb-5">
                Everything you need to own tech safely.
              </h2>
              <p className="text-neutral-500 text-lg">
                A complete gadget lifecycle management platform — from first registration to final transfer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="group p-8 rounded-2xl border border-neutral-100 hover:border-orange-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white cursor-default"
                >
                  <div className={`w-12 h-12 ${f.bg} ${f.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-black text-neutral-900 mb-2">{f.title}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed font-medium">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="py-24 px-5 lg:px-8 bg-orange-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-xs font-black uppercase tracking-widest text-orange-500 mb-4">How It Works</div>
              <h2 className="text-4xl lg:text-5xl font-black text-neutral-900 mb-5">
                Up and running in 3 simple steps.
              </h2>
              <p className="text-neutral-500 text-lg">
                No technical knowledge required. If you can fill a form, you can use TraceIt.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
              {/* Connector line (desktop) */}
              <div className="hidden lg:block absolute top-12 left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] h-px bg-orange-200" />

              {howItWorks.map((step, i) => (
                <div key={i} className="relative bg-white rounded-2xl p-8 border border-orange-100 shadow-sm">
                  <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center text-lg font-black mb-6">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-black text-neutral-900 mb-3">{step.title}</h3>
                  <p className="text-neutral-500 font-medium leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOR WHO ── */}
        <section id="for-who" className="py-24 px-5 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-xs font-black uppercase tracking-widest text-orange-500 mb-4">Built For Everyone</div>
              <h2 className="text-4xl lg:text-5xl font-black text-neutral-900 mb-5">
                Who uses TraceIt?
              </h2>
              <p className="text-neutral-500 text-lg">
                Whether you own one phone or run a 10-store electronics chain, TraceIt has a plan designed for you.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {roles.map((role, i) => (
                <div
                  key={i}
                  className={`p-8 rounded-2xl border-2 ${role.color} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
                >
                  <div className={`inline-flex items-center gap-2 ${role.badge} text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-6`}>
                    {role.icon}
                    <span>{role.title}</span>
                  </div>
                  <h3 className="text-xl font-black text-neutral-900 mb-2">{role.subtitle}</h3>
                  <ul className="space-y-3 mt-5">
                    {role.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-3 text-sm font-semibold text-neutral-600">
                        <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/register"
                    className="mt-8 flex items-center gap-2 text-sm font-black text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    Sign up as {role.title} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-24 px-5 lg:px-8 bg-neutral-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-xs font-black uppercase tracking-widest text-orange-500 mb-4">Real Stories</div>
              <h2 className="text-4xl lg:text-5xl font-black text-neutral-900 mb-5">
                Trusted by Nigerians.
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-orange-400 fill-orange-400" />
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
                        <MapPin className="w-3 h-3" /> {t.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-24 px-5 lg:px-8 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <div className="text-xs font-black uppercase tracking-widest text-orange-500 mb-4">Got Questions?</div>
              <h2 className="text-4xl lg:text-5xl font-black text-neutral-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-neutral-500 text-lg">Everything you need to know about TraceIt — honest, plain answers.</p>
            </div>
            <FaqList />
          </div>
        </section>

        {/* ── CTA ── */}
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
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-neutral-950 text-neutral-400 py-16 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-black text-white tracking-tight">TraceIt</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                Nigeria's verified national gadget registry — building a transparent, theft-free technology market, one device at a time.
              </p>
            </div>
            <div>
              <h4 className="text-white font-black text-sm mb-4 uppercase tracking-widest">Platform</h4>
              <ul className="space-y-2.5">
                {["Register Device", "Search Device", "Report Theft", "Verify Identity"].map((item) => (
                  <li key={item}>
                    <Link to="/register" className="text-sm hover:text-orange-400 transition-colors font-medium">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black text-sm mb-4 uppercase tracking-widest">Company</h4>
              <ul className="space-y-2.5">
                {["About TraceIt", "Contact Us", "Privacy Policy", "Terms of Service"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm hover:text-orange-400 transition-colors font-medium">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs font-medium">
              © {new Date().getFullYear()} TraceIt Registry — All Rights Reserved. A product of{" "}
              <span className="text-orange-400 font-bold">Lala Technologies Nigeria Ltd.</span>
            </p>
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-semibold text-neutral-500">256-bit SSL Encrypted & NIN Verified Platform</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
