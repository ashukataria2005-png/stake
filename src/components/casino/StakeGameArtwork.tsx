import React from "react";

interface StakeGameArtworkProps {
  gameId: string;
  className?: string;
}

export default function StakeGameArtwork({
  gameId,
  className = "w-full h-full",
}: StakeGameArtworkProps) {
  switch (gameId) {
    // ==========================================
    // 31 STAKE ORIGINALS
    // ==========================================

    case "dice":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="diceGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="diceRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff4d4d" />
              <stop offset="50%" stopColor="#e9113c" />
              <stop offset="100%" stopColor="#99001f" />
            </linearGradient>
            <linearGradient id="diceTop" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff6b6b" />
              <stop offset="100%" stopColor="#ff8787" />
            </linearGradient>
            <linearGradient id="diceRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c90c33" />
              <stop offset="100%" stopColor="#7a0015" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#diceGlow)" />
          {/* Shadow */}
          <ellipse cx="100" cy="155" rx="50" ry="14" fill="#000" fillOpacity="0.4" filter="blur(6px)" />
          {/* Isometric 3D Red Dice */}
          <g transform="translate(10, -5)">
            {/* Top Face */}
            <path d="M90 40 L135 62 L90 85 L45 62 Z" fill="url(#diceTop)" />
            {/* Left Face */}
            <path d="M45 62 L90 85 L90 140 L45 117 Z" fill="url(#diceRed)" />
            {/* Right Face */}
            <path d="M90 85 L135 62 L135 117 L90 140 Z" fill="url(#diceRight)" />
            {/* Dots - Top Face (Five) */}
            <ellipse cx="90" cy="62.5" rx="4.5" ry="3" fill="#ffffff" />
            <ellipse cx="68" cy="52" rx="4.5" ry="3" fill="#ffffff" />
            <ellipse cx="112" cy="73" rx="4.5" ry="3" fill="#ffffff" />
            <ellipse cx="112" cy="52" rx="4.5" ry="3" fill="#ffffff" />
            <ellipse cx="68" cy="73" rx="4.5" ry="3" fill="#ffffff" />
            {/* Dots - Left Face (Three) */}
            <ellipse cx="58" cy="80" rx="4" ry="5.5" fill="#ffffff" />
            <ellipse cx="68" cy="101" rx="4" ry="5.5" fill="#ffffff" />
            <ellipse cx="78" cy="122" rx="4" ry="5.5" fill="#ffffff" />
            {/* Dots - Right Face (Six) */}
            <ellipse cx="104" cy="98" rx="4" ry="5.5" fill="#ffffff" />
            <ellipse cx="104" cy="118" rx="4" ry="5.5" fill="#ffffff" />
            <ellipse cx="121" cy="89" rx="4" ry="5.5" fill="#ffffff" />
            <ellipse cx="121" cy="109" rx="4" ry="5.5" fill="#ffffff" />
          </g>
          {/* Subtle rolling sparkle */}
          <circle cx="140" cy="45" r="2.5" fill="#ffffff" opacity="0.9" />
          <path d="M140 38 L140 52 M133 45 L147 45" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        </svg>
      );

    case "mines":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="gemGlow" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#00e701" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00e701" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="emerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#55ff55" />
              <stop offset="40%" stopColor="#00e701" />
              <stop offset="100%" stopColor="#008000" />
            </linearGradient>
            <linearGradient id="bombGrad" x1="30%" y1="20%" x2="90%" y2="90%">
              <stop offset="0%" stopColor="#4a5568" />
              <stop offset="60%" stopColor="#1a202c" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#gemGlow)" />
          {/* Diamond Gem */}
          <g transform="translate(18, 20)">
            <polygon points="50,25 78,45 68,85 32,85 22,45" fill="url(#emerald)" />
            <polygon points="50,25 78,45 60,45" fill="#99ff99" fillOpacity="0.6" />
            <polygon points="50,25 40,45 22,45" fill="#33cc33" fillOpacity="0.7" />
            <polygon points="40,45 60,45 50,75" fill="#66ff66" fillOpacity="0.8" />
            <polygon points="22,45 40,45 32,85" fill="#009900" />
            <polygon points="60,45 78,45 68,85" fill="#006600" />
            <polygon points="40,45 60,45 50,85" fill="#00e701" />
          </g>
          {/* Classic Round Naval Mine with Spikes */}
          <g transform="translate(100, 75)">
            {/* Spikes */}
            <circle cx="45" cy="45" r="28" fill="url(#bombGrad)" />
            <rect x="42" y="10" width="6" height="12" rx="2" fill="#2d3748" />
            <rect x="42" y="68" width="6" height="12" rx="2" fill="#2d3748" />
            <rect x="10" y="42" width="12" height="6" rx="2" fill="#2d3748" />
            <rect x="68" y="42" width="12" height="6" rx="2" fill="#2d3748" />
            <rect x="18" y="18" width="10" height="6" rx="2" transform="rotate(45 23 21)" fill="#2d3748" />
            <rect x="62" y="62" width="10" height="6" rx="2" transform="rotate(45 67 65)" fill="#2d3748" />
            <rect x="62" y="18" width="10" height="6" rx="2" transform="rotate(-45 67 21)" fill="#2d3748" />
            <rect x="18" y="62" width="10" height="6" rx="2" transform="rotate(-45 23 65)" fill="#2d3748" />
            {/* Red Light / Fuse on mine */}
            <circle cx="45" cy="45" r="6" fill="#e9113c" />
            <circle cx="45" cy="45" r="3" fill="#ff708f" />
          </g>
        </svg>
      );

    case "limbo":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="limboGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
            <linearGradient id="flameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffed4a" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#limboGlow)" />
          {/* Target Multiplier Ring & Grid lines */}
          <circle cx="100" cy="100" r="60" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="40" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
          {/* Rocket Ship blasting upward */}
          <g transform="translate(45, 45) rotate(45 55 55)">
            {/* Flame Trail */}
            <polygon points="50,85 55,125 60,85" fill="url(#flameGrad)" />
            <polygon points="52,85 55,108 58,85" fill="#fff" />
            {/* Fins */}
            <polygon points="38,85 50,65 50,85" fill="#e9113c" />
            <polygon points="72,85 60,65 60,85" fill="#e9113c" />
            {/* Fuselage */}
            <path d="M47 85 C47 45 55 18 55 18 C55 18 63 45 63 85 Z" fill="url(#rocketBody)" />
            {/* Nose Cone */}
            <path d="M49 38 C51 25 55 18 55 18 C55 18 59 25 61 38 Z" fill="#e9113c" />
            {/* Porthole */}
            <circle cx="55" cy="50" r="6" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
          </g>
          {/* Target multiplier badge */}
          <rect x="110" y="30" width="55" height="24" rx="12" fill="#00e701" />
          <text x="137" y="46" textAnchor="middle" fill="#0f212e" fontSize="12" fontWeight="900" fontFamily="sans-serif">
            2.00x
          </text>
        </svg>
      );

    case "blackjack":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="bjGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#bjGlow)" />
          {/* Card 1: Jack of Clubs (Angled Left) */}
          <g transform="translate(35, 45) rotate(-12 50 65)">
            <rect x="10" y="10" width="65" height="95" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))" />
            <text x="18" y="28" fill="#0f172a" fontSize="15" fontWeight="900" fontFamily="sans-serif">J</text>
            <text x="18" y="42" fill="#0f172a" fontSize="13">♣</text>
            <circle cx="42" cy="58" r="16" fill="#0f172a" fillOpacity="0.1" />
            <text x="42" y="65" textAnchor="middle" fill="#0f172a" fontSize="24">♣</text>
          </g>
          {/* Card 2: Ace of Spades (Angled Right) */}
          <g transform="translate(75, 38) rotate(10 50 65)">
            <rect x="10" y="10" width="65" height="95" rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" filter="drop-shadow(0 6px 10px rgba(0,0,0,0.4))" />
            <text x="18" y="28" fill="#e11d48" fontSize="15" fontWeight="900" fontFamily="sans-serif">A</text>
            <text x="18" y="42" fill="#e11d48" fontSize="13">♠</text>
            <circle cx="42" cy="58" r="16" fill="#e11d48" fillOpacity="0.1" />
            <text x="42" y="65" textAnchor="middle" fill="#0f172a" fontSize="26">♠</text>
          </g>
          {/* 21 Gold Banner */}
          <rect x="65" y="140" width="70" height="26" rx="13" fill="#eab308" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.5))" />
          <text x="100" y="158" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="900" fontFamily="sans-serif">
            21
          </text>
        </svg>
      );

    case "plinko":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="plinkoGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#plinkoGlow)" />
          {/* Peg Board Triangle */}
          <g fill="#ffffff" opacity="0.85">
            {/* Row 1 */}
            <circle cx="100" cy="45" r="3" />
            {/* Row 2 */}
            <circle cx="85" cy="65" r="3" />
            <circle cx="115" cy="65" r="3" />
            {/* Row 3 */}
            <circle cx="70" cy="85" r="3" />
            <circle cx="100" cy="85" r="3" />
            <circle cx="130" cy="85" r="3" />
            {/* Row 4 */}
            <circle cx="55" cy="105" r="3" />
            <circle cx="85" cy="105" r="3" />
            <circle cx="115" cy="105" r="3" />
            <circle cx="145" cy="105" r="3" />
            {/* Row 5 */}
            <circle cx="40" cy="125" r="3" />
            <circle cx="70" cy="125" r="3" />
            <circle cx="100" cy="125" r="3" />
            <circle cx="130" cy="125" r="3" />
            <circle cx="160" cy="125" r="3" />
          </g>
          {/* Bouncing Plinko Ball */}
          <circle cx="115" cy="88" r="8" fill="#ff007f" filter="drop-shadow(0 0 8px #ff007f)" />
          <circle cx="112" cy="85" r="3" fill="#ffffff" opacity="0.8" />
          {/* Multiplier Row at Bottom */}
          <rect x="35" y="145" width="22" height="18" rx="4" fill="#ef4444" />
          <text x="46" y="158" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">10x</text>
          <rect x="62" y="145" width="22" height="18" rx="4" fill="#f59e0b" />
          <text x="73" y="158" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">3x</text>
          <rect x="89" y="145" width="22" height="18" rx="4" fill="#10b981" />
          <text x="100" y="158" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">1.5x</text>
          <rect x="116" y="145" width="22" height="18" rx="4" fill="#f59e0b" />
          <text x="127" y="158" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">3x</text>
          <rect x="143" y="145" width="22" height="18" rx="4" fill="#ef4444" />
          <text x="154" y="158" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">10x</text>
        </svg>
      );

    case "keno":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="kenoGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#kenoGlow)" />
          {/* 3x3 Tile Grid */}
          <g transform="translate(40, 40)">
            <rect x="0" y="0" width="34" height="34" rx="6" fill="#1e293b" stroke="#334155" />
            <text x="17" y="22" textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="bold">03</text>

            <rect x="42" y="0" width="34" height="34" rx="6" fill="#00e701" stroke="#4ade80" filter="drop-shadow(0 0 6px #00e701)" />
            <text x="59" y="22" textAnchor="middle" fill="#0f212e" fontSize="13" fontWeight="900">07</text>

            <rect x="84" y="0" width="34" height="34" rx="6" fill="#1e293b" stroke="#334155" />
            <text x="101" y="22" textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="bold">12</text>

            <rect x="0" y="42" width="34" height="34" rx="6" fill="#ec4899" stroke="#f472b6" filter="drop-shadow(0 0 6px #ec4899)" />
            <text x="17" y="64" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900">19</text>

            <rect x="42" y="42" width="34" height="34" rx="6" fill="#1e293b" stroke="#334155" />
            <text x="59" y="64" textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="bold">24</text>

            <rect x="84" y="42" width="34" height="34" rx="6" fill="#00e701" stroke="#4ade80" filter="drop-shadow(0 0 6px #00e701)" />
            <text x="101" y="64" textAnchor="middle" fill="#0f212e" fontSize="13" fontWeight="900">31</text>

            <rect x="0" y="84" width="34" height="34" rx="6" fill="#1e293b" stroke="#334155" />
            <text x="17" y="106" textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="bold">36</text>

            <rect x="42" y="84" width="34" height="34" rx="6" fill="#1e293b" stroke="#334155" />
            <text x="59" y="106" textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="bold">40</text>

            <rect x="84" y="84" width="34" height="34" rx="6" fill="#38bdf8" stroke="#7dd3fc" filter="drop-shadow(0 0 6px #38bdf8)" />
            <text x="101" y="106" textAnchor="middle" fill="#0f212e" fontSize="13" fontWeight="900">55</text>
          </g>
        </svg>
      );

    case "crash":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="crashGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="curveGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00e701" />
              <stop offset="70%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ff0055" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#crashGlow)" />
          {/* Axis Guidelines */}
          <path d="M30 160 L170 160 M30 160 L30 40" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
          {/* Exponential Multiplier Curve */}
          <path d="M32 158 Q100 155 160 55" stroke="url(#curveGrad)" strokeWidth="6" strokeLinecap="round" filter="drop-shadow(0 0 8px rgba(0,231,1,0.6))" />
          {/* Rocket at the Peak */}
          <circle cx="160" cy="55" r="9" fill="#ff0055" filter="drop-shadow(0 0 10px #ff0055)" />
          <circle cx="160" cy="55" r="5" fill="#ffffff" />
          {/* Multiplier label */}
          <rect x="80" y="80" width="70" height="26" rx="6" fill="#1a2c38" stroke="#213743" />
          <text x="115" y="98" textAnchor="middle" fill="#00e701" fontSize="14" fontWeight="900" fontFamily="monospace">
            14.28x
          </text>
        </svg>
      );

    case "chicken":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="chickGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#chickGlow)" />
          {/* Silver Cloche Dish Platter */}
          <ellipse cx="100" cy="150" rx="60" ry="12" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
          <ellipse cx="100" cy="148" rx="52" ry="8" fill="#64748b" />
          {/* Cute Chicken Peeking out */}
          <g transform="translate(60, 60)">
            {/* Body */}
            <circle cx="40" cy="55" r="28" fill="#fef08a" />
            {/* Red Crest */}
            <path d="M35 25 C35 15 45 15 45 25 C50 18 55 22 53 28 Z" fill="#ef4444" />
            {/* Beak */}
            <polygon points="40,55 52,60 40,65" fill="#f97316" />
            {/* Eye */}
            <circle cx="34" cy="50" r="3.5" fill="#0f172a" />
            <circle cx="33" cy="49" r="1" fill="#ffffff" />
            {/* Red Wattle */}
            <ellipse cx="38" cy="67" rx="3" ry="5" fill="#ef4444" />
          </g>
          {/* Cloche Dome Raised */}
          <path d="M60 70 Q100 20 140 70 Z" fill="#cbd5e1" stroke="#e2e8f0" strokeWidth="2" opacity="0.9" />
          <circle cx="100" cy="35" r="5" fill="#f59e0b" />
        </svg>
      );

    case "hilo":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="hiloGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#hiloGlow)" />
          {/* Center Card */}
          <rect x="65" y="45" width="70" height="95" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.4))" />
          <text x="76" y="70" fill="#dc2626" fontSize="18" fontWeight="900" fontFamily="sans-serif">K</text>
          <text x="76" y="86" fill="#dc2626" fontSize="14">♥</text>
          <text x="100" y="110" textAnchor="middle" fill="#dc2626" fontSize="34">♥</text>
          {/* Green HI Arrow (Up) */}
          <g transform="translate(145, 65)">
            <rect x="0" y="0" width="28" height="28" rx="6" fill="#00e701" />
            <polygon points="14,6 6,18 22,18" fill="#0f212e" />
          </g>
          {/* Red LO Arrow (Down) */}
          <g transform="translate(25, 95)">
            <rect x="0" y="0" width="28" height="28" rx="6" fill="#e9113c" />
            <polygon points="14,22 6,10 22,10" fill="#ffffff" />
          </g>
        </svg>
      );

    case "dragon-tower":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="dragonGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="dragonTowerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#dragonGlow)" />
          {/* Stone Tower Spire */}
          <polygon points="70,165 78,55 122,55 130,165" fill="url(#dragonTowerGrad)" stroke="#475569" strokeWidth="2" />
          {/* Battlements */}
          <rect x="74" y="45" width="52" height="12" fill="#475569" />
          <rect x="78" y="38" width="8" height="8" fill="#64748b" />
          <rect x="96" y="38" width="8" height="8" fill="#64748b" />
          <rect x="114" y="38" width="8" height="8" fill="#64748b" />
          {/* Glowing Windows */}
          <rect x="94" y="75" width="12" height="18" rx="6" fill="#f59e0b" filter="drop-shadow(0 0 6px #f59e0b)" />
          <rect x="94" y="115" width="12" height="18" rx="6" fill="#f59e0b" filter="drop-shadow(0 0 6px #f59e0b)" />
          {/* Fierce Coiled Dragon Head & Wings */}
          <path d="M50 85 Q75 55 105 50 Q145 60 140 100 Q130 135 150 145" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
          <path d="M110 40 L135 25 L125 45 Z" fill="#f59e0b" />
          <circle cx="115" cy="42" r="3" fill="#ffffff" />
          {/* Embers */}
          <circle cx="65" cy="45" r="2" fill="#f59e0b" />
          <circle cx="145" cy="40" r="2.5" fill="#ef4444" />
        </svg>
      );

    case "wheel":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="wheelGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#wheelGlow)" />
          {/* Outer Ring */}
          <circle cx="100" cy="100" r="65" fill="#1e293b" stroke="#3b82f6" strokeWidth="4" />
          {/* Segmented Colorful Wheel */}
          <g transform="translate(100, 100)">
            <path d="M0 0 L0 -60 A60 60 0 0 1 42 -42 Z" fill="#00e701" />
            <path d="M0 0 L42 -42 A60 60 0 0 1 60 0 Z" fill="#e9113c" />
            <path d="M0 0 L60 0 A60 60 0 0 1 42 42 Z" fill="#eab308" />
            <path d="M0 0 L42 42 A60 60 0 0 1 0 60 Z" fill="#8b5cf6" />
            <path d="M0 0 L0 60 A60 60 0 0 1 -42 42 Z" fill="#06b6d4" />
            <path d="M0 0 L-42 42 A60 60 0 0 1 -60 0 Z" fill="#ec4899" />
            <path d="M0 0 L-60 0 A60 60 0 0 1 -42 -42 Z" fill="#f97316" />
            <path d="M0 0 L-42 -42 A60 60 0 0 1 0 -60 Z" fill="#10b981" />
            {/* Center Cap */}
            <circle cx="0" cy="0" r="16" fill="#0f172a" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="6" fill="#eab308" />
          </g>
          {/* Wheel Pointer Pin at Top */}
          <polygon points="100,42 93,28 107,28" fill="#ffffff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))" />
        </svg>
      );

    case "roulette":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="roulGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#roulGlow)" />
          {/* Wheel Rim Mahogany */}
          <circle cx="100" cy="100" r="68" fill="#451a03" stroke="#b45309" strokeWidth="4" />
          <circle cx="100" cy="100" r="54" fill="#0f172a" stroke="#eab308" strokeWidth="2" />
          {/* Number Pockets */}
          <g transform="translate(100, 100)">
            <path d="M0 0 L0 -50 A50 50 0 0 1 25 -43 Z" fill="#00e701" />
            <path d="M0 0 L25 -43 A50 50 0 0 1 43 -25 Z" fill="#dc2626" />
            <path d="M0 0 L43 -25 A50 50 0 0 1 50 0 Z" fill="#1e293b" />
            <path d="M0 0 L50 0 A50 50 0 0 1 43 25 Z" fill="#dc2626" />
            <path d="M0 0 L43 25 A50 50 0 0 1 25 43 Z" fill="#1e293b" />
            <path d="M0 0 L25 43 A50 50 0 0 1 0 50 Z" fill="#dc2626" />
            <path d="M0 0 L0 50 A50 50 0 0 1 -25 43 Z" fill="#1e293b" />
            <path d="M0 0 L-25 43 A50 50 0 0 1 -43 25 Z" fill="#dc2626" />
            <path d="M0 0 L-43 25 A50 50 0 0 1 -50 0 Z" fill="#1e293b" />
            <path d="M0 0 L-50 0 A50 50 0 0 1 -43 -25 Z" fill="#dc2626" />
            <path d="M0 0 L-43 -25 A50 50 0 0 1 -25 -43 Z" fill="#1e293b" />
            <path d="M0 0 L-25 -43 A50 50 0 0 1 0 -50 Z" fill="#dc2626" />
            {/* Center Turret */}
            <circle cx="0" cy="0" r="22" fill="#b45309" stroke="#fbbf24" strokeWidth="2" />
            <circle cx="0" cy="0" r="10" fill="#fbbf24" />
          </g>
          {/* Ivory Ball in Pocket */}
          <circle cx="128" cy="78" r="5" fill="#ffffff" filter="drop-shadow(0 0 4px #ffffff)" />
        </svg>
      );

    case "baccarat":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="bacGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#b45309" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#bacGlow)" />
          {/* Player Card (Left) */}
          <rect x="35" y="45" width="55" height="80" rx="6" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" />
          <text x="48" y="70" fill="#ffffff" fontSize="18" fontWeight="bold">8</text>
          <text x="62" y="112" textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="900">PLAYER</text>
          {/* Banker Card (Right - Winner 9) */}
          <rect x="110" y="45" width="55" height="80" rx="6" fill="#881337" stroke="#fb7185" strokeWidth="2" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.5))" />
          <text x="123" y="70" fill="#ffffff" fontSize="18" fontWeight="bold">9</text>
          <text x="137" y="112" textAnchor="middle" fill="#fda4af" fontSize="9" fontWeight="900">BANKER</text>
          {/* Golden Casino Chips Stacked */}
          <ellipse cx="100" cy="148" rx="28" ry="9" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
          <ellipse cx="100" cy="142" rx="28" ry="9" fill="#fde047" stroke="#eab308" strokeWidth="2" />
        </svg>
      );

    case "diamonds":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="diaGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#diaGlow)" />
          {/* Central Blue Diamond */}
          <polygon points="100,35 145,75 100,150 55,75" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="2" filter="drop-shadow(0 0 12px rgba(56,189,248,0.7))" />
          <polygon points="100,35 125,75 100,150 75,75" fill="#0284c7" opacity="0.6" />
          <polygon points="100,35 145,75 125,75" fill="#7dd3fc" opacity="0.8" />
          {/* Secondary Gem Left (Pink) */}
          <polygon points="50,90 70,110 50,140 30,110" fill="#f43f5e" opacity="0.85" />
          {/* Secondary Gem Right (Gold) */}
          <polygon points="150,90 170,110 150,140 130,110" fill="#eab308" opacity="0.85" />
        </svg>
      );

    case "flip":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="flipGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#flipGlow)" />
          {/* Flipping Gold Coin Motion Lines */}
          <path d="M40 70 A60 60 0 0 1 160 70" stroke="#fef08a" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
          <path d="M40 130 A60 60 0 0 0 160 130" stroke="#fef08a" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
          {/* 3D Angled Gold Coin */}
          <ellipse cx="100" cy="100" rx="35" ry="60" fill="#ca8a04" />
          <ellipse cx="96" cy="100" rx="34" ry="58" fill="#eab308" />
          <ellipse cx="94" cy="100" rx="28" ry="48" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
          <text x="94" y="108" textAnchor="middle" fill="#854d0e" fontSize="24" fontWeight="900" fontFamily="sans-serif">
            S
          </text>
        </svg>
      );

    case "slide":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="slideGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#slideGlow)" />
          {/* Slider Horizontal Track */}
          <rect x="25" y="88" width="150" height="24" rx="12" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          {/* Glowing Target win zone */}
          <rect x="75" y="88" width="80" height="24" rx="12" fill="#00e701" opacity="0.25" />
          {/* Sliding Neon Block */}
          <rect x="90" y="75" width="30" height="50" rx="8" fill="#a855f7" stroke="#d8b4fe" strokeWidth="2" filter="drop-shadow(0 0 10px #a855f7)" />
          <text x="105" y="105" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900">
            5x
          </text>
        </svg>
      );

    case "pump":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="pumpGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#pumpGlow)" />
          {/* Turbo Pump Gauge */}
          <circle cx="100" cy="105" r="48" fill="#0f172a" stroke="#38bdf8" strokeWidth="4" />
          {/* Dial Arc */}
          <path d="M70 125 A35 35 0 1 1 130 125" stroke="#ef4444" strokeWidth="5" fill="none" strokeDasharray="60 30" />
          {/* Dial Needle */}
          <line x1="100" y1="105" x2="125" y2="80" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="105" r="7" fill="#ffffff" />
          {/* Handle */}
          <rect x="94" y="32" width="12" height="25" fill="#64748b" />
          <rect x="75" y="24" width="50" height="10" rx="3" fill="#cbd5e1" />
        </svg>
      );

    case "snakes":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="snakeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#snakeGlow)" />
          {/* 8-bit Grid Background */}
          <path d="M40 40 H160 V160 H40 Z" stroke="#1e293b" strokeWidth="1" strokeDasharray="10 10" />
          {/* Coiling Pixel Snake */}
          <rect x="50" y="120" width="16" height="16" rx="3" fill="#00e701" />
          <rect x="68" y="120" width="16" height="16" rx="3" fill="#00e701" />
          <rect x="86" y="120" width="16" height="16" rx="3" fill="#00e701" />
          <rect x="86" y="102" width="16" height="16" rx="3" fill="#00e701" />
          <rect x="86" y="84" width="16" height="16" rx="3" fill="#00e701" />
          <rect x="104" y="84" width="16" height="16" rx="3" fill="#00e701" />
          <rect x="122" y="84" width="18" height="18" rx="4" fill="#4ade80" filter="drop-shadow(0 0 6px #00e701)" />
          {/* Eyes */}
          <circle cx="132" cy="89" r="2.5" fill="#0f172a" />
          {/* Golden Pixel Apple */}
          <rect x="122" y="48" width="16" height="16" rx="4" fill="#f59e0b" filter="drop-shadow(0 0 8px #f59e0b)" />
          <rect x="128" y="42" width="3" height="6" fill="#10b981" />
        </svg>
      );

    case "tome-of-life":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="tomeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#tomeGlow)" />
          {/* Floating Ancient Grimoire / Spellbook */}
          <g transform="translate(45, 55)">
            {/* Left Page */}
            <path d="M55 25 Q30 20 5 30 L5 85 Q30 75 55 80 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
            {/* Right Page */}
            <path d="M55 25 Q80 20 105 30 L105 85 Q80 75 55 80 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
            {/* Spine */}
            <line x1="55" y1="23" x2="55" y2="82" stroke="#78350f" strokeWidth="4" />
            {/* Magical Glowing Hieroglyphic Eye */}
            <circle cx="55" cy="52" r="12" fill="#06b6d4" filter="drop-shadow(0 0 8px #06b6d4)" />
            <circle cx="55" cy="52" r="5" fill="#ffffff" />
          </g>
        </svg>
      );

    case "packs":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="packsGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#packsGlow)" />
          {/* Holographic Card Booster Pack */}
          <g transform="translate(60, 40) rotate(-6 40 60)">
            <rect x="0" y="0" width="75" height="115" rx="6" fill="#7c3aed" stroke="#f59e0b" strokeWidth="3" filter="drop-shadow(0 8px 12px rgba(0,0,0,0.5))" />
            <rect x="0" y="8" width="75" height="10" fill="#f59e0b" opacity="0.8" />
            <rect x="0" y="97" width="75" height="10" fill="#f59e0b" opacity="0.8" />
            {/* Energy Tear */}
            <polygon points="37,35 48,55 35,62 45,85" stroke="#38bdf8" strokeWidth="4" fill="none" filter="drop-shadow(0 0 6px #38bdf8)" />
          </g>
        </svg>
      );

    case "rock-paper-scissors":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="rpsGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#rpsGlow)" />
          {/* Rock (Fist) */}
          <circle cx="65" cy="75" r="24" fill="#3b82f6" opacity="0.9" />
          <text x="65" y="83" textAnchor="middle" fontSize="20">✊</text>
          {/* Scissors */}
          <circle cx="135" cy="75" r="24" fill="#ef4444" opacity="0.9" />
          <text x="135" y="83" textAnchor="middle" fontSize="20">✌️</text>
          {/* Paper */}
          <circle cx="100" cy="135" r="24" fill="#10b981" opacity="0.9" />
          <text x="100" y="143" textAnchor="middle" fontSize="20">✋</text>
        </svg>
      );

    case "drill":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="drillGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#drillGlow)" />
          {/* Titanium Spiral Drill Bit */}
          <g transform="translate(70, 30)">
            <rect x="20" y="10" width="20" height="30" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
            <polygon points="15,40 45,40 30,130" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="2" />
            {/* Spiral Grooves */}
            <path d="M16 55 Q30 65 44 55 M19 75 Q30 85 41 75 M23 95 Q30 105 37 95" stroke="#334155" strokeWidth="3" fill="none" />
          </g>
          {/* Sparks */}
          <circle cx="95" cy="165" r="3" fill="#f59e0b" />
          <circle cx="110" cy="155" r="2" fill="#ef4444" />
        </svg>
      );

    case "prime-dice":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="primeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#primeGlow)" />
          <g transform="translate(60, 50)">
            <rect x="0" y="0" width="80" height="80" rx="16" fill="#0f172a" stroke="#06b6d4" strokeWidth="3" filter="drop-shadow(0 0 12px #06b6d4)" />
            <text x="40" y="52" textAnchor="middle" fill="#06b6d4" fontSize="32" fontWeight="900" fontFamily="monospace">
              07
            </text>
          </g>
        </svg>
      );

    case "darts":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="dartGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#dartGlow)" />
          {/* Bristle Dartboard */}
          <circle cx="100" cy="100" r="60" fill="#1e293b" stroke="#334155" strokeWidth="4" />
          <circle cx="100" cy="100" r="45" fill="none" stroke="#ef4444" strokeWidth="6" strokeDasharray="10 10" />
          <circle cx="100" cy="100" r="30" fill="none" stroke="#10b981" strokeWidth="6" strokeDasharray="8 8" />
          {/* Bullseye */}
          <circle cx="100" cy="100" r="14" fill="#10b981" />
          <circle cx="100" cy="100" r="6" fill="#ef4444" />
          {/* Dart embedded */}
          <line x1="100" y1="100" x2="145" y2="55" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
          <polygon points="145,55 160,50 150,65" fill="#ef4444" />
        </svg>
      );

    case "cases":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="caseGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#caseGlow)" />
          {/* Sci-Fi Loot Crate */}
          <g transform="translate(50, 60)">
            <rect x="0" y="20" width="100" height="65" rx="10" fill="#1e293b" stroke="#00e701" strokeWidth="2.5" />
            <rect x="15" y="0" width="70" height="20" rx="4" fill="#334155" stroke="#00e701" strokeWidth="1.5" />
            {/* Center Lock Glow */}
            <circle cx="50" cy="50" r="10" fill="#00e701" filter="drop-shadow(0 0 8px #00e701)" />
          </g>
        </svg>
      );

    case "scarab-spin":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="scarabGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#scarabGlow)" />
          {/* Golden Winged Egyptian Scarab */}
          <circle cx="100" cy="55" r="14" fill="#eab308" filter="drop-shadow(0 0 8px #eab308)" />
          <ellipse cx="100" cy="105" rx="22" ry="32" fill="#0284c7" stroke="#eab308" strokeWidth="3" />
          {/* Wings */}
          <path d="M78 90 Q40 80 40 120 Q65 125 80 115 Z" fill="#eab308" />
          <path d="M122 90 Q160 80 160 120 Q135 125 120 115 Z" fill="#eab308" />
        </svg>
      );

    case "video-poker":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="vpGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#vpGlow)" />
          {/* 5 Poker Cards Spread */}
          <rect x="25" y="70" width="28" height="42" rx="3" fill="#ffffff" stroke="#94a3b8" />
          <text x="39" y="96" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="bold">10</text>
          <rect x="55" y="65" width="28" height="42" rx="3" fill="#ffffff" stroke="#94a3b8" />
          <text x="69" y="91" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="bold">J</text>
          <rect x="85" y="60" width="30" height="46" rx="3" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />
          <text x="100" y="88" textAnchor="middle" fill="#dc2626" fontSize="14" fontWeight="900">Q</text>
          <rect x="117" y="65" width="28" height="42" rx="3" fill="#ffffff" stroke="#94a3b8" />
          <text x="131" y="91" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="bold">K</text>
          <rect x="147" y="70" width="28" height="42" rx="3" fill="#ffffff" stroke="#94a3b8" />
          <text x="161" y="96" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="bold">A</text>
          {/* ROYAL FLUSH banner */}
          <rect x="50" y="125" width="100" height="20" rx="10" fill="#f59e0b" />
          <text x="100" y="139" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="900">ROYAL FLUSH</text>
        </svg>
      );

    case "bars":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="barGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#barGlow)" />
          {/* Triple Gold & Chrome BAR Ingots */}
          <rect x="40" y="65" width="120" height="24" rx="4" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
          <text x="100" y="82" textAnchor="middle" fill="#713f12" fontSize="14" fontWeight="900">BAR</text>
          <rect x="45" y="95" width="110" height="24" rx="4" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
          <text x="100" y="112" textAnchor="middle" fill="#334155" fontSize="14" fontWeight="900">BAR</text>
          <rect x="50" y="125" width="100" height="24" rx="4" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
          <text x="100" y="142" textAnchor="middle" fill="#713f12" fontSize="14" fontWeight="900">BAR</text>
        </svg>
      );

    case "blue-samurai":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="samGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#samGlow)" />
          {/* Dual Katana Crossing with Blue Flames */}
          <line x1="40" y1="160" x2="160" y2="40" stroke="#e0f2fe" strokeWidth="4" strokeLinecap="round" filter="drop-shadow(0 0 8px #38bdf8)" />
          <line x1="160" y1="160" x2="40" y2="40" stroke="#e0f2fe" strokeWidth="4" strokeLinecap="round" filter="drop-shadow(0 0 8px #38bdf8)" />
          {/* Gold Tsuba Guards */}
          <circle cx="100" cy="100" r="14" fill="#eab308" />
          <circle cx="100" cy="100" r="7" fill="#0f172a" />
        </svg>
      );

    case "plinko-magnets":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="magGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#magGlow)" />
          {/* Horseshoe Magnet */}
          <path d="M60 120 L60 80 A40 40 0 0 1 140 80 L140 120" stroke="#ef4444" strokeWidth="22" fill="none" />
          {/* Silver Poles */}
          <rect x="49" y="115" width="22" height="15" fill="#e2e8f0" />
          <rect x="129" y="115" width="22" height="15" fill="#38bdf8" />
          {/* Deflected Plinko Ball */}
          <circle cx="100" cy="130" r="8" fill="#eab308" filter="drop-shadow(0 0 8px #eab308)" />
        </svg>
      );

    case "moles":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="moleGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#moleGlow)" />
          {/* Mound Hole */}
          <ellipse cx="100" cy="135" rx="55" ry="18" fill="#451a03" />
          {/* Mole Head */}
          <circle cx="100" cy="100" r="32" fill="#78350f" />
          {/* Yellow Hardhat */}
          <path d="M68 90 Q100 65 132 90 Z" fill="#eab308" />
          <rect x="64" y="88" width="72" height="8" rx="4" fill="#facc15" />
          {/* Snout & Nose */}
          <ellipse cx="100" cy="112" rx="14" ry="10" fill="#fbcfe8" />
          <circle cx="100" cy="108" r="5" fill="#db2777" />
        </svg>
      );

    // ==========================================
    // LIVE CASINO & GAME SHOWS
    // ==========================================

    case "blackjack-live":
    case "poker-live":
    case "casino-holdem":
    case "extreme-texas-holdem":
    case "texas-holdem-bonus":
    case "caribbean-stud":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="liveDeckGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#liveDeckGlow)" />
          {/* Professional Dealer Silhouette in Tuxedo */}
          <circle cx="100" cy="70" r="28" fill="#cbd5e1" />
          <path d="M55 160 C55 110 75 105 100 105 C125 105 145 110 145 160 Z" fill="#1e293b" />
          {/* Black Tie & Collar */}
          <polygon points="100,105 92,120 108,120" fill="#0f172a" />
          <polygon points="100,120 95,145 100,155 105,145" fill="#0f172a" />
          {/* Felt Table Edge */}
          <path d="M20 170 C60 140 140 140 180 170" stroke="#eab308" strokeWidth="4" />
          {/* Red LIVE pill */}
          <rect x="72" y="22" width="56" height="20" rx="10" fill="#dc2626" />
          <circle cx="84" cy="32" r="3" fill="#ffffff" />
          <text x="105" y="36" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900">LIVE</text>
        </svg>
      );

    case "roulette-live":
    case "immersive-roulette":
    case "lightning-roulette":
    case "red-door-roulette":
    case "gold-vault-roulette":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="liveRoulGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#liveRoulGlow)" />
          {/* Golden Live Studio Roulette */}
          <circle cx="100" cy="105" r="58" fill="#1e293b" stroke="#eab308" strokeWidth="4" />
          <circle cx="100" cy="105" r="42" fill="#7f1d1d" stroke="#ca8a04" strokeWidth="2" />
          <circle cx="100" cy="105" r="16" fill="#ca8a04" />
          {/* Lightning flash if lightning roulette */}
          <polygon points="105,25 90,65 110,65 95,105" fill="#fde047" filter="drop-shadow(0 0 8px #fde047)" />
          {/* Red LIVE pill */}
          <rect x="72" y="20" width="56" height="20" rx="10" fill="#dc2626" />
          <circle cx="84" cy="30" r="3" fill="#ffffff" />
          <text x="105" y="34" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900">LIVE</text>
        </svg>
      );

    case "crazy-time":
    case "monopoly":
    case "monopoly-big-baller":
    case "funky-time":
    case "crazy-pachinko":
    case "mega-ball":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="gameShowGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#gameShowGlow)" />
          {/* Giant Studio Prize Wheel */}
          <circle cx="100" cy="110" r="60" fill="#0f172a" stroke="#ec4899" strokeWidth="5" />
          {/* Flashing Neon Segments */}
          <g transform="translate(100, 110)">
            <path d="M0 0 L-40 -40 A56 56 0 0 1 0 -56 Z" fill="#f43f5e" />
            <path d="M0 0 L0 -56 A56 56 0 0 1 40 -40 Z" fill="#eab308" />
            <path d="M0 0 L40 -40 A56 56 0 0 1 56 0 Z" fill="#06b6d4" />
            <path d="M0 0 L56 0 A56 56 0 0 1 40 40 Z" fill="#a855f7" />
            <circle cx="0" cy="0" r="18" fill="#ffffff" />
            <text x="0" y="5" textAnchor="middle" fill="#ec4899" fontSize="11" fontWeight="900">TOP</text>
          </g>
          {/* Studio Lights */}
          <circle cx="45" cy="40" r="5" fill="#facc15" filter="drop-shadow(0 0 6px #facc15)" />
          <circle cx="155" cy="40" r="5" fill="#facc15" filter="drop-shadow(0 0 6px #facc15)" />
        </svg>
      );

    // Fallback Graphic
    default:
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="defGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00e701" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00e701" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#defGlow)" />
          <rect x="50" y="50" width="100" height="100" rx="20" fill="#1a2c38" stroke="#213743" strokeWidth="3" />
          <circle cx="100" cy="100" r="25" fill="#00e701" opacity="0.8" />
          <polygon points="95,90 112,100 95,110" fill="#0f212e" />
        </svg>
      );
  }
}
