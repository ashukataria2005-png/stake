import React from "react";
import CategoryGroupView from "@/components/casino/CategoryGroupView";

export function generateStaticParams() {
  return [
    { slug: "stake-originals" },
    { slug: "live-casino" },
    { slug: "slots" },
    { slug: "game-shows" },
    { slug: "evolution" },
  ];
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CategoryGroupView slug={slug} />;
}
