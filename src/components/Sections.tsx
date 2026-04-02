import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Network, Lock, Activity, Crosshair, X, ArrowRight, Volume2, Waves } from 'lucide-react';
import { ResponderMobile } from './ResponderMobile';

// Static heights for 5 bars — fixed random-looking values
const BAR_HEIGHTS = [0.5, 0.9, 0.65, 1.0, 0.4];

export const LogoSpectrum = () => (
  <div className="flex items-center gap-0.5 h-4">
    {BAR_HEIGHTS.map((scale, i) => (
      <div
        key={i}
        className="w-0.5 bg-tactical-cyan"
        style={{ height: '100%', transform: `scaleY(${scale})`, opacity: 0.4 + scale * 0.6, transformOrigin: 'center' }}
      />
    ))}
  </div>
);

export const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-tactical-bg border-b border-tactical-cyan/10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3">
            <LogoSpectrum />
            <span className="font-display text-lg font-bold tracking-widest text-white uppercase">Echolocation</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {[
            { name: 'Overview', path: '/#overview' },
            { name: 'Features', path: '/#features' },
            { name: 'Demo', path: '/demo' },
            { name: 'Early Access', path: '/mvp', icon: Lock },
            { name: 'Contact', path: '/#contact' }
          ].map((item) => (
            item.path.startsWith('/#') ? (
              <a
                key={item.name}
                href={item.path}
                className="font-mono text-[11px] uppercase tracking-widest text-gray-400 hover:text-tactical-cyan transition-colors"
              >
                {item.name}
              </a>
            ) : (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-gray-400 hover:text-tactical-cyan transition-colors"
              >
                {item.name} {item.icon && <item.icon className="w-3 h-3" />}
              </Link>
            )
          ))}
        </div>
      </div>
    </div>
  </nav>
);

export const Hero = () => (
  <section id="overview" className="relative pt-32 pb-20 overflow-hidden min-h-[100vh] flex items-center tactical-grid">
    <div className="scanline" />
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-[0.9]">
            Real-Time Audio Intelligence for Emergency Response
          </h1>
          <p className="text-xl text-gray-400 mb-10 leading-relaxed">
            EchoLocation connects multiple audio sensors into one system, allowing teams to detect events, estimate their location, and follow activity in real time from a single interface.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/demo" className="px-8 py-4 bg-tactical-cyan text-black font-mono text-xs font-bold uppercase tracking-widest hover:bg-white transition-all glow-cyan">
              View Demo
            </Link>
            <Link to="/mvp" className="px-8 py-4 border border-tactical-cyan/30 text-tactical-cyan font-mono text-xs font-bold uppercase tracking-widest hover:bg-tactical-cyan/10 transition-all">
              Early Access
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="hidden lg:block relative"
        >
          <div className="absolute inset-0 bg-tactical-cyan/5 blur-[100px] rounded-full pointer-events-none" />
          <ResponderMobile />
        </motion.div>
      </div>
    </div>
  </section>
);

