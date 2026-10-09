import React from "react";
import CategoryGroupView from "@/components/casino/CategoryGroupView";

export function generateStaticParams() {
  return [
    { slug: "stake-originals" },
    { slug: "live-casino" },
    { slug: "slots" },
    { slug: "game-shows" },
    { slug: "evolution" },
    { slug: "ezugi" },
    { slug: "mac88" },
    { slug: "spribe" },
    { slug: "smartsoft" },
    { slug: "100hp" },
    { slug: "jili" },
    { slug: "evoplay" },
    { slug: "turbogames" },
    { slug: "inout" },
    { slug: "pragmatic" },
    { slug: "pragmatic-play" },
    { slug: "hacksaw" },
    { slug: "hacksaw-gaming" },
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
