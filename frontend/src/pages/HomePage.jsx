import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowRight, Wifi, Bluetooth, Shield, Lightbulb, Lock, Mic, Power, Sun, Moon, Volume2, ChevronRight, CheckCircle, Play, Zap } from 'lucide-react';

// ─── ROOM DATA FOR FLOORPLAN ────────────────────────────────────
const rooms = [
  { id: 'hall', name: 'Hall', icon: Lightbulb },
  { id: 'kitchen', name: 'Kitchen', icon: Sun },
  { id: 'master', name: 'Master Bedroom', icon: Moon },
  { id: 'bedroom2', name: 'Small Bedroom', icon: Lightbulb },
  { id: 'parking', name: 'Parking', icon: Power },
  { id: 'stairs', name: 'Stairs', icon: Lightbulb },
  { id: 'hanging', name: 'Hanging Lights', icon: Lightbulb },
  { id: 'masterbath', name: 'Master Bath', icon: Lightbulb },
  { id: 'guestbath', name: 'Guest Bath', icon: Lightbulb },
];

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

// ─── SVG FLOORPLAN WITH INTERACTIVE LIGHTING ────────────────────
const FloorplanSVG = ({ roomStates }) => {
  // Room positions in the SVG floorplan (x, y, width, height)
  const roomAreas = {
    hall:      { x: 10,  y: 10,  w: 180, h: 140, label: 'Hall' },
    kitchen:   { x: 200, y: 10,  w: 140, h: 140, label: 'Kitchen' },
    master:    { x: 350, y: 10,  w: 200, h: 160, label: 'Master\nBedroom' },
    bedroom2:  { x: 350, y: 180, w: 200, h: 130, label: 'Small\nBedroom' },
    parking:   { x: 10,  y: 160, w: 180, h: 150, label: 'Parking' },
    stairs:    { x: 200, y: 160, w: 70,  h: 80,  label: 'Stairs' },
    hanging:   { x: 200, y: 248, w: 140, h: 62,  label: 'Hanging\nLights' },
    masterbath:{ x: 280, y: 160, w: 60,  h: 80,  label: 'Master\nBath' },
    guestbath: { x: 10,  y: 318, w: 100, h: 62,  label: 'Guest\nBath' },
  };

  return (
    <div className="relative w-full" data-testid="live-floorplan">
      <svg viewBox="0 0 560 390" className="w-full h-auto" style={{ filter: 'drop-shadow(0 0 40px rgba(0,0,0,0.5))' }}>
        <defs>
          {/* Warm light gradient for ON rooms */}
          <radialGradient id="warmLight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFA500" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#FF8C00" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FF6600" stopOpacity="0.05" />
          </radialGradient>
          {/* Glow filter */}
          <filter id="roomGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Dark room filter */}
          <filter id="darkRoom">
            <feColorMatrix type="matrix" values="0.15 0 0 0 0  0 0.15 0 0 0  0 0 0.2 0 0  0 0 0 1 0" />
          </filter>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width="560" height="390" rx="16" fill="#111111" stroke="#222" strokeWidth="2" />

        {/* Outer walls */}
        <rect x="5" y="5" width="550" height="380" rx="12" fill="none" stroke="#333" strokeWidth="3" />

        {/* Room shapes */}
        {Object.entries(roomAreas).map(([id, room]) => {
          const isOn = !!roomStates[id];
          return (
            <g key={id}>
              {/* Room base */}
              <rect
                x={room.x}
                y={room.y}
                width={room.w}
                height={room.h}
                rx="4"
                fill={isOn ? '#1a1408' : '#0d0d0d'}
                stroke={isOn ? '#FF8C00' : '#222'}
                strokeWidth={isOn ? 1.5 : 1}
                style={{ transition: 'all 0.6s ease' }}
              />

              {/* Light overlay when ON */}
              {isOn && (
                <>
                  <rect
                    x={room.x}
                    y={room.y}
                    width={room.w}
                    height={room.h}
                    rx="4"
                    fill="url(#warmLight)"
                    style={{ transition: 'opacity 0.6s ease' }}
                  />
                  {/* Light point (ceiling light) */}
                  <circle
                    cx={room.x + room.w / 2}
                    cy={room.y + room.h / 2}
                    r={Math.min(room.w, room.h) * 0.2}
                    fill="#FFA500"
                    opacity="0.25"
                    filter="url(#roomGlow)"
                  />
                  {/* Small light icon */}
                  <circle
                    cx={room.x + room.w / 2}
                    cy={room.y + room.h / 2 - 10}
                    r="4"
                    fill="#FFD700"
                    opacity="0.9"
                  />
                  {/* Light rays */}
                  {[0, 60, 120, 180, 240, 300].map(angle => (
                    <line
                      key={angle}
                      x1={room.x + room.w / 2}
                      y1={room.y + room.h / 2 - 10}
                      x2={room.x + room.w / 2 + Math.cos(angle * Math.PI / 180) * 12}
                      y2={room.y + room.h / 2 - 10 + Math.sin(angle * Math.PI / 180) * 12}
                      stroke="#FFD700"
                      strokeWidth="0.8"
                      opacity="0.5"
                    />
                  ))}
                </>
              )}

              {/* Room label */}
              {room.label.split('\n').map((line, li) => (
                <text
                  key={li}
                  x={room.x + room.w / 2}
                  y={room.y + room.h - 14 + li * 12}
                  textAnchor="middle"
                  fill={isOn ? '#FFD700' : '#555'}
                  fontSize="9"
                  fontWeight="600"
                  fontFamily="sans-serif"
                  style={{ transition: 'fill 0.6s ease' }}
                >
                  {line}
                </text>
              ))}

              {/* Status indicator */}
              <circle
                cx={room.x + room.w - 10}
                cy={room.y + 10}
                r="4"
                fill={isOn ? '#22c55e' : '#333'}
                stroke={isOn ? '#22c55e' : '#444'}
                strokeWidth="1"
                style={{ transition: 'all 0.3s ease' }}
              />
            </g>
          );
        })}

        {/* Door openings (gaps in walls) */}
        <rect x="170" y="50" width="40" height="3" fill="#111111" /> {/* Hall to Kitchen */}
        <rect x="335" y="50" width="3" height="40" fill="#111111" /> {/* Kitchen to Master */}
        <rect x="170" y="190" width="40" height="3" fill="#111111" /> {/* Hall to Stairs */}
        <rect x="440" y="165" width="3" height="25" fill="#111111" /> {/* Master to Small Bedroom */}

        {/* "LIVE FLOORPLAN" badge */}
        <rect x="200" y="355" width="160" height="28" rx="14" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
        <text x="280" y="373" textAnchor="middle" fill="#888" fontSize="10" fontWeight="600" letterSpacing="2" fontFamily="sans-serif">
          LIVE FLOORPLAN
        </text>
      </svg>
    </div>
  );
};

