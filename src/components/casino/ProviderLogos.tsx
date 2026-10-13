import React from "react";
import StakeLogo from "@/components/common/StakeLogo";

interface ProviderLogoProps {
  className?: string;
}

export function StakeProviderLogo({ className = "h-5 sm:h-6 w-auto" }: ProviderLogoProps) {
  return (
    <div className="flex items-center justify-center max-w-full overflow-hidden">
      <StakeLogo className={`${className} text-white`} />
    </div>
  );
}

export function PragmaticPlayLogo({ className = "h-4 sm:h-5" }: ProviderLogoProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white max-w-full min-w-0 px-0.5">
      <svg className={`${className} w-auto text-[#ff9900] shrink-0`} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" fill="#ff9900" fillOpacity="0.18" />
        <path d="M5 16L7 9L12 13L17 9L19 16H5Z" fill="#ff9900" />
        <circle cx="12" cy="7" r="1.5" fill="#ff9900" />
      </svg>
      <span className="font-black text-[10px] sm:text-xs md:text-[13px] tracking-tight sm:tracking-normal uppercase text-white font-sans truncate">
        PRAGMATIC PLAY
      </span>
    </div>
  );
}

export function StakeEngineLogo({ className = "h-4 sm:h-5" }: ProviderLogoProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white max-w-full min-w-0 px-0.5">
      <svg className={`${className} w-auto text-[#00e701] shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#00e701" fillOpacity="0.25" />
      </svg>
      <span className="font-black tracking-tight sm:tracking-wider text-[10px] sm:text-xs md:text-[13px] uppercase text-white font-mono truncate">
        STAKE<span className="text-[#00e701] ml-0.5">ENGINE</span>
      </span>
    </div>
  );
}

export function EvolutionLogo({ className = "h-4 sm:h-5" }: ProviderLogoProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white max-w-full min-w-0 px-0.5">
      <svg className={`${className} w-auto text-[#1475e1] shrink-0`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 4h18v3.5H7.5v3h11v3.5H7.5v3H21V20H3z" />
      </svg>
      <span className="font-extrabold text-[10px] sm:text-xs md:text-[13px] tracking-tight sm:tracking-normal text-white truncate">
        Evolution
      </span>
    </div>
  );
}

export function HacksawGamingLogo({ className = "h-4 sm:h-5" }: ProviderLogoProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white max-w-full min-w-0 px-0.5">
      <svg className={`${className} w-auto text-[#facc15] shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="9" stroke="#facc15" />
        <path d="M12 3v6m0 6v6M3 12h6m6 0h6" stroke="#facc15" strokeLinecap="round" />
      </svg>
      <span className="font-black font-mono tracking-tight sm:tracking-wider text-[10px] sm:text-xs md:text-[13px] text-white truncate">
        HACKSAW
      </span>
    </div>
  );
}

export function JiliLogo({ className = "h-4 sm:h-5" }: ProviderLogoProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white max-w-full min-w-0 px-0.5">
      <span className="font-black font-mono text-[10px] sm:text-xs px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
        JL
      </span>
      <span className="font-black tracking-tight sm:tracking-wider text-[10px] sm:text-xs md:text-[13px] text-amber-300 font-sans truncate">
        JILI GAMES
      </span>
    </div>
  );
}

export function EvoplayLogo({ className = "h-4 sm:h-5" }: ProviderLogoProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white max-w-full min-w-0 px-0.5">
      <svg className={`${className} w-auto text-emerald-400 shrink-0`} viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      <span className="font-black tracking-tight sm:tracking-wider text-[10px] sm:text-xs md:text-[13px] text-white font-sans truncate">
        EVOPLAY
      </span>
    </div>
  );
}

export function Mac88Logo({ className = "h-4 sm:h-5" }: ProviderLogoProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white max-w-full min-w-0 px-0.5">
      <span className="font-black font-mono text-[10px] sm:text-xs px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 border border-orange-500/40 shrink-0">
        88
      </span>
      <span className="font-black tracking-tight sm:tracking-wider text-[10px] sm:text-xs md:text-[13px] text-white font-sans truncate">
        MAC88
      </span>
    </div>
  );
}

export function ValkyrieLogo({ className = "h-4 sm:h-5" }: ProviderLogoProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white max-w-full min-w-0 px-0.5">
      <svg className={`${className} w-auto text-cyan-400 shrink-0`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L4 7v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V7l-8-5zm-1 6h2v6h-2V8zm-3 8h8v2H8v-2z" />
      </svg>
      <span className="font-extrabold tracking-tight sm:tracking-wider text-[10px] sm:text-xs md:text-[13px] text-cyan-300 truncate">
        VALKYRIE
      </span>
    </div>
  );
}

export function PaperclipGamingLogo({ className = "h-4 sm:h-5" }: ProviderLogoProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white max-w-full min-w-0 px-0.5">
      <svg className={`${className} w-auto text-indigo-400 shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
      </svg>
      <span className="font-black text-[10px] sm:text-xs md:text-[13px] tracking-tight sm:tracking-normal text-white truncate">
        PAPERCLIP
      </span>
    </div>
  );
}

export function NolimitCityLogo() {
  return (
    <div className="flex items-center justify-center gap-1 text-white max-w-full min-w-0 px-0.5">
      <span className="font-black text-[10px] sm:text-xs bg-yellow-400 text-black px-1 py-0.2 rounded font-mono shrink-0">
        NO
      </span>
      <span className="font-black text-[10px] sm:text-xs md:text-[13px] tracking-tight sm:tracking-normal text-white font-sans truncate">
        LIMIT CITY
      </span>
    </div>
  );
}

export function DonutGamingLogo() {
  return (
    <div className="flex items-center justify-center gap-1 text-white max-w-full min-w-0 px-0.5">
      <span className="text-sm sm:text-base shrink-0">🍩</span>
      <span className="font-black tracking-tight sm:tracking-normal text-[10px] sm:text-xs md:text-[13px] text-pink-400 font-sans truncate">
        DONUT
      </span>
    </div>
  );
}

export function ColorfulPlayLogo({ className = "h-4 sm:h-5" }: ProviderLogoProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white max-w-full min-w-0 px-0.5">
      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr from-pink-500 via-amber-400 to-cyan-400 flex items-center justify-center shrink-0">
        <div className="w-1.5 h-1.5 border-l-2 border-t-2 border-white transform rotate-45 ml-0.5" />
      </div>
      <span className="font-extrabold text-[10px] sm:text-xs md:text-[13px] bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent truncate">
        COLORFUL
      </span>
    </div>
  );
}

