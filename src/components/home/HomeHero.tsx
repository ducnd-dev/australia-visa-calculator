import { HomeHeroBackground } from "./HomeHeroBackground";
import { HomeHeroContent } from "./HomeHeroContent";
import { HomeHeroVisual } from "./HomeHeroVisual";

/**
 * Hero banner: full-bleed 3D backdrop + readable copy on the left.
 */
export function HomeHero({ lastUpdated }: { lastUpdated: string }) {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-[520px] overflow-hidden border-b border-border lg:min-h-[600px]"
    >
      <HomeHeroBackground />

      {/* Full-banner WebGL (lazy) */}
      <HomeHeroVisual />

      {/* Keep copy readable over 3D */}
      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-background from-35% via-background/75 via-55% to-transparent to-100% lg:from-40% lg:via-50%"
        aria-hidden
      />

      <div className="relative z-[3] mx-auto max-w-6xl px-4 py-16 lg:py-24">
        <HomeHeroContent lastUpdated={lastUpdated} />
      </div>
    </section>
  );
}
