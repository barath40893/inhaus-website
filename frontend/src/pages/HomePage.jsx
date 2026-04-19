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

// ─── PREMIUM SVG FLOORPLAN WITH 3D FURNITURE & LIGHTING ─────────
const FloorplanSVG = ({ roomStates }) => {
  const isOn = (id) => !!roomStates[id];

  // Reusable light glow for a room
  const RoomLight = ({ cx, cy, r = 25, on }) => on ? (
    <g>
      <circle cx={cx} cy={cy} r={r * 2.5} fill="#FFA500" opacity="0.08" />
      <circle cx={cx} cy={cy} r={r * 1.6} fill="#FFB84D" opacity="0.12" />
      <circle cx={cx} cy={cy} r={r} fill="#FFCC66" opacity="0.2" />
      <circle cx={cx} cy={cy} r="3" fill="#FFE4A0" opacity="0.95" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
        <line key={a} x1={cx} y1={cy} x2={cx + Math.cos(a * Math.PI / 180) * 8} y2={cy + Math.sin(a * Math.PI / 180) * 8} stroke="#FFD700" strokeWidth="0.5" opacity="0.4" />
      ))}
    </g>
  ) : null;

  const wallColor = '#2a2a2a';
  const wallStroke = '#3a3a3a';
  const floorDark = '#0c0c0c';
  const floorLit = '#1a1408';

  return (
    <div className="relative w-full" data-testid="live-floorplan">
      {/* Perspective wrapper for 3D feel */}
      <div style={{ perspective: '1200px' }}>
        <div style={{ transform: 'rotateX(8deg) rotateY(-2deg)', transformOrigin: 'center center' }}>
          <svg viewBox="-10 -10 600 440" className="w-full h-auto" style={{ filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.7))' }}>
            <defs>
              <radialGradient id="lightGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFA500" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#FF8C00" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#FF6600" stopOpacity="0" />
              </radialGradient>
              <pattern id="woodFloor" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect width="20" height="20" fill="#1a1510" />
                <line x1="0" y1="10" x2="20" y2="10" stroke="#221c14" strokeWidth="0.3" />
                <line x1="10" y1="0" x2="10" y2="20" stroke="#1e1812" strokeWidth="0.15" />
              </pattern>
              <pattern id="tileFloor" width="15" height="15" patternUnits="userSpaceOnUse">
                <rect width="15" height="15" fill="#141414" />
                <rect width="14" height="14" x="0.5" y="0.5" fill="#181818" rx="1" />
              </pattern>
              <linearGradient id="wallShadow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#000" stopOpacity="0" />
              </linearGradient>
              <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="12" />
              </filter>
            </defs>

            {/* ═══ OUTER STRUCTURE ═══ */}
            <rect x="0" y="0" width="580" height="420" rx="8" fill="#080808" />
            {/* Outer wall shadow for 3D depth */}
            <rect x="2" y="2" width="576" height="416" rx="6" fill="none" stroke="#444" strokeWidth="4" />
            <rect x="6" y="6" width="568" height="408" rx="4" fill="none" stroke="#222" strokeWidth="1" />

            {/* ═══ HALL (top-left, large) ═══ */}
            <g data-room="hall">
              <rect x="10" y="10" width="210" height="170" rx="2" fill={isOn('hall') ? floorLit : floorDark} stroke={wallColor} strokeWidth="3" style={{ transition: 'fill 0.6s' }} />
              {isOn('hall') && <rect x="10" y="10" width="210" height="170" rx="2" fill="url(#lightGlow)" />}
              {/* Floor pattern */}
              <rect x="12" y="12" width="206" height="166" rx="1" fill="url(#woodFloor)" opacity={isOn('hall') ? 0.4 : 0.15} style={{ transition: 'opacity 0.6s' }} />
              {/* Sofa */}
              <rect x="30" y="90" width="70" height="30" rx="6" fill={isOn('hall') ? '#3d3520' : '#1a1a1a'} stroke={isOn('hall') ? '#554a30' : '#222'} strokeWidth="1.5" style={{ transition: 'all 0.6s' }} />
              <rect x="30" y="85" width="70" height="8" rx="4" fill={isOn('hall') ? '#4a3f28' : '#1e1e1e'} style={{ transition: 'fill 0.6s' }} />
              {/* Coffee table */}
              <rect x="55" y="130" width="30" height="18" rx="3" fill={isOn('hall') ? '#2a2418' : '#151515'} stroke={isOn('hall') ? '#3d3520' : '#1e1e1e'} strokeWidth="1" style={{ transition: 'all 0.6s' }} />
              {/* TV unit */}
              <rect x="150" y="25" width="55" height="8" rx="2" fill={isOn('hall') ? '#333' : '#1a1a1a'} style={{ transition: 'fill 0.6s' }} />
              {/* Rug */}
              <ellipse cx="80" cy="135" rx="45" ry="25" fill={isOn('hall') ? '#2a2015' : '#111'} opacity="0.5" style={{ transition: 'fill 0.6s' }} />
              <RoomLight cx={115} cy={90} r={30} on={isOn('hall')} />
              <text x="115" y="170" textAnchor="middle" fill={isOn('hall') ? '#FFD700' : '#444'} fontSize="11" fontWeight="700" fontFamily="sans-serif" style={{ transition: 'fill 0.6s' }}>Hall</text>
            </g>

            {/* ═══ KITCHEN (top-center) ═══ */}
            <g data-room="kitchen">
              <rect x="226" y="10" width="140" height="170" rx="2" fill={isOn('kitchen') ? floorLit : floorDark} stroke={wallColor} strokeWidth="3" style={{ transition: 'fill 0.6s' }} />
              {isOn('kitchen') && <rect x="226" y="10" width="140" height="170" rx="2" fill="url(#lightGlow)" />}
              <rect x="228" y="12" width="136" height="166" rx="1" fill="url(#tileFloor)" opacity={isOn('kitchen') ? 0.4 : 0.15} style={{ transition: 'opacity 0.6s' }} />
              {/* Counter top */}
              <rect x="232" y="16" width="128" height="12" rx="2" fill={isOn('kitchen') ? '#3a3025' : '#1a1a1a'} stroke={isOn('kitchen') ? '#4a3f28' : '#222'} strokeWidth="1" style={{ transition: 'all 0.6s' }} />
              {/* Stove */}
              <rect x="260" y="16" width="24" height="12" rx="1" fill={isOn('kitchen') ? '#444' : '#1e1e1e'} style={{ transition: 'fill 0.6s' }} />
              <circle cx="268" cy="22" r="3" fill={isOn('kitchen') ? '#666' : '#222'} style={{ transition: 'fill 0.6s' }} />
              <circle cx="278" cy="22" r="3" fill={isOn('kitchen') ? '#666' : '#222'} style={{ transition: 'fill 0.6s' }} />
              {/* Sink */}
              <rect x="310" y="17" width="16" height="10" rx="3" fill="none" stroke={isOn('kitchen') ? '#555' : '#222'} strokeWidth="1" style={{ transition: 'stroke 0.6s' }} />
              {/* Island */}
              <rect x="260" y="100" width="80" height="30" rx="4" fill={isOn('kitchen') ? '#2a2418' : '#151515'} stroke={isOn('kitchen') ? '#3d3520' : '#1e1e1e'} strokeWidth="1" style={{ transition: 'all 0.6s' }} />
              {/* Fridge */}
              <rect x="340" y="40" width="18" height="35" rx="3" fill={isOn('kitchen') ? '#3a3a3a' : '#1a1a1a'} stroke={isOn('kitchen') ? '#4a4a4a' : '#222'} strokeWidth="1" style={{ transition: 'all 0.6s' }} />
              <RoomLight cx={296} cy={85} r={22} on={isOn('kitchen')} />
              <text x="296" y="170" textAnchor="middle" fill={isOn('kitchen') ? '#FFD700' : '#444'} fontSize="11" fontWeight="700" fontFamily="sans-serif" style={{ transition: 'fill 0.6s' }}>Kitchen</text>
            </g>

            {/* ═══ MASTER BEDROOM (top-right) ═══ */}
            <g data-room="master">
              <rect x="372" y="10" width="200" height="195" rx="2" fill={isOn('master') ? floorLit : floorDark} stroke={wallColor} strokeWidth="3" style={{ transition: 'fill 0.6s' }} />
              {isOn('master') && <rect x="372" y="10" width="200" height="195" rx="2" fill="url(#lightGlow)" />}
              <rect x="374" y="12" width="196" height="191" rx="1" fill="url(#woodFloor)" opacity={isOn('master') ? 0.4 : 0.15} style={{ transition: 'opacity 0.6s' }} />
              {/* Bed */}
              <rect x="420" y="50" width="100" height="75" rx="6" fill={isOn('master') ? '#3d3520' : '#1a1a1a'} stroke={isOn('master') ? '#554a30' : '#222'} strokeWidth="1.5" style={{ transition: 'all 0.6s' }} />
              {/* Pillows */}
              <rect x="430" y="55" width="35" height="18" rx="6" fill={isOn('master') ? '#4a4030' : '#1e1e1e'} style={{ transition: 'fill 0.6s' }} />
              <rect x="475" y="55" width="35" height="18" rx="6" fill={isOn('master') ? '#4a4030' : '#1e1e1e'} style={{ transition: 'fill 0.6s' }} />
              {/* Blanket fold */}
              <rect x="425" y="95" width="90" height="5" rx="2" fill={isOn('master') ? '#5a4d35' : '#222'} style={{ transition: 'fill 0.6s' }} />
              {/* Wardrobe */}
              <rect x="542" y="30" width="22" height="80" rx="3" fill={isOn('master') ? '#2a2418' : '#151515'} stroke={isOn('master') ? '#3d3520' : '#1e1e1e'} strokeWidth="1" style={{ transition: 'all 0.6s' }} />
              {/* Bedside tables */}
              <rect x="395" y="65" width="18" height="18" rx="3" fill={isOn('master') ? '#2a2418' : '#151515'} style={{ transition: 'fill 0.6s' }} />
              <rect x="527" y="65" width="18" height="18" rx="3" fill={isOn('master') ? '#2a2418' : '#151515'} style={{ transition: 'fill 0.6s' }} />
              <RoomLight cx={472} cy={100} r={28} on={isOn('master')} />
              <text x="472" y="190" textAnchor="middle" fill={isOn('master') ? '#FFD700' : '#444'} fontSize="11" fontWeight="700" fontFamily="sans-serif" style={{ transition: 'fill 0.6s' }}>Master Bedroom</text>
            </g>

            {/* ═══ PARKING (bottom-left) ═══ */}
            <g data-room="parking">
              <rect x="10" y="186" width="210" height="140" rx="2" fill={isOn('parking') ? '#141210' : floorDark} stroke={wallColor} strokeWidth="3" style={{ transition: 'fill 0.6s' }} />
              {isOn('parking') && <rect x="10" y="186" width="210" height="140" rx="2" fill="url(#lightGlow)" />}
              {/* Concrete floor */}
              <rect x="12" y="188" width="206" height="136" rx="1" fill={isOn('parking') ? '#1a1815' : '#0e0e0e'} style={{ transition: 'fill 0.6s' }} />
              {/* Car body */}
              <rect x="50" y="210" width="120" height="60" rx="12" fill={isOn('parking') ? '#333' : '#191919'} stroke={isOn('parking') ? '#444' : '#222'} strokeWidth="1.5" style={{ transition: 'all 0.6s' }} />
              {/* Windshield */}
              <rect x="55" y="215" width="45" height="25" rx="6" fill={isOn('parking') ? '#4a5568' : '#1a1a1a'} style={{ transition: 'fill 0.6s' }} />
              {/* Car roof */}
              <rect x="70" y="222" width="70" height="38" rx="8" fill={isOn('parking') ? '#3a3a3a' : '#1c1c1c'} style={{ transition: 'fill 0.6s' }} />
              {/* Wheels */}
              <circle cx="75" cy="275" r="8" fill={isOn('parking') ? '#222' : '#111'} stroke={isOn('parking') ? '#333' : '#1a1a1a'} strokeWidth="2" style={{ transition: 'all 0.6s' }} />
              <circle cx="145" cy="275" r="8" fill={isOn('parking') ? '#222' : '#111'} stroke={isOn('parking') ? '#333' : '#1a1a1a'} strokeWidth="2" style={{ transition: 'all 0.6s' }} />
              {/* Bike */}
              <circle cx="190" cy="295" r="7" fill="none" stroke={isOn('parking') ? '#c0392b' : '#222'} strokeWidth="1.5" style={{ transition: 'stroke 0.6s' }} />
              <circle cx="175" cy="295" r="7" fill="none" stroke={isOn('parking') ? '#c0392b' : '#222'} strokeWidth="1.5" style={{ transition: 'stroke 0.6s' }} />
              <RoomLight cx={115} cy={240} r={25} on={isOn('parking')} />
              <text x="115" y="318" textAnchor="middle" fill={isOn('parking') ? '#FFD700' : '#444'} fontSize="11" fontWeight="700" fontFamily="sans-serif" style={{ transition: 'fill 0.6s' }}>Parking</text>
            </g>

            {/* ═══ STAIRS (center) ═══ */}
            <g data-room="stairs">
              <rect x="226" y="186" width="70" height="90" rx="2" fill={isOn('stairs') ? floorLit : floorDark} stroke={wallColor} strokeWidth="3" style={{ transition: 'fill 0.6s' }} />
              {isOn('stairs') && <rect x="226" y="186" width="70" height="90" rx="2" fill="url(#lightGlow)" />}
              {/* Stair treads */}
              {[0, 1, 2, 3, 4, 5, 6].map(i => (
                <rect key={i} x="232" y={192 + i * 11} width="58" height="9" rx="1" fill={isOn('stairs') ? '#2a2418' : '#141414'} stroke={isOn('stairs') ? '#3d3520' : '#1a1a1a'} strokeWidth="0.5" style={{ transition: 'all 0.6s' }} />
              ))}
              {/* Railing */}
              <line x1="232" y1="192" x2="232" y2="270" stroke={isOn('stairs') ? '#554a30' : '#222'} strokeWidth="2" style={{ transition: 'stroke 0.6s' }} />
              <RoomLight cx={261} cy={230} r={12} on={isOn('stairs')} />
              <text x="261" y="268" textAnchor="middle" fill={isOn('stairs') ? '#FFD700' : '#444'} fontSize="8" fontWeight="700" fontFamily="sans-serif" style={{ transition: 'fill 0.6s' }}>Stairs</text>
            </g>

            {/* ═══ MASTER BATH (center-right) ═══ */}
            <g data-room="masterbath">
              <rect x="302" y="186" width="64" height="90" rx="2" fill={isOn('masterbath') ? floorLit : floorDark} stroke={wallColor} strokeWidth="3" style={{ transition: 'fill 0.6s' }} />
              {isOn('masterbath') && <rect x="302" y="186" width="64" height="90" rx="2" fill="url(#lightGlow)" />}
              <rect x="304" y="188" width="60" height="86" rx="1" fill="url(#tileFloor)" opacity={isOn('masterbath') ? 0.4 : 0.15} style={{ transition: 'opacity 0.6s' }} />
              {/* Bathtub */}
              <rect x="308" y="195" width="50" height="25" rx="8" fill="none" stroke={isOn('masterbath') ? '#555' : '#222'} strokeWidth="1.5" style={{ transition: 'stroke 0.6s' }} />
              {/* Toilet */}
              <ellipse cx="320" cy="245" rx="8" ry="10" fill={isOn('masterbath') ? '#333' : '#181818'} stroke={isOn('masterbath') ? '#444' : '#222'} strokeWidth="1" style={{ transition: 'all 0.6s' }} />
              {/* Sink */}
              <rect x="345" y="240" width="14" height="10" rx="4" fill="none" stroke={isOn('masterbath') ? '#555' : '#222'} strokeWidth="1" style={{ transition: 'stroke 0.6s' }} />
              <RoomLight cx={334} cy={225} r={12} on={isOn('masterbath')} />
              <text x="334" y="268" textAnchor="middle" fill={isOn('masterbath') ? '#FFD700' : '#444'} fontSize="7" fontWeight="700" fontFamily="sans-serif" style={{ transition: 'fill 0.6s' }}>Master Bath</text>
            </g>

            {/* ═══ SMALL BEDROOM (right-middle) ═══ */}
            <g data-room="bedroom2">
              <rect x="372" y="211" width="200" height="130" rx="2" fill={isOn('bedroom2') ? floorLit : floorDark} stroke={wallColor} strokeWidth="3" style={{ transition: 'fill 0.6s' }} />
              {isOn('bedroom2') && <rect x="372" y="211" width="200" height="130" rx="2" fill="url(#lightGlow)" />}
              <rect x="374" y="213" width="196" height="126" rx="1" fill="url(#woodFloor)" opacity={isOn('bedroom2') ? 0.4 : 0.15} style={{ transition: 'opacity 0.6s' }} />
              {/* Bed */}
              <rect x="410" y="235" width="80" height="55" rx="5" fill={isOn('bedroom2') ? '#3d3520' : '#1a1a1a'} stroke={isOn('bedroom2') ? '#554a30' : '#222'} strokeWidth="1.5" style={{ transition: 'all 0.6s' }} />
              {/* Pillow */}
              <rect x="420" y="240" width="25" height="14" rx="5" fill={isOn('bedroom2') ? '#4a4030' : '#1e1e1e'} style={{ transition: 'fill 0.6s' }} />
              <rect x="455" y="240" width="25" height="14" rx="5" fill={isOn('bedroom2') ? '#4a4030' : '#1e1e1e'} style={{ transition: 'fill 0.6s' }} />
              {/* Desk */}
              <rect x="520" y="240" width="40" height="20" rx="3" fill={isOn('bedroom2') ? '#2a2418' : '#151515'} stroke={isOn('bedroom2') ? '#3d3520' : '#1e1e1e'} strokeWidth="1" style={{ transition: 'all 0.6s' }} />
              {/* Chair */}
              <circle cx="540" cy="270" r="7" fill={isOn('bedroom2') ? '#2a2418' : '#141414'} style={{ transition: 'fill 0.6s' }} />
              <RoomLight cx={472} cy={270} r={22} on={isOn('bedroom2')} />
              <text x="472" y="333" textAnchor="middle" fill={isOn('bedroom2') ? '#FFD700' : '#444'} fontSize="11" fontWeight="700" fontFamily="sans-serif" style={{ transition: 'fill 0.6s' }}>Small Bedroom</text>
            </g>

            {/* ═══ HANGING LIGHTS (center-bottom) ═══ */}
            <g data-room="hanging">
              <rect x="226" y="282" width="140" height="60" rx="2" fill={isOn('hanging') ? floorLit : floorDark} stroke={wallColor} strokeWidth="3" style={{ transition: 'fill 0.6s' }} />
              {isOn('hanging') && <rect x="226" y="282" width="140" height="60" rx="2" fill="url(#lightGlow)" />}
              {/* Hanging pendants */}
              {[260, 296, 332].map((cx, i) => (
                <g key={i}>
                  <line x1={cx} y1="285" x2={cx} y2="300" stroke={isOn('hanging') ? '#FFD700' : '#333'} strokeWidth="0.8" style={{ transition: 'stroke 0.6s' }} />
                  <circle cx={cx} cy={303} r="5" fill={isOn('hanging') ? '#FFB84D' : '#1a1a1a'} stroke={isOn('hanging') ? '#FFD700' : '#333'} strokeWidth="1" style={{ transition: 'all 0.6s' }} />
                  {isOn('hanging') && <circle cx={cx} cy={303} r="12" fill="#FFA500" opacity="0.15" />}
                </g>
              ))}
              <RoomLight cx={296} cy={312} r={18} on={isOn('hanging')} />
              <text x="296" y="335" textAnchor="middle" fill={isOn('hanging') ? '#FFD700' : '#444'} fontSize="8" fontWeight="700" fontFamily="sans-serif" style={{ transition: 'fill 0.6s' }}>Hanging Lights</text>
            </g>

            {/* ═══ GUEST BATH (bottom-left) ═══ */}
            <g data-room="guestbath">
              <rect x="10" y="332" width="210" height="80" rx="2" fill={isOn('guestbath') ? floorLit : floorDark} stroke={wallColor} strokeWidth="3" style={{ transition: 'fill 0.6s' }} />
              {isOn('guestbath') && <rect x="10" y="332" width="210" height="80" rx="2" fill="url(#lightGlow)" />}
              <rect x="12" y="334" width="206" height="76" rx="1" fill="url(#tileFloor)" opacity={isOn('guestbath') ? 0.4 : 0.15} style={{ transition: 'opacity 0.6s' }} />
              {/* Shower area */}
              <rect x="20" y="342" width="40" height="40" rx="4" fill="none" stroke={isOn('guestbath') ? '#555' : '#222'} strokeWidth="1" strokeDasharray="3,3" style={{ transition: 'stroke 0.6s' }} />
              {/* Toilet */}
              <ellipse cx="90" cy="365" rx="8" ry="10" fill={isOn('guestbath') ? '#333' : '#181818'} stroke={isOn('guestbath') ? '#444' : '#222'} strokeWidth="1" style={{ transition: 'all 0.6s' }} />
              {/* Vanity */}
              <rect x="130" y="345" width="60" height="12" rx="2" fill={isOn('guestbath') ? '#2a2418' : '#151515'} stroke={isOn('guestbath') ? '#3d3520' : '#1e1e1e'} strokeWidth="1" style={{ transition: 'all 0.6s' }} />
              {/* Mirror */}
              <rect x="140" y="338" width="40" height="5" rx="1" fill={isOn('guestbath') ? '#4a5568' : '#1a1a1a'} style={{ transition: 'fill 0.6s' }} />
              <RoomLight cx={115} cy={370} r={18} on={isOn('guestbath')} />
              <text x="115" y="403" textAnchor="middle" fill={isOn('guestbath') ? '#FFD700' : '#444'} fontSize="11" fontWeight="700" fontFamily="sans-serif" style={{ transition: 'fill 0.6s' }}>Guest Bath</text>
            </g>

            {/* ═══ BOTTOM-RIGHT AREA (Hanging continuation / corridor) ═══ */}
            <g>
              <rect x="372" y="347" width="200" height="65" rx="2" fill="#080808" stroke={wallColor} strokeWidth="3" />
              <text x="472" y="385" textAnchor="middle" fill="#333" fontSize="9" fontWeight="600" fontFamily="sans-serif">Balcony / Terrace</text>
            </g>

            {/* ═══ DOOR OPENINGS ═══ */}
            <rect x="185" y="75" width="45" height="5" fill="#080808" /> {/* Hall to Kitchen */}
            <rect x="366" y="80" width="5" height="45" fill="#080808" /> {/* Kitchen to Master */}
            <rect x="185" y="220" width="45" height="5" fill="#080808" /> {/* Parking to Stairs */}
            <rect x="460" y="202" width="40" height="5" fill="#080808" /> {/* Master to Small Bedroom */}
            <rect x="100" y="178" width="5" height="15" fill="#080808" /> {/* Hall to Parking */}
            <rect x="226" y="340" width="5" height="30" fill="#080808" /> {/* Guest Bath to Hanging */}

            {/* ═══ LIVE FLOORPLAN BADGE ═══ */}
            <rect x="372" y="355" width="200" height="0" rx="0" fill="none" />
          </svg>

          {/* LIVE FLOORPLAN badge overlay */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-black/70 border border-white/10 backdrop-blur-sm">
            <span className="text-[10px] font-semibold tracking-[3px] text-neutral-400 uppercase">Live Floorplan</span>
          </div>
        </div>
      </div>
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
