import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Marquee from 'react-fast-marquee';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  ArrowRight, Wifi, Bluetooth, Shield, Lightbulb, Lock, Mic, MicOff,
  Power, Sun, Moon, ChevronRight, Play, Zap, Home, Building2, Hotel,
  Cpu, Eye, Headphones, Volume2
} from 'lucide-react';

// ─── ROOM DATA (9 rooms matching NoLights.png overlays) ────────
const rooms = [
  { id: 'hall', name: 'Hall', overlay: '/overlay-living.png' },
  { id: 'kitchen', name: 'Kitchen', overlay: '/overlay-kitchen.png' },
  { id: 'master', name: 'Master Bedroom', overlay: '/overlay-bedroom.png' },
  { id: 'small', name: 'Small Bedroom', overlay: '/overlay-office.png' },
  { id: 'parking', name: 'Parking', overlay: '/overlay-garage.png' },
  { id: 'stairs', name: 'Stairs', overlay: '/overlay-hallway.png' },
  { id: 'hanging', name: 'Hanging Lights', overlay: '/overlay-hanging.png' },
  { id: 'masterbath', name: 'Master Bath', overlay: '/overlay-masterbath.png' },
  { id: 'guestbath', name: 'Guest Bath', overlay: '/overlay-guestbath.png' },
];

// ─── TICKER ITEMS ───────────────────────────────────────────────
const techLabels = ['Wi-Fi', 'Zigbee', 'Bluetooth', 'Alexa', 'Scenes', 'Security', 'Lighting', 'Curtains', 'Locks', 'Panels', 'Voice Control', 'Matter'];

// ─── ROOM NAME ALIASES FOR VOICE MATCHING ───────────────────────
const roomAliases = {
  hall: ['hall', 'living', 'living room', 'lounge'],
  kitchen: ['kitchen'],
  master: ['master', 'master bedroom', 'main bedroom', 'master room'],
  small: ['small', 'small bedroom', 'guest room', 'second bedroom', 'bedroom 2', 'bedroom two'],
  parking: ['parking', 'garage', 'car'],
  stairs: ['stairs', 'staircase', 'stairway'],
  hanging: ['hanging', 'hanging lights', 'chandelier', 'pendant'],
  masterbath: ['master bath', 'master bathroom', 'main bathroom', 'main bath'],
  guestbath: ['guest bath', 'guest bathroom', 'small bath', 'second bathroom'],
};

// ─── VOICE HELPERS ──────────────────────────────────────────────
const API_URL = process.env.REACT_APP_BACKEND_URL;

function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.1;
  u.pitch = 1;
  u.volume = 1;
  window.speechSynthesis.speak(u);
}

function matchesWakeWord(text) {
  const t = text.toLowerCase().replace(/[^a-z ]/g, '').trim();
  const patterns = [
    'inhaus', 'in house', 'in haus', 'inhous', 'in has',
    'inhos', 'in hose', 'inhouse', 'enhaus', 'en house', 'n house',
  ];
  return patterns.some(p => t.includes(p));
}

function stripWakeWord(text) {
  return text.replace(/^(hey\s*)?(in\s*haus|inhaus|in\s*house|inhous|in\s*has|inhouse|enhaus|en\s*house)[,.\s!?]*/i, '').trim();
}

