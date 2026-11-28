"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type NavLink = { href: string; label: string };

// Menu mobile façon iOS : bouton rond en verre dépoli dont les deux traits se
// croisent en « X », panneau qui descend en verre dépoli avec les liens en
// cascade. Il se ferme au choix d'une page, à la croix, à la touche Échap ou
// en touchant le fond ; la page derrière ne défile pas tant qu'il est ouvert.
export function MobileNav({
  links,
  intranetUrl,
  whatsappUrl,
}: {
  links: NavLink[];
  intranetUrl: string;
  whatsappUrl: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);
  const all = [{ href: "/", label: "Accueil" }, ...links, { href: "/demande-de-soutien", label: "Demande de soutien" }, { href: "/#soutenir", label: "Faire un don" }];

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="menu-mobile"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/55 shadow-[0_6px_20px_-8px_rgba(32,28,22,0.35),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl backdrop-saturate-150 transition-transform active:scale-90"
      >
        <span className="sr-only">{open ? "Fermer le menu" : "Ouvrir le menu"}</span>
        <span
          aria-hidden="true"
          className={`absolute h-[2px] w-[18px] rounded-full bg-ccr-ink transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] ${
            open ? "rotate-45" : "-translate-y-[6px]"
          }`}
        />
        <span
          aria-hidden="true"
          className={`absolute h-[2px] w-[18px] rounded-full bg-ccr-ink transition-all duration-200 ${open ? "scale-x-0 opacity-0" : "opacity-100"}`}
        />
        <span
          aria-hidden="true"
          className={`absolute h-[2px] w-[18px] rounded-full bg-ccr-ink transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] ${
            open ? "-rotate-45" : "translate-y-[6px]"
          }`}
        />
      </button>

      {/* Le panneau est rendu au niveau de la page : l'en-tête floute son fond,
          ce qui empêcherait sinon le panneau de couvrir tout l'écran. */}
      {mounted
        ? createPortal(
            <>
      {/* Fond assombri et flouté : un toucher ferme le menu. */}
      <div
        aria-hidden="true"
        onClick={close}
        className={`fixed inset-0 z-[80] bg-ccr-ink/30 backdrop-blur-md transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <nav
        id="menu-mobile"
        aria-label="Menu principal"
        className={`fixed inset-x-2 top-2 z-[85] max-h-[calc(100dvh-1rem)] origin-top overflow-y-auto rounded-[28px] border border-white/70 bg-[#fbfaf7]/80 px-5 pb-5 pt-[4.5rem] shadow-[0_30px_80px_-20px_rgba(32,28,22,0.45),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl backdrop-saturate-150 transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-6 scale-[0.97] opacity-0"
        }`}
      >
        {/* En-tête du panneau : logo et croix de fermeture. */}
        <div className="absolute inset-x-5 top-4 flex items-center justify-between">
          <Link href="/" onClick={close} className="flex items-center gap-2.5">
            <Image src="/logo-ccr-famille.png" alt="" width={28} height={50} className="h-10 w-auto" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ccr-ink/50">Menu</span>
          </Link>
          <button
            type="button"
            onClick={close}
            aria-label="Fermer le menu"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/70 shadow-[0_6px_20px_-8px_rgba(32,28,22,0.35),inset_0_1px_0_rgba(255,255,255,0.9)] transition-transform active:scale-90"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-ccr-ink" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <ul className="divide-y divide-ccr-ink/[0.07]">
          {all.map((link, i) => {
            const active = link.href === "/" ? pathname === "/" : !link.href.includes("#") && pathname.startsWith(link.href);
            return (
              <li
                key={link.href}
                className={`transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${
                  open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
                style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
              >
                <Link
                  href={link.href}
                  onClick={close}
                  aria-current={active ? "page" : undefined}
                  className="flex items-center justify-between py-3 active:opacity-60"
                >
                  <span className={`text-[17px] font-semibold ${active ? "text-ccr-magenta" : "text-ccr-ink"}`}>
                    {link.label}
                  </span>
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-ccr-ink/30" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </Link>
              </li>
            );
          })}
        </ul>

        <div
          className={`mt-5 grid gap-2.5 transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
          style={{ transitionDelay: open ? `${80 + all.length * 45}ms` : "0ms" }}
        >
          <Link
            href="/cultes-et-programmes"
            onClick={close}
            className="rounded-2xl bg-ccr-gold px-5 py-3 text-center text-sm font-semibold text-ccr-ink shadow-[0_8px_20px_-10px_rgba(227,166,56,0.9)] active:scale-[0.98]"
          >
            Participer à un culte
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={intranetUrl}
              onClick={close}
              className="rounded-2xl border border-ccr-ink/10 bg-white/70 px-4 py-3 text-center text-sm font-semibold active:scale-[0.98]"
            >
              Espace membres
            </a>
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                onClick={close}
                className="rounded-2xl bg-[#25D366]/90 px-4 py-3 text-center text-sm font-semibold text-ccr-ink active:scale-[0.98]"
              >
                WhatsApp
              </a>
            ) : (
              <Link
                href="/contact"
                onClick={close}
                className="rounded-2xl border border-ccr-ink/10 bg-white/70 px-4 py-3 text-center text-sm font-semibold active:scale-[0.98]"
              >
                Nous écrire
              </Link>
            )}
          </div>
        </div>
      </nav>
            </>,
            document.body,
          )
        : null}
    </div>
  );
}
