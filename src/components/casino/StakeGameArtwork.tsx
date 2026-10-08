import React from "react";

interface StakeGameArtworkProps {
  gameId: string;
  className?: string;
}

export default function StakeGameArtwork({
  gameId,
  className = "w-full h-full",
}: StakeGameArtworkProps) {
  // Normalize game identifier (lowercase, hyphens, trimmed)
  const key = (gameId || "")
    .toLowerCase()
    .trim()
    .replace(/_/g, "-");

  switch (key) {
    // ==========================================
    // 1. 31 STAKE ORIGINALS (100% BESPOKE)
    // ==========================================

    // 'dice': Distinct white & red 3D dice on purple/pink background with white dots (never shown on other games)
    case "dice":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="diceBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c026d3" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#7e22ce" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="diceRedTop" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff4d6d" />
              <stop offset="100%" stopColor="#ff758f" />
            </linearGradient>
            <linearGradient id="diceRedLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>
            <linearGradient id="diceRedRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#be123c" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
            <linearGradient id="diceWhiteTop" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
            <linearGradient id="diceWhiteLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="diceWhiteRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#diceBg)" />
          {/* Shadow */}
          <ellipse cx="100" cy="160" rx="55" ry="12" fill="#000" fillOpacity="0.5" filter="blur(6px)" />
          
          {/* Die 1: Distinct Red 3D Die */}
          <g transform="translate(18, -2)">
            {/* Top Face */}
            <path d="M85 45 L125 65 L85 85 L45 65 Z" fill="url(#diceRedTop)" />
            {/* Left Face */}
            <path d="M45 65 L85 85 L85 132 L45 112 Z" fill="url(#diceRedLeft)" />
            {/* Right Face */}
            <path d="M85 85 L125 65 L125 112 L85 132 Z" fill="url(#diceRedRight)" />
            {/* White Dots - Top (Five) */}
            <ellipse cx="85" cy="65" rx="4" ry="2.5" fill="#ffffff" />
            <ellipse cx="65" cy="55" rx="4" ry="2.5" fill="#ffffff" />
            <ellipse cx="105" cy="75" rx="4" ry="2.5" fill="#ffffff" />
            <ellipse cx="105" cy="55" rx="4" ry="2.5" fill="#ffffff" />
            <ellipse cx="65" cy="75" rx="4" ry="2.5" fill="#ffffff" />
            {/* White Dots - Left (Three) */}
            <ellipse cx="58" cy="80" rx="3.5" ry="5" fill="#ffffff" />
            <ellipse cx="65" cy="98" rx="3.5" ry="5" fill="#ffffff" />
            <ellipse cx="72" cy="116" rx="3.5" ry="5" fill="#ffffff" />
            {/* White Dots - Right (Six) */}
            <ellipse cx="98" cy="95" rx="3.5" ry="5" fill="#ffffff" />
            <ellipse cx="98" cy="113" rx="3.5" ry="5" fill="#ffffff" />
            <ellipse cx="112" cy="86" rx="3.5" ry="5" fill="#ffffff" />
            <ellipse cx="112" cy="104" rx="3.5" ry="5" fill="#ffffff" />
          </g>

          {/* Die 2: Distinct White 3D Companion Die in foreground */}
          <g transform="translate(-15, 30) scale(0.65)">
            <path d="M70 40 L105 57 L70 75 L35 57 Z" fill="url(#diceWhiteTop)" />
            <path d="M35 57 L70 75 L70 115 L35 97 Z" fill="url(#diceWhiteLeft)" />
            <path d="M70 75 L105 57 L105 97 L70 115 Z" fill="url(#diceWhiteRight)" />
            <ellipse cx="70" cy="57" rx="3.5" ry="2.2" fill="#e11d48" />
            <ellipse cx="52" cy="75" rx="3" ry="4" fill="#0f172a" />
            <ellipse cx="52" cy="95" rx="3" ry="4" fill="#0f172a" />
            <ellipse cx="88" cy="70" rx="3" ry="4" fill="#0f172a" />
            <ellipse cx="88" cy="90" rx="3" ry="4" fill="#0f172a" />
          </g>
        </svg>
      );

    // 'mines': Distinct multifaceted emerald green gem next to a round red cartoon bomb with burning fuse on blue gradient
    case "mines":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="minesBlueBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#0369a1" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="emeraldMain" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="40%" stopColor="#00e701" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
            <radialGradient id="redBombShine" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ff4d4d" />
              <stop offset="40%" stopColor="#dc2626" />
              <stop offset="85%" stopColor="#7f1d1d" />
              <stop offset="100%" stopColor="#450a0a" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#minesBlueBg)" />
          {/* Ground drop shadow */}
          <ellipse cx="100" cy="162" rx="60" ry="12" fill="#000" fillOpacity="0.45" filter="blur(5px)" />
          
          {/* Multifaceted Emerald Green Gem (Left) */}
          <g transform="translate(20, 35)">
            {/* Gem Base & Facets */}
            <polygon points="50,22 80,44 68,88 32,88 20,44" fill="url(#emeraldMain)" />
            {/* Top Table Facet */}
            <polygon points="38,44 62,44 50,28" fill="#bbf7d0" fillOpacity="0.9" />
            {/* Upper Facets */}
            <polygon points="20,44 38,44 50,22" fill="#86efac" fillOpacity="0.8" />
            <polygon points="62,44 80,44 50,22" fill="#22c55e" />
            {/* Lower Center Facet */}
            <polygon points="38,44 62,44 50,88" fill="#4ade80" />
            {/* Lower Side Facets */}
            <polygon points="20,44 38,44 32,88" fill="#16a34a" />
            <polygon points="62,44 80,44 68,88" fill="#14532d" />
            {/* Shimmer sparkle */}
            <circle cx="48" cy="36" r="3" fill="#ffffff" />
          </g>

          {/* Round Red Cartoon Bomb with Burning Fuse (Right) */}
          <g transform="translate(95, 60)">
            {/* Burning Fuse Wick */}
            <path d="M48 24 Q58 5 72 10" stroke="#fef08a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            {/* Fuse Spark / Flame */}
            <circle cx="74" cy="9" r="6" fill="#facc15" filter="drop-shadow(0 0 6px #facc15)" />
            <circle cx="74" cy="9" r="3" fill="#ef4444" />
            <polygon points="76,6 82,4 78,10 83,14 75,12 72,16 73,11 68,9" fill="#ffedd5" />
            
            {/* Bomb Collar */}
            <rect x="40" y="20" width="16" height="8" rx="2" fill="#475569" stroke="#1e293b" />
            {/* Red Bomb Sphere */}
            <circle cx="48" cy="54" r="32" fill="url(#redBombShine)" />
            {/* Gloss highlight */}
            <ellipse cx="38" cy="38" rx="8" ry="5" fill="#ffffff" fillOpacity="0.65" transform="rotate(-30 38 38)" />
          </g>
        </svg>
      );

    // 'plinko': Distinct yellow/gold 10000x banner with cascading gold discs and pyramid peg layout on violet/purple field
    case "plinko":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="plinkoBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#4c1d95" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="goldBannerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <radialGradient id="goldDisc" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#a16207" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#plinkoBg)" />

          {/* Yellow/Gold 10000x Banner at Top */}
          <g transform="translate(42, 22)">
            <rect x="0" y="0" width="116" height="26" rx="6" fill="url(#goldBannerGrad)" stroke="#fef08a" strokeWidth="1.5" filter="drop-shadow(0 4px 10px rgba(245,158,11,0.5))" />
            <text x="58" y="18" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5">
              10,000x
            </text>
          </g>

          {/* Pyramid Peg Layout */}
          <g fill="#ffffff" opacity="0.9">
            {/* Row 1 */}
            <circle cx="100" cy="62" r="3" />
            {/* Row 2 */}
            <circle cx="85" cy="78" r="3" />
            <circle cx="115" cy="78" r="3" />
            {/* Row 3 */}
            <circle cx="70" cy="94" r="3" />
            <circle cx="100" cy="94" r="3" />
            <circle cx="130" cy="94" r="3" />
            {/* Row 4 */}
            <circle cx="55" cy="110" r="3" />
            <circle cx="85" cy="110" r="3" />
            <circle cx="115" cy="110" r="3" />
            <circle cx="145" cy="110" r="3" />
            {/* Row 5 */}
            <circle cx="40" cy="126" r="3" />
            <circle cx="70" cy="126" r="3" />
            <circle cx="100" cy="126" r="3" />
            <circle cx="130" cy="126" r="3" />
            <circle cx="160" cy="126" r="3" />
          </g>

          {/* Cascading Gold Discs */}
          <circle cx="100" cy="74" r="7.5" fill="url(#goldDisc)" filter="drop-shadow(0 0 6px #eab308)" />
          <circle cx="122" cy="102" r="7.5" fill="url(#goldDisc)" filter="drop-shadow(0 0 6px #eab308)" />
          <circle cx="78" cy="118" r="7.5" fill="url(#goldDisc)" filter="drop-shadow(0 0 6px #eab308)" />

          {/* Bottom multiplier slots */}
          <g transform="translate(25, 145)">
            <rect x="0" y="0" width="22" height="18" rx="4" fill="#ef4444" />
            <text x="11" y="13" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">1000x</text>
            <rect x="26" y="0" width="22" height="18" rx="4" fill="#f97316" />
            <text x="37" y="13" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">130x</text>
            <rect x="52" y="0" width="22" height="18" rx="4" fill="#eab308" />
            <text x="63" y="13" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="bold">26x</text>
            <rect x="78" y="0" width="22" height="18" rx="4" fill="#10b981" />
            <text x="89" y="13" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">9x</text>
            <rect x="104" y="0" width="22" height="18" rx="4" fill="#eab308" />
            <text x="115" y="13" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="bold">26x</text>
            <rect x="130" y="0" width="22" height="18" rx="4" fill="#ef4444" />
            <text x="141" y="13" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">1000x</text>
          </g>
        </svg>
      );

    // 'limbo': Distinct golden-yellow ticket labeled "900x" on warm orange-yellow gradient
    case "limbo":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="limboOrangeBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.45" />
              <stop offset="65%" stopColor="#ea580c" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="limboTicketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="30%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#limboOrangeBg)" />
          {/* Floating ticket shadow */}
          <ellipse cx="100" cy="158" rx="52" ry="12" fill="#000" fillOpacity="0.45" filter="blur(6px)" />

          {/* Golden-Yellow Ticket angled labeled '900x' */}
          <g transform="translate(30, 48) rotate(-6 70 45)">
            {/* Ticket Base Body with Perforated Edges */}
            <path
              d="M10 0 H130 C130 12 138 20 148 20 C138 20 130 28 130 40 C130 52 138 60 148 60 C138 60 130 68 130 80 H10 C10 68 2 60 -8 60 C2 60 10 52 10 40 C10 28 2 20 -8 20 C2 20 10 12 10 0 Z"
              fill="url(#limboTicketGrad)"
              stroke="#ca8a04"
              strokeWidth="2.5"
              filter="drop-shadow(0 8px 16px rgba(0,0,0,0.45))"
            />
            {/* Ticket Perforation Dashes */}
            <line x1="38" y1="4" x2="38" y2="76" stroke="#a16207" strokeWidth="2" strokeDasharray="4 4" />
            
            {/* Left Ticket Stub */}
            <text x="24" y="46" textAnchor="middle" fill="#854d0e" fontSize="10" fontWeight="900" transform="rotate(-90 24 46)">
              STAKE
            </text>

            {/* Main Ticket Text 900x */}
            <text x="84" y="52" textAnchor="middle" fill="#0f172a" fontSize="32" fontWeight="900" fontFamily="sans-serif">
              900x
            </text>
            <text x="84" y="68" textAnchor="middle" fill="#713f12" fontSize="9" fontWeight="800" letterSpacing="1.5">
              MULTIPLIER
            </text>

            {/* Star badge */}
            <circle cx="120" cy="22" r="5" fill="#f59e0b" />
          </g>
        </svg>
      );

    // 'crash': Distinct soaring curved graph with golden ascending line and yellow sunburst curve on navy blue
    case "crash":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="crashNavyBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.55" />
              <stop offset="70%" stopColor="#0f172a" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="goldenAscend" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00e701" />
              <stop offset="40%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
            <radialGradient id="sunburstPeak" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#crashNavyBg)" />
          
          {/* Graph Grid Lines */}
          <path d="M30 160 L170 160 M30 160 L30 40" stroke="#334155" strokeWidth="2.5" />
          <path d="M30 120 L170 120 M30 80 L170 80" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M75 160 L75 40 M120 160 L120 40" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Yellow Sunburst Curve area fill under graph */}
          <path d="M32 158 Q105 155 155 58 L155 158 Z" fill="url(#goldenAscend)" opacity="0.15" />

          {/* Golden Ascending Curved Graph Line */}
          <path d="M32 158 Q105 155 155 58" stroke="url(#goldenAscend)" strokeWidth="6" strokeLinecap="round" filter="drop-shadow(0 0 8px #f59e0b)" />

          {/* Yellow Sunburst Glow at Peak */}
          <circle cx="155" cy="58" r="24" fill="url(#sunburstPeak)" />
          <circle cx="155" cy="58" r="8" fill="#ffffff" filter="drop-shadow(0 0 6px #ffffff)" />
          <circle cx="155" cy="58" r="4" fill="#f59e0b" />

          {/* Multiplier Display Tag */}
          <g transform="translate(62, 75)">
            <rect x="0" y="0" width="76" height="28" rx="8" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.5))" />
            <text x="38" y="19" textAnchor="middle" fill="#00e701" fontSize="13" fontWeight="900" fontFamily="monospace">
              12.84x
            </text>
          </g>
        </svg>
      );

    // 'keno': Distinct cyan matrix grid with neon green number tiles labeled "10", "11", "2", "3"
    case "keno":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="kenoCyanBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#0891b2" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#kenoCyanBg)" />

          {/* Cyan Matrix Grid Container */}
          <rect x="35" y="35" width="130" height="130" rx="12" fill="#0f212e" stroke="#0891b2" strokeWidth="2" />

          {/* Grid of tiles (4x4 Matrix) */}
          <g transform="translate(45, 45)">
            {/* Tile "2" (Neon Green Picked Tile) */}
            <rect x="0" y="0" width="24" height="24" rx="5" fill="#00e701" stroke="#4ade80" filter="drop-shadow(0 0 6px #00e701)" />
            <text x="12" y="16" textAnchor="middle" fill="#0f212e" fontSize="12" fontWeight="900" fontFamily="sans-serif">2</text>

            {/* Tile "3" (Neon Green Picked Tile) */}
            <rect x="28" y="0" width="24" height="24" rx="5" fill="#00e701" stroke="#4ade80" filter="drop-shadow(0 0 6px #00e701)" />
            <text x="40" y="16" textAnchor="middle" fill="#0f212e" fontSize="12" fontWeight="900" fontFamily="sans-serif">3</text>

            <rect x="56" y="0" width="24" height="24" rx="5" fill="#1e293b" stroke="#334155" />
            <text x="68" y="16" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">07</text>

            <rect x="84" y="0" width="24" height="24" rx="5" fill="#1e293b" stroke="#334155" />
            <text x="96" y="16" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">08</text>

            {/* Row 2 */}
            {/* Tile "10" (Neon Green Picked Tile) */}
            <rect x="0" y="28" width="24" height="24" rx="5" fill="#00e701" stroke="#4ade80" filter="drop-shadow(0 0 6px #00e701)" />
            <text x="12" y="44" textAnchor="middle" fill="#0f212e" fontSize="11" fontWeight="900" fontFamily="sans-serif">10</text>

            {/* Tile "11" (Neon Green Picked Tile) */}
            <rect x="28" y="28" width="24" height="24" rx="5" fill="#00e701" stroke="#4ade80" filter="drop-shadow(0 0 6px #00e701)" />
            <text x="40" y="44" textAnchor="middle" fill="#0f212e" fontSize="11" fontWeight="900" fontFamily="sans-serif">11</text>

            <rect x="56" y="28" width="24" height="24" rx="5" fill="#1e293b" stroke="#334155" />
            <text x="68" y="44" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">15</text>

            <rect x="84" y="28" width="24" height="24" rx="5" fill="#1e293b" stroke="#334155" />
            <text x="96" y="44" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">19</text>

            {/* Row 3 */}
            <rect x="0" y="56" width="24" height="24" rx="5" fill="#1e293b" stroke="#334155" />
            <text x="12" y="72" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">21</text>

            <rect x="28" y="56" width="24" height="24" rx="5" fill="#1e293b" stroke="#334155" />
            <text x="40" y="72" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">24</text>

            <rect x="56" y="56" width="24" height="24" rx="5" fill="#1e293b" stroke="#334155" />
            <text x="68" y="72" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">28</text>

            <rect x="84" y="56" width="24" height="24" rx="5" fill="#1e293b" stroke="#334155" />
            <text x="96" y="72" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">32</text>

            {/* Row 4 */}
            <rect x="0" y="84" width="24" height="24" rx="5" fill="#1e293b" stroke="#334155" />
            <text x="12" y="100" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">35</text>

            <rect x="28" y="84" width="24" height="24" rx="5" fill="#1e293b" stroke="#334155" />
            <text x="40" y="100" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">38</text>

            <rect x="56" y="84" width="24" height="24" rx="5" fill="#1e293b" stroke="#334155" />
            <text x="68" y="100" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">39</text>

            <rect x="84" y="84" width="24" height="24" rx="5" fill="#06b6d4" stroke="#67e8f9" filter="drop-shadow(0 0 6px #06b6d4)" />
            <text x="96" y="100" textAnchor="middle" fill="#0f212e" fontSize="11" fontWeight="900">40</text>
          </g>
        </svg>
      );

    // 'blackjack': Distinct Stake-branded playing cards (Ace of Spades and King) on deep red and navy felt background
    case "blackjack":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="bjFeltBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#881337" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#1e1b4b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#bjFeltBg)" />
          {/* Card shadows */}
          <ellipse cx="100" cy="155" rx="55" ry="12" fill="#000" fillOpacity="0.45" filter="blur(6px)" />

          {/* Card 1: King of Hearts (Angled Left) */}
          <g transform="translate(32, 42) rotate(-12 50 65)">
            <rect x="0" y="0" width="68" height="100" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.35))" />
            <text x="10" y="20" fill="#dc2626" fontSize="16" fontWeight="900" fontFamily="sans-serif">K</text>
            <text x="10" y="34" fill="#dc2626" fontSize="13">♥</text>
            <circle cx="34" cy="54" r="16" fill="#fecaca" fillOpacity="0.5" />
            <text x="34" y="62" textAnchor="middle" fill="#dc2626" fontSize="26">♥</text>
            <text x="34" y="86" textAnchor="middle" fill="#881337" fontSize="8" fontWeight="800">STAKE</text>
          </g>

          {/* Card 2: Ace of Spades (Angled Right, in front) */}
          <g transform="translate(80, 36) rotate(10 50 65)">
            <rect x="0" y="0" width="68" height="100" rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.45))" />
            <text x="10" y="20" fill="#0f172a" fontSize="16" fontWeight="900" fontFamily="sans-serif">A</text>
            <text x="10" y="34" fill="#0f172a" fontSize="13">♠</text>
            <circle cx="34" cy="54" r="16" fill="#e2e8f0" fillOpacity="0.6" />
            <text x="34" y="62" textAnchor="middle" fill="#0f172a" fontSize="28">♠</text>
            {/* Stake watermark brand */}
            <text x="34" y="86" textAnchor="middle" fill="#0284c7" fontSize="8" fontWeight="900">STAKE</text>
          </g>

          {/* Blackjack '21' Gold Pill Badge */}
          <g transform="translate(68, 142)">
            <rect x="0" y="0" width="64" height="24" rx="12" fill="#eab308" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.5))" />
            <text x="32" y="16" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="900" fontFamily="sans-serif">
              21
            </text>
          </g>
        </svg>
      );

    // 'roulette': Distinct classic casino roulette wheel with red/black slots, numbered pockets, and brass turret
    case "roulette":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="roulClassicBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#047857" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#065f46" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#roulClassicBg)" />
          
          {/* Wheel Rim Mahogany Wood */}
          <circle cx="100" cy="100" r="70" fill="#451a03" stroke="#b45309" strokeWidth="5" filter="drop-shadow(0 6px 14px rgba(0,0,0,0.5))" />
          <circle cx="100" cy="100" r="56" fill="#0f172a" stroke="#d97706" strokeWidth="2.5" />

          {/* Red & Black Slots and Numbered Pockets */}
          <g transform="translate(100, 100)">
            <path d="M0 0 L0 -52 A52 52 0 0 1 26 -45 Z" fill="#00e701" />
            <path d="M0 0 L26 -45 A52 52 0 0 1 45 -26 Z" fill="#dc2626" />
            <path d="M0 0 L45 -26 A52 52 0 0 1 52 0 Z" fill="#1e293b" />
            <path d="M0 0 L52 0 A52 52 0 0 1 45 26 Z" fill="#dc2626" />
            <path d="M0 0 L45 26 A52 52 0 0 1 26 45 Z" fill="#1e293b" />
            <path d="M0 0 L26 45 A52 52 0 0 1 0 52 Z" fill="#dc2626" />
            <path d="M0 0 L0 52 A52 52 0 0 1 -26 45 Z" fill="#1e293b" />
            <path d="M0 0 L-26 45 A52 52 0 0 1 -45 26 Z" fill="#dc2626" />
            <path d="M0 0 L-45 26 A52 52 0 0 1 -52 0 Z" fill="#1e293b" />
            <path d="M0 0 L-52 0 A52 52 0 0 1 -45 -26 Z" fill="#dc2626" />
            <path d="M0 0 L-45 -26 A52 52 0 0 1 -26 -45 Z" fill="#1e293b" />
            <path d="M0 0 L-26 -45 A52 52 0 0 1 0 -52 Z" fill="#dc2626" />

            {/* Inner Brass Turret Mechanism */}
            <circle cx="0" cy="0" r="24" fill="#ca8a04" stroke="#fef08a" strokeWidth="2" />
            {/* Turret Spindle Handles */}
            <line x1="-18" y1="0" x2="18" y2="0" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" />
            <line x1="0" y1="-18" x2="0" y2="18" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" />
            <circle cx="0" cy="0" r="8" fill="#eab308" />
          </g>

          {/* Ivory Roulette Ball resting in pocket */}
          <circle cx="132" cy="74" r="5" fill="#ffffff" filter="drop-shadow(0 0 5px #ffffff)" />
        </svg>
      );

    // 'wheel': Distinct colorful segmented carnival prize wheel with pointer arrow on cyan-yellow card
    case "wheel":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="wheelCyanYelBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="65%" stopColor="#eab308" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#wheelCyanYelBg)" />

          {/* Outer Wheel Rim */}
          <circle cx="100" cy="105" r="66" fill="#1e293b" stroke="#06b6d4" strokeWidth="4" filter="drop-shadow(0 6px 16px rgba(0,0,0,0.4))" />

          {/* Colorful Segmented Carnival Prize Wheel */}
          <g transform="translate(100, 105)">
            <path d="M0 0 L0 -62 A62 62 0 0 1 44 -44 Z" fill="#00e701" />
            <path d="M0 0 L44 -44 A62 62 0 0 1 62 0 Z" fill="#ef4444" />
            <path d="M0 0 L62 0 A62 62 0 0 1 44 44 Z" fill="#eab308" />
            <path d="M0 0 L44 44 A62 62 0 0 1 0 62 Z" fill="#8b5cf6" />
            <path d="M0 0 L0 62 A62 62 0 0 1 -44 44 Z" fill="#06b6d4" />
            <path d="M0 0 L-44 44 A62 62 0 0 1 -62 0 Z" fill="#ec4899" />
            <path d="M0 0 L-62 0 A62 62 0 0 1 -44 -44 Z" fill="#f97316" />
            <path d="M0 0 L-44 -44 A62 62 0 0 1 0 -62 Z" fill="#3b82f6" />
            
            {/* Center Cap */}
            <circle cx="0" cy="0" r="16" fill="#0f172a" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="6" fill="#eab308" />
          </g>

          {/* Pointer Arrow on cyan-yellow card at Top */}
          <polygon points="100,48 91,32 109,32" fill="#ffffff" stroke="#eab308" strokeWidth="2" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.6))" />
        </svg>
      );

    // 'chicken': Distinct white cartoon chicken character on yellow/blue badge
    case "chicken":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="chickBadgeBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="65%" stopColor="#0284c7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#chickBadgeBg)" />

          {/* Yellow/Blue Badge Container */}
          <circle cx="100" cy="100" r="68" fill="#0284c7" stroke="#facc15" strokeWidth="4" />
          <circle cx="100" cy="100" r="58" fill="#1e3a8a" />

          {/* Distinct White Cartoon Chicken Character */}
          <g transform="translate(68, 48)">
            {/* White Body Plump */}
            <ellipse cx="32" cy="56" rx="28" ry="24" fill="#ffffff" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))" />
            {/* White Head */}
            <circle cx="32" cy="32" r="18" fill="#ffffff" />
            {/* Red Crest on Head */}
            <path d="M25 15 C25 6 32 8 32 15 C36 8 42 10 40 16 Z" fill="#ef4444" />
            {/* Cute Cartoon Eyes */}
            <circle cx="26" cy="30" r="3.5" fill="#0f172a" />
            <circle cx="25" cy="29" r="1" fill="#ffffff" />
            <circle cx="38" cy="30" r="3.5" fill="#0f172a" />
            <circle cx="37" cy="29" r="1" fill="#ffffff" />
            {/* Orange Beak */}
            <polygon points="32,34 26,42 38,42" fill="#f97316" />
            {/* Red Wattle underneath beak */}
            <ellipse cx="32" cy="46" rx="3.5" ry="5" fill="#ef4444" />
            {/* Wings */}
            <ellipse cx="14" cy="58" rx="8" ry="14" fill="#f1f5f9" transform="rotate(20 14 58)" />
            <ellipse cx="50" cy="58" rx="8" ry="14" fill="#f1f5f9" transform="rotate(-20 50 58)" />
          </g>

          {/* Serving Dome / Plate at bottom */}
          <ellipse cx="100" cy="148" rx="48" ry="10" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
        </svg>
      );

    // 'hilo': Distinct playing cards with green background and directional high/low arrows
    case "hilo":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="hiloGreenBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#064e3b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#hiloGreenBg)" />
          {/* Card shadow */}
          <ellipse cx="100" cy="155" rx="50" ry="10" fill="#000" fillOpacity="0.4" filter="blur(5px)" />

          {/* Playing Card on Green Felt */}
          <rect x="66" y="42" width="68" height="96" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.4))" />
          <text x="78" y="66" fill="#dc2626" fontSize="18" fontWeight="900" fontFamily="sans-serif">K</text>
          <text x="78" y="82" fill="#dc2626" fontSize="14">♥</text>
          <text x="100" y="105" textAnchor="middle" fill="#dc2626" fontSize="32">♥</text>

          {/* High (HI) Directional Arrow (Green Up Arrow Button) */}
          <g transform="translate(144, 60)">
            <rect x="0" y="0" width="30" height="30" rx="8" fill="#00e701" stroke="#4ade80" strokeWidth="1.5" filter="drop-shadow(0 0 8px #00e701)" />
            <polygon points="15,6 7,19 23,19" fill="#0f212e" />
            <rect x="12" y="19" width="6" height="6" fill="#0f212e" />
          </g>

          {/* Low (LO) Directional Arrow (Red Down Arrow Button) */}
          <g transform="translate(26, 95)">
            <rect x="0" y="0" width="30" height="30" rx="8" fill="#ef4444" stroke="#f87171" strokeWidth="1.5" filter="drop-shadow(0 0 8px #ef4444)" />
            <polygon points="15,24 7,11 23,11" fill="#ffffff" />
            <rect x="12" y="5" width="6" height="6" fill="#ffffff" />
          </g>
        </svg>
      );

    // 'dragon-tower': Distinct gold dragon castle tower with climbing stone stages
    case "dragon-tower":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="dragonTowerBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.45" />
              <stop offset="65%" stopColor="#eab308" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#dragonTowerBg)" />

          {/* Climbing Stone Stages Base */}
          <g transform="translate(45, 60)">
            {/* Stage 1 Bottom */}
            <rect x="10" y="75" width="90" height="25" rx="3" fill="#334155" stroke="#475569" strokeWidth="2" />
            <rect x="25" y="80" width="16" height="15" rx="2" fill="#eab308" opacity="0.6" />
            <rect x="50" y="80" width="16" height="15" rx="2" fill="#eab308" opacity="0.6" />
            <rect x="75" y="80" width="16" height="15" rx="2" fill="#eab308" opacity="0.6" />

            {/* Stage 2 Middle */}
            <rect x="20" y="45" width="70" height="25" rx="3" fill="#475569" stroke="#64748b" strokeWidth="2" />
            <rect x="35" y="50" width="16" height="15" rx="2" fill="#eab308" opacity="0.8" />
            <rect x="60" y="50" width="16" height="15" rx="2" fill="#eab308" opacity="0.8" />

            {/* Stage 3 Top */}
            <rect x="30" y="15" width="50" height="25" rx="3" fill="#64748b" stroke="#94a3b8" strokeWidth="2" />
            <rect x="47" y="20" width="16" height="15" rx="2" fill="#00e701" filter="drop-shadow(0 0 6px #00e701)" />
          </g>

          {/* Gold Dragon Coiling over Castle Tower */}
          <path d="M60 120 Q80 80 115 70 Q145 65 140 100 Q130 130 150 145" stroke="#eab308" strokeWidth="7" strokeLinecap="round" filter="drop-shadow(0 0 8px #eab308)" />
          {/* Dragon Head with Horns */}
          <polygon points="120,50 145,35 135,55" fill="#facc15" />
          <circle cx="125" cy="52" r="2.5" fill="#ef4444" />
          {/* Flame breath */}
          <path d="M145 35 Q165 30 160 45 Z" fill="#ef4444" />
        </svg>
      );

    // 'moles': Distinct cartoon mole emerging with a megaphone on light blue sky
    case "moles":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="moleSkyBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#0284c7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#moleSkyBg)" />

          {/* Earth Mound Hole */}
          <ellipse cx="100" cy="145" rx="55" ry="18" fill="#451a03" stroke="#78350f" strokeWidth="3" />

          {/* Emerging Cartoon Mole */}
          <g transform="translate(68, 55)">
            {/* Body / Head */}
            <ellipse cx="32" cy="50" rx="30" ry="34" fill="#78350f" />
            {/* Snout */}
            <ellipse cx="32" cy="58" rx="14" ry="10" fill="#fbcfe8" />
            <circle cx="32" cy="54" r="5" fill="#db2777" />
            {/* Cute Whiskers */}
            <line x1="15" y1="58" x2="5" y2="56" stroke="#fbcfe8" strokeWidth="1.5" />
            <line x1="15" y1="62" x2="5" y2="64" stroke="#fbcfe8" strokeWidth="1.5" />
            <line x1="49" y1="58" x2="59" y2="56" stroke="#fbcfe8" strokeWidth="1.5" />
            <line x1="49" y1="62" x2="59" y2="64" stroke="#fbcfe8" strokeWidth="1.5" />
            {/* Eyes */}
            <circle cx="22" cy="40" r="3.5" fill="#0f172a" />
            <circle cx="21" cy="39" r="1" fill="#ffffff" />
            <circle cx="42" cy="40" r="3.5" fill="#0f172a" />
            <circle cx="41" cy="39" r="1" fill="#ffffff" />
            {/* Miner Yellow Hardhat */}
            <path d="M8 32 Q32 10 56 32 Z" fill="#eab308" />
            <rect x="4" y="30" width="56" height="7" rx="3" fill="#facc15" />
            <circle cx="32" cy="22" r="4" fill="#ffffff" filter="drop-shadow(0 0 4px #ffffff)" />
          </g>

          {/* Megaphone in Paw */}
          <g transform="translate(112, 105) rotate(-15 15 15)">
            <polygon points="5,15 28,5 28,25" fill="#ef4444" stroke="#dc2626" strokeWidth="1.5" />
            <rect x="2" y="12" width="6" height="6" rx="1" fill="#cbd5e1" />
            <path d="M6 18 L10 26 L14 26 L10 18 Z" fill="#64748b" />
          </g>
        </svg>
      );

    // 'flip': Distinct floating gold flip coin with glowing rim on casino teal green
    case "flip":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="flipTealBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#0f766e" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="coinRimGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#a16207" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#flipTealBg)" />

          {/* Motion Flip Orbit Rings */}
          <ellipse cx="100" cy="100" rx="65" ry="30" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.6" transform="rotate(-30 100 100)" />

          {/* Floating Gold Coin with Glowing Rim */}
          <g transform="translate(100, 100) rotate(15)">
            {/* Coin Rim Thickness */}
            <ellipse cx="4" cy="0" rx="32" ry="54" fill="#a16207" />
            <ellipse cx="2" cy="0" rx="31" ry="53" fill="#ca8a04" />
            {/* Front Face */}
            <ellipse cx="0" cy="0" rx="30" ry="52" fill="url(#coinRimGold)" stroke="#fef08a" strokeWidth="2.5" filter="drop-shadow(0 0 12px #eab308)" />
            {/* Inscribed Stake 'S' Emblem */}
            <text x="0" y="8" textAnchor="middle" fill="#713f12" fontSize="28" fontWeight="900" fontFamily="sans-serif">
              S
            </text>
          </g>
        </svg>
      );

    // 'slide': Distinct blue highway track with sliding numeric multiplier barrier
    case "slide":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="slideTrackBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#1d4ed8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#slideTrackBg)" />

          {/* Blue Highway Track Perspective */}
          <polygon points="30,150 170,150 120,50 80,50" fill="#1e293b" stroke="#3b82f6" strokeWidth="2.5" />
          {/* Dashed Center Road Markers */}
          <line x1="100" y1="55" x2="100" y2="70" stroke="#facc15" strokeWidth="3" />
          <line x1="100" y1="85" x2="100" y2="105" stroke="#facc15" strokeWidth="4" />
          <line x1="100" y1="120" x2="100" y2="148" stroke="#facc15" strokeWidth="5" />

          {/* Sliding Numeric Multiplier Barrier (Neon Gate) */}
          <g transform="translate(50, 85)">
            <rect x="0" y="0" width="100" height="28" rx="6" fill="#a855f7" stroke="#d8b4fe" strokeWidth="2" filter="drop-shadow(0 0 12px #a855f7)" />
            <text x="50" y="19" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="900" fontFamily="sans-serif">
              5.20x
            </text>
          </g>
        </svg>
      );

    // 'pump': Distinct large round red helium balloon about to pop on vibrant blue grid
    case "pump":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="pumpBlueGridBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#0369a1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="heliumBalloon" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ff758f" />
              <stop offset="35%" stopColor="#ef4444" />
              <stop offset="85%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#pumpBlueGridBg)" />
          
          {/* Vibrant Blue Grid Lines */}
          <path d="M40 40 H160 V160 H40 Z" stroke="#38bdf8" strokeWidth="1" strokeDasharray="12 12" opacity="0.4" />
          <line x1="70" y1="40" x2="70" y2="160" stroke="#38bdf8" strokeWidth="0.8" opacity="0.3" />
          <line x1="130" y1="40" x2="130" y2="160" stroke="#38bdf8" strokeWidth="0.8" opacity="0.3" />

          {/* Large Round Red Helium Balloon About to Pop */}
          <g transform="translate(100, 95)">
            <ellipse cx="0" cy="0" rx="46" ry="52" fill="url(#heliumBalloon)" filter="drop-shadow(0 8px 16px rgba(239,68,68,0.5))" />
            {/* Balloon Gloss Highlight */}
            <ellipse cx="-16" cy="-22" rx="12" ry="7" fill="#ffffff" fillOpacity="0.65" transform="rotate(-30 -16 -22)" />
            {/* Tie Knot at bottom */}
            <polygon points="0,52 -6,59 6,59" fill="#b91c1c" />
            {/* Floating string */}
            <path d="M0 59 Q-10 75 5 90" stroke="#cbd5e1" strokeWidth="2" fill="none" />
            {/* Tension Multiplier Text */}
            <text x="0" y="8" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="900" fontFamily="sans-serif">
              POP!
            </text>
          </g>
        </svg>
      );

    // 'baccarat': Distinct player/banker card showdown with Stake navy branded back
    case "baccarat":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="bacRedNavyBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.5" />
              <stop offset="65%" stopColor="#b45309" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#bacRedNavyBg)" />

          {/* Player Card (Left - Blue Card Front) */}
          <g transform="translate(35, 45) rotate(-6 27 40)">
            <rect x="0" y="0" width="54" height="80" rx="6" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.4))" />
            <text x="12" y="24" fill="#ffffff" fontSize="16" fontWeight="bold">8</text>
            <text x="27" y="70" textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="900">PLAYER</text>
          </g>

          {/* Banker Card (Right - Red Card Front, Winner 9) */}
          <g transform="translate(105, 42) rotate(6 27 40)">
            <rect x="0" y="0" width="54" height="80" rx="6" fill="#881337" stroke="#fb7185" strokeWidth="2" filter="drop-shadow(0 6px 14px rgba(0,0,0,0.5))" />
            <text x="12" y="24" fill="#ffffff" fontSize="16" fontWeight="bold">9</text>
            <text x="27" y="70" textAnchor="middle" fill="#fda4af" fontSize="9" fontWeight="900">BANKER</text>
          </g>

          {/* Stake Navy Branded Card Back in center foreground */}
          <g transform="translate(74, 75)">
            <rect x="0" y="0" width="52" height="76" rx="5" fill="#0f212e" stroke="#0284c7" strokeWidth="2" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.5))" />
            <rect x="5" y="5" width="42" height="66" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
            <text x="26" y="42" textAnchor="middle" fill="#00e701" fontSize="10" fontWeight="900">STAKE</text>
          </g>
        </svg>
      );

    // 'snakes': Distinct 3D white arcade snake crawling on yellow grid
    case "snakes":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="snakesYellowBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#ca8a04" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#snakesYellowBg)" />

          {/* Yellow Grid Layout */}
          <path d="M40 40 H160 V160 H40 Z" stroke="#ca8a04" strokeWidth="1.5" strokeDasharray="12 12" />
          <line x1="70" y1="40" x2="70" y2="160" stroke="#ca8a04" strokeWidth="1" strokeDasharray="12 12" opacity="0.6" />
          <line x1="100" y1="40" x2="100" y2="160" stroke="#ca8a04" strokeWidth="1" strokeDasharray="12 12" opacity="0.6" />
          <line x1="130" y1="40" x2="130" y2="160" stroke="#ca8a04" strokeWidth="1" strokeDasharray="12 12" opacity="0.6" />

          {/* 3D White Arcade Snake Crawling */}
          <g filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))">
            {/* Tail segments */}
            <rect x="52" y="118" width="18" height="18" rx="4" fill="#e2e8f0" stroke="#cbd5e1" />
            <rect x="72" y="118" width="18" height="18" rx="4" fill="#f1f5f9" stroke="#cbd5e1" />
            <rect x="92" y="118" width="18" height="18" rx="4" fill="#f8fafc" stroke="#cbd5e1" />
            <rect x="92" y="98" width="18" height="18" rx="4" fill="#ffffff" stroke="#cbd5e1" />
            <rect x="92" y="78" width="18" height="18" rx="4" fill="#ffffff" stroke="#cbd5e1" />
            <rect x="112" y="78" width="18" height="18" rx="4" fill="#ffffff" stroke="#cbd5e1" />
            
            {/* Head Segment with Face */}
            <rect x="132" y="76" width="22" height="22" rx="6" fill="#ffffff" stroke="#94a3b8" filter="drop-shadow(0 0 6px #ffffff)" />
            <circle cx="144" cy="83" r="3" fill="#0f172a" />
            <circle cx="144" cy="91" r="3" fill="#0f172a" />
            {/* Red Flicking Tongue */}
            <line x1="154" y1="87" x2="162" y2="87" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Red Golden Apple Target */}
          <circle cx="140" cy="130" r="10" fill="#ef4444" filter="drop-shadow(0 0 8px #ef4444)" />
          <rect x="139" y="116" width="2" height="5" fill="#15803d" />
        </svg>
      );

    // 'tome-of-life': Distinct mystical Egyptian ancient book with glowing purple eye of Horus
    case "tome-of-life":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="tomePurpleBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#9333ea" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#6b21a8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#tomePurpleBg)" />

          {/* Ancient Mystical Egyptian Book */}
          <g transform="translate(42, 52)">
            {/* Book Cover Backing */}
            <rect x="0" y="0" width="116" height="96" rx="8" fill="#451a03" stroke="#ca8a04" strokeWidth="3" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.5))" />
            {/* Gold Corner Clasps */}
            <polygon points="0,0 20,0 0,20" fill="#eab308" />
            <polygon points="116,0 96,0 116,20" fill="#eab308" />
            <polygon points="0,96 20,96 0,76" fill="#eab308" />
            <polygon points="116,96 96,96 116,76" fill="#eab308" />

            {/* Glowing Purple Eye of Horus in Center */}
            <circle cx="58" cy="48" r="24" fill="#581c87" stroke="#a855f7" strokeWidth="2" filter="drop-shadow(0 0 10px #a855f7)" />
            {/* Eye shape */}
            <path d="M42 48 Q58 35 74 48 Q58 61 42 48 Z" fill="#ffffff" />
            <circle cx="58" cy="48" r="7" fill="#a855f7" />
            <circle cx="58" cy="48" r="3" fill="#ffffff" />
            {/* Eye of Horus Markings */}
            <line x1="58" y1="55" x2="58" y2="65" stroke="#eab308" strokeWidth="2" />
            <path d="M66 52 Q72 62 64 66" stroke="#eab308" strokeWidth="2" fill="none" />
          </g>
        </svg>
      );

    // 'diamonds': Distinct sparkling white/blue crystal gem floating inside purple geometric frame
    case "diamonds":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="diaPurpleFrameBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#7e22ce" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#diaPurpleFrameBg)" />

          {/* Purple Geometric Frame */}
          <polygon points="100,28 162,64 162,136 100,172 38,136 38,64" stroke="#c084fc" strokeWidth="3" fill="#3b0764" fillOpacity="0.5" filter="drop-shadow(0 0 12px #a855f7)" />
          <polygon points="100,38 152,68 152,132 100,162 48,132 48,68" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 4" fill="none" />

          {/* Sparkling White/Blue Crystal Gem */}
          <g transform="translate(100, 100)">
            <polygon points="0,-48 42,-8 0,48 -42,-8" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="2" filter="drop-shadow(0 0 16px #38bdf8)" />
            {/* Gem Facets */}
            <polygon points="0,-48 20,-8 0,48" fill="#7dd3fc" opacity="0.8" />
            <polygon points="0,-48 -20,-8 0,48" fill="#0284c7" opacity="0.7" />
            <polygon points="0,-48 42,-8 20,-8" fill="#bae6fd" opacity="0.9" />
            <polygon points="0,-48 -42,-8 -20,-8" fill="#0369a1" opacity="0.9" />
            {/* Sparkle Glints */}
            <circle cx="15" cy="-20" r="3" fill="#ffffff" />
            <polygon points="25,-32 28,-22 38,-20 28,-18 25,-8 22,-18 12,-20 22,-22" fill="#ffffff" />
          </g>
        </svg>
      );

    // 'packs': Distinct gold booster pack opening with rainbow prism beams
    case "packs":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="packsPrismBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#b45309" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="rainbowPrism" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="25%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="75%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#packsPrismBg)" />

          {/* Rainbow Prism Beams radiating outward */}
          <g opacity="0.6">
            <polygon points="100,80 20,20 40,10" fill="#ef4444" opacity="0.4" />
            <polygon points="100,80 80,10 110,10" fill="#f59e0b" opacity="0.4" />
            <polygon points="100,80 160,20 180,40" fill="#10b981" opacity="0.4" />
            <polygon points="100,80 190,80 190,110" fill="#06b6d4" opacity="0.4" />
            <polygon points="100,80 180,160 160,180" fill="#8b5cf6" opacity="0.4" />
          </g>

          {/* Gold Booster Pack Opening */}
          <g transform="translate(60, 42) rotate(-8 40 60)">
            <rect x="0" y="0" width="78" height="116" rx="8" fill="#ca8a04" stroke="#fef08a" strokeWidth="3" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.5))" />
            {/* Foil Crimp Lines */}
            <rect x="0" y="8" width="78" height="8" fill="#a16207" />
            <rect x="0" y="100" width="78" height="8" fill="#a16207" />
            {/* Rainbow Tear Strip */}
            <path d="M0 35 Q39 50 78 35" stroke="url(#rainbowPrism)" strokeWidth="6" strokeLinecap="round" filter="drop-shadow(0 0 8px #facc15)" />
            {/* Stake Logo on Pack */}
            <text x="39" y="75" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900">
              STAKE
            </text>
            <text x="39" y="90" textAnchor="middle" fill="#713f12" fontSize="8" fontWeight="bold">
              BOOSTER
            </text>
          </g>
        </svg>
      );

    // 'rock-paper-scissors': Distinct red card with white cartoon hands for Rock, Paper, and Scissors
    case "rock-paper-scissors":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="rpsRedCardBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#991b1b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#rpsRedCardBg)" />

          {/* Red Card Base */}
          <rect x="38" y="32" width="124" height="136" rx="12" fill="#991b1b" stroke="#ef4444" strokeWidth="3" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.5))" />

          {/* White Cartoon Hands */}
          {/* 1. Rock (Fist) Top Left */}
          <g transform="translate(68, 62)">
            <circle cx="0" cy="0" r="20" fill="#1e293b" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="7" textAnchor="middle" fontSize="16">✊</text>
            <text x="0" y="28" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">ROCK</text>
          </g>

          {/* 2. Paper (Open Palm) Top Right */}
          <g transform="translate(132, 62)">
            <circle cx="0" cy="0" r="20" fill="#1e293b" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="7" textAnchor="middle" fontSize="16">✋</text>
            <text x="0" y="28" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">PAPER</text>
          </g>

          {/* 3. Scissors (Peace/Cut) Bottom Center */}
          <g transform="translate(100, 124)">
            <circle cx="0" cy="0" r="20" fill="#1e293b" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="7" textAnchor="middle" fontSize="16">✌️</text>
            <text x="0" y="28" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">SCISSORS</text>
          </g>
        </svg>
      );

    // 'drill': Distinct futuristic yellow and blue rotary drill digging into golden crystal ore
    case "drill":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="drillFutureBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
              <stop offset="65%" stopColor="#eab308" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#drillFutureBg)" />

          {/* Golden Crystal Ore at Bottom */}
          <g transform="translate(100, 155)">
            <polygon points="-40,0 -20,-25 0,-10 25,-30 45,0" fill="#eab308" stroke="#fde047" strokeWidth="2" filter="drop-shadow(0 0 10px #eab308)" />
            <polygon points="-10,0 5,-18 20,0" fill="#facc15" />
          </g>

          {/* Futuristic Yellow & Blue Rotary Drill */}
          <g transform="translate(100, 80)">
            {/* Blue Chassis Body */}
            <rect x="-24" y="-55" width="48" height="38" rx="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="2.5" />
            <circle cx="0" cy="-36" r="8" fill="#38bdf8" />
            {/* Yellow Rotary Motor Housing */}
            <rect x="-18" y="-17" width="36" height="15" rx="3" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />

            {/* Rotary Spiral Drill Cone Bit */}
            <polygon points="-22,-2 22,-2 0,62" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
            {/* Helical Spiral Grooves */}
            <path d="M-20 12 Q0 22 20 12 M-14 30 Q0 38 14 30 M-7 46 Q0 52 7 46" stroke="#0284c7" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </g>

          {/* Golden Sparks from Digging */}
          <circle cx="95" cy="148" r="3" fill="#facc15" />
          <circle cx="108" cy="144" r="2.5" fill="#f59e0b" />
          <circle cx="85" cy="150" r="2" fill="#38bdf8" />
        </svg>
      );

    // 'prime-dice': Distinct royal crown resting over neon blue crystal dice
    case "prime-dice":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="primeDiceBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#0891b2" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#primeDiceBg)" />

          {/* Royal Crown Resting Over */}
          <g transform="translate(68, 38)">
            <polygon points="0,32 10,12 32,24 54,12 64,32" fill="#eab308" stroke="#fef08a" strokeWidth="2" filter="drop-shadow(0 0 8px #eab308)" />
            <circle cx="10" cy="12" r="3" fill="#ef4444" />
            <circle cx="32" cy="24" r="3" fill="#38bdf8" />
            <circle cx="54" cy="12" r="3" fill="#ef4444" />
            <rect x="0" y="30" width="64" height="6" rx="2" fill="#ca8a04" />
          </g>

          {/* Neon Blue Crystal Dice */}
          <g transform="translate(65, 75)">
            <rect x="0" y="0" width="70" height="70" rx="14" fill="#0f172a" stroke="#06b6d4" strokeWidth="3.5" filter="drop-shadow(0 0 16px #06b6d4)" />
            {/* Center Prime Number 7 or Dots */}
            <circle cx="20" cy="20" r="4.5" fill="#06b6d4" filter="drop-shadow(0 0 4px #06b6d4)" />
            <circle cx="35" cy="35" r="4.5" fill="#06b6d4" filter="drop-shadow(0 0 4px #06b6d4)" />
            <circle cx="50" cy="50" r="4.5" fill="#06b6d4" filter="drop-shadow(0 0 4px #06b6d4)" />
            <circle cx="50" cy="20" r="4.5" fill="#06b6d4" filter="drop-shadow(0 0 4px #06b6d4)" />
            <circle cx="20" cy="50" r="4.5" fill="#06b6d4" filter="drop-shadow(0 0 4px #06b6d4)" />
          </g>
        </svg>
      );

    // 'darts': Distinct concentric dartboard target with neon green, red, and yellow rings
    case "darts":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="dartsBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#047857" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#dartsBg)" />

          {/* Concentric Dartboard Target */}
          <circle cx="100" cy="100" r="66" fill="#1e293b" stroke="#334155" strokeWidth="4" filter="drop-shadow(0 6px 14px rgba(0,0,0,0.5))" />
          {/* Neon Green Outer Ring */}
          <circle cx="100" cy="100" r="54" fill="none" stroke="#00e701" strokeWidth="6" strokeDasharray="14 10" filter="drop-shadow(0 0 6px #00e701)" />
          {/* Red Middle Ring */}
          <circle cx="100" cy="100" r="38" fill="none" stroke="#ef4444" strokeWidth="6" strokeDasharray="12 8" filter="drop-shadow(0 0 6px #ef4444)" />
          {/* Yellow Inner Ring */}
          <circle cx="100" cy="100" r="22" fill="none" stroke="#facc15" strokeWidth="5" strokeDasharray="8 6" filter="drop-shadow(0 0 6px #facc15)" />
          {/* Bullseye Green & Red Center */}
          <circle cx="100" cy="100" r="14" fill="#00e701" />
          <circle cx="100" cy="100" r="6" fill="#ef4444" />

          {/* Embedded Dart */}
          <g transform="translate(100, 100) rotate(-35)">
            <line x1="0" y1="0" x2="65" y2="0" stroke="#f1f5f9" strokeWidth="3" strokeLinecap="round" />
            <polygon points="45,-6 65,0 45,6" fill="#ef4444" />
          </g>
        </svg>
      );

    // 'cases': Distinct purple loot crate / mystery box with lock mechanism
    case "cases":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="casesPurpleBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#6d28d9" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#casesPurpleBg)" />
          {/* Shadow */}
          <ellipse cx="100" cy="158" rx="55" ry="12" fill="#000" fillOpacity="0.45" filter="blur(6px)" />

          {/* Purple Loot Crate / Mystery Box */}
          <g transform="translate(48, 55)">
            {/* Box Body */}
            <rect x="0" y="24" width="104" height="66" rx="8" fill="#581c87" stroke="#a855f7" strokeWidth="3" />
            {/* Lid */}
            <rect x="-4" y="8" width="112" height="22" rx="4" fill="#6b21a8" stroke="#c084fc" strokeWidth="2.5" />
            {/* Reinforced Edge Straps */}
            <rect x="18" y="24" width="12" height="66" fill="#3b0764" />
            <rect x="74" y="24" width="12" height="66" fill="#3b0764" />

            {/* Glowing Center Lock Mechanism */}
            <circle cx="52" cy="46" r="14" fill="#00e701" stroke="#ffffff" strokeWidth="2" filter="drop-shadow(0 0 10px #00e701)" />
            {/* Keyhole */}
            <circle cx="52" cy="44" r="3" fill="#0f172a" />
            <polygon points="51,44 53,44 54,51 50,51" fill="#0f172a" />
          </g>
        </svg>
      );

    // 'scarab-spin': Distinct golden Pharaoh mask and Egyptian scarab jewel on orange sands
    case "scarab-spin":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="scarabOrangeBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#d97706" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#scarabOrangeBg)" />

          {/* Egyptian Scarab Jewel Body */}
          <g transform="translate(100, 100)">
            {/* Golden Scarab Wings */}
            <path d="M-15 -10 Q-65 -30 -55 25 Q-30 45 -5 18 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
            <path d="M15 -10 Q65 -30 55 25 Q30 45 5 18 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
            
            {/* Turquoise Gemstone Shell */}
            <ellipse cx="0" cy="8" rx="20" ry="28" fill="#0284c7" stroke="#eab308" strokeWidth="3" filter="drop-shadow(0 0 10px #0284c7)" />
            {/* Shell division line */}
            <line x1="0" y1="-20" x2="0" y2="36" stroke="#ca8a04" strokeWidth="2" />
            
            {/* Pharaoh Golden Head & Sun Disk */}
            <circle cx="0" cy="-35" r="14" fill="#facc15" filter="drop-shadow(0 0 8px #facc15)" />
            <circle cx="0" cy="-35" r="7" fill="#ef4444" />
          </g>
        </svg>
      );

    // 'video-poker': Distinct royal flush card hand fan on red casino background
    case "video-poker":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="vpRedBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#b91c1c" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#7f1d1d" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#vpRedBg)" />

          {/* Royal Flush Card Hand Fan (10, J, Q, K, A of Spades) */}
          <g transform="translate(100, 115)">
            {/* Card 10 */}
            <g transform="rotate(-24) translate(-20, -65)">
              <rect x="0" y="0" width="34" height="52" rx="4" fill="#ffffff" stroke="#cbd5e1" />
              <text x="6" y="16" fill="#0f172a" fontSize="10" fontWeight="bold">10</text>
              <text x="17" y="36" textAnchor="middle" fill="#0f172a" fontSize="16">♠</text>
            </g>
            {/* Card J */}
            <g transform="rotate(-12) translate(-18, -68)">
              <rect x="0" y="0" width="34" height="52" rx="4" fill="#ffffff" stroke="#cbd5e1" />
              <text x="6" y="16" fill="#0f172a" fontSize="11" fontWeight="bold">J</text>
              <text x="17" y="36" textAnchor="middle" fill="#0f172a" fontSize="16">♠</text>
            </g>
            {/* Card Q */}
            <g transform="rotate(0) translate(-17, -72)">
              <rect x="0" y="0" width="34" height="52" rx="4" fill="#ffffff" stroke="#cbd5e1" />
              <text x="6" y="16" fill="#dc2626" fontSize="11" fontWeight="bold">Q</text>
              <text x="17" y="36" textAnchor="middle" fill="#0f172a" fontSize="16">♠</text>
            </g>
            {/* Card K */}
            <g transform="rotate(12) translate(-16, -68)">
              <rect x="0" y="0" width="34" height="52" rx="4" fill="#ffffff" stroke="#cbd5e1" />
              <text x="6" y="16" fill="#0f172a" fontSize="11" fontWeight="bold">K</text>
              <text x="17" y="36" textAnchor="middle" fill="#0f172a" fontSize="16">♠</text>
            </g>
            {/* Card A */}
            <g transform="rotate(24) translate(-14, -65)">
              <rect x="0" y="0" width="34" height="52" rx="4" fill="#ffffff" stroke="#cbd5e1" />
              <text x="6" y="16" fill="#dc2626" fontSize="11" fontWeight="bold">A</text>
              <text x="17" y="36" textAnchor="middle" fill="#0f172a" fontSize="16">♠</text>
            </g>
          </g>

          {/* Royal Flush Gold Banner */}
          <g transform="translate(42, 142)">
            <rect x="0" y="0" width="116" height="22" rx="11" fill="#eab308" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.4))" />
            <text x="58" y="15" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="900" letterSpacing="0.5">
              ROYAL FLUSH
            </text>
          </g>
        </svg>
      );

    // 'bars': Distinct vintage neon gold casino BAR symbols on warm amber background
    case "bars":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="barAmberBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#b45309" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#barAmberBg)" />

          {/* Vintage Neon Gold Casino BAR Stack */}
          <g transform="translate(42, 50)">
            {/* BAR 1 (Gold Neon) */}
            <rect x="0" y="0" width="116" height="28" rx="6" fill="#eab308" stroke="#fef08a" strokeWidth="2" filter="drop-shadow(0 0 8px #eab308)" />
            <text x="58" y="20" textAnchor="middle" fill="#713f12" fontSize="16" fontWeight="900" letterSpacing="3">BAR</text>

            {/* BAR 2 (Silver Chrome) */}
            <rect x="8" y="36" width="100" height="28" rx="6" fill="#cbd5e1" stroke="#ffffff" strokeWidth="2" filter="drop-shadow(0 0 6px #cbd5e1)" />
            <text x="58" y="56" textAnchor="middle" fill="#334155" fontSize="16" fontWeight="900" letterSpacing="3">BAR</text>

            {/* BAR 3 (Gold Neon) */}
            <rect x="16" y="72" width="84" height="28" rx="6" fill="#eab308" stroke="#fef08a" strokeWidth="2" filter="drop-shadow(0 0 8px #eab308)" />
            <text x="58" y="92" textAnchor="middle" fill="#713f12" fontSize="16" fontWeight="900" letterSpacing="3">BAR</text>
          </g>
        </svg>
      );

    // 'blue-samurai': Distinct traditional samurai kabuto helmet in cobalt blue and gold crest
    case "blue-samurai":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="samCobaltBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.55" />
              <stop offset="70%" stopColor="#1e3a8a" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#samCobaltBg)" />

          {/* Traditional Samurai Kabuto Helmet */}
          <g transform="translate(100, 95)">
            {/* Cobalt Blue Dome */}
            <path d="M-40 10 Q0 -45 40 10 Z" fill="#1e40af" stroke="#60a5fa" strokeWidth="2.5" />
            {/* Gold Crescent Maedate Horn Crest */}
            <path d="M-42 -20 Q0 -55 42 -20 Q0 -40 -42 -20 Z" fill="#eab308" stroke="#fef08a" strokeWidth="1.5" filter="drop-shadow(0 0 8px #eab308)" />
            <circle cx="0" cy="-28" r="6" fill="#facc15" />

            {/* Neck Guard Plates (Shikoro) */}
            <path d="M-45 10 L-55 35 L-30 35 L-25 10 Z" fill="#1e3a8a" stroke="#3b82f6" />
            <path d="M45 10 L55 35 L30 35 L25 10 Z" fill="#1e3a8a" stroke="#3b82f6" />

            {/* Fierce Face Mask (Menpo) */}
            <path d="M-25 10 Q0 42 25 10 Z" fill="#0f172a" stroke="#ca8a04" strokeWidth="2" />
            {/* Gold Moustache & Teeth */}
            <line x1="-15" y1="22" x2="15" y2="22" stroke="#eab308" strokeWidth="3" />
          </g>
        </svg>
      );

    // 'plinko-magnets': Distinct purple plinko board with blue magnetic forcefield rings
    case "plinko-magnets":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="plinkoMagBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#9333ea" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#6b21a8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#plinkoMagBg)" />

          {/* Blue Magnetic Forcefield Rings */}
          <circle cx="100" cy="100" r="50" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 6" filter="drop-shadow(0 0 8px #38bdf8)" />
          <circle cx="100" cy="100" r="35" fill="none" stroke="#00e701" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Horseshoe Magnet */}
          <g transform="translate(100, 100)">
            <path d="M-35 25 L-35 -15 A35 35 0 0 1 35 -15 L35 25" stroke="#ef4444" strokeWidth="18" fill="none" />
            {/* Silver / Blue Magnetic Poles */}
            <rect x="-44" y="20" width="18" height="14" fill="#e2e8f0" />
            <rect x="26" y="20" width="18" height="14" fill="#38bdf8" />
          </g>

          {/* Deflected Plinko Gold Discs */}
          <circle cx="100" cy="62" r="7" fill="#facc15" filter="drop-shadow(0 0 6px #facc15)" />
          <circle cx="70" cy="120" r="6" fill="#facc15" />
          <circle cx="130" cy="120" r="6" fill="#facc15" />
        </svg>
      );

    // ==========================================
    // 2. EXTERNAL SLOTS (GATES, SWEET BONANZA, WANTED, SUGAR RUSH, ETC.)
    // ==========================================

    // Gates of Olympus: Real Zeus portrait with glowing lightning eyes on Greek temple backdrop
    case "gates-of-olympus":
    case "gates-of-olympus-1000":
    case "gates-olympus-1000":
    case "gates-olympus-2500":
    case "gates-olympus-super-scatter":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="zeusBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#78350f" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#zeusBg)" />

          {/* Greek Temple Pillars in Background */}
          <rect x="35" y="45" width="14" height="110" fill="#475569" stroke="#64748b" />
          <rect x="151" y="45" width="14" height="110" fill="#475569" stroke="#64748b" />
          <rect x="25" y="38" width="150" height="10" fill="#64748b" />

          {/* Zeus Majestic Silhouette / Portrait */}
          <g transform="translate(100, 105)">
            {/* Flowing White Hair & Cloud Cape */}
            <circle cx="0" cy="-25" r="32" fill="#e2e8f0" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.5))" />
            {/* Royal Gold Laurel Crown */}
            <path d="M-22 -45 Q0 -52 22 -45" stroke="#eab308" strokeWidth="4" fill="none" />
            {/* Zeus Face */}
            <ellipse cx="0" cy="-22" rx="20" ry="24" fill="#fed7aa" />
            {/* Glowing Lightning Eyes */}
            <ellipse cx="-7" cy="-25" rx="3.5" ry="2" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)" />
            <ellipse cx="7" cy="-25" rx="3.5" ry="2" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)" />
            {/* Flowing White Beard */}
            <path d="M-18 -12 Q0 28 18 -12 Q0 42 -18 -12 Z" fill="#ffffff" />
            {/* Golden Armor Toga */}
            <path d="M-35 30 L35 30 L25 60 L-25 60 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
          </g>

          {/* Giant Zeus Lightning Bolt */}
          <polygon points="120,25 95,75 118,75 92,125 138,55 115,55" fill="#fde047" stroke="#ffffff" strokeWidth="1.5" filter="drop-shadow(0 0 10px #fde047)" />
        </svg>
      );

    // Sweet Bonanza: Swirled pink/white lollipop and colorful fruit candies on pink candy clouds
    case "sweet-bonanza":
    case "sweet-bonanza-1000":
    case "sweet-bonanza-xmas":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="sweetBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#db2777" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#sweetBg)" />

          {/* Pink Candy Clouds */}
          <ellipse cx="60" cy="140" rx="35" ry="18" fill="#fbcfe8" opacity="0.6" />
          <ellipse cx="140" cy="145" rx="40" ry="20" fill="#fbcfe8" opacity="0.6" />

          {/* Swirled Pink/White Giant Lollipop */}
          <g transform="translate(100, 85)">
            {/* White Stick */}
            <rect x="-4" y="25" width="8" height="55" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            {/* Swirl Spiral Disc */}
            <circle cx="0" cy="0" r="38" fill="#ec4899" stroke="#f472b6" strokeWidth="3" filter="drop-shadow(0 6px 12px rgba(236,72,153,0.4))" />
            <path d="M0 -34 A34 34 0 0 1 34 0 A34 34 0 0 1 0 34 A34 34 0 0 1 -34 0 Z" fill="#ffffff" opacity="0.4" />
            <path d="M0 -25 A25 25 0 0 1 25 0 A25 25 0 0 1 0 25 A25 25 0 0 1 -25 0 Z" fill="#ec4899" />
            <path d="M0 -15 A15 15 0 0 1 15 0 A15 15 0 0 1 0 15 A15 15 0 0 1 -15 0 Z" fill="#ffffff" />
          </g>

          {/* Colorful Fruit Candies (Red Heart, Grape, Banana, Apple) */}
          <circle cx="50" cy="65" r="14" fill="#ef4444" filter="drop-shadow(0 0 6px #ef4444)" />
          <polygon points="150,55 162,75 138,75" fill="#a855f7" filter="drop-shadow(0 0 6px #a855f7)" />
          <ellipse cx="152" cy="120" rx="12" ry="16" fill="#eab308" />
        </svg>
      );

    // Wanted Dead or a Wild: Gritty western bandit with smoking revolver in sepia/orange desert
    case "wanted-dead-or-a-wild":
    case "wanted-dead-or-wild":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="wantedSepiaBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ea580c" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#7c2d12" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#wantedSepiaBg)" />

          {/* Desert Sunset Horizon & Saguaro Cactus */}
          <line x1="30" y1="145" x2="170" y2="145" stroke="#7c2d12" strokeWidth="3" />
          <path d="M150 145 V110 H158 V125 H162 V118 H158 V105 H150 V145" fill="#451a03" />

          {/* Gritty Western Bandit with Cowboy Hat */}
          <g transform="translate(100, 85)">
            {/* Wide Brim Cowboy Hat */}
            <ellipse cx="0" cy="-22" rx="42" ry="12" fill="#292524" />
            <path d="M-22 -22 Q0 -44 22 -22 Z" fill="#1c1917" />
            {/* Bandit Face Mask / Bandana */}
            <polygon points="-18,-5 18,-5 0,22" fill="#b91c1c" stroke="#991b1b" />
            {/* Intense Eyes in Shadow */}
            <ellipse cx="-10" cy="-12" rx="3" ry="1.5" fill="#facc15" />
            <ellipse cx="10" cy="-12" rx="3" ry="1.5" fill="#facc15" />
          </g>

          {/* Smoking Revolver Pistol Barrel */}
          <g transform="translate(68, 120)">
            <rect x="0" y="8" width="50" height="12" rx="2" fill="#78716c" stroke="#292524" strokeWidth="2" />
            <rect x="40" y="4" width="18" height="20" rx="3" fill="#44403c" />
            {/* Muzzle Flash & Smoke */}
            <circle cx="-6" cy="14" r="7" fill="#cbd5e1" opacity="0.6" filter="blur(2px)" />
            <circle cx="-14" cy="8" r="5" fill="#cbd5e1" opacity="0.4" filter="blur(2px)" />
          </g>
        </svg>
      );

    // Sugar Rush 1000: Colorful gummy bears and multiplier candies on pink lollipop clouds
    case "sugar-rush":
    case "sugar-rush-1000":
    case "sugar-rush-xmas":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="sugarBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d946ef" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#a21caf" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#sugarBg)" />

          {/* Cute Pink Gummy Bear in Center */}
          <g transform="translate(100, 95)">
            {/* Body */}
            <ellipse cx="0" cy="10" rx="26" ry="32" fill="#ec4899" stroke="#f472b6" strokeWidth="2.5" filter="drop-shadow(0 6px 14px rgba(236,72,153,0.5))" />
            {/* Head */}
            <circle cx="0" cy="-24" r="22" fill="#ec4899" stroke="#f472b6" strokeWidth="2" />
            {/* Ears */}
            <circle cx="-18" cy="-38" r="8" fill="#ec4899" />
            <circle cx="18" cy="-38" r="8" fill="#ec4899" />
            {/* Face Snout */}
            <ellipse cx="0" cy="-20" rx="8" ry="6" fill="#fbcfe8" />
            <circle cx="0" cy="-22" r="3" fill="#831843" />
            <circle cx="-8" cy="-28" r="3" fill="#0f172a" />
            <circle cx="8" cy="-28" r="3" fill="#0f172a" />
          </g>

          {/* Multiplier Candy Pill */}
          <g transform="translate(45, 140)">
            <rect x="0" y="0" width="110" height="24" rx="12" fill="#f59e0b" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.4))" />
            <text x="55" y="16" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900">
              1,024x MULTI
            </text>
          </g>
        </svg>
      );

    // ==========================================
    // 3. LIVE DEALERS & GAME SHOWS
    // ==========================================

    // Crazy Time: Live female host in red/gold circus ringmaster costume beside the massive wheel
    case "crazy-time":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="ctGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#ctGlow)" />

          {/* Massive Wheel in Background */}
          <circle cx="75" cy="95" r="58" fill="#1e293b" stroke="#ec4899" strokeWidth="4" />
          <path d="M75 95 L50 40 A58 58 0 0 1 100 40 Z" fill="#eab308" />
          <path d="M75 95 L100 40 A58 58 0 0 1 130 80 Z" fill="#06b6d4" />
          <path d="M75 95 L130 80 A58 58 0 0 1 110 135 Z" fill="#10b981" />
          <path d="M75 95 L110 135 A58 58 0 0 1 50 145 Z" fill="#ef4444" />

          {/* Live Female Host in Red/Gold Ringmaster Costume */}
          <g transform="translate(132, 75)">
            {/* Top Hat Ringmaster */}
            <rect x="0" y="0" width="22" height="18" fill="#b91c1c" stroke="#facc15" strokeWidth="1.5" />
            <ellipse cx="11" cy="18" rx="16" ry="4" fill="#ca8a04" />
            {/* Host Face & Hair */}
            <circle cx="11" cy="30" r="12" fill="#fed7aa" />
            {/* Red Tuxedo / Ringmaster Jacket */}
            <path d="M-5 42 L27 42 L22 80 L0 80 Z" fill="#b91c1c" stroke="#facc15" strokeWidth="1.5" />
            <polygon points="11,42 6,55 16,55" fill="#facc15" />
          </g>

          {/* Red LIVE pill */}
          <rect x="72" y="20" width="56" height="20" rx="10" fill="#dc2626" />
          <circle cx="84" cy="30" r="3" fill="#ffffff" />
          <text x="105" y="34" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900">LIVE</text>
        </svg>
      );

    // Lightning Roulette: Studio dealer in black waistcoat next to glowing Art Deco gold lightning pillars
    case "lightning-roulette":
    case "red-door-roulette":
    case "gold-vault-roulette":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="lrGoldBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#a16207" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#lrGoldBg)" />

          {/* Glowing Art Deco Gold Lightning Pillars */}
          <rect x="25" y="45" width="16" height="110" fill="#1e293b" stroke="#eab308" strokeWidth="2" filter="drop-shadow(0 0 8px #eab308)" />
          <rect x="159" y="45" width="16" height="110" fill="#1e293b" stroke="#eab308" strokeWidth="2" filter="drop-shadow(0 0 8px #eab308)" />

          {/* Studio Dealer in Black Waistcoat */}
          <g transform="translate(100, 95)">
            {/* Dealer Head */}
            <circle cx="0" cy="-25" r="16" fill="#fed7aa" />
            {/* White Shirt Collar */}
            <polygon points="0,-12 -12,-5 12,-5" fill="#ffffff" />
            {/* Black Waistcoat */}
            <path d="M-22 5 L22 5 L16 55 L-16 55 Z" fill="#0f172a" stroke="#ca8a04" strokeWidth="1.5" />
            {/* Black Bowtie */}
            <polygon points="-6,-9 6,-9 0,-6" fill="#0f172a" />
          </g>

          {/* Gold Lightning Bolt striking */}
          <polygon points="105,20 85,65 105,65 90,110" fill="#fde047" filter="drop-shadow(0 0 12px #fde047)" />

          {/* Red LIVE pill */}
          <rect x="72" y="20" width="56" height="20" rx="10" fill="#dc2626" />
          <circle cx="84" cy="30" r="3" fill="#ffffff" />
          <text x="105" y="34" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900">500x</text>
        </svg>
      );

    // Live Blackjack: Professional dealer in burgundy dress holding dealt blackjack hand
    case "blackjack-live":
    case "live-blackjack":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="bjLiveBurgundyBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#881337" stopOpacity="0.55" />
              <stop offset="70%" stopColor="#4c0519" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#bjLiveBurgundyBg)" />

          {/* Professional Dealer in Burgundy Dress */}
          <g transform="translate(100, 85)">
            {/* Dealer Head & Hair */}
            <circle cx="0" cy="-24" r="18" fill="#fed7aa" />
            <path d="M-18 -32 Q0 -44 18 -32 Q22 -15 18 5 Q-18 5 -18 -32 Z" fill="#451a03" />
            {/* Elegant Burgundy Dress */}
            <path d="M-22 5 C-22 5 -12 25 0 25 C12 25 22 5 22 5 L28 65 L-28 65 Z" fill="#881337" stroke="#be123c" strokeWidth="1.5" />
          </g>

          {/* Dealt Blackjack Cards Held in Hands */}
          <g transform="translate(75, 115)">
            <rect x="0" y="0" width="28" height="40" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            <text x="5" y="14" fill="#0f172a" fontSize="10" fontWeight="bold">A</text>
            <text x="14" y="28" textAnchor="middle" fill="#0f172a" fontSize="14">♠</text>

            <rect x="22" y="5" width="28" height="40" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            <text x="27" y="19" fill="#dc2626" fontSize="10" fontWeight="bold">K</text>
            <text x="36" y="33" textAnchor="middle" fill="#dc2626" fontSize="14">♥</text>
          </g>

          {/* Red LIVE pill */}
          <rect x="72" y="20" width="56" height="20" rx="10" fill="#dc2626" />
          <circle cx="84" cy="30" r="3" fill="#ffffff" />
          <text x="105" y="34" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900">LIVE</text>
        </svg>
      );

    // Other Live Games / Studio Games
    case "roulette-live":
    case "immersive-roulette":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="85" fill="#1e1b4b" opacity="0.5" />
          <circle cx="100" cy="105" r="58" fill="#1e293b" stroke="#eab308" strokeWidth="4" />
          <circle cx="100" cy="105" r="42" fill="#7f1d1d" stroke="#ca8a04" strokeWidth="2" />
          <circle cx="100" cy="105" r="16" fill="#ca8a04" />
          <rect x="72" y="20" width="56" height="20" rx="10" fill="#dc2626" />
          <circle cx="84" cy="30" r="3" fill="#ffffff" />
          <text x="105" y="34" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900">LIVE</text>
        </svg>
      );

    case "baccarat-live":
    case "lightning-baccarat":
    case "peek-baccarat":
    case "bac-bo":
    case "dragon-tiger":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="85" fill="#064e3b" opacity="0.5" />
          {/* Dragon Tiger / Baccarat Golden Dragon */}
          <path d="M40 120 Q80 60 120 70 Q160 80 150 120" stroke="#facc15" strokeWidth="8" fill="none" />
          <rect x="50" y="90" width="35" height="50" rx="4" fill="#1e3a8a" stroke="#60a5fa" />
          <rect x="115" y="90" width="35" height="50" rx="4" fill="#881337" stroke="#fb7185" />
          <rect x="72" y="20" width="56" height="20" rx="10" fill="#dc2626" />
          <circle cx="84" cy="30" r="3" fill="#ffffff" />
          <text x="105" y="34" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900">LIVE</text>
        </svg>
      );

    case "poker-live":
    case "casino-holdem":
    case "extreme-texas-holdem":
    case "texas-holdem-bonus":
    case "caribbean-stud":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="85" fill="#1e3a8a" opacity="0.5" />
          <ellipse cx="100" cy="135" rx="55" ry="16" fill="#eab308" />
          <rect x="65" y="75" width="30" height="45" rx="4" fill="#ffffff" stroke="#cbd5e1" />
          <text x="75" y="95" fill="#dc2626" fontSize="12" fontWeight="bold">A♥</text>
          <rect x="105" y="75" width="30" height="45" rx="4" fill="#ffffff" stroke="#cbd5e1" />
          <text x="115" y="95" fill="#0f172a" fontSize="12" fontWeight="bold">A♠</text>
          <rect x="72" y="20" width="56" height="20" rx="10" fill="#dc2626" />
          <circle cx="84" cy="30" r="3" fill="#ffffff" />
          <text x="105" y="34" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900">POKER</text>
        </svg>
      );

    case "monopoly":
    case "monopoly-live":
    case "monopoly-big-baller":
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="85" fill="#0284c7" opacity="0.5" />
          {/* Mr Monopoly with Top Hat */}
          <rect x="75" y="45" width="50" height="35" rx="4" fill="#0f172a" />
          <ellipse cx="100" cy="80" rx="36" ry="8" fill="#1e293b" />
          <circle cx="100" cy="105" r="22" fill="#fed7aa" />
          {/* Big White Moustache */}
          <path d="M85 112 Q100 120 115 112 Q100 106 85 112 Z" fill="#ffffff" />
          <rect x="72" y="20" width="56" height="20" rx="10" fill="#dc2626" />
          <circle cx="84" cy="30" r="3" fill="#ffffff" />
          <text x="105" y="34" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900">LIVE</text>
        </svg>
      );

          return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="stakeChipBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00e701" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#059669" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="85" fill="url(#stakeChipBg)" />
          {/* Casino Geometric Medallion */}
          <circle cx="100" cy="100" r="56" fill="#1a2c38" stroke="#213743" strokeWidth="4" />
          <circle cx="100" cy="100" r="46" fill="#0f212e" stroke="#00e701" strokeWidth="2" strokeDasharray="8 6" />
          {/* Stake Brand 'S' Emblem */}
          <text x="100" y="114" textAnchor="middle" fill="#00e701" fontSize="38" fontWeight="900" fontFamily="sans-serif">
            S
          </text>
        </svg>
      );
  }
}