export const Problem = () => (
  <section className="py-20 border-y border-tactical-cyan/10 relative overflow-hidden">
    <div className="absolute inset-0 opacity-5 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
        <path
          d="M0,50 Q250,0 500,50 T1000,50"
          fill="none"
          stroke="var(--color-tactical-cyan)"
          strokeWidth="2"
          className="animate-pulse"
        />
        <path
          d="M0,50 Q250,100 500,50 T1000,50"
          fill="none"
          stroke="var(--color-tactical-cyan)"
          strokeWidth="1"
          className="animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </svg>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          {
            title: "Situational Awareness",
            desc: "Real-time information to support decision-making."
          },
          {
            title: "Broader Coverage",
            desc: "Detects events beyond camera visibility."
          },
          {
            title: "Event Localization",
            desc: "Estimates where events occur and tracks movement in real time."
          }
        ].map((item, i) => (
          <div key={i} className="space-y-4">
            <div className="w-10 h-[1px] bg-tactical-cyan/40" />
            <h3 className="text-lg font-bold text-white">{item.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const Features = () => (
  <section id="features" className="py-20 bg-[#080808] tactical-grid">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold text-white mb-4">Core Features</h2>
          <p className="text-gray-400">EchoLocation provides tools to support response coordination and monitoring.</p>
        </div>
        <div className="font-mono text-[10px] text-tactical-cyan uppercase tracking-widest border-b border-tactical-cyan/30 pb-2">
          System Specs v1.0.0
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-tactical-cyan/10 border border-tactical-cyan/10">
        {[
          { icon: Shield, title: "Situational Awareness", desc: "Maintains a live operational picture to help teams understand evolving conditions during active response." },
          { icon: Activity, title: "Acoustic Activity Monitoring", desc: "Identifies and highlights relevant audio events in real time with minimal manual monitoring." },
          { icon: Zap, title: "Rapid Response Support", desc: "Provides structured, confidence-based insights designed to assist trained personnel in high-pressure environments." },
          { icon: Network, title: "Live Event Timeline", desc: "Organizes incoming data into a time-aligned sequence to support coordination and review." }
        ].map((feat, i) => (
          <div key={i} className="bg-tactical-bg p-8 hover:bg-tactical-cyan/[0.02] transition-colors group">
            <feat.icon className="w-6 h-6 text-tactical-cyan mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-white mb-3">{feat.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const MVP = () => (
  <section id="mvp" className="py-20 border-t border-tactical-cyan/10 bg-[#080808]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <div className="font-mono text-[10px] text-tactical-cyan uppercase tracking-[0.3em] mb-4">Active Deployment</div>
        <h2 className="text-4xl font-bold text-white mb-6 tracking-tight uppercase">Early Access v1.0.0</h2>
        <p className="text-gray-400 leading-relaxed mb-8">
          The EchoLocation Early Access program provides a locally deployable system for real-time audio analysis and incident visualization. It enables real-time audio-based event localization and visualization for emergency response teams.
        </p>
        <div className="flex justify-center">
          <Link
            to="/mvp"
            className="inline-flex items-center gap-3 px-8 py-4 bg-tactical-cyan text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-all glow-cyan"
          >
            Access Early Access <Lock className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export const Privacy = () => (
  <section className="py-20">
    <div className="max-w-3xl mx-auto px-4 text-center">
      <Shield className="w-8 h-8 text-tactical-cyan mx-auto mb-8" />
      <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">Access Control & Data Privacy</h2>
      <p className="text-gray-400 leading-relaxed mb-8">
        EchoLocation is designed to support authorized emergency response personnel. The system operates on local networks with configurable data retention and access controls. It is designed to support, not replace, the judgment of trained responders.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 rounded-sm bg-white/5 font-mono text-[10px] text-gray-500 uppercase tracking-widest">
        <Lock className="w-3 h-3" /> Secure Local Operation Only
      </div>
    </div>
  </section>
);

export const ContactPanel = () => (
  <section id="contact" className="py-24 border-t border-tactical-cyan/10 bg-[#080808] tactical-grid">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-10 uppercase tracking-tight leading-tight">
          For inquiries, technical support, or partnerships.
        </h2>
        <div className="flex justify-center">
          <a
            href="mailto:contact@use-muse.com"
            className="group relative px-12 py-6 bg-tactical-cyan/5 border border-tactical-cyan/20 text-tactical-cyan font-mono text-sm font-bold uppercase tracking-[0.2em] hover:bg-tactical-cyan hover:text-black transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">contact@use-muse.com</span>
            <div className="absolute inset-0 bg-tactical-cyan translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </a>
        </div>
      </div>
    </div>
  </section>
);

export const Footer = ({ onPrivacyClick }: { onPrivacyClick: () => void }) => (
  <footer className="py-12 border-t border-tactical-cyan/10 bg-[#050505]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-3">
            <LogoSpectrum />
            <span className="font-display text-sm font-bold tracking-widest text-white uppercase">Echolocation</span>
          </div>
          <a href="mailto:contact@use-muse.com" className="font-mono text-[10px] text-tactical-cyan hover:text-white transition-colors">contact@use-muse.com</a>
        </div>
        <div className="flex gap-8">
          <button
            onClick={onPrivacyClick}
            className="font-mono text-[10px] text-gray-500 hover:text-white uppercase tracking-widest cursor-pointer"
          >
            Privacy Policy
          </button>
          <a href="/#contact" className="font-mono text-[10px] text-gray-500 hover:text-white uppercase tracking-widest">Contact</a>
        </div>
        <div className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">
          © 2026 Eighty Twenty, Co. All rights reserved.
        </div>
      </div>
    </div>
  </footer>
);

export const PrivacyPolicyModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-[#080808] border border-tactical-cyan/20 p-8 md:p-12"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="font-mono text-[10px] text-tactical-cyan uppercase tracking-widest mb-6">Legal / Privacy Policy</div>
        <h2 className="text-3xl font-bold text-white mb-8">Privacy Policy</h2>

        <div className="space-y-6 text-sm text-gray-400 leading-relaxed">
          <section>
            <h3 className="text-white font-bold uppercase text-xs tracking-widest mb-3">1. Data Collection</h3>
            <p>EchoLocation is designed as a local-first, closed-network intelligence tool. We do not collect, store, or transmit personal data to external servers. All acoustic telemetry and incident data are processed and stored on your local infrastructure.</p>
          </section>

          <section>
            <h3 className="text-white font-bold uppercase text-xs tracking-widest mb-3">2. Operational Security</h3>
            <p>Access to the EchoLocation dashboard and sensor satellites is controlled by the deploying organization. We recommend implementing strict network-level security and physical access controls for all hardware satellites.</p>
          </section>

          <section>
            <h3 className="text-white font-bold uppercase text-xs tracking-widest mb-3">3. Third-Party Services</h3>
            <p>This application does not utilize third-party tracking, analytics, or advertising services. Your operational data remains entirely within your controlled environment.</p>
          </section>

          <section>
            <h3 className="text-white font-bold uppercase text-xs tracking-widest mb-3">4. Compliance</h3>
            <p>Deploying organizations are responsible for ensuring that the use of acoustic monitoring equipment complies with all local, state, and federal laws regarding privacy and surveillance.</p>
          </section>

          <div className="pt-8 border-t border-white/5 text-[10px] uppercase tracking-widest text-gray-600">
            Last Updated: April 2026
          </div>
        </div>
      </motion.div>
    </div>
  );
};
