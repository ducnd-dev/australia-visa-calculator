import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth/admin";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/marketing", label: "Marketing" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireSuperAdmin();
  if (!profile) redirect("/app");

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col border-r border-slate-800 bg-slate-900 p-4 text-sm text-white">
        <p className="font-semibold">Platform admin</p>
        <nav className="mt-6 flex flex-col gap-1">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded px-2 py-1.5 hover:bg-slate-800">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
