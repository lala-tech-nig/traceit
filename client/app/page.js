"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Smartphone, 
  Zap, 
  ShieldAlert, 
  ArrowRight,
  UserCheck,
  History,
  Activity
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      title: "Gadget Registry",
      description: "Register your smartphones, laptops, and tablets in our secure database to establish proof of ownership.",
      icon: <Smartphone className="w-6 h-6" />,
      color: "bg-blue-500"
    },
    {
      title: "Secure Transfers",
      description: "Transfer ownership seamlessly when selling or gifting gadgets. Ensure a clean digital paper trail for every device.",
      icon: <Zap className="w-6 h-6" />,
      color: "bg-amber-500"
    },
    {
      title: "Theft Protection",
      description: "Flag stolen devices instantly. Our nationwide database helps technicians and buyers avoid black-market gadgets.",
      icon: <ShieldAlert className="w-6 h-6" />,
      color: "bg-red-500"
    },
    {
      title: "History Tracking",
      description: "Access the complete lifecycle of any registered device. Know exactly where it came from and its current status.",
      icon: <History className="w-6 h-6" />,
      color: "bg-green-500"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Create Account",
      description: "Sign up as an individual, vendor, or technician to join the TraceIt ecosystem."
    },
    {
      number: "02",
      title: "Register Devices",
      description: "Add your gadgets using IMEI or Serial Numbers to link them to your identity."
    },
    {
      number: "03",
      title: "Stay Protected",
      description: "Manage your fleet, track transfers, and report issues in real-time."
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-[family-name:var(--font-geist-sans)] selection:bg-primary/20">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-8 border border-primary/20"
              >
                <Activity className="w-4 h-4" />
                <span>Africa's Most Trusted Gadget Registry</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-5xl lg:text-7xl font-extrabold tracking-tight text-neutral-900 mb-8 leading-[1.1]"
              >
                Secure Your Tech. <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-500">
                  Trace Your Gadgets.
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-lg lg:text-xl text-neutral-600 max-w-2xl mx-auto mb-12 leading-relaxed"
              >
                TraceIt is a professional platform designed to eradicate gadget theft by creating a verified digital history for every device. Buy, sell, and own with absolute confidence.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link 
                  href={user ? "/dashboard" : "/register"} 
                  className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 group"
                >
                  {user ? "Go to Dashboard" : "Protect Your Gadgets Now"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="#features" 
                  className="w-full sm:w-auto px-8 py-4 bg-white text-neutral-700 border-2 border-neutral-100 rounded-2xl font-bold text-lg hover:border-primary/20 hover:bg-neutral-50 transition-all flex items-center justify-center"
                >
                  Learn More
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">Comprehensive Protection</h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">Built with security and transparency at its core, TraceIt provides the tools you need to safeguard your digital life.</p>
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeIn}
                  className="p-8 bg-white rounded-3xl border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
                >
                  <div className={`w-12 h-12 ${feature.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">{feature.title}</h3>
                  <p className="text-neutral-600 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-6">Simple Steps to Secondary Market Safety</h2>
                <p className="text-lg text-neutral-600 mb-10 leading-relaxed">
                  We've simplified the process of gadget registration and verification so you can focus on what matters. Whether you're a buyer, seller, or technician, TraceIt works for you.
                </p>
                
                <div className="space-y-8">
                  {steps.map((step, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex gap-6"
                    >
                      <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                        {step.number}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-neutral-900 mb-1">{step.title}</h4>
                        <p className="text-neutral-600 font-medium">{step.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="lg:w-1/2 relative">
                <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10 rounded-full"></div>
                <div className="bg-neutral-900 aspect-square rounded-[3rem] p-8 shadow-2xl relative">
                  <div className="absolute top-4 left-4 right-4 h-8 bg-neutral-800 rounded-t-xl flex items-center px-4 gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <div className="mt-8 h-full bg-neutral-800/50 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                    <ShieldCheck className="w-24 h-24 text-primary mb-6 animate-pulse" />
                    <div className="h-4 w-48 bg-neutral-700 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-neutral-700 rounded-full mb-8"></div>
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <div className="h-20 bg-neutral-700/50 rounded-2xl border border-neutral-600 flex flex-col items-center justify-center gap-2">
                        <UserCheck className="w-6 h-6 text-neutral-400" />
                        <div className="h-2 w-12 bg-neutral-600 rounded-full"></div>
                      </div>
                      <div className="h-20 bg-neutral-700/50 rounded-2xl border border-neutral-600 flex flex-col items-center justify-center gap-2">
                        <Lock className="w-6 h-6 text-neutral-400" />
                        <div className="h-2 w-12 bg-neutral-600 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 bg-neutral-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">Ready to secure your gadgets?</h2>
            <p className="text-xl text-neutral-400 mb-12">Join thousands of users across Africa who trust TraceIt for device verification and registry services.</p>
            <Link 
              href={user ? "/dashboard" : "/register"} 
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-neutral-900 rounded-2xl font-extrabold text-xl hover:bg-neutral-100 transition-all shadow-2xl"
            >
              Get Started for Free
              <ArrowRight className="w-6 h-6" />
            </Link>
            <p className="mt-8 text-neutral-500 font-medium">No credit card required to register your first device.</p>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg"></div>
            <span className="text-xl font-black tracking-tighter text-neutral-900 uppercase">TraceIt</span>
          </div>
          <p className="text-neutral-500 font-medium text-sm">
            © {new Date().getFullYear()} TraceIt Registry. All rights reserved.
          </p>
          <div className="flex gap-8 text-sm font-bold text-neutral-600">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
