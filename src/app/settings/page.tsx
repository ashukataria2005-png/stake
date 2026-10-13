"use client";

import React from "react";
import { useRouter } from "next/navigation";
import SettingsModal from "@/components/profile/SettingsModal";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0f212e] flex items-center justify-center p-4">
      <SettingsModal
        isOpen={true}
        onClose={() => router.push("/casino/home")}
      />
    </div>
  );
}
