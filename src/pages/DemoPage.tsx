import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { LogoSpectrum } from '../components/Sections';
import {
  Play,
  Pause,
  RotateCcw,
  Camera,
  CameraOff,
  Activity,
  Crosshair,
  ArrowLeft,
} from 'lucide-react';
import { CameraNode, TimelineState, AudioEvent } from '../types';
import { DEFAULT_NODES, TOTAL_DURATION, CHOREOGRAPHED_EVENTS } from '../constants';

const VIDEO_MAP: Record<string, string> = {
  'cam-1': '/cam1.mp4',
  'cam-2': '/cam2.mp4',
  'cam-3': '/cam3.mp4',
  'cam-4': '/cam4.mp4',
};

const POSTER_MAP: Record<string, string> = {
  'cam-1': '/cam1-poster.png',
  'cam-2': '/cam2-poster.png',
  'cam-3': '/cam3-poster.png',
  'cam-4': '/cam4-poster.png',
};

// Per-camera offset (seconds) to compensate for file-level sync drift
const SYNC_OFFSETS: Record<string, number> = {
  'cam-1': 0,
  'cam-2': -1,
  'cam-3': 0,
  'cam-4': 0,
};

const COORDS: Record<string, { lat: number; lng: number }> = {
  'cam-1': { lat: 34.40328220756281,   lng: -118.56924750237668 },
  'cam-2': { lat: 34.40328848457708,   lng: -118.56907766021114 },
  'cam-3': { lat: 34.40316721779883,   lng: -118.56924646201153 },
  'cam-4': { lat: 34.402990673406116,  lng: -118.56924932307518 },
};


// ─── Optimized Video Feed Component — isolated re-renders ────────────────────
const VideoFeed = React.memo(({ 
  id, src, poster, isMuted, registerRef, onMouseEnter, onMouseLeave, className, currentTimeRef 
}: {
  id: string; src: string; poster: string; isMuted: boolean; 
  registerRef: (el: HTMLVideoElement | null) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
  currentTimeRef: React.MutableRefObject<{ currentTime: number; isPlaying: boolean }>;
}) => {
  const [isReady, setIsReady] = useState(false);
  const internalRef = useRef<HTMLVideoElement | null>(null);

  // Sync muted and playing state imperatively to ensure browser compliance
  useEffect(() => {
    const v = internalRef.current;
    if (!v) return;
    v.muted = isMuted;
    v.volume = 1.0;
    
    const { isPlaying } = currentTimeRef.current;
    if (isPlaying && v.paused) {
      v.play().catch(() => {});
    }
  }, [isMuted, currentTimeRef]);

  const setRef = (el: HTMLVideoElement | null) => {
    internalRef.current = el;
    registerRef(el);
  };

  return (
    <div className={`relative overflow-hidden w-full h-full bg-ui-card ${className}`}>
      <img 
        src={poster} 
        alt="" 
        className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300"
        style={{ opacity: isReady ? 0.3 : 1 }}
      />
      <video
        ref={setRef}
        src={src}
        className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-500 
          ${isReady ? 'opacity-100' : 'opacity-0'}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPlaying={() => setIsReady(true)}
        onSeeking={() => setIsReady(false)}
        playsInline
        preload="auto"
        onLoadedData={e => {
          const t = currentTimeRef.current.currentTime;
          const isPlaying = currentTimeRef.current.isPlaying;
          e.currentTarget.currentTime = t > 0 ? t : 0.001;
          if (isPlaying) e.currentTarget.play().catch(() => {});
        }}
      />
    </div>
  );
});

