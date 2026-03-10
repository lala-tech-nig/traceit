"use client";

import { useState, useEffect } from "react";
import { Search, ShieldCheck, Lock, CheckCircle2, History, AlertTriangle, AlertOctagon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchStatus, setSearchStatus] = useState("idle"); // idle, loading, success, error, not_found
  const { user, API_URL } = useAuth();

  // Fake payment state for demonstration
  const [hasPaidForSearch, setHasPaidForSearch] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // If user is vendor/tech, they have unlimited searches
  const hasUnlimitedSearch = user?.role === 'vendor' || user?.role === 'technician';

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim().length === 0) return;

    setSearchStatus("loading");
    setSearchResult(null);
    setHasPaidForSearch(false);

    try {
      // For landing page search, we hit an endpoint.
      // If user is authenticated, we hit the protected endpoint.
      // If not, we might hit a public one that returns blurred/partial data.
      let headers = {};
      if (user) {
        headers.Authorization = `Bearer ${user.token}`;
      }

      // To accommodate the requirement: "search bar that on input... response will display in blurred box demanding the login"
      // If not logged in, we can hit a public endpoint or we can just simulate the blurred box if the device exists.
      // Let's create a public search endpoint in the backend for this later, or just handle errors gracefully.

      const endpoint = user
        ? `${API_URL}/devices/search/${searchQuery}`
        : `${API_URL}/devices/public-search/${searchQuery}`; // We will add this endpoint

      const res = await axios.get(endpoint, { headers });
      setSearchResult(res.data);
      setSearchStatus("success");
    } catch (error) {
      if (error.response?.status === 404) {
        setSearchStatus("not_found");
      } else {
        // If 401/Unauthorized, it means they need to login to view full details
        setSearchStatus("error");
        setSearchResult({ _id: 'dummy', needsLogin: true }); // Mock data to trigger blurred box
      }
    }
  };

  const handlePaymentSimulation = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setHasPaidForSearch(true);
    }, 1500);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'clean': return <span className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-bold uppercase tracking-wide flex items-center gap-2 border border-green-200"><ShieldCheck className="w-5 h-5" /> Clean</span>;
      case 'lost': return <span className="px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-bold uppercase tracking-wide flex items-center gap-2 border border-orange-200"><AlertTriangle className="w-5 h-5" /> Lost</span>;
      case 'stolen': return <span className="px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-bold uppercase tracking-wide flex items-center gap-2 border border-red-200"><AlertOctagon className="w-5 h-5" /> Stolen</span>;
      default: return null;
    }
  };

  const showBlurredBox = searchResult && (!user || (user.role === 'basic' && !hasPaidForSearch));
  const showActualData = searchResult && user && (hasUnlimitedSearch || hasPaidForSearch || user._id === searchResult.currentOwner?._id);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-[family-name:var(--font-geist-sans)]">
      <Navbar />

      <main className="flex-1 flex flex-col w-full pt-28 pb-20">
        <section className="w-full relative px-4 py-12 sm:py-20 flex flex-col items-center justify-center text-center overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
              Eradicate Gadget Theft <br className="hidden md:block" />
              <span className="text-primary italic font-serif pr-2">Forever.</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Buy cleanly, transfer safely, and view the complete digital history of any gadget. The trusted registry for verifying device ownership in Africa.
            </p>

            <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-neutral-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Serial Number or IMEI..."
                className="w-full pl-12 pr-32 py-5 rounded-2xl border-2 border-neutral-200 outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all font-medium text-lg bg-white shadow-sm"
                required
              />
              <button disabled={searchStatus === 'loading'} type="submit" className="absolute inset-y-2 right-2 bg-foreground text-white px-6 rounded-xl font-bold hover:bg-neutral-800 transition-colors shadow-md flex items-center gap-2 disabled:opacity-70">
                {searchStatus === 'loading' ? 'Searching...' : 'Verify'}
              </button>
            </form>
          </motion.div>

          <AnimatePresence mode="wait">
            {searchStatus === "not_found" && (
              <motion.div key="not-found" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mt-12 w-full max-w-2xl mx-auto">
                <div className="bg-white border border-neutral-200 p-8 rounded-3xl shadow-md text-center">
                  <AlertTriangle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Device Not Found</h3>
                  <p className="text-neutral-600 font-medium">We couldn't find any device matching that Serial Number or IMEI in our registry. It might not be registered yet.</p>
                </div>
              </motion.div>
            )}

            {showBlurredBox && (
              <motion.div key="blurred" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mt-12 w-full max-w-3xl mx-auto text-left relative">
                <div className="bg-white border border-neutral-200 p-8 rounded-3xl shadow-xl relative overflow-hidden">
                  <div className="flex flex-col gap-6 filter blur-[10px] select-none opacity-40">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-6 w-32 bg-neutral-300 rounded mb-2"></div>
                        <div className="h-8 w-48 bg-neutral-400 rounded"></div>
                      </div>
                      <div className="h-10 w-24 bg-neutral-300 rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><div className="h-4 w-20 bg-neutral-300 rounded"></div><div className="h-5 w-full bg-neutral-200 rounded"></div></div>
                      <div className="space-y-2"><div className="h-4 w-20 bg-neutral-300 rounded"></div><div className="h-5 w-full bg-neutral-200 rounded"></div></div>
                    </div>
                  </div>

                  <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[6px] flex flex-col items-center justify-center text-center p-6">
                    <Lock className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Device Found in Registry</h3>

                    {!user ? (
                      <>
                        <p className="text-neutral-700 font-medium mb-6 max-w-md">
                          Log in to your account and complete verification to view detailed ownership history, actual status (Clean, Stolen, Lost), and current owner of this device.
                        </p>
                        <div className="flex items-center gap-4">
                          <Link href="/login" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-md">
                            Login to View
                          </Link>
                          <Link href="/register" className="bg-white text-foreground border border-neutral-200 px-6 py-3 rounded-xl font-bold hover:bg-neutral-50 transition-colors">
                            Create Account
                          </Link>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-neutral-700 font-medium mb-6 max-w-md">
                          You are currently on a <span className="font-bold text-foreground capitalize">{user.role}</span> plan. Searching device history costs <span className="font-bold text-primary">₦500</span> per search.
                        </p>
                        <button
                          onClick={handlePaymentSimulation}
                          disabled={isProcessingPayment}
                          className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                          {isProcessingPayment ? "Processing Payment..." : "Pay ₦500 to View Details"}
                        </button>
                        <p className="text-xs text-neutral-500 mt-4">(Simulated Flutterwave payment step)</p>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {showActualData && (
              <motion.div key="actual" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-12 w-full max-w-4xl mx-auto text-left">
                <div className="bg-white border-2 border-primary/20 p-8 rounded-3xl shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-orange-400"></div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-8 border-b border-neutral-100">
                    <div className="flex gap-6 items-center">
                      {searchResult.deviceImage ? (
                        <img src={searchResult.deviceImage} alt={searchResult.name} className="w-24 h-24 rounded-2xl object-cover border border-neutral-200 shadow-sm" />
                      ) : (
                        <div className="w-24 h-24 bg-neutral-100 rounded-2xl flex items-center justify-center border border-neutral-200">
                          <ShieldCheck className="w-10 h-10 text-neutral-400" />
                        </div>
                      )}
                      <div>
                        <h2 className="text-3xl font-extrabold text-foreground mb-1">{searchResult.name}</h2>
                        <p className="text-lg font-semibold text-neutral-500">{searchResult.brand} • {searchResult.model}</p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(searchResult.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold flex items-center gap-2 border-b border-neutral-100 pb-2">
                        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Search className="w-4 h-4" /></span>
                        Device Specs
                      </h3>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                        <div><p className="text-sm font-semibold text-neutral-500 mb-1">Color</p><p className="font-bold text-foreground">{searchResult.color}</p></div>
                        <div><p className="text-sm font-semibold text-neutral-500 mb-1">Serial Number</p><p className="font-bold text-neutral-700 font-mono bg-neutral-100 px-2 py-1 rounded inline-block">{searchResult.serialNumber}</p></div>
                        {searchResult.imei && (
                          <div className="col-span-2"><p className="text-sm font-semibold text-neutral-500 mb-1">IMEI</p><p className="font-bold text-neutral-700 font-mono bg-neutral-100 px-2 py-1 rounded inline-block">{searchResult.imei}</p></div>
                        )}
                      </div>

                      <h3 className="text-xl font-bold flex items-center gap-2 border-b border-neutral-100 pb-2 mt-8">
                        <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><ShieldCheck className="w-4 h-4" /></span>
                        Current Owner
                      </h3>
                      {searchResult.currentOwner ? (
                        <div className="flex items-center gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                          {searchResult.currentOwner.image ? (
                            <img src={searchResult.currentOwner.image} alt="Owner" className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl">
                              {searchResult.currentOwner.name?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-foreground">{searchResult.currentOwner.name}</p>
                            <p className="text-sm font-semibold text-neutral-500 capitalize">{searchResult.currentOwner.role}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-neutral-500 italic">No owner data available</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2 border-b border-neutral-100 pb-2 mb-6">
                        <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center"><History className="w-4 h-4" /></span>
                        Ownership History
                      </h3>

                      {searchResult.history && searchResult.history.length > 0 ? (
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-200 before:to-transparent">
                          {searchResult.history.slice().reverse().map((record, index) => (
                            <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-neutral-200 text-neutral-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10 ms-0 md:mx-auto">
                                <ArrowLeftRight className="w-4 h-4" />
                              </div>
                              <div className="bg-white border border-neutral-200 rounded-2xl p-4 w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] shadow-sm text-sm">
                                <div className="font-bold text-primary mb-1">Transfer Entry</div>
                                <div className="font-medium text-neutral-600 mb-2">From <span className="font-bold text-foreground">{record.previousOwner?.name || 'Unknown'}</span> to <span className="font-bold text-foreground">{record.newOwner?.name || 'Unknown'}</span></div>
                                <div className="bg-neutral-50 p-2 rounded-lg italic text-neutral-500">"{record.comment}"</div>
                                <div className="text-xs font-semibold text-neutral-400 mt-2">{new Date(record.transferDate).toLocaleDateString()}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 bg-neutral-50 rounded-2xl border border-neutral-100">
                          <History className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                          <p className="font-medium text-neutral-500">No transfer history available.</p>
                          <p className="text-sm text-neutral-400">This device has not been transferred yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