// ─── VOICE COMMAND HOOK (Whisper + Wake Word + TTS) ─────────────
const useVoiceCommand = ({ onToggleAll, onSetRoom }) => {
  const [mode, setMode] = useState('idle');
  const [wakeEnabled, setWakeEnabled] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [supported, setSupported] = useState(true);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const feedbackTimer = useRef(null);
  const wakeEnabledRef = useRef(false);
  const streamRef = useRef(null);
  const wakeLoopActive = useRef(false);
  const callbacksRef = useRef({ onToggleAll, onSetRoom });
  callbacksRef.current = { onToggleAll, onSetRoom };

  // Keep ref in sync with state
  useEffect(() => { wakeEnabledRef.current = wakeEnabled; }, [wakeEnabled]);

  const executeCommand = useCallback((cmd) => {
    if (cmd.type === 'all') callbacksRef.current.onToggleAll(cmd.state);
    else if (cmd.type === 'room') callbacksRef.current.onSetRoom(cmd.roomId, cmd.state);
    speak('OK. ' + cmd.feedback);
    setFeedback(cmd.feedback);
  }, []);

  const processText = useCallback((text) => {
    const cmd = parseVoiceCommand(text.toLowerCase().trim());
    if (cmd) {
      executeCommand(cmd);
    } else {
      setFeedback('Try: "turn on hall" or "all lights off"');
      speak("Sorry, I didn't understand.");
    }
    setTranscript(text);
    clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => { setFeedback(''); setTranscript(''); }, 4000);
  }, [executeCommand]);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) setSupported(false);
    return () => {
      clearTimeout(feedbackTimer.current);
      wakeEnabledRef.current = false;
      wakeLoopActive.current = false;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const transcribeBlob = useCallback(async (blob) => {
    const formData = new FormData();
    formData.append('file', blob, 'voice.webm');
    const res = await fetch(`${API_URL}/api/voice/transcribe`, { method: 'POST', body: formData });
    const data = await res.json();
    return data.text?.trim() || '';
  }, []);

  const recordClip = useCallback((stream, duration) => {
    return new Promise((resolve, reject) => {
      if (!stream.active) { reject(new Error('Stream closed')); return; }
      const chunks = [];
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mr.onstop = () => resolve(new Blob(chunks, { type: 'audio/webm' }));
      mr.onerror = () => reject(new Error('Recorder error'));
      mr.start();
      setTimeout(() => { if (mr.state === 'recording') mr.stop(); }, duration);
    });
  }, []);

  // ── WAKE WORD LOOP (uses ref, not state) ──────────────────────
  const runWakeLoop = useCallback(async (stream) => {
    if (!wakeEnabledRef.current || !stream.active) {
      wakeLoopActive.current = false;
      return;
    }
    wakeLoopActive.current = true;
    setMode('wakeListening');

    try {
      // Record 3s — enough for "InHaus, turn on hall" in one breath
      const blob = await recordClip(stream, 3000);
      if (!wakeEnabledRef.current) { wakeLoopActive.current = false; return; }
      if (blob.size < 200) { setTimeout(() => runWakeLoop(stream), 100); return; }

      const text = await transcribeBlob(blob);
      if (!wakeEnabledRef.current) { wakeLoopActive.current = false; return; }

      if (matchesWakeWord(text)) {
        // Strip wake word and check if command was included in same clip
        const cmdPart = stripWakeWord(text);
        const cmd = cmdPart ? parseVoiceCommand(cmdPart.toLowerCase()) : null;

        if (cmd) {
          // Wake word + command in one shot — fastest path
          speak('OK. ' + cmd.feedback);
          if (cmd.type === 'all') callbacksRef.current.onToggleAll(cmd.state);
          else if (cmd.type === 'room') callbacksRef.current.onSetRoom(cmd.roomId, cmd.state);
          setFeedback(cmd.feedback);
          setTranscript(cmdPart);
          setMode('idle');
          clearTimeout(feedbackTimer.current);
          feedbackTimer.current = setTimeout(() => { setFeedback(''); setTranscript(''); }, 3000);
          // Resume listening after voice finishes
          if (wakeEnabledRef.current) setTimeout(() => runWakeLoop(stream), 2500);
        } else {
          // Wake word detected but no command — record separately
          speak('OK');
          setFeedback('Listening...');
          setMode('recording');
          await new Promise(r => setTimeout(r, 600));

          const cmdBlob = await recordClip(stream, 3000);
          setMode('processing');
          const cmdText = await transcribeBlob(cmdBlob);

          if (cmdText) {
            const cleaned = stripWakeWord(cmdText);
            processText(cleaned || cmdText);
          } else {
            setFeedback('No command heard. Say "InHaus" again.');
          }
          if (wakeEnabledRef.current) setTimeout(() => runWakeLoop(stream), 2500);
          else wakeLoopActive.current = false;
        }
      } else {
        // No wake word — loop immediately
        if (wakeEnabledRef.current) setTimeout(() => runWakeLoop(stream), 50);
        else wakeLoopActive.current = false;
      }
    } catch (err) {
      if (wakeEnabledRef.current) setTimeout(() => runWakeLoop(stream), 1000);
      else wakeLoopActive.current = false;
    }
  }, [recordClip, transcribeBlob, processText]);

  // ── TOGGLE WAKE WORD ──────────────────────────────────────────
  const toggleWake = useCallback(async () => {
    if (wakeEnabled) {
      setWakeEnabled(false);
      wakeEnabledRef.current = false;
      wakeLoopActive.current = false;
      if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
      setMode('idle');
      setFeedback('');
      setTranscript('');
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        setWakeEnabled(true);
        wakeEnabledRef.current = true;
        setFeedback('Say "InHaus" followed by a command...');
        speak('Listening. Say InHaus.');
        setTimeout(() => runWakeLoop(stream), 800);
      } catch {
        setFeedback('Microphone access denied.');
      }
    }
  }, [wakeEnabled, runWakeLoop]);

  // ── MANUAL MIC (single command, 3 seconds) ────────────────────
  const toggleMic = useCallback(async () => {
    if (mode === 'recording') {
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
      return;
    }
    try {
      setTranscript(''); setFeedback(''); chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (blob.size < 100) { setFeedback('No audio. Try again.'); setMode('idle'); return; }
        setMode('processing'); setFeedback('Processing...');
        try {
          const text = await transcribeBlob(blob);
          if (text) processText(text);
          else { setFeedback('No speech detected.'); speak('No speech detected.'); }
        } catch { setFeedback('Connection error.'); }
        setMode('idle');
      };
      mr.start(); setMode('recording');
      setTimeout(() => { if (mr.state === 'recording') mr.stop(); }, 3000);
    } catch { setFeedback('Mic access denied.'); setMode('idle'); }
  }, [mode, transcribeBlob, processText]);

  return { mode, wakeEnabled, transcript, feedback, supported, toggleMic, toggleWake, processText };
};

