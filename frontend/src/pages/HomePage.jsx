import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import Marquee from 'react-fast-marquee';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  ArrowRight, Wifi, Bluetooth, Shield, Lightbulb, Lock, Mic,
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

// ─── ROOM TILE ──────────────────────────────────────────────────
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
  const toggleAll = (state) => {
    animTimers.current.forEach((t) => clearTimeout(t));
    animTimers.current = [];
    const s = {};
    rooms.forEach((r) => { s[r.id] = state; });
    setRoomStates(s);
  };

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
                className="flex flex-wrap gap-3 mb-6">
                <Link to="/products" data-testid="hero-cta-primary">
                  <button className="group flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full px-7 py-3 font-medium transition-all duration-300 shadow-[0_0_24px_rgba(249,115,22,0.25)] hover:shadow-[0_0_36px_rgba(249,115,22,0.4)]">
                    Explore Products <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </Link>
                <Link to="/contact" data-testid="hero-cta-secondary">
                  <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full px-7 py-3 font-medium transition-all">
                    <Play size={14} className="text-orange-500" /> Get a Quote
                  </button>
                </Link>
              </motion.div>
              {/* Try Demo CTA */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
                <button
                  onClick={() => document.getElementById('interactive-demo')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 font-medium transition-all"
                  data-testid="try-demo-cta"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
                    <Lightbulb size={14} className="text-orange-500" />
                  </span>
                  Try our Interactive Demo
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>

            {/* Right — Interactive Demo */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-7" ref={demoRef}>
              <Floorplan roomStates={roomStates} />
              {/* Mini toggle bar */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <button onClick={() => toggleAll(true)} className="px-4 py-1.5 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 transition-all" data-testid="all-on-btn">All On</button>
                <button onClick={() => toggleAll(false)} className="px-4 py-1.5 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 transition-all" data-testid="all-off-btn">All Off</button>
                {rooms.slice(0, 5).map((r) => (
                  <button key={r.id} onClick={() => toggleRoom(r.id)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 ${
                      roomStates[r.id] ? 'bg-orange-500/15 border border-orange-500/30 text-orange-400' : 'bg-white/5 border border-white/10 text-zinc-500 hover:text-zinc-300'
                    }`}
                    data-testid={`hero-toggle-${r.id}`}
                  >{r.name}</button>
                ))}
                <span className="text-[10px] text-zinc-600">+{rooms.length - 5} more</span>
              </div>
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

      {/* ═══ SMART HOME DEMO — FULL CONTROLLER ═══ */}
      <section id="interactive-demo" className="py-24 md:py-32 relative" data-testid="smart-demo-section">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/[0.015] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs tracking-[0.2em] uppercase text-orange-500 font-semibold mb-3">Interactive Demo</p>
            <h2 className="text-3xl sm:text-4xl tracking-tight font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Control Every Room
            </h2>
            <p className="text-base text-zinc-400 mt-3 max-w-xl mx-auto">
              Toggle each room from the controller. Watch the floorplan light up in real time.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto items-start">
            {/* Controller — Mobile Phone Frame */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-2">
              {/* Phone outer shell */}
              <div className="relative mx-auto max-w-[360px]">
                {/* Phone frame */}
                <div className="rounded-[44px] border-[3px] border-zinc-700/50 overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)]" style={{ background: '#000' }}>
                  
                  {/* Phone status bar */}
                  <div className="flex items-center justify-between px-7 pt-3 pb-1">
                    <span className="text-[10px] text-white/60 font-medium">9:41</span>
                    <div className="flex items-center gap-1.5">
                      <Wifi size={11} className="text-white/60" />
                      <div className="flex items-end gap-px">
                        <div className="w-[3px] h-[5px] rounded-sm bg-white/60" />
                        <div className="w-[3px] h-[7px] rounded-sm bg-white/60" />
                        <div className="w-[3px] h-[9px] rounded-sm bg-white/60" />
                        <div className="w-[3px] h-[11px] rounded-sm bg-white/40" />
                      </div>
                      <div className="w-5 h-[10px] rounded-sm border border-white/50 flex items-center justify-end pr-px">
                        <div className="w-3 h-[6px] rounded-sm bg-green-400" />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic island */}
                  <div className="flex justify-center mb-3">
                    <div className="w-28 h-7 rounded-full bg-black border border-white/[0.04]" />
                  </div>

                  {/* App content area */}
                  <div className="px-5 pb-8" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(37,46,70,0.35), transparent 55%), linear-gradient(175deg, #0e1225 0%, #070810 60%)' }}>
                    
                    {/* InHaus App Header */}
                    <div className="flex items-center gap-3 mb-5">
                      <img src="/inhaus_logo_white.png" alt="InHaus" className="w-9 h-9 object-contain" />
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-[0.1em] uppercase" style={{ fontFamily: 'Outfit, sans-serif' }}>INHAUS</h3>
                        <p className="text-[9px] text-zinc-500 tracking-[0.15em] uppercase">Smart Automation</p>
                      </div>
                    </div>
                    
                    {/* All On/Off */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button onClick={() => toggleAll(false)} className="py-2 rounded-xl text-[11px] font-medium bg-white/[0.04] border border-white/[0.06] text-zinc-400 hover:bg-white/[0.07] transition-all" data-testid="controller-all-off">All Off</button>
                      <button onClick={() => toggleAll(true)} className="py-2 rounded-xl text-[11px] font-medium bg-white/[0.04] border border-white/[0.06] text-zinc-400 hover:bg-white/[0.07] transition-all" data-testid="controller-all-on">All On</button>
                    </div>

                    {/* Voice Command */}
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] mb-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-orange-500/80 to-amber-500/80 shadow-[0_0_12px_rgba(249,115,22,0.2)]">
                        <Mic size={14} className="text-white" />
                      </div>
                      <div>
                        <div className="text-[9px] text-zinc-500 uppercase tracking-[2px] font-medium">Voice</div>
                        <div className="text-[11px] text-zinc-400">"Hey InHaus, lights on"</div>
                      </div>
                    </div>

                    {/* Room Tiles */}
                    <div className="grid grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-0.5 custom-scrollbar">
                      {rooms.map((r) => (
                        <RoomTile key={r.id} room={r} isOn={!!roomStates[r.id]} onToggle={toggleRoom} />
                      ))}
                    </div>
                  </div>

                  {/* Phone home indicator */}
                  <div className="flex justify-center pb-2 pt-1 bg-[#070810]">
                    <div className="w-32 h-1 rounded-full bg-white/20" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floorplan */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
              className="lg:col-span-3 sticky top-28">
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
