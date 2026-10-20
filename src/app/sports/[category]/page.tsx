import React from "react";
import SportCategoryView from "@/components/sports/SportCategoryView";
import { TRENDING_SPORTS } from "@/data/trendingSports";

export function generateStaticParams() {
  const sportSlugs = TRENDING_SPORTS.map((s) => ({ category: s.id }));
  const extras = [
    { category: "cricket" },
    { category: "football" },
    { category: "tennis" },
    { category: "basketball" },
    { category: "all" },
  ];
  return [...sportSlugs, ...extras];
}

export default function SportCategoryPage() {
  return <SportCategoryView />;
}