// ─── PARSE VOICE COMMAND ────────────────────────────────────────
function parseVoiceCommand(text) {
  const t = text.toLowerCase().replace(/[^a-z0-9 ]/g, '');

  // All on/off
  if (/\b(all|every|everything)\b.*\b(on|open|bright)\b/.test(t) || /\bturn on (all|every|everything)\b/.test(t) || t === 'all on' || t === 'lights on') {
    return { type: 'all', state: true, feedback: 'All lights turned on' };
  }
  if (/\b(all|every|everything)\b.*\b(off|close|dark)\b/.test(t) || /\bturn off (all|every|everything)\b/.test(t) || t === 'all off' || t === 'lights off') {
    return { type: 'all', state: false, feedback: 'All lights turned off' };
  }

  // Determine action
  const turnOn = /\b(on|open|bright|enable|activate|switch on|light up)\b/.test(t);
  const turnOff = /\b(off|close|dark|disable|deactivate|switch off|shut)\b/.test(t);
  if (!turnOn && !turnOff) return null;
  const state = turnOn;

  // Find room
  for (const [roomId, aliases] of Object.entries(roomAliases)) {
    for (const alias of aliases) {
      if (t.includes(alias)) {
        const roomName = rooms.find(r => r.id === roomId)?.name || roomId;
        return { type: 'room', roomId, state, feedback: `${roomName} light ${state ? 'on' : 'off'}` };
      }
    }
  }
  return null;
}

// ─── TOUCH PANEL SWITCH ─────────────────────────────────────────
const TouchSwitch = ({ room, isOn, onToggle }) => (
  <button
    onClick={() => onToggle(room.id)}
    className="group relative flex flex-col items-center gap-2 py-4 px-2 outline-none"
    data-testid={`touch-switch-${room.id}`}
  >
    {/* Switch circle */}
    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
      isOn
        ? 'bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.5),0_0_4px_rgba(249,115,22,0.8)]'
        : 'bg-white/[0.06] group-hover:bg-white/10'
    }`}>
      {/* Glow ring */}
      {isOn && <div className="absolute inset-[-4px] rounded-full border border-orange-500/30 animate-pulse" />}
      <Power size={18} className={`transition-colors duration-300 ${isOn ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
    </div>
    {/* Label */}
    <span className={`text-[9px] text-center uppercase tracking-[1.5px] font-medium leading-tight transition-colors duration-300 ${
      isOn ? 'text-orange-400' : 'text-zinc-600'
    }`}>{room.name}</span>
    {/* Tiny status dot */}
    <div className={`w-1 h-1 rounded-full transition-all duration-300 ${isOn ? 'bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.8)]' : 'bg-zinc-800'}`} />
  </button>
);

