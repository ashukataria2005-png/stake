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
    { slug: "hp100" },
    { slug: "jili" },
    { slug: "evoplay" },
    { slug: "turbogames" },
    { slug: "inout" },
    { slug: "pragmatic" },
    { slug: "pragmatic-play" },
    { slug: "hacksaw" },
    { slug: "hacksaw-gaming" },
    { slug: "only-on-stake" },
    { slug: "chicken-games" },
    { slug: "new-releases" },
    { slug: "burst-games" },
  ];
}

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CategoryGroupView slug={slug} />;
}
