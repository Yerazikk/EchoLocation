import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Activity, Camera, ArrowRight, Crosshair, Radio } from 'lucide-react';

export const InteractiveDemo = () => {
  return (
    <section id="demo" className="py-20 bg-tactical-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="font-mono text-xs text-tactical-cyan uppercase tracking-[0.3em] mb-3">Live System</div>
          <h2 className="text-3xl font-bold text-white mb-4">Mission Control Console</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Real-time acoustic intelligence grid with distributed camera satellites, live event detection, and synchronized playback.
          </p>
        </div>

        {/* Preview card */}
        <div className="bg-[#0a0a0a] border border-tactical-cyan/20 rounded-sm overflow-hidden shadow-2xl glow-cyan">
          {/* Mock top bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-tactical-cyan/10 bg-[#0d0d0d]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-tactical-cyan/20 flex items-center justify-center rounded-sm">
                <Activity className="w-5 h-5 text-tactical-cyan" />
              </div>
              <span className="font-mono text-sm font-bold tracking-widest text-white">ECHOLOCATION</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-tactical-cyan animate-pulse" />
              <span className="font-mono text-[10px] text-tactical-cyan uppercase tracking-widest">System Ready</span>
            </div>
          </div>

          {/* Preview body */}
          <div className="relative h-72 bg-[#050505] overflow-hidden flex items-center justify-center">
            {/* Animated grid background */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'linear-gradient(#00f2ff 1px, transparent 1px), linear-gradient(90deg, #00f2ff 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />

            {/* Pulsing camera nodes */}
            {[
              { x: '31%', y: '20%', label: 'CAM 01' },
              { x: '40%', y: '68%', label: 'CAM 02' },
              { x: '17%', y: '76%', label: 'CAM 03' },
              { x: '85%', y: '76%', label: 'CAM 04' },
            ].map((cam, i) => (
              <div key={i} className="absolute" style={{ left: cam.x, top: cam.y }}>
                <div className="relative -translate-x-1/2 -translate-y-1/2">
                  <motion.div
                    className="w-5 h-5 rounded-full border-2 border-tactical-cyan bg-black/80 flex items-center justify-center"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                  >
                    <Camera className="w-2.5 h-2.5 text-tactical-cyan" />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 rounded-full border border-tactical-cyan/40"
                    animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                  />
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 font-mono text-[8px] text-white/50 whitespace-nowrap">{cam.label}</span>
                </div>
              </div>
            ))}

            {/* Floating event labels */}
            <motion.div
              className="absolute px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border bg-orange-500/30 border-orange-500 text-orange-400"
              style={{ left: '14%', top: '55%' }}
              animate={{ opacity: [0, 1, 1, 0], y: [0, -30] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            >
              Gunshots
            </motion.div>
            <motion.div
              className="absolute px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border bg-black/80 border-white/20 text-white/90"
              style={{ left: '37%', top: '50%' }}
              animate={{ opacity: [0, 1, 1, 0], y: [0, -30] }}
              transition={{ duration: 3, repeat: Infinity, delay: 2.5 }}
            >
              Screaming
            </motion.div>

            {/* Center CTA */}
            <div className="relative z-10 text-center">
              <Link
                to="/demo"
                className="inline-flex items-center gap-3 px-8 py-4 bg-tactical-cyan text-black font-bold uppercase tracking-widest text-sm hover:bg-white transition-all glow-cyan group"
              >
                <Crosshair className="w-4 h-4" />
                Launch Demo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Scanline */}
            <div className="scanline" />
          </div>

          {/* Bottom bar */}
          <div className="px-6 py-4 bg-[#0d0d0d] border-t border-tactical-cyan/10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              {['4 Camera Nodes', 'Live Event Log', 'Clip Review', 'Timeline Scrub'].map((feat) => (
                <div key={feat} className="flex items-center gap-2">
                  <Radio className="w-3 h-3 text-tactical-cyan" />
                  <span className="font-mono text-[10px] text-gray-400">{feat}</span>
                </div>
              ))}
            </div>
            <Link to="/demo" className="font-mono text-[10px] text-tactical-cyan hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1">
              Open Full Demo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
