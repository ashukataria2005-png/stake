"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import TransactionsModal from "@/components/profile/TransactionsModal";

export default function TransactionsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0f212e] flex items-center justify-center p-4">
      <TransactionsModal
        isOpen={true}
        onClose={() => router.push("/casino/home")}
      />
    </div>
  );
}