export function PGSoftLogo() {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white max-w-full min-w-0 px-0.5">
      <span className="font-black font-mono text-[10px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
        PG
      </span>
      <span className="font-black tracking-tight sm:tracking-wider text-[10px] sm:text-xs md:text-[13px] text-white truncate">
        SOFT
      </span>
    </div>
  );
}

export function SpribeLogo({ className = "h-4 sm:h-5" }: ProviderLogoProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white max-w-full min-w-0 px-0.5">
      <svg className={`${className} w-auto text-red-500 shrink-0`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
      <span className="font-black tracking-tight sm:tracking-wider text-[10px] sm:text-xs md:text-[13px] text-white uppercase truncate">
        SPRIBE
      </span>
    </div>
  );
}

export function TwistGamingLogo({ className = "h-4 sm:h-5" }: ProviderLogoProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white max-w-full min-w-0 px-0.5">
      <svg className={`${className} w-auto text-purple-400 shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M4 12a8 8 0 0 1 14.93-4M20 12a8 8 0 0 1-14.93 4" />
      </svg>
      <span className="font-black tracking-tight sm:tracking-wider text-[10px] sm:text-xs md:text-[13px] text-purple-300 truncate">
        TWIST
      </span>
    </div>
  );
}

export function UppercutGamingLogo({ className = "h-4 sm:h-5" }: ProviderLogoProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white max-w-full min-w-0 px-0.5">
      <svg className={`${className} w-auto text-red-500 shrink-0`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a5 5 0 0 1 5 5v2h1a3 3 0 0 1 3 3v4a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5v-4a3 3 0 0 1 3-3h1V7a5 5 0 0 1 5-5z" />
      </svg>
      <span className="font-black tracking-tight sm:tracking-wider text-[10px] sm:text-xs md:text-[13px] text-white truncate">
        UPPERCUT
      </span>
    </div>
  );
}

export function PlayngoLogo({ className = "h-4 sm:h-5" }: ProviderLogoProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white max-w-full min-w-0 px-0.5">
      <div className="w-4 h-4 rounded-md bg-[#00e701] flex items-center justify-center text-black font-black text-[10px] shrink-0">
        ▶
      </div>
      <span className="font-black tracking-tight sm:tracking-normal text-[10px] sm:text-xs md:text-[13px] text-white truncate">
        PLAY&apos;N GO
      </span>
    </div>
  );
}

export function PocketPlayLogo({ className = "h-4 sm:h-5" }: ProviderLogoProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white max-w-full min-w-0 px-0.5">
      <svg className={`${className} w-auto text-amber-400 shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M5 4h14v8a7 7 0 0 1-14 0V4z" fill="#f59e0b" fillOpacity="0.2" />
        <polygon points="10 8 15 11 10 14 10 8" fill="#f59e0b" />
      </svg>
      <span className="font-black tracking-tight sm:tracking-normal text-[10px] sm:text-xs md:text-[13px] text-white truncate">
        POCKET PLAY
      </span>
    </div>
  );
}

