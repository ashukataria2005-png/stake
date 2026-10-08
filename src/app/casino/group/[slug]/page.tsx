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
    { slug: "inout" },
    { slug: "pragmatic" },
    { slug: "pragmatic-play" },
    { slug: "hacksaw" },
    { slug: "hacksaw-gaming" },
    { slug: "100hp" },
    { slug: "spribe" },
    { slug: "smartsoft" },
    { slug: "jili" },
    { slug: "evoplay" },
    { slug: "pragmatic-live" },
    { slug: "turbogames" },
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
