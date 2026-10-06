import React from "react";

export interface FiatCoinIconProps {
  currency: string;
  className?: string;
  size?: number;
}

export default function FiatCoinIcon({
  currency,
  className = "w-5 h-5",
  size = 20,
}: FiatCoinIconProps) {
  const code = (currency || "USD").toUpperCase();

  switch (code) {
    case "INR":
      return (
        <svg
          viewBox="0 0 32 32"
          className={`shrink-0 select-none ${className}`}
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="inrGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="25%" stopColor="#F59E0B" />
              <stop offset="55%" stopColor="#B45309" />
              <stop offset="85%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
            <linearGradient id="inrGoldFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="50%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
            <linearGradient id="inrGloss" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Outer 3D Metallic Beveled Rim */}
          <circle cx="16" cy="16" r="15.5" fill="url(#inrGoldRim)" />
          {/* Inner Coin Body */}
          <circle cx="16" cy="16" r="13.5" fill="url(#inrGoldFace)" />
          {/* Mint Concentric Ornamental Ring */}
          <circle
            cx="16"
            cy="16"
            r="11.5"
            stroke="#FEF3C7"
            strokeWidth="0.8"
            strokeDasharray="1.2 1.2"
            opacity="0.8"
          />
          <circle cx="16" cy="16" r="10.2" stroke="#FDE68A" strokeWidth="0.5" opacity="0.4" />
          {/* Upper Specular Gloss */}
          <path d="M 4.5 16 A 11.5 11.5 0 0 1 27.5 16 Z" fill="url(#inrGloss)" />
          {/* Sharp White 3D Rupee Symbol */}
          <text
            x="16"
            y="16.5"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="14.5"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            fill="#FFFFFF"
            stroke="#78350F"
            strokeWidth="0.4"
            style={{ filter: "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.65))" }}
          >
            ₹
          </text>
        </svg>
      );

    case "USD":
      return (
        <svg
          viewBox="0 0 32 32"
          className={`shrink-0 select-none ${className}`}
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="usdGreenRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="30%" stopColor="#10B981" />
              <stop offset="70%" stopColor="#047857" />
              <stop offset="100%" stopColor="#064E3B" />
            </linearGradient>
            <linearGradient id="usdGreenFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="60%" stopColor="#064E3B" />
              <stop offset="100%" stopColor="#022C22" />
            </linearGradient>
            <linearGradient id="usdGloss" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="15.5" fill="url(#usdGreenRim)" />
          <circle cx="16" cy="16" r="13.5" fill="url(#usdGreenFace)" />
          <circle
            cx="16"
            cy="16"
            r="11.5"
            stroke="#FDE68A"
            strokeWidth="0.8"
            strokeDasharray="1.2 1.2"
            opacity="0.8"
          />
          <circle cx="16" cy="16" r="10.2" stroke="#34D399" strokeWidth="0.5" opacity="0.4" />
          <path d="M 4.5 16 A 11.5 11.5 0 0 1 27.5 16 Z" fill="url(#usdGloss)" />
          <text
            x="16"
            y="16.5"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="15"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            fill="#FFFFFF"
            stroke="#064E3B"
            strokeWidth="0.4"
            style={{ filter: "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.65))" }}
          >
            $
          </text>
        </svg>
      );

    case "EUR":
      return (
        <svg
          viewBox="0 0 32 32"
          className={`shrink-0 select-none ${className}`}
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="eurBlueRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93C5FD" />
              <stop offset="30%" stopColor="#3B82F6" />
              <stop offset="70%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>
            <linearGradient id="eurBlueFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="60%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#172554" />
            </linearGradient>
            <linearGradient id="eurGloss" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#BFDBFE" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="15.5" fill="url(#eurBlueRim)" />
          <circle cx="16" cy="16" r="13.5" fill="url(#eurBlueFace)" />
          <circle
            cx="16"
            cy="16"
            r="11.5"
            stroke="#FDE68A"
            strokeWidth="0.8"
            strokeDasharray="1.2 1.2"
            opacity="0.8"
          />
          <path d="M 4.5 16 A 11.5 11.5 0 0 1 27.5 16 Z" fill="url(#eurGloss)" />
          <text
            x="16"
            y="16.5"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="14.5"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            fill="#FFFFFF"
            stroke="#172554"
            strokeWidth="0.4"
            style={{ filter: "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.65))" }}
          >
            €
          </text>
        </svg>
      );

    case "GBP":
      return (
        <svg
          viewBox="0 0 32 32"
          className={`shrink-0 select-none ${className}`}
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="gbpNavyRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A5B4FC" />
              <stop offset="30%" stopColor="#6366F1" />
              <stop offset="70%" stopColor="#4338CA" />
              <stop offset="100%" stopColor="#312E81" />
            </linearGradient>
            <linearGradient id="gbpNavyFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="60%" stopColor="#3730A3" />
              <stop offset="100%" stopColor="#1E1B4B" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="15.5" fill="url(#gbpNavyRim)" />
          <circle cx="16" cy="16" r="13.5" fill="url(#gbpNavyFace)" />
          <circle
            cx="16"
            cy="16"
            r="11.5"
            stroke="#FDE68A"
            strokeWidth="0.8"
            strokeDasharray="1.2 1.2"
            opacity="0.8"
          />
          <text
            x="16"
            y="16.5"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="14.5"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            fill="#FFFFFF"
            stroke="#1E1B4B"
            strokeWidth="0.4"
            style={{ filter: "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.65))" }}
          >
            £
          </text>
        </svg>
      );

    case "JPY":
    case "CNY":
      return (
        <svg
          viewBox="0 0 32 32"
          className={`shrink-0 select-none ${className}`}
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="jpyRedRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCA5A5" />
              <stop offset="30%" stopColor="#EF4444" />
              <stop offset="70%" stopColor="#B91C1C" />
              <stop offset="100%" stopColor="#7F1D1D" />
            </linearGradient>
            <linearGradient id="jpyRedFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="60%" stopColor="#991B1B" />
              <stop offset="100%" stopColor="#450A0A" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="15.5" fill="url(#jpyRedRim)" />
          <circle cx="16" cy="16" r="13.5" fill="url(#jpyRedFace)" />
          <circle
            cx="16"
            cy="16"
            r="11.5"
            stroke="#FDE68A"
            strokeWidth="0.8"
            strokeDasharray="1.2 1.2"
            opacity="0.8"
          />
          <text
            x="16"
            y="16.5"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="14.5"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            fill="#FFFFFF"
            stroke="#450A0A"
            strokeWidth="0.4"
            style={{ filter: "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.65))" }}
          >
            ¥
          </text>
        </svg>
      );

    case "CAD":
      return (
        <svg
          viewBox="0 0 32 32"
          className={`shrink-0 select-none ${className}`}
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="cadRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDA4AF" />
              <stop offset="30%" stopColor="#F43F5E" />
              <stop offset="70%" stopColor="#BE123C" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
            <linearGradient id="cadFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E11D48" />
              <stop offset="60%" stopColor="#9F1239" />
              <stop offset="100%" stopColor="#4C0519" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="15.5" fill="url(#cadRim)" />
          <circle cx="16" cy="16" r="13.5" fill="url(#cadFace)" />
          <circle
            cx="16"
            cy="16"
            r="11.5"
            stroke="#FDE68A"
            strokeWidth="0.8"
            strokeDasharray="1.2 1.2"
            opacity="0.8"
          />
          <text
            x="16"
            y="16.5"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="12.5"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            fill="#FFFFFF"
            stroke="#4C0519"
            strokeWidth="0.4"
            style={{ filter: "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.65))" }}
          >
            C$
          </text>
        </svg>
      );

    case "AUD":
      return (
        <svg
          viewBox="0 0 32 32"
          className={`shrink-0 select-none ${className}`}
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="audRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5EEAD4" />
              <stop offset="30%" stopColor="#14B8A6" />
              <stop offset="70%" stopColor="#0F766E" />
              <stop offset="100%" stopColor="#115E59" />
            </linearGradient>
            <linearGradient id="audFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0D9488" />
              <stop offset="60%" stopColor="#0F766E" />
              <stop offset="100%" stopColor="#042F2E" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="15.5" fill="url(#audRim)" />
          <circle cx="16" cy="16" r="13.5" fill="url(#audFace)" />
          <circle
            cx="16"
            cy="16"
            r="11.5"
            stroke="#FDE68A"
            strokeWidth="0.8"
            strokeDasharray="1.2 1.2"
            opacity="0.8"
          />
          <text
            x="16"
            y="16.5"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="12.5"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            fill="#FFFFFF"
            stroke="#042F2E"
            strokeWidth="0.4"
            style={{ filter: "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.65))" }}
          >
            A$
          </text>
        </svg>
      );

    case "BRL":
      return (
        <svg
          viewBox="0 0 32 32"
          className={`shrink-0 select-none ${className}`}
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="brlRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="30%" stopColor="#F59E0B" />
              <stop offset="70%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="brlFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="60%" stopColor="#047857" />
              <stop offset="100%" stopColor="#064E3B" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="15.5" fill="url(#brlRim)" />
          <circle cx="16" cy="16" r="13.5" fill="url(#brlFace)" />
          <circle
            cx="16"
            cy="16"
            r="11.5"
            stroke="#FDE68A"
            strokeWidth="0.8"
            strokeDasharray="1.2 1.2"
            opacity="0.8"
          />
          <text
            x="16"
            y="16.5"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="12.5"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            fill="#FFFFFF"
            stroke="#064E3B"
            strokeWidth="0.4"
            style={{ filter: "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.65))" }}
          >
            R$
          </text>
        </svg>
      );

    default:
      // Generic Polished Gold/Platinum Coin Fallback
      return (
        <svg
          viewBox="0 0 32 32"
          className={`shrink-0 select-none ${className}`}
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="genRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="30%" stopColor="#94A3B8" />
              <stop offset="70%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id="genFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="60%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="15.5" fill="url(#genRim)" />
          <circle cx="16" cy="16" r="13.5" fill="url(#genFace)" />
          <circle
            cx="16"
            cy="16"
            r="11.5"
            stroke="#CBD5E1"
            strokeWidth="0.8"
            strokeDasharray="1.2 1.2"
            opacity="0.8"
          />
          <text
            x="16"
            y="16.5"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={code.length > 2 ? "10" : "13"}
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            fill="#FFFFFF"
            stroke="#1E293B"
            strokeWidth="0.3"
            style={{ filter: "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.65))" }}
          >
            {code.slice(0, 3)}
          </text>
        </svg>
      );
  }
}
