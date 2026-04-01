import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Send, 
  MoreVertical, 
  Wifi, 
  Battery, 
  Lock,
  Terminal,
  Check,
  CheckCheck,
  Pause,
  Play
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const modelName = "gemini-2.0-flash";

// --- Components ---

const StatusBar = () => (
  <div className="flex justify-between items-center px-8 pt-6 pb-2 text-[10px] font-mono font-bold text-ui-accent/60 uppercase tracking-widest">
    <span>9:41 AM</span>
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Wifi size={12} />
        <span className="text-[8px]">LTE</span>
      </div>
      <Battery size={14} />
    </div>
  </div>
);

const BarWaveform = ({ audioData }: { audioData: number[] }) => (
  <div className="flex items-center justify-center gap-[3px] h-full w-full">
    {audioData.map((value, i) => (
      <motion.div
        key={i}
        animate={{ 
          height: `${Math.max(6, value * 100)}%`,
          backgroundColor: value > 0.5 ? 'rgba(0, 242, 255, 1)' : 'rgba(0, 242, 255, 0.6)'
        }}
        transition={{ type: "spring", stiffness: 800, damping: 40, mass: 0.5 }}
        className="w-[2px] rounded-full shadow-[0_0_12px_rgba(0,242,255,0.4)]"
      />
    ))}
  </div>
);

const Waveform = ({ audioData }: { audioData: number[] }) => (
  <div className="h-28 w-full flex items-center justify-center px-1 overflow-hidden">
    <BarWaveform audioData={audioData} />
  </div>
);

const Message = ({ text, time, status }: { text: string; time: string; status: 'sending' | 'delivered' | 'read' }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col mb-6 items-end"
  >
    <div className="flex items-center gap-2 mb-1 px-1">
      <span className="text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-white/20">
        Transmission Log
      </span>
      <span className="text-[8px] font-mono text-white/10">{time}</span>
    </div>
    <div className="max-w-[90%] px-4 py-3 rounded-sm text-[13px] leading-relaxed font-sans border bg-ui-accent/5 border-ui-accent/20 text-ui-accent shadow-[0_0_15px_rgba(0,242,255,0.05)]">
      {text}
    </div>
    <div className="flex items-center gap-1.5 mt-1.5 px-1">
      <span className="text-[7px] font-mono uppercase tracking-widest text-white/30">
        {status === 'read' ? 'Read by Dispatch' : status === 'delivered' ? 'Delivered' : 'Transmitting...'}
      </span>
      {status === 'read' && <CheckCheck size={10} className="text-ui-accent" />}
      {status === 'delivered' && <Check size={10} className="text-white/30" />}
    </div>
  </motion.div>
);

// --- Main Component ---

