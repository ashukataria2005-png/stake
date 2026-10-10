"use client";

import React from "react";

interface MinesBombProps {
  exploded?: boolean;
  dimmed?: boolean;
  animations?: boolean;
  id?: string | number;
  className?: string;
}

export default function MinesBomb({
  exploded = false,
  dimmed = false,
  animations = true,
  id = 0,
  className = "",
}: MinesBombProps) {
  const uid = `bomb-${id}`;

  if (dimmed) {
    return (
      <div className={`opacity-50 flex items-center justify-center ${className}`}>
        <svg
          viewBox="0 0 64 64"
          className="h-7 w-7 sm:h-8 sm:w-8 drop-shadow-[0_0_8px_rgba(233,17,60,0.5)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Translucent Sphere Body */}
          <circle cx="28" cy="36" r="19" fill="#3a0d14" stroke="#e9113c" strokeWidth="1.2" />
          {/* Subtle Specular Arc */}
          <ellipse cx="22" cy="29" rx="5.5" ry="3" transform="rotate(-30 22 29)" fill="#ffffff" fillOpacity="0.18" />
          {/* Collar */}
          <rect x="23" y="13.5" width="10" height="5" rx="1.5" fill="#334155" stroke="#991b1b" strokeWidth="0.8" />
          {/* Wick */}
          <path d="M28 13.5 C 28 6.5, 37 8, 43 6.5" stroke="#b45309" strokeWidth="2.2" strokeLinecap="round" />
          {/* Spark Tip */}
          <circle cx="43" cy="6.5" r="2.5" fill="#e9113c" />
        </svg>
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 64 64"
      className={`h-8 w-8 sm:h-10 sm:w-10 ${
        exploded
          ? `drop-shadow-[0_0_24px_rgba(233,17,60,0.95)] ${animations ? "animate-bomb-shake" : ""}`
          : "drop-shadow-[0_0_16px_rgba(233,17,60,0.8)]"
      } ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Radial Crimson Body Gradient */}
        <radialGradient id={`body-${uid}`} cx="35%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#ff4d6d" />
          <stop offset="30%" stopColor="#ff2a55" />
          <stop offset="65%" stopColor="#e9113c" />
          <stop offset="90%" stopColor="#a30a28" />
          <stop offset="100%" stopColor="#590012" />
        </radialGradient>

        {/* Ambient Crimson Glow */}
        <radialGradient id={`glow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff2a55" stopOpacity="0.85" />
          <stop offset="65%" stopColor="#e9113c" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {/* Starburst Spark Glow */}
        <radialGradient id={`sparkGlow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#ffe600" />
          <stop offset="75%" stopColor="#ff6b00" />
          <stop offset="100%" stopColor="#e9113c" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 1. Ambient Crimson Underglow */}
      <circle cx="28" cy="36" r="23" fill={`url(#glow-${uid})`} />

      {/* 2. Crisp Circular Sphere Body */}
      <circle
        cx="28"
        cy="36"
        r="19"
        fill={`url(#body-${uid})`}
        stroke="#ff2a55"
        strokeWidth="1.2"
        strokeOpacity="0.9"
      />

      {/* 3. Gloss Specular Highlight Arc */}
      <ellipse
        cx="22"
        cy="29"
        rx="5.8"
        ry="3.2"
        transform="rotate(-30 22 29)"
        fill="#ffffff"
        fillOpacity="0.32"
      />
      <circle cx="19.5" cy="26.5" r="1.6" fill="#ffffff" fillOpacity="0.65" />

      {/* 4. Top Cylindrical Collar */}
      <rect
        x="23"
        y="13.5"
        width="10"
        height="5"
        rx="1.5"
        fill="#334155"
        stroke="#e9113c"
        strokeWidth="1"
      />
      <ellipse cx="28" cy="13.5" rx="5" ry="1.2" fill="#475569" />

      {/* 5. Angled Wick/Fuse */}
      <path
        d="M28 13.5 C 28 6.5, 37 8, 43 6.5"
        stroke="#d97706"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* 6. Yellow-White Starburst Spark */}
      <circle cx="43" cy="6.5" r="7" fill={`url(#sparkGlow-${uid})`} />
      <polygon
        points="43,1 44.5,5 49,4 46,7.5 48.5,11.5 44.5,9.5 42,13.5 41.5,9 37.5,7 41.5,5"
        fill="#ffe600"
      />
      <polygon
        points="43,3 44,5.5 47,4.8 45,7.2 46.5,10 43.8,8.8 42,11.5 41.8,8.2 39,7 41.8,5.8"
        fill="#ffffff"
      />
      <circle cx="43" cy="6.5" r="2" fill="#ffffff" />
    </svg>
  );
}
