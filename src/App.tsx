import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar, Hero, Problem, Capabilities, MVP, Privacy, ContactPanel, Footer, PrivacyPolicyModal } from './components/Sections';
import { InteractiveDemo } from './components/InteractiveDemo';
import { MVPPage } from './pages/MVPPage';
import { DemoPage } from './pages/DemoPage';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
};

const HomePage = () => (
  <main>
    <div id="overview"><Hero /></div>
    <Problem />
    <div id="capabilities"><Capabilities /></div>
    <div id="demo"><InteractiveDemo /></div>
    <MVP />
    <Privacy />
    <ContactPanel />
  </main>
);

const MarketingSite = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  return (
    <div className="min-h-screen selection:bg-tactical-cyan selection:text-black">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mvp" element={<MVPPage />} />
      </Routes>
      <Footer onPrivacyClick={() => setShowPrivacy(true)} />
      <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </div>
  );
};

export default function App() {
  useEffect(() => {
    const createPing = (x: number, y: number) => {
      const ping = document.createElement('div');
      ping.className = 'click-ping';
      ping.style.left = `${x}px`;
      ping.style.top = `${y}px`;
      document.body.appendChild(ping);
      setTimeout(() => ping.remove(), 1500);
    };
    const handleClick = (e: MouseEvent) => createPing(e.clientX, e.clientY);
    window.addEventListener('click', handleClick);
    return () => { window.removeEventListener('click', handleClick); };
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/*" element={<MarketingSite />} />
      </Routes>
    </BrowserRouter>
  );
}
