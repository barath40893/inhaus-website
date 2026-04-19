import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowRight, Wifi, Bluetooth, Shield, Lightbulb, Lock, Mic, Power, Sun, Moon, Volume2, ChevronRight, CheckCircle, Play, Zap } from 'lucide-react';

// ─── ROOM DATA FOR 3BHK FLOORPLAN ───────────────────────────────
const rooms = [
  { id: 'hall', name: 'Living Room', icon: Lightbulb },
  { id: 'kitchen', name: 'Kitchen', icon: Sun },
  { id: 'dining', name: 'Dining', icon: Lightbulb },
  { id: 'master', name: 'Master Bedroom', icon: Moon },
  { id: 'masterbath', name: 'Master Bath', icon: Lightbulb },
  { id: 'bedroom2', name: 'Bedroom 2', icon: Moon },
  { id: 'bedroom3', name: 'Bedroom 3', icon: Moon },
  { id: 'bathroom', name: 'Bathroom', icon: Lightbulb },
  { id: 'balcony', name: 'Balcony', icon: Sun },
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

// ─── 3D ISOMETRIC FLOORPLAN FOR 3BHK ────────────────────────────
const FloorplanSVG = ({ roomStates }) => {
  const isOn = (id) => !!roomStates[id];

  // Isometric projection helpers
  const ISO = 0.866; // cos(30)
  const wallH = 18; // wall height in pixels

  // Convert grid (x, y) to isometric screen (sx, sy)
  const isoX = (x, y) => 400 + (x - y) * ISO * 0.9;
  const isoY = (x, y) => 60 + (x + y) * 0.45;

  // Create isometric floor polygon points
  const floorPoly = (x, y, w, h) => {
    const tl = `${isoX(x, y)},${isoY(x, y)}`;
    const tr = `${isoX(x + w, y)},${isoY(x + w, y)}`;
    const br = `${isoX(x + w, y + h)},${isoY(x + w, y + h)}`;
    const bl = `${isoX(x, y + h)},${isoY(x, y + h)}`;
    return `${tl} ${tr} ${br} ${bl}`;
  };

  // Left wall polygon
  const leftWall = (x, y, h) => {
    const b1 = `${isoX(x, y)},${isoY(x, y)}`;
    const b2 = `${isoX(x, y + h)},${isoY(x, y + h)}`;
    const t2 = `${isoX(x, y + h)},${isoY(x, y + h) - wallH}`;
    const t1 = `${isoX(x, y)},${isoY(x, y) - wallH}`;
    return `${b1} ${b2} ${t2} ${t1}`;
  };

  // Right wall polygon
  const rightWall = (x, y, w) => {
    const b1 = `${isoX(x + w, y)},${isoY(x + w, y)}`;
    const b2 = `${isoX(x, y)},${isoY(x, y)}`;
    const t2 = `${isoX(x, y)},${isoY(x, y) - wallH}`;
    const t1 = `${isoX(x + w, y)},${isoY(x + w, y) - wallH}`;
    return `${b1} ${b2} ${t2} ${t1}`;
  };

  // Back wall (top-right wall)
  const backWallR = (x, y, w) => {
    const b1 = `${isoX(x, y)},${isoY(x, y)}`;
    const b2 = `${isoX(x + w, y)},${isoY(x + w, y)}`;
    const t2 = `${isoX(x + w, y)},${isoY(x + w, y) - wallH}`;
    const t1 = `${isoX(x, y)},${isoY(x, y) - wallH}`;
    return `${b1} ${b2} ${t2} ${t1}`;
  };

  // Back wall (top-left wall)
  const backWallL = (x, y, h) => {
    const b1 = `${isoX(x, y)},${isoY(x, y)}`;
    const b2 = `${isoX(x, y + h)},${isoY(x, y + h)}`;
    const t2 = `${isoX(x, y + h)},${isoY(x, y + h) - wallH}`;
    const t1 = `${isoX(x, y)},${isoY(x, y) - wallH}`;
    return `${b1} ${b2} ${t2} ${t1}`;
  };

  // Isometric rectangle (for furniture)
  const isoRect = (x, y, w, h) => floorPoly(x, y, w, h);

  // 3BHK Room definitions: {x, y, w, h} in grid units
  const roomDefs = {
    hall:       { x: 0, y: 0, w: 140, h: 100, name: 'Living Room' },
    kitchen:    { x: 140, y: 0, w: 90, h: 70, name: 'Kitchen' },
    dining:     { x: 140, y: 70, w: 90, h: 60, name: 'Dining' },
    master:     { x: 0, y: 100, w: 110, h: 90, name: 'Master Bedroom' },
    masterbath: { x: 0, y: 190, w: 50, h: 40, name: 'M. Bath' },
    bedroom2:   { x: 110, y: 130, w: 80, h: 70, name: 'Bedroom 2' },
    bedroom3:   { x: 190, y: 130, w: 80, h: 70, name: 'Bedroom 3' },
    bathroom:   { x: 230, y: 0, w: 40, h: 70, name: 'Bathroom' },
    balcony:    { x: 230, y: 70, w: 40, h: 60, name: 'Balcony' },
  };

  // Room component
  const Room = ({ id, def }) => {
    const { x, y, w, h, name } = def;
    const lit = isOn(id);
    const floorColor = lit ? '#2a2215' : '#0e0e0e';
    const floorLitOverlay = lit ? 'rgba(255,165,0,0.08)' : 'transparent';
    const wallLitLeft = lit ? '#d4c4a0' : '#3a3a3a';
    const wallLitRight = lit ? '#b8a880' : '#2d2d2d';
    const wallBack = lit ? '#c8b890' : '#333';
    const cx = isoX(x + w / 2, y + h / 2);
    const cy = isoY(x + w / 2, y + h / 2);

    return (
      <g style={{ transition: 'all 0.6s' }}>
        {/* Floor */}
        <polygon points={floorPoly(x, y, w, h)} fill={floorColor} stroke="#1a1a1a" strokeWidth="0.5" style={{ transition: 'fill 0.6s' }} />
        {lit && <polygon points={floorPoly(x, y, w, h)} fill={floorLitOverlay} style={{ transition: 'fill 0.6s' }} />}

        {/* Back walls (top-left and top-right) */}
        <polygon points={backWallR(x, y, w)} fill={wallBack} stroke="#222" strokeWidth="0.3" opacity="0.9" style={{ transition: 'fill 0.6s' }} />
        <polygon points={backWallL(x, y, h)} fill={wallLitLeft} stroke="#222" strokeWidth="0.3" opacity="0.85" style={{ transition: 'fill 0.6s' }} />

        {/* Light glow effect */}
        {lit && (
          <>
            <circle cx={cx} cy={cy - 5} r={Math.min(w, h) * 0.35} fill="url(#isoGlow)" opacity="0.5" />
            <circle cx={cx} cy={cy - 8} r="3" fill="#FFE4A0" opacity="0.9">
              <animate attributeName="opacity" values="0.9;0.6;0.9" dur="2s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        {/* Room label */}
        <text x={cx} y={cy + Math.min(w, h) * 0.3} textAnchor="middle" fill={lit ? '#FFD700' : '#3a3a3a'} fontSize="7" fontWeight="700" fontFamily="Inter, sans-serif" style={{ transition: 'fill 0.6s', textShadow: lit ? '0 0 8px rgba(255,215,0,0.5)' : 'none' }}>
          {name}
        </text>
      </g>
    );
  };

  // Isometric furniture piece
  const Furniture = ({ x, y, w, h, lit, color = '#3d3520', darkColor = '#1a1a1a' }) => (
    <polygon points={isoRect(x, y, w, h)} fill={lit ? color : darkColor} stroke={lit ? '#554a30' : '#222'} strokeWidth="0.5" style={{ transition: 'all 0.6s' }} />
  );

  return (
    <div className="relative w-full" data-testid="live-floorplan">
      <svg viewBox="0 30 800 350" className="w-full h-auto" style={{ filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.6))' }}>
        <defs>
          <radialGradient id="isoGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFA500" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#FF8C00" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#FF6600" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="wallGradLight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8dcc0" />
            <stop offset="100%" stopColor="#c8b890" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect x="0" y="30" width="800" height="350" fill="#080808" rx="12" />

        {/* ═══ ROOMS ═══ */}
        <Room id="hall" def={roomDefs.hall} />
        <Room id="kitchen" def={roomDefs.kitchen} />
        <Room id="dining" def={roomDefs.dining} />
        <Room id="master" def={roomDefs.master} />
        <Room id="masterbath" def={roomDefs.masterbath} />
        <Room id="bedroom2" def={roomDefs.bedroom2} />
        <Room id="bedroom3" def={roomDefs.bedroom3} />
        <Room id="bathroom" def={roomDefs.bathroom} />
        <Room id="balcony" def={roomDefs.balcony} />

        {/* ═══ FURNITURE ═══ */}
        {/* Hall - L-shaped sofa */}
        <Furniture x={15} y={15} w={60} h={20} lit={isOn('hall')} />
        <Furniture x={15} y={35} w={20} h={30} lit={isOn('hall')} />
        {/* Hall - Coffee table */}
        <Furniture x={45} y={45} w={25} h={15} lit={isOn('hall')} color="#2a2418" darkColor="#151515" />
        {/* Hall - TV unit */}
        <Furniture x={90} y={10} w={40} h={8} lit={isOn('hall')} color="#444" darkColor="#1a1a1a" />
        {/* Hall - Rug */}
        <polygon points={isoRect(30, 40, 55, 35)} fill={isOn('hall') ? 'rgba(42,32,21,0.3)' : 'rgba(17,17,17,0.3)'} style={{ transition: 'fill 0.6s' }} />

        {/* Kitchen - Counter */}
        <Furniture x={145} y={5} w={80} h={10} lit={isOn('kitchen')} color="#5a4d35" darkColor="#1e1e1e" />
        {/* Kitchen - Island */}
        <Furniture x={160} y={35} w={45} h={18} lit={isOn('kitchen')} color="#3a3025" darkColor="#151515" />
        {/* Kitchen - Fridge */}
        <Furniture x={215} y={10} w={10} h={18} lit={isOn('kitchen')} color="#4a4a4a" darkColor="#1a1a1a" />

        {/* Dining - Table */}
        <Furniture x={155} y={82} w={50} h={28} lit={isOn('dining')} color="#4a3f28" darkColor="#151515" />
        {/* Dining - Chairs */}
        {[0, 15, 30, 45].map(dx => (
          <polygon key={dx} points={isoRect(155 + dx, 78, 8, 4)} fill={isOn('dining') ? '#3a3025' : '#141414'} style={{ transition: 'fill 0.6s' }} />
        ))}
        {[0, 15, 30, 45].map(dx => (
          <polygon key={`b${dx}`} points={isoRect(155 + dx, 112, 8, 4)} fill={isOn('dining') ? '#3a3025' : '#141414'} style={{ transition: 'fill 0.6s' }} />
        ))}

        {/* Master Bedroom - Bed */}
        <Furniture x={20} y={115} w={55} h={45} lit={isOn('master')} />
        {/* Master - Pillows */}
        <Furniture x={25} y={118} w={18} h={10} lit={isOn('master')} color="#5a4d35" darkColor="#1e1e1e" />
        <Furniture x={48} y={118} w={18} h={10} lit={isOn('master')} color="#5a4d35" darkColor="#1e1e1e" />
        {/* Master - Wardrobe */}
        <Furniture x={85} y={105} w={15} h={50} lit={isOn('master')} color="#2a2418" darkColor="#151515" />
        {/* Master - Bedside tables */}
        <Furniture x={8} y={130} w={10} h={10} lit={isOn('master')} color="#2a2418" darkColor="#151515" />
        <Furniture x={78} y={130} w={10} h={10} lit={isOn('master')} color="#2a2418" darkColor="#151515" />

        {/* Master Bath - Bathtub */}
        <polygon points={isoRect(8, 195, 30, 14)} fill="none" stroke={isOn('masterbath') ? '#666' : '#222'} strokeWidth="1" style={{ transition: 'stroke 0.6s' }} />
        {/* Master Bath - Toilet */}
        <polygon points={isoRect(10, 215, 10, 12)} fill={isOn('masterbath') ? '#444' : '#1a1a1a'} style={{ transition: 'fill 0.6s' }} />

        {/* Bedroom 2 - Bed */}
        <Furniture x={120} y={145} w={45} h={35} lit={isOn('bedroom2')} />
        {/* Bedroom 2 - Pillows */}
        <Furniture x={125} y={148} w={15} h={8} lit={isOn('bedroom2')} color="#5a4d35" darkColor="#1e1e1e" />
        <Furniture x={145} y={148} w={15} h={8} lit={isOn('bedroom2')} color="#5a4d35" darkColor="#1e1e1e" />
        {/* Bedroom 2 - Desk */}
        <Furniture x={170} y={140} w={15} h={25} lit={isOn('bedroom2')} color="#2a2418" darkColor="#151515" />

        {/* Bedroom 3 - Bed */}
        <Furniture x={205} y={145} w={40} h={30} lit={isOn('bedroom3')} />
        {/* Bedroom 3 - Pillow */}
        <Furniture x={210} y={148} w={12} h={8} lit={isOn('bedroom3')} color="#5a4d35" darkColor="#1e1e1e" />
        <Furniture x={228} y={148} w={12} h={8} lit={isOn('bedroom3')} color="#5a4d35" darkColor="#1e1e1e" />
        {/* Bedroom 3 - Study corner */}
        <Furniture x={255} y={140} w={12} h={20} lit={isOn('bedroom3')} color="#2a2418" darkColor="#151515" />

        {/* Common Bathroom - Fixtures */}
        <polygon points={isoRect(235, 8, 28, 12)} fill="none" stroke={isOn('bathroom') ? '#666' : '#222'} strokeWidth="1" style={{ transition: 'stroke 0.6s' }} />
        <polygon points={isoRect(240, 35, 10, 14)} fill={isOn('bathroom') ? '#444' : '#1a1a1a'} style={{ transition: 'fill 0.6s' }} />
        <polygon points={isoRect(255, 40, 10, 8)} fill="none" stroke={isOn('bathroom') ? '#555' : '#222'} strokeWidth="0.8" style={{ transition: 'stroke 0.6s' }} />

        {/* Balcony - Plants */}
        <circle cx={isoX(245, 85)} cy={isoY(245, 85)} r="4" fill={isOn('balcony') ? '#2d5016' : '#141414'} style={{ transition: 'fill 0.6s' }} />
        <circle cx={isoX(255, 95)} cy={isoY(255, 95)} r="3" fill={isOn('balcony') ? '#2d5016' : '#141414'} style={{ transition: 'fill 0.6s' }} />
        {/* Balcony railing */}
        <line x1={isoX(270, 70)} y1={isoY(270, 70) - 8} x2={isoX(270, 130)} y2={isoY(270, 130) - 8} stroke={isOn('balcony') ? '#888' : '#333'} strokeWidth="1.5" style={{ transition: 'stroke 0.6s' }} />

        {/* ═══ OUTER WALLS (front edges) ═══ */}
        {/* Front-right wall */}
        <polygon points={`
          ${isoX(270, 0)},${isoY(270, 0)}
          ${isoX(270, 200)},${isoY(270, 200)}
          ${isoX(270, 200)},${isoY(270, 200) - wallH}
          ${isoX(270, 0)},${isoY(270, 0) - wallH}
        `} fill="#2a2a2a" stroke="#333" strokeWidth="0.5" opacity="0.6" />
        {/* Front-left wall */}
        <polygon points={`
          ${isoX(0, 230)},${isoY(0, 230)}
          ${isoX(270, 230)},${isoY(270, 230)}
          ${isoX(270, 230)},${isoY(270, 230) - wallH}
          ${isoX(0, 230)},${isoY(0, 230) - wallH}
        `} fill="#222" stroke="#333" strokeWidth="0.5" opacity="0.5" />

        {/* ═══ FLOOR SHADOW ═══ */}
        <polygon points={floorPoly(-5, -5, 280, 240)} fill="none" stroke="#1a1a1a" strokeWidth="2" opacity="0.3" />
      </svg>

      {/* Badge */}
      <div className="flex justify-center mt-3">
        <div className="px-6 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
          <span className="text-[9px] font-bold tracking-[4px] text-neutral-500 uppercase">3BHK Live Floorplan</span>
        </div>
      </div>
    </div>
  );
};

// ─── ROOM TILE — NOVIQ STYLE ────────────────────────────────────
const RoomTile = ({ room, isOn, onToggle }) => {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-2xl backdrop-blur-md transition-all duration-500 ${
        isOn
          ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/15 border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)]'
          : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06]'
      }`}
      data-testid={`room-tile-${room.id}`}
    >
      <div>
        <div className="font-semibold text-white text-sm mb-0.5">{room.name}</div>
        <div className={`text-xs uppercase tracking-wider font-medium ${isOn ? 'text-orange-400' : 'text-neutral-600'}`}>
          Lighting {isOn ? 'on' : 'off'}
        </div>
      </div>
      <button
        onClick={() => onToggle(room.id)}
        className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
          isOn
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_4px_20px_rgba(249,115,22,0.35)] hover:shadow-[0_4px_25px_rgba(249,115,22,0.5)]'
            : 'bg-white/10 text-neutral-300 hover:bg-white/15 border border-white/10'
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
              <div className="rounded-3xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md p-5 shadow-[0_0_80px_rgba(0,0,0,0.3)]">
                
                {/* All On/Off */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button
                    onClick={() => toggleAll(false)}
                    className="py-3 rounded-2xl text-sm font-semibold bg-white/[0.04] border border-white/[0.08] text-neutral-300 hover:bg-white/[0.08] transition-all backdrop-blur-sm"
                    data-testid="all-off-btn"
                  >
                    All Off
                  </button>
                  <button
                    onClick={() => toggleAll(true)}
                    className="py-3 rounded-2xl text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all shadow-[0_4px_20px_rgba(249,115,22,0.3)]"
                    data-testid="all-on-btn"
                  >
                    All On
                  </button>
                </div>

                {/* Voice Command */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-5">
                  <button
                    className="relative w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all"
                    data-testid="voice-cmd-btn"
                  >
                    <span className="absolute inset-0 rounded-full border-2 border-orange-400/30 animate-ping" />
                    <Mic size={20} className="text-white relative z-10" />
                  </button>
                  <div>
                    <div className="text-xs text-neutral-400 uppercase tracking-widest font-semibold">Voice Command</div>
                    <div className="text-sm text-neutral-300">Tap mic and say "Hey InHaus..."</div>
                  </div>
                </div>

                {/* Room Tiles */}
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
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
