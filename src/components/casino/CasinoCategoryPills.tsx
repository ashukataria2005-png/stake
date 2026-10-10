"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { User, Sparkles, Flame, Tv, Heart, LayoutGrid } from "lucide-react";

interface CategoryPill {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface CasinoCategoryPillsProps {
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export default function CasinoCategoryPills({
  activeCategory,
  onSelectCategory,
}: CasinoCategoryPillsProps) {
  const router = useRouter();

  const handlePillClick = (id: string) => {
    onSelectCategory(id);
    if (["stake-originals", "slots", "live-casino", "game-shows", "evolution", "ezugi", "mac88", "inout"].includes(id)) {
      router.push(`/casino/group/${id}`);
    } else if (id === "providers") {
      router.push("/casino/collection/providers");
    }
  };

  const categories: CategoryPill[] = [
    {
      id: "home",
      label: "Casino Home",
      icon: (
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M19 2H9C7.9 2 7 2.9 7 4v2h12c1.1 0 2 .9 2 2v10h2c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4 6H5C3.9 8 3 8.9 3 10v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-3 8.5c-.8 0-1.5-.7-1.5-1.5s1.5-2.5 1.5-2.5 1.5 1.7 1.5 2.5-.7 1.5-1.5 1.5z" />
        </svg>
      ),
    },
    {
      id: "my-casino",
      label: "My Casino",
      icon: <User className="w-4 h-4 shrink-0" />,
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: <Heart className="w-4 h-4 shrink-0" />,
    },
    {
      id: "only-on-stake",
      label: "Only on Stake",
      icon: (
        <div className="w-3.5 h-3.5 rounded bg-emerald-500 text-[#0f212e] font-black flex items-center justify-center text-[9px] leading-none shrink-0">
          S
        </div>
      ),
    },
    {
      id: "new-releases",
      label: "New Releases",
      icon: <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />,
    },
    {
      id: "stake-originals",
      label: "Stake Originals",
      icon: <Flame className="w-4 h-4 text-emerald-400 shrink-0" />,
    },
    {
      id: "slots",
      label: "Slots",
      icon: (
        <span className="font-mono font-black text-xs text-yellow-400 tracking-tighter shrink-0">
          777
        </span>
      ),
    },
    {
      id: "live-casino",
      label: "Live Casino",
      icon: (
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M7.7 8.3L2 12l5.7 3.7c1.3.8 3 .5 4-.6l.3-.4.3.4c1 1.1 2.7 1.4 4 .6L22 12l-5.7-3.7c-1.3-.8-3-.5-4 .6l-.3.4-.3-.4c-1-1.1-2.7-1.4-4-.6zM12 13.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
        </svg>
      ),
    },

    {
      id: "game-shows",
      label: "Game Shows",
      icon: <Tv className="w-4 h-4 text-pink-400 shrink-0" />,
    },
    {
      id: "providers",
      label: "Providers",
      icon: <LayoutGrid className="w-4 h-4 shrink-0" />,
    },
  ];

  return (
    <div className="relative w-full overflow-x-auto no-scrollbar scroll-smooth py-1 select-none">
      <div className="flex items-center gap-1.5 min-w-max">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handlePillClick(cat.id)}
              className={`rounded-full px-4 py-2 flex items-center gap-2 text-sm sm:text-base shrink-0 cursor-pointer transition-all duration-150 ${isActive
                  ? "bg-[#2f4553] text-white font-bold shadow-sm"
                  : "bg-transparent text-[#b1bad3] hover:text-white font-medium hover:bg-[#213743]/50"
                }`}
            >
              <span className="flex items-center justify-center shrink-0">
                {cat.icon}
              </span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
