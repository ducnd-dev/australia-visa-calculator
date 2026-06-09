import "@/components/home/home-animations.css";

/** Decorative fixed background — marketing pages only. */
export function MarketingAtmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="marketing-mesh-a absolute -left-[20%] top-[-10%] size-[55vw] max-h-[520px] max-w-[520px] rounded-full bg-primary/20 blur-[100px]" />
      <div className="marketing-mesh-b absolute -right-[15%] top-[20%] size-[45vw] max-h-[480px] max-w-[480px] rounded-full bg-sky-400/15 blur-[90px]" />
      <div className="marketing-mesh-c absolute bottom-[10%] left-[30%] size-[40vw] max-h-[400px] max-w-[400px] rounded-full bg-violet-400/10 blur-[80px]" />
      <div className="marketing-dot-grid absolute inset-0 opacity-[0.35]" />
    </div>
  );
}