// ─── ROOM CONTROL PANEL (LEFT SIDE) ─────────────────────────────
const RoomControl = ({ room, isOn, onToggle }) => {
  const Icon = room.icon;
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
        isOn
          ? 'bg-orange-500/10 border-orange-500/30'
          : 'bg-white/[0.02] border-white/5 hover:border-white/10'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
          isOn ? 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.4)]' : 'bg-white/5'
        }`}>
          <Icon size={14} className={isOn ? 'text-white' : 'text-neutral-500'} />
        </div>
        <div>
          <div className="text-sm font-medium text-white">{room.name}</div>
          <div className={`text-xs ${isOn ? 'text-orange-400' : 'text-neutral-600'}`}>
            Lighting {isOn ? 'on' : 'off'}
          </div>
        </div>
      </div>
      <button
        onClick={() => onToggle(room.id)}
        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
          isOn
            ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]'
            : 'bg-white/10 text-neutral-300 hover:bg-white/15'
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
    const newStates = {};
    rooms.forEach(r => { newStates[r.id] = state; });
    setRoomStates(newStates);
  };

  // Animate rooms when demo comes into view
  useEffect(() => {
    if (demoInView) {
      const timer = setTimeout(() => {
        rooms.forEach((room, i) => {
          setTimeout(() => {
            setRoomStates(prev => ({ ...prev, [room.id]: true }));
          }, i * 200);
        });
        // Turn off after demo
        setTimeout(() => {
          rooms.forEach((room, i) => {
            setTimeout(() => {
              setRoomStates(prev => ({ ...prev, [room.id]: false }));
            }, i * 150);
          });
        }, 3000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [demoInView]);

  const activeCount = Object.values(roomStates).filter(Boolean).length;

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
      features: ['At Home routines', 'Away Mode security', 'Custom configurations'],
      link: '/products',
    },
    {
      title: 'Why InHaus?',
      desc: 'A modern blend of elevated design and robust engineering for a truly connected lifestyle.',
      features: ['Signature aesthetic', 'Intelligent core', 'Always-on care'],
      link: '/about',
    },
    {
      title: 'Premium Devices',
      desc: 'From intelligent lighting to advanced security, our collection transforms ordinary spaces.',
      features: ['Smart Switches', 'Security Systems', 'Climate Control'],
      link: '/products',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      <Navbar />

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20" data-testid="hero-section">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/30441226/pexels-photo-30441226.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Modern smart home interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/70 via-[#0A0A0A]/80 to-[#0A0A0A]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/90 via-transparent to-[#0A0A0A]/50" />
        </div>

        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                Smart Living Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold leading-none mb-4"
              data-testid="hero-title"
            >
              Home,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
                Reimagined
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-lg md:text-xl text-neutral-500 mb-2 font-medium"
            >
              by InHaus
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-8 leading-relaxed"
            >
              Seamless control of lights, locks, curtains and more.
              Designed with precision. Powered by intelligence. Feels like the future.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-8"
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 text-sm text-neutral-400"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={18} />
                <span>Free Installation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={18} />
                <span>2-Year Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={18} />
                <span>24/7 Support</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-neutral-500 uppercase tracking-widest">Scroll</span>
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

      {/* ═══ SMART HOME DEMO — LIVE FLOORPLAN ═══ */}
      <section className="py-24 md:py-32 relative" ref={demoRef} data-testid="smart-demo-section">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/[0.03] to-transparent" />

        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-sm text-orange-500 uppercase tracking-widest font-medium mb-4 block">
              Interactive Demo
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Smart Lights{' '}
              <span className="text-neutral-500">Demo</span>
            </h2>
            <p className="text-neutral-400 text-base md:text-lg max-w-2xl mx-auto">
              Use the controls to toggle each room. Lights brighten the floorplan instantly,
              showing how InHaus automations respond in real time.
            </p>
          </motion.div>

          {/* Two-column layout: Controls + Floorplan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-start">
            {/* LEFT — Control Panel */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Voice Command Banner */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20 mb-5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-purple-500 flex items-center justify-center shrink-0">
                  <Mic size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Voice Command</div>
                  <div className="text-sm text-neutral-300">Tap mic and say "Hey InHaus..."</div>
                </div>
              </div>

              {/* All On/Off */}
              <div className="flex gap-3 mb-5">
                <button
                  onClick={() => toggleAll(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-neutral-300 hover:bg-white/10 transition-all"
                  data-testid="all-off-btn"
                >
                  All Off
                </button>
                <button
                  onClick={() => toggleAll(true)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                  data-testid="all-on-btn"
                >
                  All On
                </button>
              </div>

              {/* Room Controls */}
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                {rooms.map((room) => (
                  <RoomControl
                    key={room.id}
                    room={room}
                    isOn={!!roomStates[room.id]}
                    onToggle={toggleRoom}
                  />
                ))}
              </div>
            </motion.div>

            {/* RIGHT — Live Floorplan */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="sticky top-32"
            >
              <FloorplanSVG roomStates={roomStates} />
              
              {/* Active count */}
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-neutral-500">
                <Power size={14} className={activeCount > 0 ? 'text-orange-500' : ''} />
                <span>{activeCount}/{rooms.length} rooms active</span>
              </div>
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

                  <div className="space-y-3 mb-8">
                    {cap.features.map((feat, j) => (
                      <div key={j} className="flex items-center gap-3 text-neutral-300 text-sm">
                        <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                          <ChevronRight size={12} className="text-orange-500" />
                        </div>
                        {feat}
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