// ─── GLASS TOUCH PANEL ──────────────────────────────────────────
const TouchPanel = ({ roomStates, onToggle, onAllOn, onAllOff }) => {
  const litCount = Object.values(roomStates).filter(Boolean).length;
  return (
    <div className="relative" data-testid="touch-panel">
      {/* Panel frame — dark glass with subtle bevel */}
      <div
        className="rounded-[20px] overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(20,20,28,0.95), rgba(10,10,15,0.98))',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.03)',
        }}
      >
        {/* Glass reflection */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/[0.02] to-transparent rounded-t-[20px] pointer-events-none" />

        {/* Panel header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-[3px] font-medium">InHaus</div>
            <div className="text-xs text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>Touch Panel</div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${litCount > 0 ? 'bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]' : 'bg-zinc-700'}`} />
            <span className="text-[9px] text-zinc-500 font-medium">{litCount} ON</span>
          </div>
        </div>

        {/* Divider line */}
        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Switch grid — 3 columns */}
        <div className="grid grid-cols-3 gap-0 px-3 py-3">
          {rooms.map((r) => (
            <TouchSwitch key={r.id} room={r} isOn={!!roomStates[r.id]} onToggle={onToggle} />
          ))}
        </div>

        {/* Bottom divider */}
        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* All On / All Off bar */}
        <div className="flex items-center gap-2 px-5 py-4">
          <button
            onClick={onAllOff}
            className="flex-1 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-wider bg-white/[0.04] border border-white/[0.06] text-zinc-500 hover:bg-white/[0.08] hover:text-zinc-300 transition-all"
            data-testid="touch-all-off"
          >All Off</button>
          <button
            onClick={onAllOn}
            className="flex-1 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-wider bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-all"
            data-testid="touch-all-on"
          >All On</button>
        </div>
      </div>

      {/* Panel wall-mount shadow */}
      <div className="absolute -bottom-3 left-4 right-4 h-6 bg-black/30 blur-xl rounded-full -z-10" />
    </div>
  );
};
const RoomTile = ({ room, isOn, onToggle }) => (
  <div
    className={`relative flex flex-col rounded-2xl transition-all duration-200 overflow-hidden p-3 ${
      isOn ? 'bg-[#141828] border border-indigo-500/20' : 'bg-white/[0.04] border border-transparent hover:border-white/[0.06]'
    }`}
    data-testid={`room-tile-${room.id}`}
  >
    {isOn && <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-indigo-400 to-purple-400" />}
    <div className="font-semibold text-white text-[13px] mb-0.5 pl-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{room.name}</div>
    <div className={`text-[10px] uppercase tracking-[2px] font-medium mb-3 pl-1 ${isOn ? 'text-indigo-300' : 'text-neutral-600'}`}>
      Lighting {isOn ? 'on' : 'off'}
    </div>
    <button
      onClick={() => onToggle(room.id)}
      className={`w-full py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all duration-200 ${
        isOn
          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_2px_12px_rgba(249,115,22,0.25)]'
          : 'bg-gradient-to-r from-[#f5f7ff] to-[#cfd6f7] text-[#1a1a2e] font-bold'
      }`}
      data-testid={`room-toggle-${room.id}`}
    >
      {isOn ? 'Turn Off' : 'Turn On'}
    </button>
  </div>
);

// ─── FLOORPLAN (PNG OVERLAYS) ───────────────────────────────────
const Floorplan = ({ roomStates }) => (
  <div className="relative w-full" data-testid="live-floorplan">
    <div className="relative w-full overflow-hidden rounded-[20px]" style={{ aspectRatio: '1000 / 678' }}>
      <img src="/NoLights.png" alt="House floorplan" className="block w-full h-full object-contain select-none pointer-events-none" draggable={false} />
      {rooms.map((r) => (
        <img
          key={r.id} src={r.overlay} alt={`${r.name} light`}
          data-testid={`light-overlay-${r.id}`}
          className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
          draggable={false}
          style={{ opacity: roomStates[r.id] ? 1 : 0, transition: 'opacity 0.2s ease' }}
        />
      ))}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="px-4 py-2 rounded-lg bg-black/50 backdrop-blur-sm">
          <span className="text-[10px] font-semibold tracking-[3px] text-neutral-300 uppercase">Live Floorplan</span>
        </div>
      </div>
    </div>
  </div>
);

// ─── SERVICE CARD ───────────────────────────────────────────────
const ServiceCard = ({ icon: Icon, title, desc, img, link }) => (
  <Link to={link} data-testid={`service-${title.toLowerCase()}`}>
    <div className="group relative h-[380px] rounded-2xl overflow-hidden border border-white/10 hover:border-orange-500/40 transition-all duration-500">
      <img src={img} alt={title} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/70 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-3 group-hover:bg-orange-500/20 transition-colors">
          <Icon size={20} className="text-orange-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  </Link>
);

// ─── FEATURE CARD ───────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, items, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="group p-6 rounded-2xl bg-[#141414] border border-white/10 hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-1"
    data-testid={`feature-${title.toLowerCase().replace(/\s+/g, '-')}`}
  >
    <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
      <Icon size={22} className="text-orange-500" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</h3>
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <ChevronRight size={14} className="text-orange-500/60 mt-0.5 shrink-0" />
          <span className="text-sm text-zinc-400">{item}</span>
        </div>
      ))}
    </div>
  </motion.div>
);

