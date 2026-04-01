import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Download, FileText, Terminal, Shield, CheckCircle2, ArrowLeft, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MVPPage = () => {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState(false);

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === 'alpha') {
      setIsAuthorized(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleDownload = (filename: string) => {
    const content = `EchoLocation ${filename.replace('.txt', '').replace(/-/g, ' ').toUpperCase()}\n\nThis is a tactical build placeholder for the EchoLocation framework.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-tactical-bg flex items-center justify-center px-4">
        <div className="max-w-xs w-full">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-tactical-cyan/40 hover:text-tactical-cyan transition-colors font-mono text-[10px] uppercase tracking-widest mb-12">
              <ArrowLeft className="w-3 h-3" /> Return
            </Link>
            <h1 className="text-xs font-mono text-gray-500 uppercase tracking-[0.3em] mb-8">Access Code</h1>
          </div>

          <form onSubmit={handleAccess} className="space-y-4">
            <div className="relative">
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-transparent border-b ${error ? 'border-red-500' : 'border-tactical-cyan/20'} py-2 text-white font-mono text-sm tracking-[0.5em] text-center focus:outline-none focus:border-tactical-cyan transition-colors placeholder:text-gray-900`}
                autoFocus
              />
              {error && (
                <p className="absolute -bottom-6 left-0 w-full text-center text-[10px] text-red-500 font-mono uppercase tracking-widest">Denied</p>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tactical-bg pt-24 pb-20 selection:bg-tactical-cyan selection:text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-tactical-cyan hover:text-white transition-colors font-mono text-xs uppercase tracking-widest mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Intelligence Grid
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="font-mono text-xs text-tactical-cyan uppercase tracking-[0.3em] mb-2">Operational Alpha</div>
              <h1 className="text-5xl font-bold text-white tracking-tighter">MVP RELEASE v1.0.0</h1>
            </div>
          </div>
        </div>

        <div className="space-y-12 max-w-4xl">
          {/* Download Section */}
          <section className="bg-[#080808] border border-tactical-cyan/20 p-8 md:p-12 rounded-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-tactical-cyan/5 -mr-16 -mt-16 rotate-45 transition-transform group-hover:scale-110" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <Terminal className="w-6 h-6 text-tactical-cyan" />
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Code Alpha Download</h2>
                </div>
                
                <p className="text-gray-400 mb-8 max-w-xl leading-relaxed">
                  Access the initial Alpha build of the EchoLocation tactical framework. This package includes the core acoustic processing engine, satilight communication protocols, and the mission control dashboard source.
                </p>

                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => handleDownload('echolocation-alpha-v1.0.0.txt')}
                    className="flex items-center gap-3 px-8 py-4 bg-tactical-cyan text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-all glow-cyan"
                  >
                    <Download className="w-4 h-4" /> Access Download
                  </button>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] text-gray-600 uppercase">Build Hash</span>
                    <span className="font-mono text-[10px] text-tactical-cyan">SHA-256: 8f2d...4e1a</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] text-gray-600 uppercase">Platform</span>
                    <span className="font-mono text-[10px] text-white">macOS / Linux / Windows</span>
                  </div>
                </div>
              </div>
            </section>

            {/* How To Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-tactical-cyan" />
                <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Deployment Guide</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "Environment Setup", desc: "Ensure your local network is configured for UDP broadcast and sensor satilight discovery." },
                  { title: "Satilight Provisioning", desc: "Flash the Alpha firmware to your distributed hardware units using the provided CLI tool." },
                  { title: "Hub Initialization", desc: "Launch the central processing engine on a dedicated workstation with high-gain audio input." },
                  { title: "Dashboard Sync", desc: "Connect the browser-based mission control to the local hub's secure WebSocket endpoint." }
                ].map((step, i) => (
                  <div key={i} className="p-6 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className="font-mono text-[10px] text-tactical-cyan mb-4">STEP 0{i+1}</div>
                    <h3 className="text-white font-bold mb-2 uppercase text-sm tracking-widest">{step.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-tactical-cyan/5 border border-tactical-cyan/20 rounded-sm">
                <p className="text-xs text-tactical-cyan font-mono italic">
                  Note: Detailed step-by-step instructions will be provided in the upcoming technical documentation release.
                </p>
              </div>
            </section>
        </div>
      </div>
    </div>
  );
};
