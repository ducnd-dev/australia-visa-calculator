import { MarketingShell } from "@/components/layout/MarketingShell";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <MarketingShell>
      <main id="main" className="flex-1 focus:outline-none">
        {children}
      </main>
    </MarketingShell>
  );
}