export const ResponderMobile = () => {
  // Initialize Gemini only if key is present
  const genAI = useMemo(() => {
    // @ts-ignore
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) return null;
    return new GoogleGenAI({ apiKey: key });
  }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState([
    { id: 1, text: "Oh god, they're in the hallway. I can hear them. Please tell me you're close. We're in room 302.", time: '09:41:02', status: 'read' as const },
    { id: 2, text: "I have 20 kids in here, we're all under the desks. It's so quiet. I'm so scared. Please help us.", time: '09:41:45', status: 'read' as const },
    { id: 3, text: "There was another shot. It sounded right outside the door. I think they're trying the handle. Please, please hurry.", time: '09:42:12', status: 'delivered' as const },
  ]);
  const [inputText, setInputText] = useState('');
  const [audioData, setAudioData] = useState<number[]>(new Array(48).fill(0));
  const [transcriptionLines, setTranscriptionLines] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Live timer for technical readout
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Microphone stream management
  useEffect(() => {
    if (!isMonitoring) {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      }
      return;
    }

    const initStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioStream(stream);
      } catch (err) {
        console.error("Mic Stream Error:", err);
      }
    };

    initStream();
    return () => {
      if (audioStream) audioStream.getTracks().forEach(track => track.stop());
    };
  }, [isMonitoring]);

  // Audio Visualizer Logic
  useEffect(() => {
    if (!audioStream || !isMonitoring) {
      setAudioData(new Array(48).fill(0));
      return;
    }

    let audioContext: AudioContext;
    let analyzer: AnalyserNode;
    let source: MediaStreamAudioSourceNode;
    let animationFrame: number;

    const startAudio = () => {
      try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyzer = audioContext.createAnalyser();
        source = audioContext.createMediaStreamSource(audioStream);
        source.connect(analyzer);
        
        analyzer.fftSize = 256; 
        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const update = () => {
          if (audioContext.state === 'suspended') {
            animationFrame = requestAnimationFrame(update);
            return;
          }
          
          analyzer.getByteFrequencyData(dataArray);
          
          const rawData = Array.from(dataArray.slice(0, 48)).map(v => (v / 255) * 0.8);
          
          const centeredData = new Array(48);
          for (let i = 0; i < 24; i++) {
            centeredData[23 - i] = rawData[i * 2] || 0;
            centeredData[24 + i] = rawData[i * 2 + 1] || 0;
          }
          
          setAudioData(centeredData);
          animationFrame = requestAnimationFrame(update);
        };
        update();

        const resume = () => {
          if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
          }
        };
        window.addEventListener('click', resume);
        window.addEventListener('touchstart', resume);

        return () => {
          window.removeEventListener('click', resume);
          window.removeEventListener('touchstart', resume);
        };
      } catch (err) {
        console.error("Audio Context Error:", err);
      }
    };

    const cleanup = startAudio();
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (audioContext) audioContext.close();
      if (cleanup) cleanup();
    };
  }, [audioStream, isMonitoring]);

  // Gemini-powered transcription (Zero-Gap Continuous Loop)
  useEffect(() => {
    // @ts-ignore
    if (!import.meta.env.VITE_GEMINI_API_KEY || !genAI || !isMonitoring || !audioStream) return;

    let mediaRecorder: MediaRecorder | null = null;
    let isActive = true;

    const recordNextChunk = () => {
      if (!isActive || !isMonitoring || !audioStream) return;
      
      mediaRecorder = new MediaRecorder(audioStream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Start next recording IMMEDIATELY to prevent audio loss
        if (isActive && isMonitoring) recordNextChunk();
        
        if (chunks.length === 0) return;
        const blob = new Blob(chunks, { type: 'audio/webm' });
        
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          try {
            // @ts-ignore - genAI is checked in useEffect guard
            const result = await genAI.models.generateContent({
              model: modelName,
              contents: [{
                role: 'user',
                parts: [
                  { inlineData: { data: base64Data, mimeType: "audio/webm" } },
                  { text: "Return ONLY the transcript of this English audio snippet. The audio is from a tactical emergency responder headset. Use context to infer words if the audio is slightly clipped. If no speech is clear, return nothing. No punctuation or extra text." }
                ]
              }]
            });

            const text = result.text.trim();
            if (text && text.length > 2) { 
              setTranscriptionLines(prev => {
                const newLines = [...prev, text];
                return newLines.slice(-2);
              });
            }
          } catch (err) {
            console.error("Gemini Transcription Error:", err);
          }
        };
      };

      mediaRecorder.start();
      
      // Send chunks every 4 seconds
      setTimeout(() => {
        if (mediaRecorder?.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 4000);
    };

    recordNextChunk();

    return () => {
      isActive = false;
      if (mediaRecorder?.state === 'recording') mediaRecorder.stop();
    };
  }, [audioStream, isMonitoring, genAI]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    const newMessage = {
      id: Date.now(),
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'delivered' as const
    };
    setMessages([...messages, newMessage]);
    setInputText('');
    
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'read' } : m));
    }, 2000);
  };

  return (
    <div className="relative w-full max-w-[320px] aspect-[9/19] bg-ui-card rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] border-[8px] border-zinc-900 overflow-hidden flex flex-col ring-1 ring-white/5 mx-auto">
      
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-zinc-900 rounded-b-2xl z-50 flex items-center justify-center">
        <div className="w-10 h-1 bg-zinc-800 rounded-full" />
      </div>

      <StatusBar />

      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-ui-border bg-ui-card/80 backdrop-blur-xl z-40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-ui-accent/10 border border-ui-accent/30 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.1)]">
              <ShieldAlert size={18} className="text-ui-accent" />
            </div>
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-ui-accent border-2 border-ui-card rounded-full" 
            />
          </div>
          <div>
            <h1 className="text-[10px] font-display font-black uppercase tracking-[0.2em] text-white m-0">Responder</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[7px] font-mono text-ui-accent font-bold uppercase tracking-widest">Uplink Active</span>
              <span className="w-0.5 h-0.5 rounded-full bg-white/10" />
              <span className="text-[7px] font-mono text-white/30 uppercase tracking-tighter">ID: 402-TAC</span>
            </div>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-1.5 transition-colors ${isMenuOpen ? 'text-ui-accent' : 'text-white/20 hover:text-white'}`}
          >
            <MoreVertical size={16} />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-36 bg-zinc-900/95 border border-white/10 rounded-sm shadow-2xl backdrop-blur-xl z-[60] py-1"
              >
                <button
                  onClick={() => {
                    setIsMonitoring(!isMonitoring);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-3 hover:bg-white/5 transition-colors group"
                >
                  {isMonitoring ? (
                    <>
                      <Pause size={12} className="text-white/40 group-hover:text-ui-accent transition-colors" />
                      <span className="text-[10px] font-mono text-white/60 group-hover:text-white uppercase tracking-wider">Pause Feed</span>
                    </>
                  ) : (
                    <>
                      <Play size={12} className="text-ui-accent transition-colors" />
                      <span className="text-[10px] font-mono text-white/60 group-hover:text-white uppercase tracking-wider">Resume Feed</span>
                    </>
                  )}
                </button>
                <div role="separator" className="h-px bg-white/5 mx-2 my-1" />
                <button className="w-full px-3 py-2 flex items-center gap-3 hover:bg-white/5 transition-colors group opacity-40">
                  <Terminal size={12} className="text-white/40" />
                  <span className="text-[10px] font-mono text-white/60 uppercase tracking-wider">Diagnostics</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Technical Grid Background */}
      <div className="absolute inset-0 grid-lines pointer-events-none opacity-20" />

      {/* Transmission Monitor */}
      <div className="bg-black/60 border-b border-ui-accent/20 px-6 pt-5 pb-8 flex flex-col items-center gap-4 relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)] z-30">
        <div className="scanline opacity-10" />
        
        <div className="flex items-center justify-between w-full z-10 font-mono">
          <div className="flex items-center gap-1.5">
            <div className={`w-1 h-1 rounded-full ${isMonitoring ? 'bg-ui-accent animate-pulse' : 'bg-white/20'}`} />
            <span className={`text-[7px] font-black uppercase tracking-[0.2em] ${isMonitoring ? 'text-ui-accent' : 'text-white/40'}`}>
              {isMonitoring ? 'Monitoring Active' : 'Uplink Suspended'}
            </span>
          </div>
          <span className="text-[7px] text-white/30 uppercase tracking-tighter">GPS Locked</span>
        </div>

        <div className="w-full bg-black/80 backdrop-blur-md rounded-sm p-3 border border-ui-accent/10 z-10 relative h-32 flex flex-col justify-center overflow-hidden">
          <Waveform audioData={audioData} />
          
          <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center text-[7px] font-mono text-white/40 uppercase tracking-[0.2em] pointer-events-none">
            <div className="flex items-center gap-1.5">
              <Terminal size={7} className="text-ui-accent/60" />
              <span>Audio_Feed_Live</span>
            </div>
            <span className="text-ui-accent/80 font-bold">
              {currentTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Transcription Strip */}
        <div className="w-full -mt-2 z-10 transition-all duration-300">
          {transcriptionLines.length > 0 ? (
            <div className="px-1.5 py-1 bg-ui-accent/5 border-l-2 border-ui-accent/30 overflow-hidden min-h-[40px] flex flex-col justify-center animate-in fade-in slide-in-from-left-2 duration-500">
              {transcriptionLines.map((line, i) => (
                <p key={i} className={`text-[9px] font-mono italic leading-tight truncate uppercase tracking-tight ${i === 1 ? 'text-ui-accent/90' : 'text-ui-accent/40'}`}>
                  <span className="opacity-40 mr-2">≫</span>
                  {line}
                </p>
              ))}
            </div>
          ) : (
            <div className="px-1.5 py-1 min-h-[40px] flex items-center gap-2 opacity-20">
              <Terminal size={8} />
              <span className="text-[8px] font-mono uppercase tracking-widest">Waiting for signal...</span>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 pt-12 pb-6 custom-scrollbar overscroll-contain bg-ui-bg/40 z-10">
        <div className="flex flex-col">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-sm border border-white/5">
              <Lock size={10} className="text-white/20" />
              <span className="text-[8px] text-white/30 font-mono font-bold uppercase tracking-[0.15em]">Transmission: AES-256</span>
            </div>
          </div>
          
          {messages.map((msg) => (
            <Message key={msg.id} {...msg} />
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-ui-card border-t border-ui-border z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend(e)}
              placeholder="Type message..."
              className="w-full h-8 bg-black/40 border border-white/5 rounded-sm px-4 text-[11px] text-white placeholder:text-white/10 focus:outline-none focus:border-ui-accent/40 transition-all font-sans"
            />
            <button 
              onClick={(e) => handleSend(e)}
              className={`absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-sm flex items-center justify-center transition-all ${
                inputText.trim() ? 'bg-ui-accent text-black shadow-[0_0_20px_rgba(0,242,255,0.3)]' : 'bg-white/5 text-white/10'
              }`}
            >
              <Send size={12} />
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex justify-center">
          <div className="w-20 h-0.5 bg-white/5 rounded-full" />
        </div>
      </div>
    </div>
  );
};
