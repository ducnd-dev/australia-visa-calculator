"use client";
import { GoogleAnalytics as GA } from "@next/third-parties/google";

export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return null;
  return <GA gaId={id} />;
}
