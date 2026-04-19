import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowRight, Wifi, Bluetooth, Shield, Lightbulb, Lock, Mic, Power, Sun, Moon, Volume2, ChevronRight, CheckCircle, Play, Zap } from 'lucide-react';

// ─── ROOM DATA FOR FLOORPLAN (matches NoLights.png) ─────────────
const rooms = [
  { id: 'living', name: 'Living Room', icon: Lightbulb },
  { id: 'kitchen', name: 'Kitchen', icon: Sun },
  { id: 'bedroom', name: 'Bedroom', icon: Moon },
  { id: 'office', name: 'Office / Study', icon: Lightbulb },
  { id: 'garage', name: 'Garage', icon: Power },
  { id: 'hallway', name: 'Hallway', icon: Lightbulb },
  { id: 'bath1', name: 'Bathroom 1', icon: Lightbulb },
  { id: 'bath2', name: 'Bathroom 2', icon: Lightbulb },
];

// ─── ROOM LIGHT OVERLAY POSITIONS (% of image 1000x678) ────────
// Soft warm-white ambient glow — mimics natural room lighting
const roomOverlays = {
  living: { cx: 44.3, cy: 53.7, rx: 13, ry: 13 },
  kitchen: { cx: 28.6, cy: 29, rx: 10, ry: 12 },
  bedroom: { cx: 74.3, cy: 50.3, rx: 10, ry: 12 },
  office: { cx: 14.3, cy: 42.5, rx: 6, ry: 7 },
  garage: { cx: 71.8, cy: 92, rx: 14, ry: 11 },
  hallway: { cx: 43.2, cy: 41.3, rx: 7, ry: 11 },
  bath1: { cx: 32.5, cy: 45.7, rx: 4.5, ry: 6 },
  bath2: { cx: 65, cy: 35.1, rx: 5, ry: 7 },
};

// ─── TICKER ITEMS ───────────────────────────────────────────────
const tickerItems = [
  { label: 'Wi-Fi', icon: Wifi },
  { label: 'Zigbee', icon: Bluetooth },
  { label: 'Bluetooth', icon: Bluetooth },
  { label: 'Alexa', icon: Mic },
  { label: 'Scenes', icon: Sun },
  { label: 'Security', icon: Shield },
  { label: 'Lighting', icon: Lightbulb },
  { label: 'Curtains', icon: ChevronRight },
  { label: 'Locks', icon: Lock },
  { label: 'Panels', icon: Power },
  { label: 'Voice Control', icon: Volume2 },
  { label: 'Smart Switches', icon: Zap },
];

// ─── SCROLLING TICKER COMPONENT ─────────────────────────────────
const ScrollingTicker = () => (
  <div className="relative overflow-hidden py-6 border-y border-white/5" data-testid="scrolling-ticker">
    <div className="flex animate-ticker">
      {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
        <div key={i} className="flex items-center gap-2 px-6 shrink-0">
          <item.icon size={16} className="text-orange-500" />
          <span className="text-sm font-medium text-neutral-400 whitespace-nowrap">{item.label}</span>
        </div>
      ))}
    </div>
  </div>
);

