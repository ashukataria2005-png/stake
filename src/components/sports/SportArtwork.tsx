"use client";

import React from "react";

interface SportArtworkProps {
  sportId: string;
  className?: string;
}

export default function SportArtwork({
  sportId,
  className = "w-full h-full",
}: SportArtworkProps) {
  const id = (sportId || "").toLowerCase().trim();

  // Common stadium light and background gradient definitions
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {renderArtwork(id)}
    </div>
  );
}

function renderArtwork(id: string) {
  switch (id) {
    // 1. SOCCER
    case "soccer":
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="socBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#081e36" />
              <stop offset="50%" stopColor="#0f3156" />
              <stop offset="100%" stopColor="#061324" />
            </linearGradient>
            <radialGradient id="socLight" cx="60%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="socBallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>
          <rect width="300" height="400" fill="url(#socBg)" />
          <circle cx="180" cy="120" r="160" fill="url(#socLight)" />
          {/* Stadium Light Beams */}
          <path d="M0 0L140 240L100 240Z" fill="#38bdf8" fillOpacity="0.08" />
          <path d="M300 0L170 260L210 260Z" fill="#38bdf8" fillOpacity="0.08" />
          {/* Dynamic Speed Lines */}
          <path d="M40 280Q140 200 230 160" stroke="#38bdf8" strokeWidth="2.5" strokeOpacity="0.4" strokeDasharray="6 4" />
          <path d="M20 220Q120 180 200 130" stroke="#00e701" strokeWidth="2" strokeOpacity="0.3" />
          {/* Soccer Striker Silhouette in Mid-Air Volley Kick */}
          <g transform="translate(45, 60)" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.6))">
            {/* Player Body & Torso */}
            <path d="M110 90L95 140L75 145L70 120L95 80Z" fill="#1e40af" />
            {/* Head & Neck */}
            <circle cx="115" cy="65" r="14" fill="#3b82f6" />
            {/* Kicking Leg outstretched high */}
            <path d="M95 140L145 125L175 105L165 95L135 118L85 130Z" fill="#60a5fa" />
            <polygon points="175,105 188,102 182,92 168,96" fill="#f8fafc" />
            {/* Supporting Leg */}
            <path d="M75 145L60 185L70 215L82 210L72 185L85 150Z" fill="#1d4ed8" />
            <polygon points="70,215 78,225 88,220 82,210" fill="#f8fafc" />
            {/* Arms balanced for volley */}
            <path d="M98 85L60 70L40 90L50 96L68 80L90 95Z" fill="#93c5fd" />
            <path d="M115 90L145 75L150 90L125 100Z" fill="#93c5fd" />
          </g>
          {/* Soccer Ball with Motion Glow */}
          <g transform="translate(205, 120)">
            <circle cx="28" cy="28" r="28" fill="url(#socBallGrad)" filter="drop-shadow(0 0 14px rgba(56,189,248,0.7))" />
            {/* Classic Pentagon pattern */}
            <polygon points="28,16 38,23 34,35 22,35 18,23" fill="#0f172a" />
            <polygon points="28,6 36,12 32,15 24,15 20,12" fill="#0f172a" />
            <polygon points="46,24 54,30 50,38 42,35 40,28" fill="#0f172a" />
            <polygon points="10,24 16,28 14,35 6,38 2,30" fill="#0f172a" />
            <line x1="28" y1="16" x2="28" y2="6" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="38" y1="23" x2="46" y2="24" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="18" y1="23" x2="10" y2="24" stroke="#0f172a" strokeWidth="1.5" />
          </g>
        </svg>
      );

    // 2. TENNIS
    case "tennis":
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="tenBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0a233a" />
              <stop offset="50%" stopColor="#10365c" />
              <stop offset="100%" stopColor="#07192b" />
            </linearGradient>
            <radialGradient id="tenLight" cx="40%" cy="30%" r="55%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="400" fill="url(#tenBg)" />
          <circle cx="120" cy="120" r="140" fill="url(#tenLight)" />
          {/* Court lines perspective */}
          <path d="M20 380L110 240L190 240L280 380" stroke="#22d3ee" strokeWidth="1.5" strokeOpacity="0.2" />
          <line x1="110" y1="240" x2="190" y2="240" stroke="#22d3ee" strokeWidth="2" strokeOpacity="0.3" />
          {/* Tennis Player Lunging with Racket */}
          <g transform="translate(60, 75)" filter="drop-shadow(0 6px 14px rgba(0,0,0,0.6))">
            {/* Body */}
            <circle cx="95" cy="55" r="14" fill="#67e8f9" />
            <path d="M85 75L110 70L118 120L85 125Z" fill="#0891b2" />
            {/* Left Arm extended */}
            <path d="M85 80L55 90L40 105L48 112L65 98L85 88Z" fill="#a5f3fc" />
            {/* Right Arm swinging racket */}
            <path d="M110 75L145 65L170 50L178 58L150 78L115 88Z" fill="#a5f3fc" />
            {/* Tennis Racket */}
            <ellipse cx="195" cy="38" rx="22" ry="32" transform="rotate(35 195 38)" stroke="#22d3ee" strokeWidth="3" fill="#083344" fillOpacity="0.3" />
            <line x1="174" y1="54" x2="183" y2="44" stroke="#22d3ee" strokeWidth="4" />
            <path d="M185 20L205 56M192 14L212 50M178 30L216 42M174 44L212 56" stroke="#67e8f9" strokeWidth="1" strokeOpacity="0.6" />
            {/* Lunging Legs */}
            <path d="M88 125L60 170L40 190L30 185L50 160L82 125Z" fill="#0e7490" />
            <polygon points="40,190 28,198 22,188 32,183" fill="#f8fafc" />
            <path d="M115 120L145 160L165 205L155 210L135 168L108 125Z" fill="#155e75" />
            <polygon points="165,205 175,215 168,222 155,210" fill="#f8fafc" />
          </g>
          {/* Glowing Tennis Ball */}
          <g transform="translate(225, 95)">
            <circle cx="16" cy="16" r="14" fill="#a3e635" filter="drop-shadow(0 0 10px #a3e635)" />
            <path d="M6 10Q16 16 26 10" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />
            <path d="M6 22Q16 16 26 22" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />
          </g>
        </svg>
      );

    // 3. AMERICAN FOOTBALL
    case "american-football":
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="amfBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#091f38" />
              <stop offset="50%" stopColor="#122e50" />
              <stop offset="100%" stopColor="#071728" />
            </linearGradient>
            <radialGradient id="amfGlow" cx="60%" cy="35%" r="55%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="400" fill="url(#amfBg)" />
          <circle cx="180" cy="140" r="140" fill="url(#amfGlow)" />
          {/* Yard Markers & Stadium Lights */}
          <line x1="20" y1="280" x2="280" y2="280" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.15" />
          <line x1="40" y1="320" x2="260" y2="320" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.1" />
          {/* Quarterback Silhouette Throwing */}
          <g transform="translate(65, 70)" filter="drop-shadow(0 6px 16px rgba(0,0,0,0.6))">
            {/* Helmet & Visor */}
            <circle cx="85" cy="50" r="17" fill="#f59e0b" />
            <path d="M88 48L104 52L98 62L85 58Z" fill="#1e293b" />
            <rect x="92" y="52" width="10" height="3" fill="#38bdf8" />
            {/* Shoulder Pads & Jersey */}
            <polygon points="50,70 120,68 115,125 58,125" fill="#d97706" />
            <text x="82" y="105" fill="#ffffff" fontSize="18" fontWeight="900" textAnchor="middle">12</text>
            {/* Throwing Arm Cocked Back */}
            <path d="M115 70L145 60L160 38L150 32L132 50L112 68Z" fill="#fde68a" />
            {/* Legs in Stance */}
            <path d="M65 125L50 175L35 210L48 212L68 180L80 125Z" fill="#1e293b" />
            <polygon points="35,210 22,218 30,222 48,212" fill="#ffffff" />
            <path d="M105 125L120 170L145 205L132 210L110 172L95 125Z" fill="#334155" />
            <polygon points="145,205 156,215 146,220 132,210" fill="#ffffff" />
          </g>
          {/* Football Spiral in Hand / Launching */}
          <g transform="translate(205, 95) rotate(-28)">
            <ellipse cx="26" cy="16" rx="26" ry="16" fill="#78350f" filter="drop-shadow(0 0 8px rgba(251,191,36,0.6))" />
            <path d="M12 0L12 32M40 0L40 32" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="20" y1="16" x2="32" y2="16" stroke="#ffffff" strokeWidth="2" />
            <line x1="23" y1="12" x2="23" y2="20" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="26" y1="12" x2="26" y2="20" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="29" y1="12" x2="29" y2="20" stroke="#ffffff" strokeWidth="1.5" />
          </g>
        </svg>
      );

    // 4. BASEBALL
    case "baseball":
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bbBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#08223d" />
              <stop offset="50%" stopColor="#0f2e4f" />
              <stop offset="100%" stopColor="#061829" />
            </linearGradient>
            <radialGradient id="bbGlow" cx="45%" cy="35%" r="55%">
              <stop offset="0%" stopColor="#f87171" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="400" fill="url(#bbBg)" />
          <circle cx="140" cy="130" r="140" fill="url(#bbGlow)" />
          {/* Batter Swinging Bat Silhouette */}
          <g transform="translate(60, 65)" filter="drop-shadow(0 6px 14px rgba(0,0,0,0.6))">
            {/* Helmet */}
            <circle cx="95" cy="50" r="15" fill="#ef4444" />
            <polygon points="95,48 116,52 105,58" fill="#ef4444" />
            {/* Jersey & Pants */}
            <polygon points="75,68 115,68 110,125 78,125" fill="#ffffff" />
            {/* Arms twisting through swing */}
            <path d="M110 75L135 70L155 60L148 52L125 65L95 72Z" fill="#fca5a5" />
            {/* Bat Arcing */}
            <polygon points="148,52 205,18 212,25 155,60" fill="#f59e0b" filter="drop-shadow(0 0 6px #f59e0b)" />
            {/* Legs coiled */}
            <path d="M80 125L60 170L50 215L62 215L78 175L92 125Z" fill="#e2e8f0" />
            <path d="M105 125L120 170L140 212L128 215L108 175L98 125Z" fill="#cbd5e1" />
          </g>
          {/* High-Velocity Baseball with Red Seams */}
          <g transform="translate(210, 110)">
            <circle cx="22" cy="22" r="18" fill="#ffffff" filter="drop-shadow(0 0 12px rgba(248,113,113,0.8))" />
            <path d="M12 8C16 14 16 30 12 36" stroke="#ef4444" strokeWidth="1.8" strokeDasharray="2 2" fill="none" />
            <path d="M32 8C28 14 28 30 32 36" stroke="#ef4444" strokeWidth="1.8" strokeDasharray="2 2" fill="none" />
          </g>
        </svg>
      );

    // 5. ICE HOCKEY
    case "ice-hockey":
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="hkBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#082542" />
              <stop offset="50%" stopColor="#11385f" />
              <stop offset="100%" stopColor="#07192d" />
            </linearGradient>
            <radialGradient id="hkGlow" cx="50%" cy="30%" r="55%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="400" fill="url(#hkBg)" />
          <circle cx="150" cy="120" r="140" fill="url(#hkGlow)" />
          {/* Ice Shards & Skating Rink lines */}
          <path d="M30 320L120 280L240 330" stroke="#bae6fd" strokeWidth="2" strokeOpacity="0.25" />
          <polygon points="50,290 80,270 70,300" fill="#38bdf8" fillOpacity="0.2" />
          <polygon points="180,310 220,285 200,320" fill="#38bdf8" fillOpacity="0.2" />
          {/* Hockey Skater Silhouette */}
          <g transform="translate(60, 65)" filter="drop-shadow(0 6px 14px rgba(0,0,0,0.6))">
            {/* Helmet & Cage */}
            <circle cx="90" cy="48" r="15" fill="#0284c7" />
            <rect x="94" y="48" width="9" height="10" fill="#0c4a6e" />
            {/* Jersey */}
            <polygon points="65,65 120,65 110,120 70,120" fill="#0369a1" />
            {/* Arms holding stick */}
            <path d="M70 75L50 98L60 110L80 88Z" fill="#7dd3fc" />
            <path d="M110 75L130 105L120 115L100 88Z" fill="#7dd3fc" />
            {/* Hockey Stick */}
            <path d="M40 90L145 195L185 205L185 198L150 190L48 85Z" fill="#f8fafc" />
            {/* Skates carving ice */}
            <path d="M75 120L45 165L20 185L28 192L60 170L85 120Z" fill="#0f172a" />
            <line x1="16" y1="192" x2="35" y2="192" stroke="#e0f2fe" strokeWidth="3" />
            <path d="M105 120L125 160L155 180L150 188L118 168L95 120Z" fill="#1e293b" />
            <line x1="145" y1="188" x2="162" y2="188" stroke="#e0f2fe" strokeWidth="3" />
          </g>
          {/* Speed Puck with Ice Spray */}
          <g transform="translate(225, 255)">
            <ellipse cx="18" cy="12" rx="16" ry="7" fill="#000000" stroke="#38bdf8" strokeWidth="1" filter="drop-shadow(0 0 8px #38bdf8)" />
          </g>
        </svg>
      );

    // 6. BASKETBALL
    case "basketball":
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bkbBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0c223c" />
              <stop offset="50%" stopColor="#163354" />
              <stop offset="100%" stopColor="#091726" />
            </linearGradient>
            <radialGradient id="bkbGlow" cx="65%" cy="25%" r="55%">
              <stop offset="0%" stopColor="#fb923c" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="400" fill="url(#bkbBg)" />
          <circle cx="190" cy="110" r="140" fill="url(#bkbGlow)" />
          {/* Basketball Rim & Net in Background */}
          <path d="M195 50L245 50" stroke="#f97316" strokeWidth="4" />
          <path d="M200 52L210 90L230 90L240 52" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
          <path d="M205 52L235 90M235 52L205 90" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.4" />
          {/* Dunker Soaring Silhouette */}
          <g transform="translate(60, 45)" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.6))">
            {/* Head */}
            <circle cx="85" cy="60" r="14" fill="#ea580c" />
            {/* Torso & Jersey */}
            <polygon points="68,78 105,75 100,135 72,135" fill="#f97316" />
            {/* Slamming Arm stretched high */}
            <path d="M102 75L125 45L145 20L155 25L135 55L108 82Z" fill="#fed7aa" />
            {/* Trailing Arm */}
            <path d="M70 82L45 95L38 112L46 118L60 102L75 90Z" fill="#fed7aa" />
            {/* Legs splayed mid-air */}
            <path d="M75 135L55 175L40 215L50 220L72 178L88 135Z" fill="#1e293b" />
            <polygon points="40,215 32,225 42,228 50,220" fill="#ffffff" />
            <path d="M98 135L115 170L135 210L125 218L102 175L88 135Z" fill="#334155" />
            <polygon points="135,210 145,220 138,228 125,218" fill="#ffffff" />
          </g>
          {/* Basketball at the apex */}
          <g transform="translate(200, 55)">
            <circle cx="24" cy="24" r="22" fill="#ea580c" filter="drop-shadow(0 0 12px #f97316)" />
            <line x1="2" y1="24" x2="46" y2="24" stroke="#000000" strokeWidth="1.8" />
            <line x1="24" y1="2" x2="24" y2="46" stroke="#000000" strokeWidth="1.8" />
            <path d="M8 8Q24 24 8 40" stroke="#000000" strokeWidth="1.5" fill="none" />
            <path d="M40 8Q24 24 40 40" stroke="#000000" strokeWidth="1.5" fill="none" />
          </g>
        </svg>
      );

    // 7. CRICKET
    case "cricket":
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="crkBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#07243c" />
              <stop offset="50%" stopColor="#0e3658" />
              <stop offset="100%" stopColor="#071a2b" />
            </linearGradient>
            <radialGradient id="crkGlow" cx="45%" cy="30%" r="55%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="400" fill="url(#crkBg)" />
          <circle cx="130" cy="120" r="140" fill="url(#crkGlow)" />
          {/* Wickets in distance */}
          <line x1="240" y1="230" x2="240" y2="270" stroke="#f59e0b" strokeWidth="2.5" />
          <line x1="248" y1="230" x2="248" y2="270" stroke="#f59e0b" strokeWidth="2.5" />
          <line x1="256" y1="230" x2="256" y2="270" stroke="#f59e0b" strokeWidth="2.5" />
          <line x1="238" y1="230" x2="258" y2="230" stroke="#f59e0b" strokeWidth="2" />
          {/* Batsman Driving Shot */}
          <g transform="translate(60, 65)" filter="drop-shadow(0 6px 14px rgba(0,0,0,0.6))">
            {/* Helmet & Visor */}
            <circle cx="85" cy="50" r="15" fill="#059669" />
            <rect x="88" y="52" width="10" height="8" fill="#10b981" fillOpacity="0.7" />
            {/* Jersey */}
            <polygon points="65,68 108,68 102,125 72,125" fill="#ffffff" />
            {/* Arms driving bat */}
            <path d="M75 75L105 85L125 95L118 105L95 95L70 82Z" fill="#a7f3d0" />
            {/* Cricket Bat */}
            <polygon points="125,95 165,135 155,145 115,105" fill="#d97706" />
            <polygon points="115,105 125,95 118,88 108,98" fill="#78350f" />
            {/* Pads & Stance */}
            <path d="M72 125L55 170L50 215L65 215L78 175L85 125Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
            <path d="M98 125L115 168L130 210L118 215L102 172L90 125Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
          </g>
          {/* Red Cricket Ball with White Seam */}
          <g transform="translate(205, 125)">
            <circle cx="18" cy="18" r="16" fill="#dc2626" filter="drop-shadow(0 0 10px rgba(239,68,68,0.8))" />
            <line x1="4" y1="18" x2="32" y2="18" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 2" />
          </g>
        </svg>
      );

    // 8. HORSE RACING
    case "horse-racing":
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="hrBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0b213a" />
              <stop offset="50%" stopColor="#143254" />
              <stop offset="100%" stopColor="#081829" />
            </linearGradient>
            <radialGradient id="hrGlow" cx="50%" cy="35%" r="55%">
              <stop offset="0%" stopColor="#facc15" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="400" fill="url(#hrBg)" />
          <circle cx="150" cy="140" r="140" fill="url(#hrGlow)" />
          {/* Galloping Thoroughbred & Jockey Silhouette */}
          <g transform="translate(35, 90)" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.6))">
            {/* Jockey crouched in silks */}
            <circle cx="115" cy="20" r="11" fill="#facc15" />
            <path d="M105 32L135 30L140 55L110 58Z" fill="#eab308" />
            <path d="M125 35L150 48L142 54L120 42Z" fill="#fef08a" />
            {/* Horse Torso */}
            <path d="M70 75Q130 65 175 75Q190 95 185 115Q130 115 65 105Z" fill="#78350f" />
            {/* Horse Neck & Head arched */}
            <path d="M165 75L195 40L215 35L225 45L210 65L185 85Z" fill="#92400e" />
            <polygon points="192,38 198,28 202,36" fill="#78350f" />
            {/* Front Legs outstretched in sprint */}
            <path d="M180 100L215 145L235 150L215 135L195 95Z" fill="#78350f" />
            <path d="M175 105L195 150L210 165L195 155L180 115Z" fill="#92400e" />
            {/* Back Legs pushing off ground */}
            <path d="M75 100L45 135L30 170L38 175L60 140L85 105Z" fill="#78350f" />
            <path d="M65 95L35 125L15 155L22 160L48 130L75 100Z" fill="#92400e" />
            {/* Flowing Tail */}
            <path d="M68 85Q30 95 10 120Q30 105 65 95Z" fill="#451a03" />
          </g>
          {/* Turf Specks */}
          <circle cx="80" cy="275" r="3" fill="#84cc16" fillOpacity="0.4" />
          <circle cx="120" cy="285" r="2.5" fill="#84cc16" fillOpacity="0.5" />
          <circle cx="210" cy="265" r="3" fill="#84cc16" fillOpacity="0.4" />
        </svg>
      );

    // 9. CS2 (Counter-Strike 2)
    case "cs2":
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="csBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d233c" />
              <stop offset="50%" stopColor="#16375d" />
              <stop offset="100%" stopColor="#0a1b2d" />
            </linearGradient>
            <radialGradient id="csGlow" cx="50%" cy="35%" r="55%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="400" fill="url(#csBg)" />
          <circle cx="150" cy="130" r="140" fill="url(#csGlow)" />
          {/* Tactical Crosshair Watermark */}
          <circle cx="150" cy="130" r="60" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.25" />
          <line x1="90" y1="130" x2="210" y2="130" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.25" strokeDasharray="6 4" />
          <line x1="150" y1="70" x2="150" y2="190" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.25" strokeDasharray="6 4" />
          {/* Counter-Terrorist Operator Silhouette */}
          <g transform="translate(65, 60)" filter="drop-shadow(0 8px 18px rgba(0,0,0,0.7))">
            {/* Tactical Helmet with Goggles */}
            <path d="M75 40Q88 28 105 40L108 55L72 55Z" fill="#1e293b" />
            <rect x="76" y="44" width="28" height="7" rx="3" fill="#f97316" />
            <circle cx="84" cy="47" r="2" fill="#fed7aa" />
            <circle cx="96" cy="47" r="2" fill="#fed7aa" />
            {/* Heavy Plate Carrier & Rig */}
            <path d="M60 62L120 62L112 135L68 135Z" fill="#0f172a" />
            <rect x="75" y="75" width="30" height="25" fill="#334155" rx="3" />
            {/* Arms holding Assault Rifle */}
            <path d="M60 70L40 95L55 105L70 85Z" fill="#475569" />
            <path d="M115 70L135 90L150 95L145 105L120 95Z" fill="#475569" />
            {/* M4A4 / Rifle */}
            <polygon points="45,95 180,85 180,95 140,102 120,120 110,120 115,102 45,105" fill="#1e293b" />
            <rect x="175" y="87" width="12" height="4" fill="#f97316" filter="drop-shadow(0 0 6px #f97316)" />
            {/* Muzzle Flash sparks */}
            <polygon points="188,89 205,82 195,89 210,95 192,92" fill="#ffedd5" />
            {/* Legs */}
            <path d="M68 135L55 195L70 200L85 140Z" fill="#1e293b" />
            <path d="M112 135L125 195L110 200L95 140Z" fill="#0f172a" />
          </g>
        </svg>
      );

    // 10. DOTA 2
    case "dota-2":
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="dotaBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0b1f36" />
              <stop offset="50%" stopColor="#163152" />
              <stop offset="100%" stopColor="#09192b" />
            </linearGradient>
            <radialGradient id="dotaGlow" cx="50%" cy="30%" r="55%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="400" fill="url(#dotaBg)" />
          <circle cx="150" cy="120" r="140" fill="url(#dotaGlow)" />
          {/* Dota Logo Rune Silhouette */}
          <g transform="translate(110, 35)" opacity="0.35">
            <polygon points="40,10 70,35 60,65 20,40" fill="#ef4444" />
            <polygon points="10,25 25,60 15,75" fill="#ef4444" />
            <polygon points="55,15 75,10 70,25" fill="#ef4444" />
          </g>
          {/* Juggernaut Hero Silhouette Wielding Katana */}
          <g transform="translate(60, 60)" filter="drop-shadow(0 8px 18px rgba(0,0,0,0.7))">
            {/* Mask with glowing slit */}
            <path d="M80 40L105 40L100 65L85 65Z" fill="#ffffff" />
            <line x1="85" y1="52" x2="100" y2="52" stroke="#ef4444" strokeWidth="2.5" />
            {/* Cloak & Armor */}
            <path d="M65 65L120 65L125 145L60 145Z" fill="#b91c1c" />
            {/* Dual Katana Blade radiating orange/red flame */}
            <path d="M120 75L195 20L190 15L110 68Z" fill="#fca5a5" filter="drop-shadow(0 0 10px #ef4444)" />
            <polygon points="195,20 205,12 198,10 190,15" fill="#ffffff" />
            {/* Hero stance */}
            <path d="M70 145L55 210L72 215L88 150Z" fill="#7f1d1d" />
            <path d="M115 145L135 210L118 215L100 150Z" fill="#450a0a" />
          </g>
        </svg>
      );

    // 11. MMA / UFC
    case "mma":
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="mmaBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0a1e35" />
              <stop offset="50%" stopColor="#122e4e" />
              <stop offset="100%" stopColor="#081628" />
            </linearGradient>
            <radialGradient id="mmaGlow" cx="50%" cy="35%" r="55%">
              <stop offset="0%" stopColor="#f87171" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="400" fill="url(#mmaBg)" />
          <circle cx="150" cy="130" r="140" fill="url(#mmaGlow)" />
          {/* Octagon Wire Mesh Pattern */}
          <path d="M20 180L70 120L150 100L230 120L280 180" stroke="#f87171" strokeWidth="1.5" strokeOpacity="0.2" fill="none" />
          <path d="M20 260L70 320L150 340L230 320L280 260" stroke="#f87171" strokeWidth="1.5" strokeOpacity="0.2" fill="none" />
          {/* Cage Fighter Silhouette Throwing Overhand Right */}
          <g transform="translate(60, 65)" filter="drop-shadow(0 8px 18px rgba(0,0,0,0.7))">
            {/* Head */}
            <circle cx="95" cy="50" r="15" fill="#fca5a5" />
            {/* Muscular Torso */}
            <path d="M75 70L115 70L108 125L82 125Z" fill="#ef4444" />
            {/* Guarding Left Hand */}
            <path d="M75 75L50 65L45 80L70 88Z" fill="#fca5a5" />
            <circle cx="48" cy="72" r="7" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
            {/* Punching Right Hand (4oz Glove) */}
            <path d="M115 72L150 68L185 62L182 78L145 82Z" fill="#fca5a5" />
            <rect x="180" y="58" width="16" height="18" rx="4" fill="#1e293b" stroke="#ef4444" strokeWidth="2" filter="drop-shadow(0 0 8px #ef4444)" />
            {/* Fight Shorts */}
            <polygon points="80,125 110,125 118,155 72,155" fill="#0f172a" />
            {/* Legs coiled in cage stance */}
            <path d="M78 155L60 195L48 220L60 222L75 198L88 155Z" fill="#fca5a5" />
            <path d="M112 155L135 195L150 220L138 222L120 198L102 155Z" fill="#fca5a5" />
          </g>
        </svg>
      );

    // 12. FORMULA 1
    case "formula-1":
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="f1Bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#09223d" />
              <stop offset="50%" stopColor="#11355c" />
              <stop offset="100%" stopColor="#07192c" />
            </linearGradient>
            <radialGradient id="f1Glow" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#00e701" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00e701" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="400" fill="url(#f1Bg)" />
          <circle cx="150" cy="150" r="140" fill="url(#f1Glow)" />
          {/* High Speed Track Perspective & Curbs */}
          <polygon points="120,40 180,40 280,380 20,380" fill="#0f172a" fillOpacity="0.4" />
          <path d="M20 380L70 380L135 60L125 60Z" fill="#00e701" fillOpacity="0.3" />
          <path d="M280 380L230 380L165 60L175 60Z" fill="#00e701" fillOpacity="0.3" />
          {/* Stake F1 Car Front Nose & Cockpit */}
          <g transform="translate(45, 90)" filter="drop-shadow(0 10px 20px rgba(0,0,0,0.8))">
            {/* Front Halo & Driver Helmet */}
            <circle cx="105" cy="55" r="10" fill="#00e701" />
            <path d="M92 58Q105 48 118 58L105 75Z" fill="#0f172a" stroke="#00e701" strokeWidth="2" />
            {/* Sleek Monocoque Nose */}
            <polygon points="95,65 115,65 118,145 92,145" fill="#00e701" />
            {/* Sidepods & Aero Mirrors */}
            <polygon points="65,95 95,75 92,140 50,135" fill="#111827" />
            <polygon points="145,95 115,75 118,140 160,135" fill="#111827" />
            {/* Front Wing Assembly */}
            <rect x="25" y="145" width="160" height="12" rx="3" fill="#00e701" filter="drop-shadow(0 0 8px #00e701)" />
            <rect x="15" y="138" width="12" height="22" rx="2" fill="#111827" />
            <rect x="183" y="138" width="12" height="22" rx="2" fill="#111827" />
            {/* Front Wide Tires */}
            <rect x="10" y="70" width="30" height="58" rx="6" fill="#1f2937" stroke="#374151" strokeWidth="2" />
            <rect x="170" y="70" width="30" height="58" rx="6" fill="#1f2937" stroke="#374151" strokeWidth="2" />
          </g>
          {/* Ground Sparks */}
          <polygon points="135,270 145,260 148,272" fill="#fef08a" />
          <polygon points="155,270 168,262 165,275" fill="#fef08a" />
        </svg>
      );

    // 13. LEAGUE OF LEGENDS
    case "league-of-legends":
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lolBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#082542" />
              <stop offset="50%" stopColor="#0f3b64" />
              <stop offset="100%" stopColor="#081e36" />
            </linearGradient>
            <radialGradient id="lolGlow" cx="50%" cy="30%" r="55%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="400" fill="url(#lolBg)" />
          <circle cx="150" cy="120" r="140" fill="url(#lolGlow)" />
          {/* Arcane Sigil Ring */}
          <circle cx="150" cy="120" r="70" stroke="#22d3ee" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="8 6" />
          <polygon points="150,55 205,150 95,150" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.25" fill="none" />
          {/* Champion Silhouette with Arcane Staff */}
          <g transform="translate(65, 50)" filter="drop-shadow(0 8px 18px rgba(0,0,0,0.7))">
            {/* Hood & Glowing Eyes */}
            <path d="M78 35Q90 22 102 35L98 62L82 62Z" fill="#0891b2" />
            <circle cx="86" cy="45" r="2" fill="#a5f3fc" />
            <circle cx="94" cy="45" r="2" fill="#a5f3fc" />
            {/* Robes & Armor */}
            <path d="M68 65L112 65L120 155L60 155Z" fill="#0e7490" />
            {/* Celestial Staff */}
            <line x1="135" y1="10" x2="135" y2="200" stroke="#22d3ee" strokeWidth="4" />
            <circle cx="135" cy="15" r="15" fill="#0891b2" stroke="#67e8f9" strokeWidth="3" filter="drop-shadow(0 0 10px #22d3ee)" />
            <polygon points="135,5 142,15 135,25 128,15" fill="#ffffff" />
          </g>
        </svg>
      );

    // 14. VALORANT
    case "valorant":
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="valBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0a2038" />
              <stop offset="50%" stopColor="#153457" />
              <stop offset="100%" stopColor="#091829" />
            </linearGradient>
            <radialGradient id="valGlow" cx="50%" cy="30%" r="55%">
              <stop offset="0%" stopColor="#fb7185" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="400" fill="url(#valBg)" />
          <circle cx="150" cy="120" r="140" fill="url(#valGlow)" />
          {/* Valorant V Slash Emblem Background */}
          <polygon points="80,60 150,180 130,180 60,60" fill="#fb7185" fillOpacity="0.2" />
          <polygon points="220,60 170,180 190,180 240,60" fill="#fb7185" fillOpacity="0.2" />
          {/* Radiant Duelist Silhouette (Jett Style Kunai Daggers) */}
          <g transform="translate(60, 55)" filter="drop-shadow(0 8px 18px rgba(0,0,0,0.7))">
            {/* Head & Hair */}
            <circle cx="90" cy="45" r="14" fill="#ffffff" />
            <path d="M78 40Q88 20 105 38L95 55Z" fill="#e2e8f0" />
            {/* Tactical Vest */}
            <polygon points="70,60 110,60 102,125 78,125" fill="#f43f5e" />
            {/* Floating Kunai Knives */}
            <polygon points="135,35 155,20 148,45" fill="#38bdf8" filter="drop-shadow(0 0 8px #38bdf8)" />
            <polygon points="148,60 168,50 158,72" fill="#38bdf8" filter="drop-shadow(0 0 8px #38bdf8)" />
            <polygon points="45,45 25,32 35,55" fill="#38bdf8" filter="drop-shadow(0 0 8px #38bdf8)" />
            {/* Legs */}
            <path d="M78 125L60 185L75 190L88 135Z" fill="#1e293b" />
            <path d="M102 125L120 185L105 190L92 135Z" fill="#0f172a" />
          </g>
        </svg>
      );

    // 15. GOLF
    case "golf":
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="glfBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#07243c" />
              <stop offset="50%" stopColor="#0d3659" />
              <stop offset="100%" stopColor="#061b2e" />
            </linearGradient>
            <radialGradient id="glfGlow" cx="45%" cy="30%" r="55%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="400" fill="url(#glfBg)" />
          <circle cx="130" cy="120" r="140" fill="url(#glfGlow)" />
          {/* Flag & Green Pin in distance */}
          <line x1="230" y1="180" x2="230" y2="240" stroke="#f8fafc" strokeWidth="2" />
          <polygon points="230,180 255,190 230,200" fill="#ef4444" />
          {/* Golfer Follow-Through Silhouette */}
          <g transform="translate(60, 60)" filter="drop-shadow(0 6px 14px rgba(0,0,0,0.6))">
            {/* Visor & Head */}
            <circle cx="95" cy="45" r="14" fill="#6ee7b7" />
            <polygon points="95,40 115,44 105,48" fill="#10b981" />
            {/* Polo & Trousers */}
            <polygon points="75,62 115,62 108,120 82,120" fill="#ffffff" />
            {/* Arched Arms & Driver Club */}
            <path d="M105 70L80 50L60 30L52 38L75 60L95 75Z" fill="#a7f3d0" />
            <line x1="55" y1="35" x2="25" y2="15" stroke="#94a3b8" strokeWidth="3" />
            <ellipse cx="22" cy="13" rx="7" ry="4" fill="#64748b" transform="rotate(-30 22 13)" />
            {/* Legs */}
            <path d="M82 120L75 175L72 215L85 215L90 175L92 120Z" fill="#065f46" />
            <path d="M108 120L115 170L125 210L115 215L102 170L98 120Z" fill="#047857" />
          </g>
          {/* Dimpled White Golf Ball Ascending */}
          <g transform="translate(205, 90)">
            <circle cx="16" cy="16" r="12" fill="#ffffff" filter="drop-shadow(0 0 10px rgba(52,211,153,0.8))" />
            <circle cx="12" cy="14" r="1.5" fill="#cbd5e1" />
            <circle cx="18" cy="12" r="1.5" fill="#cbd5e1" />
            <circle cx="16" cy="18" r="1.5" fill="#cbd5e1" />
          </g>
        </svg>
      );

    // 16. FIFA
    case "fifa":
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="fifBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#08223c" />
              <stop offset="50%" stopColor="#10355d" />
              <stop offset="100%" stopColor="#081a2e" />
            </linearGradient>
            <radialGradient id="fifGlow" cx="50%" cy="35%" r="55%">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="400" fill="url(#fifBg)" />
          <circle cx="150" cy="130" r="140" fill="url(#fifGlow)" />
          {/* Digital Geometry Grid */}
          <polygon points="150,50 240,110 240,220 150,280 60,220 60,110" stroke="#2dd4bf" strokeWidth="1" strokeOpacity="0.25" fill="none" />
          {/* FIFA Player in Explosive Skill Move */}
          <g transform="translate(60, 65)" filter="drop-shadow(0 6px 16px rgba(0,0,0,0.6))">
            <circle cx="95" cy="50" r="14" fill="#5eead4" />
            <polygon points="75,68 115,68 108,125 82,125" fill="#0d9488" />
            <path d="M108 72L135 60L145 72L120 85Z" fill="#99f6e4" />
            {/* Kicking Leg */}
            <path d="M108 125L145 145L170 120L160 112L135 135L98 125Z" fill="#14b8a6" />
            {/* Standing Leg */}
            <path d="M82 125L65 175L55 210L68 212L80 178L92 125Z" fill="#0f766e" />
          </g>
          {/* Glowing Digital Ball */}
          <g transform="translate(205, 120)">
            <circle cx="22" cy="22" r="20" fill="#ffffff" filter="drop-shadow(0 0 12px #2dd4bf)" />
            <polygon points="22,12 30,18 26,28 18,28 14,18" fill="#0f766e" />
          </g>
        </svg>
      );

    // 17. NBA2K
    case "nba2k":
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="nbaBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0c223c" />
              <stop offset="50%" stopColor="#15355a" />
              <stop offset="100%" stopColor="#09182a" />
            </linearGradient>
            <radialGradient id="nbaGlow" cx="50%" cy="30%" r="55%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="400" fill="url(#nbaBg)" />
          <circle cx="150" cy="120" r="140" fill="url(#nbaGlow)" />
          {/* Cyber Hardwood Grid Lines */}
          <line x1="30" y1="280" x2="270" y2="280" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.3" />
          <line x1="50" y1="320" x2="250" y2="320" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.2" />
          {/* NBA Crossover Dribbler Silhouette */}
          <g transform="translate(60, 65)" filter="drop-shadow(0 6px 14px rgba(0,0,0,0.6))">
            <circle cx="95" cy="50" r="14" fill="#fde68a" />
            <polygon points="75,68 115,68 108,125 82,125" fill="#f59e0b" />
            {/* Low Crossover Stance */}
            <path d="M82 125L55 160L35 195L48 198L68 165L90 125Z" fill="#1e293b" />
            <path d="M108 125L135 160L155 195L142 198L122 165L100 125Z" fill="#334155" />
            {/* Dribbling Arm down to floor */}
            <path d="M80 75L60 95L50 125L60 130L72 102L90 82Z" fill="#fef3c7" />
          </g>
          {/* Orange Textured Basketball */}
          <g transform="translate(100, 195)">
            <circle cx="18" cy="18" r="16" fill="#f97316" filter="drop-shadow(0 0 10px #fbbf24)" />
            <line x1="2" y1="18" x2="34" y2="18" stroke="#1f2937" strokeWidth="1.5" />
            <line x1="18" y1="2" x2="18" y2="34" stroke="#1f2937" strokeWidth="1.5" />
          </g>
        </svg>
      );

    // 18. TABLE TENNIS
    case "table-tennis":
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ttBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0a223a" />
              <stop offset="50%" stopColor="#133558" />
              <stop offset="100%" stopColor="#081a2c" />
            </linearGradient>
            <radialGradient id="ttGlow" cx="50%" cy="35%" r="55%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="400" fill="url(#ttBg)" />
          <circle cx="150" cy="130" r="140" fill="url(#ttGlow)" />
          {/* Ping Pong Table & Net */}
          <polygon points="30,260 270,260 230,340 70,340" fill="#0284c7" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="150" y1="240" x2="150" y2="280" stroke="#ffffff" strokeWidth="3" />
          {/* Ping Pong Paddle Smashing */}
          <g transform="translate(110, 85)" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.6))">
            <circle cx="45" cy="45" r="35" fill="#ef4444" stroke="#000000" strokeWidth="3" />
            <rect x="38" y="78" width="14" height="40" rx="3" fill="#d97706" />
          </g>
          {/* Orange Ping Pong Ball with Motion Streak */}
          <g transform="translate(195, 125)">
            <circle cx="14" cy="14" r="12" fill="#f97316" filter="drop-shadow(0 0 10px #f97316)" />
          </g>
        </svg>
      );

    // 19. BADMINTON
    case "badminton":
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="badBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#082138" />
              <stop offset="50%" stopColor="#103356" />
              <stop offset="100%" stopColor="#08192a" />
            </linearGradient>
            <radialGradient id="badGlow" cx="45%" cy="30%" r="55%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="400" fill="url(#badBg)" />
          <circle cx="130" cy="120" r="140" fill="url(#badGlow)" />
          {/* Badminton Shuttler Leaping High */}
          <g transform="translate(60, 55)" filter="drop-shadow(0 6px 14px rgba(0,0,0,0.6))">
            <circle cx="85" cy="45" r="14" fill="#a5b4fc" />
            <polygon points="68,62 108,62 102,125 72,125" fill="#4f46e5" />
            {/* Racquet raised overhead */}
            <path d="M102 68L125 45L145 20L155 25L135 55L108 75Z" fill="#c7d2fe" />
            <ellipse cx="165" cy="12" rx="16" ry="24" transform="rotate(30 165 12)" stroke="#818cf8" strokeWidth="2.5" fill="none" />
            {/* Legs splayed mid-air */}
            <path d="M72 125L52 170L38 205L50 208L68 172L85 125Z" fill="#312e81" />
            <path d="M102 125L118 168L135 205L125 210L105 170L92 125Z" fill="#3730a3" />
          </g>
          {/* Feathered Shuttlecock */}
          <g transform="translate(205, 75) rotate(-35)">
            <path d="M10 20L20 5L30 20Z" fill="#ffffff" stroke="#c7d2fe" strokeWidth="1" filter="drop-shadow(0 0 8px #818cf8)" />
            <circle cx="20" cy="22" r="6" fill="#1e1b4b" />
          </g>
        </svg>
      );

    // 20. BOXING
    case "boxing":
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="boxBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d1d33" />
              <stop offset="50%" stopColor="#182c47" />
              <stop offset="100%" stopColor="#091524" />
            </linearGradient>
            <radialGradient id="boxGlow" cx="50%" cy="35%" r="55%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="300" height="400" fill="url(#boxBg)" />
          <circle cx="150" cy="130" r="140" fill="url(#boxGlow)" />
          {/* Ring Ropes Horizontal */}
          <line x1="0" y1="150" x2="300" y2="150" stroke="#ef4444" strokeWidth="2" strokeOpacity="0.3" />
          <line x1="0" y1="210" x2="300" y2="210" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.25" />
          <line x1="0" y1="270" x2="300" y2="270" stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.2" />
          {/* Heavyweight Boxer Silhouette Landing Right Hook */}
          <g transform="translate(60, 60)" filter="drop-shadow(0 8px 18px rgba(0,0,0,0.7))">
            {/* Shaved Head & Jaw */}
            <circle cx="95" cy="48" r="16" fill="#fca5a5" />
            {/* Powerful Torso */}
            <path d="M72 68L118 68L112 125L78 125Z" fill="#dc2626" />
            {/* Guarding Left Glove */}
            <circle cx="68" cy="65" r="14" fill="#b91c1c" stroke="#fca5a5" strokeWidth="2" />
            {/* Throwing Knockout Right Glove */}
            <path d="M118 72L150 68L180 62L178 80L145 82Z" fill="#fca5a5" />
            <ellipse cx="185" cy="70" rx="16" ry="14" fill="#b91c1c" stroke="#fca5a5" strokeWidth="2" filter="drop-shadow(0 0 10px #ef4444)" />
            {/* Trunks with Champion Belt */}
            <rect x="75" y="125" width="40" height="8" fill="#facc15" />
            <polygon points="75,133 115,133 120,165 70,165" fill="#0f172a" />
            {/* Boxer Stance Legs */}
            <path d="M75 165L60 205L48 230L60 232L78 208L88 165Z" fill="#fca5a5" />
            <path d="M115 165L135 205L150 230L138 232L120 208L102 165Z" fill="#fca5a5" />
          </g>
          {/* Impact Flash Stars */}
          <polygon points="245,120 255,108 250,122 262,125 248,128 252,140 242,128" fill="#fef08a" />
        </svg>
      );

    // Fallback default
    default:
      return (
        <svg viewBox="0 0 300 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="400" fill="#0f212e" />
          <circle cx="150" cy="150" r="80" fill="#213743" />
          <text x="150" y="160" fill="#b1bad3" fontSize="24" fontWeight="bold" textAnchor="middle">
            SPORTS
          </text>
        </svg>
      );
  }
}
