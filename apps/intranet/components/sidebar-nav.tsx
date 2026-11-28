"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icons";

export type NavItem = { href: string; label: string; icon: IconName; count?: number };

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-visible md:pb-0">
      {items.map((item) => {
        const seg = (p: string) => p.split("/")[1];
        const active = pathname === item.href || seg(pathname) === seg(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm transition-colors ${
              active
                ? "bg-ccr-gold font-semibold text-ccr-ink"
                : "text-ccr-cream/70 hover:bg-ccr-cream/[0.07] hover:text-ccr-cream"
            }`}
          >
            <Icon name={item.icon} className={`h-[18px] w-[18px] shrink-0 ${active ? "" : "text-ccr-cream/50 group-hover:text-ccr-gold-light"}`} />
            <span className="flex-1">{item.label}</span>
            {item.count ? (
              <span
                className={`rounded-full px-2 text-xs font-bold ${
                  active ? "bg-ccr-ink/15" : "bg-ccr-magenta text-white"
                }`}
              >
                {item.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
