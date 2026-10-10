"use client";

import React from "react";

interface MinesGemProps {
  dimmed?: boolean;
  animations?: boolean;
  id?: string | number;
  className?: string;
}

export default function MinesGem({
  dimmed = false,
  animations = true,
  id = 0,
  className = "",
}: MinesGemProps) {
  const uid = `gem-${id}`;

  if (dimmed) {
    return (
      <div className={`opacity-45 flex items-center justify-center ${className}`}>
        <svg
          viewBox="0 0 64 64"
          className="h-7 w-7 sm:h-8 sm:w-8 drop-shadow-[0_0_8px_rgba(0,231,1,0.4)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Table */}
          <polygon
            points="22,13 42,13 38,20 26,20"
            fill="#004d00"
            stroke="#00e701"
            strokeWidth="0.8"
            strokeOpacity="0.7"
          />
          {/* Crown Facets */}
          <polygon
            points="22,13 26,20 18,25 12,25"
            fill="#003800"
            stroke="#00e701"
            strokeWidth="0.7"
            strokeOpacity="0.6"
          />
          <polygon
            points="42,13 38,20 46,25 52,25"
            fill="#003800"
            stroke="#00e701"
            strokeWidth="0.7"
            strokeOpacity="0.6"
          />
          <polygon
            points="26,20 38,20 32,25"
            fill="#005000"
            stroke="#00e701"
            strokeWidth="0.7"
            strokeOpacity="0.6"
          />
          <polygon
            points="26,20 32,25 18,25"
            fill="#003800"
            stroke="#00e701"
            strokeWidth="0.7"
            strokeOpacity="0.5"
          />
          <polygon
            points="38,20 32,25 46,25"
            fill="#002d00"
            stroke="#00e701"
            strokeWidth="0.7"
            strokeOpacity="0.5"
          />
          {/* Pavilion */}
          <polygon
            points="18,25 32,25 32,54"
            fill="#004d00"
            stroke="#00e701"
            strokeWidth="0.75"
            strokeOpacity="0.6"
          />
          <polygon
            points="46,25 32,25 32,54"
            fill="#003300"
            stroke="#00e701"
            strokeWidth="0.75"
            strokeOpacity="0.6"
          />
          <polygon
            points="12,25 18,25 32,54"
            fill="#002400"
            stroke="#00e701"
            strokeWidth="0.7"
            strokeOpacity="0.5"
          />
          <polygon
            points="52,25 46,25 32,54"
            fill="#002000"
            stroke="#00e701"
            strokeWidth="0.7"
            strokeOpacity="0.5"
          />
          {/* Girdle & Pavilion Lines */}
          <line x1="12" y1="25" x2="52" y2="25" stroke="#00e701" strokeWidth="0.8" strokeOpacity="0.5" />
          <line x1="32" y1="25" x2="32" y2="54" stroke="#00e701" strokeWidth="0.9" strokeOpacity="0.6" />
        </svg>
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 64 64"
      className={`h-8 w-8 sm:h-10 sm:w-10 drop-shadow-[0_0_14px_rgba(0,231,1,0.85)] ${
        animations ? "animate-gem-pop" : ""
      } ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Ambient Radial Underglow */}
        <radialGradient id={`glow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00e701" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#00c701" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        {/* Crown Table Gradient */}
        <linearGradient id={`table-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c2ffca" />
          <stop offset="50%" stopColor="#52ff6b" />
          <stop offset="100%" stopColor="#00e701" />
        </linearGradient>
        {/* Star & Center Crown */}
        <linearGradient id={`star-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#75ff85" />
          <stop offset="100%" stopColor="#00c701" />
        </linearGradient>
        {/* Facet Gradient Left */}
        <linearGradient id={`facetL-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ff66" />
          <stop offset="100%" stopColor="#008001" />
        </linearGradient>
        {/* Facet Gradient Right */}
        <linearGradient id={`facetR-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00b801" />
          <stop offset="100%" stopColor="#004d00" />
        </linearGradient>
        {/* Pavilion Gradient Left */}
        <linearGradient id={`pavL-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00e701" />
          <stop offset="100%" stopColor="#006601" />
        </linearGradient>
        {/* Pavilion Gradient Right */}
        <linearGradient id={`pavR-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00a301" />
          <stop offset="100%" stopColor="#003800" />
        </linearGradient>
      </defs>

      {/* 1. Ambient Green Underglow */}
      <circle cx="32" cy="34" r="24" fill={`url(#glow-${uid})`} />

      {/* 2. Flat Top Table Facet */}
      <polygon
        points="22,13 42,13 38,20 26,20"
        fill={`url(#table-${uid})`}
        stroke="#ffffff"
        strokeWidth="0.8"
        strokeOpacity="0.9"
      />

      {/* 3. Multi-Faceted Crown Cuts */}
      <polygon
        points="22,13 26,20 18,25 12,25"
        fill={`url(#facetL-${uid})`}
        stroke="#a3ffb0"
        strokeWidth="0.7"
      />
      <polygon
        points="42,13 38,20 46,25 52,25"
        fill={`url(#facetR-${uid})`}
        stroke="#a3ffb0"
        strokeWidth="0.7"
      />
      <polygon
        points="26,20 38,20 32,25"
        fill={`url(#star-${uid})`}
        stroke="#ffffff"
        strokeWidth="0.75"
        strokeOpacity="0.8"
      />
      <polygon
        points="26,20 32,25 18,25"
        fill={`url(#facetL-${uid})`}
        stroke="#00e701"
        strokeWidth="0.7"
      />
      <polygon
        points="38,20 32,25 46,25"
        fill={`url(#facetR-${uid})`}
        stroke="#00e701"
        strokeWidth="0.7"
      />

      {/* 4. Pointed Lower Pavilion */}
      <polygon
        points="18,25 32,25 32,54"
        fill={`url(#pavL-${uid})`}
        stroke="#00e701"
        strokeWidth="0.75"
      />
      <polygon
        points="46,25 32,25 32,54"
        fill={`url(#pavR-${uid})`}
        stroke="#00e701"
        strokeWidth="0.75"
      />
      <polygon
        points="12,25 18,25 32,54"
        fill={`url(#facetL-${uid})`}
        stroke="#00e701"
        strokeWidth="0.7"
      />
      <polygon
        points="52,25 46,25 32,54"
        fill={`url(#facetR-${uid})`}
        stroke="#00e701"
        strokeWidth="0.7"
      />

      {/* 5. Crisp White Light-Reflection Facet Highlights */}
      <line x1="22" y1="13" x2="42" y2="13" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.95" />
      <line x1="12" y1="25" x2="52" y2="25" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.7" />
      <line x1="32" y1="25" x2="32" y2="54" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.8" />
      <line x1="26" y1="20" x2="18" y2="25" stroke="#ffffff" strokeWidth="0.75" strokeOpacity="0.65" />
      <line x1="38" y1="20" x2="46" y2="25" stroke="#ffffff" strokeWidth="0.75" strokeOpacity="0.65" />

      {/* 6. Sparkling Glint Star on Crown Corner */}
      <polygon
        points="24,8 25.2,12 29,13 25.2,14 24,18 22.8,14 19,13 22.8,12"
        fill="#ffffff"
        fillOpacity="0.95"
      />
      <circle cx="24" cy="13" r="1.5" fill="#ffffff" />
    </svg>
  );
}