// ─── IMAGE-BASED INTERACTIVE FLOORPLAN ───────────────────────────
const ImageFloorplan = ({ roomStates }) => {
  const litCount = Object.values(roomStates).filter(Boolean).length;
  
  return (
    <div className="relative w-full" data-testid="live-floorplan">
      <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '1000 / 678', background: '#111' }}>
        {/* Base floorplan image — always reasonably visible */}
        <img
          src="/NoLights.png"
          alt="3D Isometric Floorplan"
          className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none transition-[filter] duration-700"
          draggable={false}
          style={{
            filter: litCount > 0
              ? `brightness(${0.65 + litCount * 0.04}) saturate(0.85)`
              : 'brightness(0.6) saturate(0.5)',
          }}
        />

        {/* Soft ambient glow per room — warm white, very diffuse */}
        {Object.entries(roomOverlays).map(([id, ov]) => {
          const isOn = !!roomStates[id];
          return (
            <div
              key={id}
              data-testid={`light-overlay-${id}`}
              className="absolute pointer-events-none rounded-[50%]"
              style={{
                left: `${ov.cx - ov.rx * 1.3}%`,
                top: `${ov.cy - ov.ry * 1.3}%`,
                width: `${ov.rx * 2.6}%`,
                height: `${ov.ry * 2.6}%`,
                background: 'radial-gradient(ellipse at center, rgba(255,240,200,0.45) 0%, rgba(255,230,180,0.2) 40%, rgba(255,220,160,0.06) 70%, transparent 100%)',
                opacity: isOn ? 1 : 0,
                transition: 'opacity 0.5s ease',
                mixBlendMode: 'screen',
              }}
            />
          );
        })}

        {/* LIVE FLOORPLAN badge — bottom-center like NOVIQ */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
          <div className="px-5 py-1.5 rounded-md bg-black/50 backdrop-blur-sm">
            <span className="text-[10px] font-semibold tracking-[3px] text-neutral-300 uppercase">Live Floorplan</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ROOM TILE — NOVIQ CARD STYLE (2-col grid) ─────────────────
const RoomTile = ({ room, isOn, onToggle }) => {
  return (
    <div
      className={`relative flex flex-col p-3.5 rounded-xl transition-all duration-400 overflow-hidden ${
        isOn
          ? 'bg-[#1a1a2e] border border-indigo-500/25'
          : 'bg-white/[0.03] border border-white/[0.06] hover:border-white/10'
      }`}
      data-testid={`room-tile-${room.id}`}
    >
      {/* Accent left border when ON */}
      {isOn && (
        <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-orange-400 to-amber-500" />
      )}
      <div className="font-semibold text-white text-[13px] mb-0.5 pl-1">{room.name}</div>
      <div className={`text-[10px] uppercase tracking-widest font-medium mb-3 pl-1 ${isOn ? 'text-orange-400' : 'text-neutral-600'}`}>
        Lighting {isOn ? 'on' : 'off'}
      </div>
      <button
        onClick={() => onToggle(room.id)}
        className={`w-full py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all duration-300 ${
          isOn
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_2px_12px_rgba(249,115,22,0.25)]'
            : 'bg-white/[0.06] text-neutral-400 hover:bg-white/10 border border-white/[0.08]'
        }`}
        data-testid={`room-toggle-${room.id}`}
      >
        {isOn ? 'Turn Off' : 'Turn On'}
      </button>
    </div>
  );
};

// ─── MAIN HOMEPAGE ──────────────────────────────────────────────
const HomePage = () => {
  const [roomStates, setRoomStates] = useState({});
  const demoRef = useRef(null);
  const demoInView = useInView(demoRef, { once: true, margin: '-100px' });

  const toggleRoom = (id) => {
    setRoomStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = (state) => {
    // Cancel any running animation
    animTimers.current.forEach(t => clearTimeout(t));
    animTimers.current = [];
    const newStates = {};
    rooms.forEach(r => { newStates[r.id] = state; });
    setRoomStates(newStates);
  };

  // Animate rooms when demo comes into view
  const animTimers = useRef([]);
  useEffect(() => {
    if (demoInView) {
      // Clear any existing timers
      animTimers.current.forEach(t => clearTimeout(t));
      animTimers.current = [];
      
      const mainTimer = setTimeout(() => {
        rooms.forEach((room, i) => {
          const t = setTimeout(() => {
            setRoomStates(prev => ({ ...prev, [room.id]: true }));
          }, i * 200);
          animTimers.current.push(t);
        });
        // Turn off after demo
        const offTimer = setTimeout(() => {
          rooms.forEach((room, i) => {
            const t = setTimeout(() => {
              setRoomStates(prev => ({ ...prev, [room.id]: false }));
            }, i * 150);
            animTimers.current.push(t);
          });
        }, 3000);
        animTimers.current.push(offTimer);
      }, 500);
      animTimers.current.push(mainTimer);
      
      return () => {
        animTimers.current.forEach(t => clearTimeout(t));
        animTimers.current = [];
      };
    }
  }, [demoInView]);

  const stats = [
    { value: '5000+', label: 'Smart Homes' },
    { value: '50K+', label: 'Devices Active' },
    { value: '30%', label: 'Energy Saved' },
    { value: '24/7', label: 'Support' },
  ];

  const partners = [
    { name: 'Amazon Alexa', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Amazon_Alexa_App_Logo.png' },
    { name: 'Google Home', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Google_Assistant_logo.png' },
    { name: 'Apple HomeKit', logo: null, svg: true },
    { name: 'Matter', logo: null, initial: 'M' },
  ];

  const capabilities = [
    {
      title: 'Smart Living',
      desc: 'Automate daily life with intelligent scenes across lighting, curtains, locks, and more.',
      features: [
        { label: 'At Home', detail: 'Lights, curtains, and locks respond to your routines for comfort and convenience.' },
        { label: 'Away Mode', detail: 'Security and energy-saving automations activate when you\'re away.' },
        { label: 'Custom Configurations', detail: 'Personalized scene setups tailored to your lifestyle needs.' },
      ],
      link: '/products',
    },
    {
      title: 'Why InHaus?',
      desc: 'A modern blend of elevated design and robust engineering for a truly connected lifestyle.',
      features: [
        { label: 'Signature Aesthetic', detail: 'Immersive lighting, polished surfaces, and purposeful motion.' },
        { label: 'Intelligent Core', detail: 'Zigbee, Wi-Fi, and voice tech for instant responses and rock-solid security.' },
        { label: 'Always-On Care', detail: 'Concierge support, predictive maintenance, and adaptive scenes.' },
      ],
      link: '/about',
    },
    {
      title: 'Premium Devices',
      desc: 'From intelligent lighting to advanced security, our collection transforms ordinary spaces.',
      features: [
        { label: 'Smart Switches', detail: 'Touch panels and modular switches with elegant glass finish.' },
        { label: 'Security Systems', detail: 'Smart locks, cameras, and motion sensors for complete peace of mind.' },
        { label: 'Climate Control', detail: 'Automated curtains, IR blasters, and thermostat integration.' },
      ],
      link: '/products',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      <Navbar />

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-screen flex items-center justify-center" data-testid="hero-section">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/30441226/pexels-photo-30441226.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Modern smart home interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/60 via-[#0A0A0A]/70 to-[#0A0A0A]" />
        </div>

        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <span className="text-xs text-neutral-400 uppercase tracking-[5px] font-medium">
              Smart Living Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold leading-none mb-6"
            data-testid="hero-title"
          >
            InHaus — Home,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">
              Reimagined
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Seamless control of lights, locks, curtains and more.
            Designed with precision. Powered by intelligence. Feels like the future.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/products" data-testid="hero-cta-primary">
              <button className="group flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-medium transition-all duration-300 shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] hover:scale-105">
                Explore Products
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/contact" data-testid="hero-cta-secondary">
              <button className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-full font-medium transition-all duration-300 backdrop-blur-sm">
                <Play size={18} className="text-orange-500" />
                Get a Free Quote
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-neutral-600 flex justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-1 bg-orange-500 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* ═══ SCROLLING TICKER ═══ */}
      <ScrollingTicker />

      {/* ═══ STATS SECTION ═══ */}
      <section className="py-20 border-b border-white/5" data-testid="stats-section">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-neutral-500 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SMART HOME DEMO — NOVIQ LAYOUT ═══ */}
      <section className="py-24 md:py-32 relative" ref={demoRef} data-testid="smart-demo-section">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/[0.02] to-transparent" />

        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Smart Lights Demo
            </h2>
            <p className="text-neutral-400 text-base md:text-lg max-w-2xl mx-auto">
              Use the on-screen controller to toggle each room. Lights brighten the floorplan instantly,
              showing how InHaus automations respond in real time.
            </p>
          </motion.div>

          {/* NOVIQ-STYLE TWO COLUMN: Phone Controller + Floorplan */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto items-start">
            
            {/* LEFT — Phone Controller (2/5 width) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
            >
              <div className="rounded-[28px] bg-[#0d0d1a] border border-white/[0.06] p-5 shadow-[0_8px_60px_rgba(0,0,0,0.5)]">
                
                {/* Phone Dynamic Island */}
                <div className="flex justify-center mb-5">
                  <div className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-[#181828] border border-white/[0.05]">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500/60" />
                    <div className="w-14 h-[3px] rounded-full bg-white/[0.08]" />
                  </div>
                </div>

                {/* Smart Home Header */}
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-white">Smart Home</h3>
                  <p className="text-xs text-neutral-500">Tap to illuminate each space</p>
                </div>
                
                {/* All On/Off */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => toggleAll(false)}
                    className="py-2.5 rounded-xl text-xs font-medium bg-white/[0.04] border border-white/[0.06] text-neutral-400 hover:bg-white/[0.07] transition-all"
                    data-testid="all-off-btn"
                  >
                    All Off
                  </button>
                  <button
                    onClick={() => toggleAll(true)}
                    className="py-2.5 rounded-xl text-xs font-medium bg-white/[0.04] border border-white/[0.06] text-neutral-400 hover:bg-white/[0.07] transition-all"
                    data-testid="all-on-btn"
                  >
                    All On
                  </button>
                </div>

                {/* Voice Command */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] mb-4">
                  <button
                    className="relative w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                    data-testid="voice-cmd-btn"
                  >
                    <Mic size={16} className="text-white" />
                  </button>
                  <div>
                    <div className="text-[10px] text-neutral-500 uppercase tracking-[2px] font-medium">Voice Command</div>
                    <div className="text-xs text-neutral-400">Tap mic and say "Hey InHaus..."</div>
                  </div>
                </div>

                {/* Room Tiles — 2 Column Grid */}
                <div className="grid grid-cols-2 gap-2.5 max-h-[400px] overflow-y-auto pr-0.5 custom-scrollbar">
                  {rooms.map((room) => (
                    <RoomTile
                      key={room.id}
                      room={room}
                      isOn={!!roomStates[room.id]}
                      onToggle={toggleRoom}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* RIGHT — Live Floorplan (3/5 width) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-3 sticky top-32"
            >
              <ImageFloorplan roomStates={roomStates} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ WORKS WITH / PARTNERS ═══ */}
      <section className="py-16 border-y border-white/5" data-testid="partners-section">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-sm text-neutral-500 uppercase tracking-widest mb-2">Works Seamlessly With</p>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
            {/* Amazon Alexa */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Amazon_Alexa_App_Logo.png" alt="Amazon Alexa" className="w-10 h-10 object-contain opacity-60" />
              <span className="font-medium">Amazon Alexa</span>
            </motion.div>

            {/* Google Home */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5a/Google_Assistant_logo.png" alt="Google Home" className="w-10 h-10 object-contain opacity-60" />
              <span className="font-medium">Google Home</span>
            </motion.div>

            {/* Apple HomeKit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors"
            >
              <svg className="w-10 h-10 opacity-60" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span className="font-medium">Apple HomeKit</span>
            </motion.div>

            {/* Matter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-lg font-bold text-orange-500">M</span>
              </div>
              <span className="font-medium">Matter</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ CAPABILITY CARDS — GLASS-MORPHISM ═══ */}
      <section className="py-24 md:py-32" data-testid="capabilities-section">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm text-orange-500 uppercase tracking-widest font-medium mb-4 block">
              Why InHaus
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Intelligence Meets{' '}
              <span className="text-neutral-500">Elegance</span>
            </h2>
            <p className="text-neutral-400 text-base md:text-lg max-w-2xl mx-auto">
              Every feature designed to simplify your life while elevating your home experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {capabilities.map((cap, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="group relative p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-orange-500/20 hover:bg-white/[0.06] transition-all duration-500 backdrop-blur-sm"
                data-testid={`capability-card-${i}`}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute -inset-px bg-gradient-to-b from-orange-500/10 via-transparent to-orange-500/5 rounded-3xl blur-sm" />
                </div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-3">{cap.title}</h3>
                  <p className="text-neutral-400 mb-6 leading-relaxed">{cap.desc}</p>

                  <div className="space-y-4 mb-8">
                    {cap.features.map((feat, j) => (
                      <div key={j}>
                        <div className="flex items-center gap-3 text-white text-sm font-semibold mb-1">
                          <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                            <ChevronRight size={12} className="text-orange-500" />
                          </div>
                          {feat.label}
                        </div>
                        <p className="text-neutral-500 text-xs pl-9 leading-relaxed">{feat.detail}</p>
                      </div>
                    ))}
                  </div>

                  <Link
                    to={cap.link}
                    className="inline-flex items-center gap-2 text-orange-500 text-sm font-medium group-hover:gap-3 transition-all duration-300"
                  >
                    Learn More
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section className="py-24 md:py-32 relative" data-testid="cta-section">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-orange-500/10" />

        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Ready to Transform
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
                Your Living Space?
              </span>
            </h2>
            <p className="text-neutral-400 text-base md:text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of homeowners who have already made the switch to intelligent living.
              Get a free consultation and personalized quote today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <button className="group flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-10 py-5 rounded-full font-medium text-lg transition-all duration-300 shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)] hover:scale-105">
                  Get Free Consultation
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/products">
                <button className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-10 py-5 rounded-full font-medium text-lg transition-all duration-300">
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