export const DemoPage = () => {
  const [mapImage]   = useState<string | null>('/default-map.png');
  const [mapAspect, setMapAspect] = useState<{ w: number; h: number } | null>(null);

  // All 4 video refs — always mounted, always synced
  const videoRefsMap = useRef<Record<string, HTMLVideoElement | null>>({});
  // All 4 hover preview video refs — always mounted, always synced
  const hoverVideoRefsMap = useRef<Record<string, HTMLVideoElement | null>>({});
  // Always-fresh timeline state for use in callbacks
  const timelineStateRef = useRef({ currentTime: 0, isPlaying: false });

  const showGrid = true;

  const [nodes] = useState<CameraNode[]>(() => {
    try {
      const saved = localStorage.getItem('echolocation-nodes');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_NODES;
  });

  const [timeline, setTimeline] = useState<TimelineState>({
    currentTime: 0,
    duration: TOTAL_DURATION,
    isPlaying: false,
  });

  const [hoveredNode,    setHoveredNode]    = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeEvents,   setActiveEvents]   = useState<AudioEvent[]>([]);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [activeClipId,    setActiveClipId]    = useState<string | null>(null);

  const clipEndTimeRef    = useRef<number | null>(null);
  const lastTriggeredRef  = useRef<Set<string>>(new Set());
  const prevTimeRef       = useRef<number>(0);
  const syncIdRef         = useRef<number>(0);
  const isClipJumpRef     = useRef<boolean>(false);
  const timelineBarRef    = useRef<HTMLDivElement>(null);
  const mapContainerRef   = useRef<HTMLDivElement>(null);
  const timerRef          = useRef<NodeJS.Timeout | null>(null);

  const MAP_HEIGHT = 600;
  const mapSize = useMemo(() => {
    if (!mapAspect) return { width: 900, height: MAP_HEIGHT };
    return { width: Math.round(MAP_HEIGHT * mapAspect.w / mapAspect.h), height: MAP_HEIGHT };
  }, [mapAspect]);

  // Keep timelineStateRef fresh for use in loadedmetadata callbacks
  useEffect(() => {
    timelineStateRef.current = { currentTime: timeline.currentTime, isPlaying: timeline.isPlaying };
  }, [timeline]);

  // ─── Imperative sync — the ONLY place videos are controlled ───────────────
  const syncAll = useCallback((time: number, playing: boolean) => {
    const syncId = ++syncIdRef.current;

    const mainIds = Object.keys(videoRefsMap.current);
    const hoverIds = Object.keys(hoverVideoRefsMap.current);
    
    const allVideos = [
      ...mainIds.map(id => ({ id, v: videoRefsMap.current[id], offset: SYNC_OFFSETS[id] ?? 0 })),
      ...hoverIds.map(id => ({ id: `hover-${id}`, v: hoverVideoRefsMap.current[id], offset: 0 }))
    ].filter(v => v.v !== null) as { id: string; v: HTMLVideoElement; offset: number }[];

    // Always pause first so nothing plays while seeking
    allVideos.forEach(item => item.v.pause());

    if (!playing) {
      allVideos.forEach(item => {
        const target = Math.max(0, time + item.offset);
        if (Math.abs(item.v.currentTime - target) > 0.3) {
          item.v.currentTime = target;
        }
      });
      return;
    }

    // When playing: wait for every video that needs seeking to finish,
    // then start them all at the same instant
    let pending = 0;
    const tryPlay = () => {
      if (syncIdRef.current !== syncId) return; // superseded
      if (--pending === 0) allVideos.forEach(item => item.v.play().catch(() => {}));
    };

    allVideos.forEach(item => {
      const target = Math.max(0, time + item.offset);
      if (Math.abs(item.v.currentTime - target) > 0.3) {
        pending++;
        item.v.addEventListener('seeked', tryPlay, { once: true });
        item.v.currentTime = target;
      }
    });

    if (pending === 0) {
      allVideos.forEach(item => item.v.play().catch(() => {}));
    }
  }, []);

  // ─── Interval timer — advances currentTime only, never touches videos ─────
  useEffect(() => {
    if (timeline.isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeline(prev => {
          if (prev.currentTime >= prev.duration) {
            syncAll(prev.duration, false);
            return { ...prev, isPlaying: false, currentTime: prev.duration };
          }
          const end = clipEndTimeRef.current;
          if (end !== null && prev.currentTime >= end) {
            clipEndTimeRef.current = null;
            setActiveClipId(null);
            syncAll(end, false);
            // Mute all sidebar videos when clip ends
            Object.values(videoRefsMap.current).forEach(v => { 
              if (v instanceof HTMLVideoElement) v.muted = true; 
            });
            return { ...prev, isPlaying: false, currentTime: end };
          }
          return { ...prev, currentTime: prev.currentTime + 0.05 };
        });
      }, 50);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeline.isPlaying, syncAll]);

  // ─── Floating event label logic ────────────────────────────────────────────
  useEffect(() => {
    const currentTime = timeline.currentTime;
    if (currentTime === 0) {
      lastTriggeredRef.current.clear();
      setActiveEvents([]);
      prevTimeRef.current = 0;
      return;
    }

    // Keeping the persistent log (events no longer delete when scrubbing backward)
    prevTimeRef.current = currentTime;

    const now = Date.now();
    const newEvents = CHOREOGRAPHED_EVENTS.filter(e =>
      e.timestamp <= currentTime && !lastTriggeredRef.current.has(e.id)
    );
    if (newEvents.length > 0) {
      newEvents.forEach(e => lastTriggeredRef.current.add(e.id));
      setActiveEvents(prev => {
        const filtered = prev.filter(e => e.expiresAt! > now);
        const withExpiry = newEvents.map((e, idx) => ({
          ...e,
          expiresAt: now + 4000,
          initialOffset: (filtered.filter(ev => ev.nodeId === e.nodeId).length + idx) * -28,
        }));
        return [...filtered, ...withExpiry];
      });
    } else {
      setActiveEvents(prev => {
        const filtered = prev.filter(e => e.expiresAt! > now);
        return filtered.length === prev.length ? prev : filtered;
      });
    }
  }, [timeline.currentTime]);

  // ─── Actions ───────────────────────────────────────────────────────────────
  const togglePlay = () => {
    const newPlaying = !timeline.isPlaying;
    syncAll(timeline.currentTime, newPlaying);
    setTimeline(prev => ({ ...prev, isPlaying: newPlaying }));
  };

  const resetTimeline = () => {
    syncAll(0, false);
    clipEndTimeRef.current = null;
    setActiveClipId(null);
    lastTriggeredRef.current.clear();
    setActiveEvents([]);
    setHoveredNode(null);
    setTimeline(prev => ({ ...prev, currentTime: 0, isPlaying: false }));
  };

  const handleScrub = (e: React.MouseEvent | React.TouchEvent) => {
    if (!timelineBarRef.current) return;
    const rect = timelineBarRef.current.getBoundingClientRect();
    const x    = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const pos  = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
    const newTime = pos * timeline.duration;
    clipEndTimeRef.current = null;
    CHOREOGRAPHED_EVENTS.forEach(ev => {
      if (ev.timestamp <= newTime) lastTriggeredRef.current.add(ev.id);
    });
    syncAll(newTime, timeline.isPlaying);
    setTimeline(prev => ({ ...prev, currentTime: newTime }));
  };

  const handleJumpToEvent = (timestamp: number) => {
    clipEndTimeRef.current = null;
    CHOREOGRAPHED_EVENTS.forEach(e => {
      if (e.timestamp <= timestamp) lastTriggeredRef.current.add(e.id);
    });
    syncAll(timestamp, false);
    setTimeline(prev => ({ ...prev, currentTime: timestamp, isPlaying: false }));
  };

  const handlePlayClip = (event: AudioEvent) => {
    const startTime = Math.max(0, event.timestamp - 1);
    const endTime   = Math.min(TOTAL_DURATION, event.timestamp + 2);
    
    const execute = (log: boolean) => {
      if (log) console.log(`[AudioDebug] PlayClip triggered for ${event.label} at ${event.timestamp}s`);
      clipEndTimeRef.current = endTime;
      setActiveClipId(event.id);
      // Preserve all events seen up to now so the log doesn't clear when we jump back
      CHOREOGRAPHED_EVENTS.forEach(e => {
        if (e.timestamp <= timeline.currentTime) lastTriggeredRef.current.add(e.id);
      });
      isClipJumpRef.current = true;
      setSelectedNodeId(event.nodeId);
      
      // Unmute the specified video immediately to satisfy browser requirements for user gesture
      const v = videoRefsMap.current[event.nodeId];
      if (v) {
        v.muted = false;
        v.volume = 1.0;
        if (log) console.log(`[AudioDebug] Unmuted video for camera: ${event.nodeId}`);
      }

      // CRITICAL: Synchronously initiate play on all videos to capture the user gesture
      // This prevents "NotAllowedError" if syncAll() takes too long to seek.
      Object.values(videoRefsMap.current).forEach(vid => {
        if (vid instanceof HTMLVideoElement) {
          vid.play().catch(err => console.debug('[AudioDebug] Sync play error (expected if seeking):', err));
        }
      });

      syncAll(startTime, true);
      setTimeline(prev => ({ ...prev, currentTime: startTime, isPlaying: true }));
    };

    // Quick fix: Run twice to ensure state settlement and audio activation
    execute(true);
    setTimeout(() => {
      console.log(`[AudioDebug] Running double-play quick fix...`);
      execute(false);
    }, 50);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms   = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  // Intelligence log: events for selected camera up to currentTime
  const cameraEvents = useMemo(() =>
    CHOREOGRAPHED_EVENTS.filter(e =>
      e.nodeId === selectedNodeId &&
      (e.timestamp <= timeline.currentTime || lastTriggeredRef.current.has(e.id))
    ).sort((a, b) => b.timestamp - a.timestamp),
    [selectedNodeId, timeline.currentTime]
  );

  // Unique timeline markers (dedupe same-timestamp same-type)
  const timelineMarkers = useMemo(() =>
    CHOREOGRAPHED_EVENTS.filter((e, i, arr) =>
      arr.findIndex(x => Math.abs(x.timestamp - e.timestamp) < 0.05 && x.isGunfire === e.isGunfire) === i
    ), []
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-ui-bg text-white font-sans selection:bg-ui-accent selection:text-black">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="h-16 border-b border-ui-border flex items-center justify-between px-6 bg-ui-bg/80 backdrop-blur-md z-50 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mr-2">
            <ArrowLeft size={16} />
            <span className="text-xs font-mono uppercase tracking-wider">Back</span>
          </Link>
          <div className="w-px h-6 bg-white/10" />
          <div className="flex items-center gap-3">
            <LogoSpectrum />
            <h1 className="font-display font-bold tracking-widest text-lg uppercase">Echolocation</h1>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 mr-2">
          {[
            { name: 'Overview',      path: '/#overview' },
            { name: 'Capabilities',  path: '/#capabilities' },
            { name: 'Early Access',  path: '/mvp' },
            { name: 'Contact',       path: '/#contact' },
          ].map(item =>
            item.path.startsWith('/#') ? (
              <a key={item.name} href={item.path} className="font-mono text-[11px] uppercase tracking-widest text-gray-400 hover:text-tactical-cyan transition-colors">
                {item.name}
              </a>
            ) : (
              <Link key={item.name} to={item.path} className="font-mono text-[11px] uppercase tracking-widest text-gray-400 hover:text-tactical-cyan transition-colors">
                {item.name}
              </Link>
            )
          )}
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ── Map ──────────────────────────────────────────────────────────── */}
        <main className="flex-1 relative overflow-hidden flex items-center justify-center bg-black/20 min-w-0">
          {mapImage && (
            <div
              ref={mapContainerRef}
              className="relative shrink-0 overflow-visible"
              style={{ width: mapSize.width, height: mapSize.height }}
              onClick={() => setSelectedNodeId(null)}
            >
              <img
                src={mapImage}
                alt="Floor Plan"
                className="absolute inset-0 w-full h-full object-fill opacity-40"
                onLoad={e => {
                  const img = e.currentTarget;
                  setMapAspect({ w: img.naturalWidth, h: img.naturalHeight });
                }}
              />

              {showGrid && (
                <div className="absolute inset-0 grid-lines pointer-events-none z-30 opacity-100" />
              )}

              <div className="absolute inset-0 z-20">
                {nodes.map(node => (
                  <motion.div
                    key={node.id}
                    className="absolute group"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <div
                      className="relative cursor-pointer -translate-x-1/2 -translate-y-1/2"
                      onClick={e => { e.stopPropagation(); setSelectedNodeId(node.id); }}
                    >
                      {/* Floating event labels */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 pointer-events-none z-50 w-64 flex flex-col items-center">
                        <AnimatePresence mode="popLayout">
                          {activeEvents.filter(e => e.nodeId === node.id).map(event => {
                            const isFaint = event.label.includes('(Faint)');
                            const isFaintGunfire = event.isGunfire && isFaint;
                            const stackOffset = (event.initialOffset ?? 0) * 0.4;
                            return (
                              <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: stackOffset + 6, scale: 0.9 }}
                                animate={{ opacity: [0, 1, 1, 0], y: stackOffset - 38, scale: 1 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ duration: 3.5, times: [0, 0.12, 0.65, 1], ease: 'easeOut' }}
                                className={`absolute bottom-0 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider whitespace-nowrap border backdrop-blur-xl
                                  ${isFaintGunfire
                                    ? 'bg-orange-500/10 border-orange-800/40 text-orange-600/50'
                                    : event.isGunfire
                                      ? 'bg-orange-500/30 border-orange-500 text-orange-400 shadow-orange-500/40 shadow-lg'
                                      : isFaint
                                        ? 'bg-black/40 border-white/10 text-white/35'
                                        : 'bg-black/80 border-white/20 text-white/90 shadow-black/60 shadow-lg'
                                  }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  {event.isGunfire && !isFaint && (
                                    <motion.div
                                      animate={{ scale: [1, 1.2, 1] }}
                                      transition={{ repeat: Infinity, duration: 0.5 }}
                                      className="w-1.5 h-1.5 rounded-full bg-orange-500"
                                    />
                                  )}
                                  <span>{event.label}</span>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>

                      {/* Node dot */}
                      <motion.div
                        animate={{ scale: (hoveredNode === node.id || selectedNodeId === node.id) ? 1.2 : 1 }}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                          ${selectedNodeId === node.id
                            ? 'bg-ui-accent border-ui-accent text-black shadow-[0_0_20px_rgba(0,242,255,0.6)] ring-4 ring-ui-accent/20'
                            : hoveredNode === node.id
                              ? 'bg-ui-accent/40 border-ui-accent text-black'
                              : 'bg-black/80 border-ui-accent text-ui-accent'
                          }`}
                      >
                        <Camera size={12} />
                      </motion.div>

                      <div className="absolute inset-0 rounded-full border border-ui-accent animate-ping opacity-20 pointer-events-none" />

                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap pointer-events-none">
                        <span className={`text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border backdrop-blur-sm transition-colors
                          ${selectedNodeId === node.id ? 'bg-ui-accent text-black border-ui-accent' : 'bg-black/60 text-white border-white/10'}`}>
                          {node.name}
                        </span>
                      </div>

                      {/* Hover preview popup — always mounted, synchronized by the main sync engine */}
                      <motion.div
                        initial={false}
                        animate={{ 
                          opacity: hoveredNode === node.id ? 1 : 0, 
                          scale: hoveredNode === node.id ? 1 : 0.9,
                          y: hoveredNode === node.id ? 0 : 10 
                        }}
                        transition={{ duration: 0.15 }}
                        className={`absolute left-1/2 -translate-x-1/2 w-48 bg-ui-card border border-ui-border rounded-lg shadow-2xl overflow-hidden z-[60] 
                          ${hoveredNode === node.id ? 'pointer-events-auto' : 'pointer-events-none'}
                          ${node.y < 50 ? 'top-full mt-8' : 'bottom-full mb-12'}`}
                      >
                        <div className="aspect-video w-48 border border-ui-border rounded-lg shadow-2xl overflow-hidden">
                          <VideoFeed 
                            id={`hover-${node.id}`}
                            src={VIDEO_MAP[node.id]}
                            poster={POSTER_MAP[node.id]}
                            isMuted={hoveredNode !== node.id}
                            registerRef={el => { hoverVideoRefsMap.current[node.id] = el; }}
                            currentTimeRef={timelineStateRef}
                          />
                        </div>
                        <div className="p-2 border-t border-ui-border bg-ui-bg relative z-10">
                          <span className="text-[9px] font-display font-bold uppercase tracking-widest text-ui-accent">{node.name}</span>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Legend */}
              <div className="absolute bottom-6 left-6 z-40 bg-ui-card/80 backdrop-blur-md border border-ui-border rounded-lg p-3 flex items-center gap-6 shadow-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-ui-accent shadow-[0_0_8px_rgba(0,242,255,0.8)]" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-white/60">Camera Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-white/60">Audio Anomaly</span>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside className="w-80 border-l border-ui-border bg-ui-bg/50 backdrop-blur-2xl flex flex-col h-full z-50 shrink-0">

          {/* Video panel */}
          <div className="p-6 border-b border-ui-border bg-black/20 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-ui-accent animate-pulse" />
                <h2 className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-white/80">
                  Live Intelligence
                </h2>
              </div>
              {selectedNodeId && (
                <span className="text-[9px] font-mono bg-white/5 text-white/60 px-2 py-0.5 rounded border border-white/10">
                  {nodes.find(n => n.id === selectedNodeId)?.name}
                </span>
              )}
            </div>

            <div 
              className="aspect-video bg-black rounded-lg border border-white/5 relative overflow-hidden shadow-2xl"
              onMouseEnter={() => setIsSidebarHovered(true)}
              onMouseLeave={() => setIsSidebarHovered(false)}
            >
              {/* All 4 videos always mounted — only selected is visible */}
              {Object.entries(VIDEO_MAP).map(([id, src]) => (
                <div 
                  key={id} 
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{ opacity: selectedNodeId === id ? 1 : 0, pointerEvents: selectedNodeId === id ? 'auto' : 'none' }}
                >
                  <VideoFeed 
                    id={id}
                    src={src}
                    poster={POSTER_MAP[id]}
                    isMuted={!(selectedNodeId === id && (isSidebarHovered || (clipEndTimeRef.current !== null && timeline.isPlaying)))}
                    registerRef={el => { videoRefsMap.current[id] = el; }}
                    onMouseEnter={() => setIsSidebarHovered(true)}
                    onMouseLeave={() => setIsSidebarHovered(false)}
                    currentTimeRef={timelineStateRef}
                  />
                </div>
              ))}

              {selectedNodeId ? (
                <>
                  <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-lg" />
                    <span className="text-[9px] font-mono uppercase tracking-tighter text-white/80">Stream Active</span>
                  </div>
                  <div className="absolute bottom-3 right-3 z-10 text-[10px] font-mono text-white/40 bg-black/40 px-2 py-1 rounded backdrop-blur-sm border border-white/5">
                    {formatTime(timeline.currentTime)}
                  </div>
                  <div className="scanline opacity-30" />
                  <div className="absolute inset-0 border border-ui-accent/10 pointer-events-none z-10" />
                  <div className="absolute top-3 right-3 z-10">
                    <Crosshair size={14} className="text-ui-accent/40" />
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-transparent to-black/40 z-10">
                  <Camera size={32} className="text-white/5 mb-4" />
                  <div className="space-y-2">
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.15em] leading-relaxed">
                      Select a camera to view live feed and recent audio intelligence.
                    </p>
                    <p className="text-[9px] text-white/20 uppercase tracking-[0.1em]">
                      Detected events will populate here in real time.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* GPS */}
          {selectedNodeId && (() => {
            const coord = COORDS[selectedNodeId];
            return coord ? (
              <div className="px-6 py-3 border-b border-ui-border bg-black/30 flex items-center gap-3 shrink-0">
                <Crosshair size={11} className="text-ui-accent shrink-0" />
                <div className="flex gap-4">
                  <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">
                    {coord.lat.toFixed(6)}°N
                  </span>
                  <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">
                    {Math.abs(coord.lng).toFixed(6)}°W
                  </span>
                </div>
              </div>
            ) : null;
          })()}

          {/* Intelligence log */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="px-6 py-4 border-b border-ui-border flex items-center justify-between bg-black/40 shrink-0">
              <div className="flex items-center gap-2">
                <Activity size={12} className="text-white/40" />
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-white/40">Intelligence Log</h3>
              </div>
              {selectedNodeId && (
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">
                  {cameraEvents.length} Events
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-black/10 min-h-0">
              {selectedNodeId ? (
                cameraEvents.length > 0 ? (
                  cameraEvents.map(event => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: 10, y: 0 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ layout: { duration: 0.3 } }}
                      key={event.id}
                      onClick={() => handleJumpToEvent(event.timestamp)}
                      className={`group flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer 
                        ${activeClipId === event.id && timeline.isPlaying 
                          ? 'bg-ui-accent/10 border-ui-accent/30 shadow-[0_0_15px_rgba(0,242,255,0.1)]' 
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}`}
                    >
                      <div className={`w-1 h-10 rounded-full shrink-0
                        ${event.isGunfire ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'bg-ui-accent/40'}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider truncate
                            ${event.isGunfire ? 'text-orange-500' : 'text-white/80'}`}>
                            {event.label}
                          </span>
                          <span className="text-[9px] font-mono text-white/30 shrink-0 ml-2">
                            {formatTime(event.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={e => { e.stopPropagation(); handlePlayClip(event); }}
                            className={`p-1.5 rounded-lg transition-all flex items-center gap-2 
                              ${activeClipId === event.id && timeline.isPlaying
                                ? 'bg-ui-accent text-black shadow-[0_0_10px_rgba(0,242,255,0.4)]'
                                : 'bg-white/5 text-white/40 hover:bg-ui-accent hover:text-black'}`}
                          >
                            {activeClipId === event.id && timeline.isPlaying ? (
                              <>
                                <Pause size={10} fill="currentColor" />
                                <span className="text-[8px] font-bold uppercase tracking-tighter">Playing...</span>
                              </>
                            ) : (
                              <>
                                <Play size={10} fill="currentColor" />
                                <span className="text-[8px] font-bold uppercase tracking-tighter">Play Clip</span>
                              </>
                            )}
                          </button>

                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-30 mt-12">
                    <Activity size={32} strokeWidth={1} className="mb-4 text-ui-accent" />
                    <p className="text-[10px] uppercase tracking-[0.2em] leading-relaxed">No events detected for this camera yet.</p>
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-20 mt-12">
                  <Activity size={32} strokeWidth={1} className="mb-4" />
                  <p className="text-[10px] uppercase tracking-[0.2em] leading-relaxed">Awaiting camera selection.</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Timeline footer ─────────────────────────────────────────────────── */}
      <footer className="h-24 border-t border-ui-border bg-ui-bg/90 backdrop-blur-xl px-8 flex items-center gap-8 z-50 shrink-0">

        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform active:scale-95 shadow-lg"
          >
            {timeline.isPlaying
              ? <Pause fill="currentColor" />
              : <Play fill="currentColor" className="ml-1" />
            }
          </button>
          <button onClick={resetTimeline} className="p-2 text-white/40 hover:text-white transition-colors">
            <RotateCcw size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="flex justify-between text-[10px] font-mono text-white/40 uppercase tracking-widest">
            <span className="text-ui-accent font-bold">{formatTime(timeline.currentTime)}</span>
            <span>{formatTime(timeline.duration)}</span>
          </div>

          <div
            ref={timelineBarRef}
            className="relative h-1.5 bg-white/10 rounded-full cursor-pointer group"
            onMouseDown={handleScrub}
            onMouseMove={e => { if (e.buttons === 1) handleScrub(e); }}
          >
            {/* Progress */}
            <div
              className="absolute top-0 left-0 h-full bg-ui-accent rounded-full shadow-[0_0_10px_rgba(0,242,255,0.5)] pointer-events-none"
              style={{ width: `${(timeline.currentTime / timeline.duration) * 100}%` }}
            />

            {/* Event markers */}
            {timelineMarkers.map(event => (
              <div
                key={event.id}
                className={`absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full pointer-events-none
                  ${event.isGunfire ? 'bg-orange-500' : 'bg-white/30'}`}
                style={{ left: `${(event.timestamp / timeline.duration) * 100}%` }}
              />
            ))}

            {/* Handle */}
            <div
              className="absolute top-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ left: `${(timeline.currentTime / timeline.duration) * 100}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
        </div>

        <div className="w-48 flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-2 text-ui-accent">
            <Crosshair size={14} />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Sync Active</span>
          </div>
          <div className="text-[9px] font-mono text-white/30 uppercase">
            All nodes locked to master
          </div>
        </div>
      </footer>
    </div>
  );
};