// ═════════════════════════════════════════════════════════════════
// ─── MAIN HOMEPAGE ──────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════
const HomePage = () => {
  const [roomStates, setRoomStates] = useState({});
  const demoRef = useRef(null);
  const demoInView = useInView(demoRef, { once: true, margin: '-100px' });
  const animTimers = useRef([]);

  const toggleRoom = (id) => setRoomStates((p) => ({ ...p, [id]: !p[id] }));
  const setRoom = (id, state) => setRoomStates((p) => ({ ...p, [id]: state }));
  const toggleAll = (state) => {
    animTimers.current.forEach((t) => clearTimeout(t));
    animTimers.current = [];
    const s = {};
    rooms.forEach((r) => { s[r.id] = state; });
    setRoomStates(s);
  };

  const voice = useVoiceCommand({ onToggleAll: toggleAll, onSetRoom: setRoom });
  const [cmdInput, setCmdInput] = useState('');

  useEffect(() => {
    if (!demoInView) return;
    animTimers.current.forEach((t) => clearTimeout(t));
    animTimers.current = [];
    const main = setTimeout(() => {
      rooms.forEach((r, i) => {
        const t = setTimeout(() => setRoomStates((p) => ({ ...p, [r.id]: true })), i * 180);
        animTimers.current.push(t);
      });
      const off = setTimeout(() => {
        rooms.forEach((r, i) => {
          const t = setTimeout(() => setRoomStates((p) => ({ ...p, [r.id]: false })), i * 120);
          animTimers.current.push(t);
        });
      }, 2800);
      animTimers.current.push(off);
    }, 400);
    animTimers.current.push(main);
    return () => { animTimers.current.forEach((t) => clearTimeout(t)); animTimers.current = []; };
  }, [demoInView]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28" data-testid="hero-section">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/[0.06] rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left — Copy */}
            <div className="lg:col-span-5">
              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="text-xs tracking-[0.2em] uppercase text-orange-500 font-semibold mb-4">
                Smart Living Platform
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
                className="text-4xl sm:text-5xl lg:text-6xl tracking-tighter font-medium leading-[1.1] mb-5"
                style={{ fontFamily: 'Outfit, sans-serif' }} data-testid="hero-title">
                Automation for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">Every Space</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                className="text-base text-zinc-400 leading-relaxed mb-8 max-w-md">
                From private residences to luxury hotels and commercial buildings
                &mdash; InHaus delivers seamless control of lights, locks, curtains and climate.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
                className="flex flex-col gap-4 mb-2">
                {/* Primary — Try Interactive Demo (most prominent) */}
                <button
                  onClick={() => document.getElementById('interactive-demo')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 py-4 font-semibold text-base transition-all duration-300 shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_45px_rgba(249,115,22,0.5)] hover:scale-[1.02] w-fit"
                  data-testid="try-demo-cta"
                >
                  <Lightbulb size={18} />
                  Try our Interactive Demo
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                {/* Secondary row */}
                <div className="flex flex-wrap gap-3">
                  <Link to="/products" data-testid="hero-cta-primary">
                    <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full px-6 py-3 text-sm font-medium transition-all">
                      Explore Products <ArrowRight size={14} />
                    </button>
                  </Link>
                  <Link to="/contact" data-testid="hero-cta-secondary">
                    <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full px-6 py-3 text-sm font-medium transition-all">
                      Contact Us
                    </button>
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right — Interactive Demo */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-7" ref={demoRef}>
              <Floorplan roomStates={roomStates} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ TECH TICKER ═══ */}
      <div className="border-y border-white/5 py-5" data-testid="scrolling-ticker">
        <Marquee speed={30} gradient={false} pauseOnHover>
          {techLabels.map((label, i) => (
            <span key={i} className="mx-8 text-sm tracking-[0.15em] uppercase text-zinc-400 font-bold">{label}</span>
          ))}
        </Marquee>
      </div>

      {/* ═══ SERVICES — 3 SEGMENTS ═══ */}
      <section className="py-24 md:py-32" data-testid="services-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs tracking-[0.2em] uppercase text-orange-500 font-semibold mb-3">We Automate</p>
            <h2 className="text-3xl sm:text-4xl tracking-tight font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Homes. Offices. Hotels.
            </h2>
            <p className="text-base text-zinc-400 mt-3 max-w-xl mx-auto">End-to-end automation solutions designed for every scale of living and working.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ServiceCard icon={Home} title="Residential" desc="Smart switches, lighting scenes, curtains & security for modern homes." img="https://images.pexels.com/photos/32334253/pexels-photo-32334253.jpeg?auto=compress&cs=tinysrgb&w=800" link="/products" />
            <ServiceCard icon={Building2} title="Commercial" desc="Energy-efficient BMS integration, access control & climate management." img="https://images.unsplash.com/photo-1671590733598-6dde3ba88d82?auto=format&w=800&q=80" link="/products" />
            <ServiceCard icon={Hotel} title="Hotels" desc="Guest-room automation, in-room tablets, keyless entry & hospitality tech." img="https://images.pexels.com/photos/30641386/pexels-photo-30641386.jpeg?auto=compress&cs=tinysrgb&w=800" link="/products" />
          </div>
        </div>
      </section>

      {/* ═══ INTERACTIVE DEMO — TOUCH · TAP · TALK ═══ */}
      <section id="interactive-demo" className="py-24 md:py-32 relative" data-testid="smart-demo-section">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/[0.015] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 relative z-10">

          {/* Hook headline */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs tracking-[0.2em] uppercase text-orange-500 font-semibold mb-3">Interactive Demo</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl tracking-tight font-medium leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Want to control your lights?
            </h2>
            <p className="text-lg text-zinc-400 mt-4 max-w-2xl mx-auto leading-relaxed">
              <span className="text-white font-medium">Touch</span> the panel.{' '}
              <span className="text-white font-medium">Tap</span> the app.{' '}
              <span className="text-white font-medium">Talk</span> to your home.{' '}
              <span className="text-orange-400">Try it live.</span>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* LEFT — Touch Panel + Phone App */}
            <div className="space-y-6">

              {/* ── TOUCH — 4x2 Glass Panel ── */}
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <Zap size={16} className="text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Touch</h3>
                    <p className="text-[11px] text-zinc-500">Smart switch panel — tap any switch</p>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden" data-testid="demo-touch-panel"
                  style={{
                    background: 'linear-gradient(145deg, rgba(18,18,24,0.97), rgba(10,10,14,0.98))',
                    boxShadow: '0 16px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.04)',
                  }}
                >
                  <div className="relative">
                    <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/[0.015] to-transparent pointer-events-none rounded-t-2xl" />
                    <div className="grid grid-cols-4">
                      {rooms.slice(0, 8).map((r) => {
                        const isOn = !!roomStates[r.id];
                        return (
                          <button key={r.id} onClick={() => toggleRoom(r.id)}
                            className="group flex flex-col items-center justify-center py-4 hover:bg-white/[0.03] transition-all"
                            data-testid={`panel-touch-${r.id}`}
                          >
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                              isOn ? 'bg-orange-500 shadow-[0_0_14px_rgba(249,115,22,0.5)]' : 'bg-white/[0.06] group-hover:bg-white/10'
                            }`}>
                              <Power size={16} className={isOn ? 'text-white' : 'text-zinc-600'} />
                            </div>
                            <span className={`mt-1.5 text-[8px] uppercase tracking-[0.5px] font-medium ${isOn ? 'text-orange-400' : 'text-zinc-700'}`}>
                              {r.name.length > 7 ? r.name.split(' ')[0] : r.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-2 gap-2 px-4 pb-3">
                      <button onClick={() => toggleAll(false)} className="py-2 rounded-xl text-[10px] font-semibold uppercase tracking-wider bg-white/[0.04] border border-white/[0.06] text-zinc-500 hover:bg-white/[0.08] transition-all" data-testid="touch-all-off">All Off</button>
                      <button onClick={() => toggleAll(true)} className="py-2 rounded-xl text-[10px] font-semibold uppercase tracking-wider bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-all" data-testid="touch-all-on">All On</button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ── TAP & TALK — Phone App ── */}
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <Lightbulb size={16} className="text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Tap & Talk</h3>
                    <p className="text-[11px] text-zinc-500">InHaus app — tap rooms or speak commands</p>
                  </div>
                </div>
                <div className="relative mx-auto max-w-[340px]">
                  <div className="rounded-[36px] border-[2px] border-zinc-700/50 overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.5)]" style={{ background: '#000' }}>
                    <div className="flex items-center justify-between px-6 pt-2.5 pb-0.5">
                      <span className="text-[9px] text-white/60 font-medium">9:41</span>
                      <div className="flex items-center gap-1">
                        <Wifi size={9} className="text-white/60" />
                        <div className="w-4 h-[8px] rounded-sm border border-white/50 flex items-center justify-end pr-px">
                          <div className="w-2.5 h-[5px] rounded-sm bg-green-400" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center mb-2">
                      <div className="w-20 h-5 rounded-full bg-black border border-white/[0.04]" />
                    </div>
                    <div className="px-4 pb-5" style={{ background: 'linear-gradient(175deg, #0e1225, #070810)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <img src="/inhaus_icon_white.png" alt="InHaus" className="w-6 h-6 object-contain" />
                        <img src="/inhaus_text_logo_white.png" alt="INHAUS" className="h-4 w-auto" />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 mb-2">
                        <button onClick={() => toggleAll(false)} className="py-1.5 rounded-lg text-[9px] font-medium bg-white/[0.04] border border-white/[0.06] text-zinc-400 hover:bg-white/[0.07] transition-all" data-testid="controller-all-off">All Off</button>
                        <button onClick={() => toggleAll(true)} className="py-1.5 rounded-lg text-[9px] font-medium bg-white/[0.04] border border-white/[0.06] text-zinc-400 hover:bg-white/[0.07] transition-all" data-testid="controller-all-on">All On</button>
                      </div>
                      {/* Voice bar */}
                      <div className={`flex items-center gap-2 p-2 rounded-xl mb-2 transition-all ${
                        voice.mode === 'recording' ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-white/[0.03] border border-white/[0.05]'
                      }`}>
                        <button onClick={voice.toggleMic}
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            voice.mode === 'recording' ? 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                            : 'bg-gradient-to-br from-orange-500/80 to-amber-500/80'
                          }`} data-testid="voice-mic-btn">
                          <Mic size={12} className="text-white" />
                        </button>
                        <div className="flex-1 min-w-0">
                          {voice.mode === 'recording' ? <span className="text-[9px] text-orange-400 font-semibold">Listening...</span>
                          : voice.mode === 'processing' ? <span className="text-[9px] text-amber-400">Processing...</span>
                          : voice.feedback ? <span className="text-[9px] text-green-400 truncate block">{voice.feedback}</span>
                          : <span className="text-[9px] text-zinc-500">Tap mic or type below</span>}
                        </div>
                      </div>
                      <form className="flex gap-1 mb-2" onSubmit={(e) => { e.preventDefault(); if (cmdInput.trim()) { voice.processText(cmdInput.trim()); setCmdInput(''); } }}>
                        <input type="text" value={cmdInput} onChange={(e) => setCmdInput(e.target.value)} placeholder='"turn on hall"'
                          className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1.5 text-[9px] text-white placeholder-zinc-600 outline-none focus:border-orange-500/40"
                          data-testid="voice-text-input" />
                        <button type="submit" className="px-2 py-1.5 rounded-lg bg-orange-500/20 border border-orange-500/30 text-[8px] font-semibold text-orange-400"
                          data-testid="voice-text-submit">Go</button>
                      </form>
                      {/* Room tiles */}
                      <div className="grid grid-cols-2 gap-1.5 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {rooms.map((r) => (
                          <RoomTile key={r.id} room={r} isOn={!!roomStates[r.id]} onToggle={toggleRoom} />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-center pb-1.5 pt-0.5 bg-[#070810]">
                      <div className="w-20 h-0.5 rounded-full bg-white/20" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* RIGHT — Floorplan (sticky) */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="sticky top-24">
              <Floorplan roomStates={roomStates} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-20 border-y border-white/5" data-testid="stats-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { val: '5,000+', label: 'Smart Homes' },
              { val: '50K+', label: 'Devices Active' },
              { val: '30%', label: 'Energy Saved' },
              { val: '24/7', label: 'Support' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="text-center">
                <div className="text-4xl md:text-5xl font-light text-white mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{s.val}</div>
                <div className="text-sm text-zinc-500 uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PARTNERS ═══ */}
      <section className="py-14" data-testid="partners-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <p className="text-center text-xs text-zinc-600 uppercase tracking-[0.2em] mb-8">Works Seamlessly With</p>
          <Marquee speed={25} gradient={false} pauseOnHover>
            {['Amazon Alexa', 'Google Home', 'Apple HomeKit', 'Matter', 'Samsung SmartThings', 'Tuya'].map((name, i) => (
              <span key={i} className="mx-10 text-sm font-medium tracking-widest text-zinc-600 hover:text-white transition-colors cursor-default">{name}</span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-24 md:py-32" data-testid="capabilities-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs tracking-[0.2em] uppercase text-orange-500 font-semibold mb-3">Why InHaus</p>
            <h2 className="text-3xl sm:text-4xl tracking-tight font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Intelligence Meets Elegance
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard icon={Cpu} title="Smart Automation" delay={0} items={['Schedules, scenes & geofencing', 'Multi-protocol: Zigbee + Wi-Fi + BLE', 'One-tap routines for every moment']} />
            <FeatureCard icon={Eye} title="Premium Design" delay={0.1} items={['Glass-touch switch panels', 'Flush-mount modular hardware', 'Invisible tech, visible elegance']} />
            <FeatureCard icon={Headphones} title="Always-On Care" delay={0.2} items={['Dedicated support engineer', 'Predictive maintenance alerts', 'Free installation & 2-year warranty']} />
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-28 md:py-36 relative" data-testid="cta-section">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/[0.06] via-transparent to-orange-500/[0.06] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl tracking-tighter font-medium mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Ready to Upgrade<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">Your Space?</span>
            </h2>
            <p className="text-base text-zinc-400 max-w-xl mx-auto mb-10">
              Whether it's a single room or an entire hotel, we'll design and install a system that just works. Get a free consultation today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <button className="group flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full px-10 py-4 font-medium text-lg transition-all shadow-[0_0_30px_rgba(249,115,22,0.25)] hover:shadow-[0_0_50px_rgba(249,115,22,0.4)] hover:scale-[1.02]">
                  Get Free Consultation <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/products">
                <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full px-10 py-4 font-medium text-lg transition-all">
                  View Products
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
