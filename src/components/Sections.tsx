import React from 'react';
import { motion, useTime, useTransform } from 'motion/react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Network, Lock, Activity, Crosshair, X, ArrowRight, Volume2, Waves } from 'lucide-react';

const Bar = ({ index, time }: { index: number; time: any; key?: React.Key }) => {
  // Spread 5 bars across exactly half a cosine cycle (PI)
  // This ensures the first bar is the 'cosine' and the last is the 'flipped cosine'
  const phase = index * (Math.PI / 4);
  
  // Transform time (ms) into a scale value using a cosine wave
  // 2500ms for a slightly slower, more tactical oscillation
  const scaleY = useTransform(time, (t: number) => {
    return 0.6 + 0.4 * Math.cos((t / 2500) * 2 * Math.PI + phase);
  });
  
  // Sync opacity with scale
  const opacity = useTransform(scaleY, [0.2, 1], [0.3, 1]);

  return (
    <motion.div 
      className="w-0.5 bg-tactical-cyan" 
      style={{ 
        height: '100%', 
        scaleY, 
        opacity, 
        transformOrigin: 'center' 
      }} 
    />
  );
};

const LogoSpectrum = () => {
  const time = useTime();
  
  return (
    <div className="flex items-center gap-0.5 h-4">
      {[...Array(5)].map((_, i) => (
        <Bar key={i} index={i} time={time} />
      ))}
    </div>
  );
};

export const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-tactical-bg border-b border-tactical-cyan/10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3">
            <LogoSpectrum />
            <span className="font-mono text-lg font-bold tracking-tighter text-white">ECHOLOCATION</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {[
            { name: 'Overview', path: '/#overview' },
            { name: 'Capabilities', path: '/#capabilities' },
            { name: 'Demo', path: '/demo' },
            { name: 'MVP', path: '/mvp', icon: Lock },
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-3xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-[0.9]">
            Real-Time Acoustic Intelligence for Critical Incidents
          </h1>
          <p className="text-xl text-gray-400 mb-10 leading-relaxed">
            EchoLocation transforms distributed sensor satilights into a live situational-awareness grid, surfacing probable gunfire origin, distress events, and incident timelines through a centralized mission control interface.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#demo" className="px-8 py-4 bg-tactical-cyan text-black font-mono text-xs font-bold uppercase tracking-widest hover:bg-white transition-all glow-cyan">
              View Demo
            </a>
            <a href="#mvp" className="px-8 py-4 border border-tactical-cyan/30 text-tactical-cyan font-mono text-xs font-bold uppercase tracking-widest hover:bg-tactical-cyan/10 transition-all">
              Local Deployment MVP
            </a>
          </div>
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
            title: "Limited Awareness",
            desc: "Responders often enter critical environments with limited live situational data, increasing operational risk."
          },
          {
            title: "Visual Gaps",
            desc: "Camera coverage is frequently incomplete, obstructed, or entirely inaccessible during high-stress incidents."
          },
          {
            title: "Threat Direction",
            desc: "Distributed acoustic intelligence helps surface probable threat direction and event progression in real-time."
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

export const Capabilities = () => (
  <section id="capabilities" className="py-20 bg-[#080808] tactical-grid">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold text-white mb-4">Tactical Capabilities</h2>
          <p className="text-gray-400">EchoLocation provides a robust suite of tools for rapid incident response and situational intelligence.</p>
        </div>
        <div className="font-mono text-[10px] text-tactical-cyan uppercase tracking-widest border-b border-tactical-cyan/30 pb-2">
          System Specs v1.0.0
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-tactical-cyan/10 border border-tactical-cyan/10">
        {[
          { icon: Shield, title: "Situational Awareness", desc: "Maintains a live operational picture to help teams understand evolving conditions during active response." },
          { icon: Activity, title: "Acoustic Activity Monitoring", desc: "Surfaces notable sounds and disturbances in real time without requiring continuous manual oversight." },
          { icon: Zap, title: "Rapid Response Support", desc: "Provides structured, confidence-based insights designed to assist trained personnel in high-pressure environments." },
          { icon: Network, title: "Live Event Timeline", desc: "Organizes incoming signals into a clear, time-aligned sequence for coordinated decision-making." }
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
        <div className="font-mono text-[10px] text-tactical-cyan uppercase tracking-[0.3em] mb-4">Operational Alpha</div>
        <h2 className="text-4xl font-bold text-white mb-6 tracking-tight uppercase">MVP RELEASE v1.0.0</h2>
        <p className="text-gray-400 leading-relaxed mb-8">
          The EchoLocation MVP is a fully functional tactical intelligence framework designed for local closed-network deployment. It provides real-time acoustic triangulation and incident visualization for emergency response teams.
        </p>
        <div className="flex justify-center">
          <Link 
            to="/mvp" 
            className="inline-flex items-center gap-3 px-8 py-4 bg-tactical-cyan text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-all glow-cyan"
          >
            Access MVP Page <Lock className="w-4 h-4" />
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
      <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">Controlled Positioning & Privacy</h2>
      <p className="text-gray-400 leading-relaxed mb-8">
        EchoLocation is designed to support authorized emergency response personnel. The system operates on local, closed networks with controlled data retention policies. It is an intelligence-support tool intended to augment, not replace, the judgment of trained responders.
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
          For mission-critical inquiries, technical support, or partnership requests.
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
            <span className="font-mono text-sm font-bold tracking-tighter text-white">ECHOLOCATION</span>
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
            <p>Access to the EchoLocation dashboard and sensor satilights is controlled by the deploying organization. We recommend implementing strict network-level security and physical access controls for all hardware satilights.</p>
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