export function GamesGlobalLogo({ className = "h-4 sm:h-5" }: ProviderLogoProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white max-w-full min-w-0 px-0.5">
      <svg className={`${className} w-auto text-emerald-400 shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      <span className="font-extrabold tracking-tight sm:tracking-normal text-[10px] sm:text-xs md:text-[13px] text-white truncate">
        GAMES GLOBAL
      </span>
    </div>
  );
}

export function BGamingLogo() {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white max-w-full min-w-0 px-0.5">
      <span className="font-black font-sans text-[10px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/40 shrink-0">
        B
      </span>
      <span className="font-black tracking-tight sm:tracking-wider text-[10px] sm:text-xs md:text-[13px] text-white truncate">
        BGAMING
      </span>
    </div>
  );
}

export function DegenLabLogo({ className = "h-4 sm:h-5" }: ProviderLogoProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white max-w-full min-w-0 px-0.5">
      <svg className={`${className} w-auto text-teal-400 shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6M10 9h4M10 3v6l-4 9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l-4-9V3" />
      </svg>
      <span className="font-black font-mono tracking-tight sm:tracking-wider text-[10px] sm:text-xs md:text-[13px] text-teal-300 truncate">
        DEGEN LAB
      </span>
    </div>
  );
}

export function HyperPlayLogo({ className = "h-4 sm:h-5" }: ProviderLogoProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white max-w-full min-w-0 px-0.5">
      <svg className={`${className} w-auto text-blue-400 shrink-0`} viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 4 15 12 5 20 5 4" />
        <polygon points="12 4 22 12 12 20 12 4" />
      </svg>
      <span className="font-black tracking-tight sm:tracking-normal text-[10px] sm:text-xs md:text-[13px] text-white truncate">
        HYPER PLAY
      </span>
    </div>
  );
}

export function SmartSoftLogo({ className = "h-4 sm:h-5" }: ProviderLogoProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white max-w-full min-w-0 px-0.5">
      <svg className={`${className} w-auto text-amber-500 shrink-0`} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2.5" />
      </svg>
      <span className="font-black tracking-tight sm:tracking-normal text-[10px] sm:text-xs md:text-[13px] text-white font-sans truncate">
        SMARTSOFT
      </span>
    </div>
  );
}

/**
 * Universal ProviderLogo component:
 * Dynamically resolves and renders authentic vector SVGs for any Stake publisher by ID or Name.
 */
export function ProviderLogo({
  id,
  name,
  className,
}: {
  id?: string;
  name?: string;
  className?: string;
}) {
  const raw = `${id || ""} ${name || ""}`.toLowerCase();
  const key = raw.replace(/[^a-z0-9]/g, "");

  if (key.includes("stakeengine") || key.includes("stake-engine")) {
    return <StakeEngineLogo className={className} />;
  }
  if (key.includes("stake") || key.includes("original")) {
    return <StakeProviderLogo className={className} />;
  }
  if (key.includes("pragmatic")) {
    return <PragmaticPlayLogo className={className} />;
  }
  if (key.includes("evolution")) {
    return <EvolutionLogo className={className} />;
  }
  if (key.includes("hacksaw")) {
    return <HacksawGamingLogo className={className} />;
  }
  if (key.includes("jili")) {
    return <JiliLogo className={className} />;
  }
  if (key.includes("evoplay")) {
    return <EvoplayLogo className={className} />;
  }
  if (key.includes("mac88")) {
    return <Mac88Logo className={className} />;
  }
  if (key.includes("valkyrie")) {
    return <ValkyrieLogo className={className} />;
  }
  if (key.includes("paperclip")) {
    return <PaperclipGamingLogo className={className} />;
  }
  if (key.includes("nolimit")) {
    return <NolimitCityLogo />;
  }
  if (key.includes("donut")) {
    return <DonutGamingLogo />;
  }
  if (key.includes("colorful")) {
    return <ColorfulPlayLogo className={className} />;
  }
  if (key.includes("pgsoft") || key.includes("pocketgames")) {
    return <PGSoftLogo />;
  }
  if (key.includes("spribe")) {
    return <SpribeLogo className={className} />;
  }
  if (key.includes("twist")) {
    return <TwistGamingLogo className={className} />;
  }
  if (key.includes("uppercut")) {
    return <UppercutGamingLogo className={className} />;
  }
  if (key.includes("playngo") || key.includes("play-n-go")) {
    return <PlayngoLogo className={className} />;
  }
  if (key.includes("pocketplay") || key.includes("pocket-play")) {
    return <PocketPlayLogo className={className} />;
  }
  if (key.includes("gamesglobal") || key.includes("games-global")) {
    return <GamesGlobalLogo className={className} />;
  }
  if (key.includes("bgaming")) {
    return <BGamingLogo />;
  }
  if (key.includes("degenlab") || key.includes("degen-lab")) {
    return <DegenLabLogo className={className} />;
  }
  if (key.includes("hyperplay") || key.includes("hyper-play") || key.includes("hyperx")) {
    return <HyperPlayLogo className={className} />;
  }
  if (key.includes("smartsoft")) {
    return <SmartSoftLogo className={className} />;
  }

  const displayName = name || id || "STUDIO";
  return (
    <span className="font-extrabold text-[10px] sm:text-xs md:text-[13px] tracking-tight sm:tracking-normal text-white uppercase truncate max-w-full">
      {displayName}
    </span>
  );
}

export default ProviderLogo;
