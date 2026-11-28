import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
  back,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-8">
      {back ? (
        <Link
          href={back.href}
          className="text-sm font-semibold text-ccr-ink/50 hover:text-ccr-magenta"
        >
          &larr; {back.label}
        </Link>
      ) : null}
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-ccr-ink/60">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-ccr-ink/10 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wide text-ccr-ink/50">{label}</p>
      <p className="mt-2 font-display text-4xl font-black">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ccr-ink/50">{hint}</p> : null}
    </Card>
  );
}

export const fieldClass =
  "mt-1 w-full rounded-lg border border-ccr-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ccr-gold focus:ring-2 focus:ring-ccr-gold/30";

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-ccr-ink/50">{hint}</span> : null}
    </label>
  );
}

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
}

export function Select({
  options,
  empty,
  ...props
}: ComponentProps<"select"> & { options: Record<string, string> | string[][]; empty?: string }) {
  const entries = Array.isArray(options) ? options : Object.entries(options);
  return (
    <select {...props} className={`${fieldClass} ${props.className ?? ""}`}>
      {empty !== undefined ? <option value="">{empty}</option> : null}
      {entries.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

export function Button({
  variant = "primary",
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "secondary" | "danger" }) {
  const styles = {
    primary: "bg-ccr-gold text-ccr-ink hover:bg-ccr-gold-light",
    secondary: "border border-ccr-ink/20 hover:border-ccr-ink",
    danger: "border border-ccr-magenta/40 text-ccr-magenta hover:bg-ccr-magenta/10",
  }[variant];
  return (
    <button
      {...props}
      className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${styles} ${props.className ?? ""}`}
    />
  );
}

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: "primary" | "secondary" }) {
  return (
    <Link
      href={href}
      className={
        variant === "primary"
          ? "rounded-full bg-ccr-gold px-5 py-2 text-sm font-semibold text-ccr-ink transition-colors hover:bg-ccr-gold-light"
          : "rounded-full border border-ccr-ink/20 bg-white px-5 py-2 text-sm font-semibold text-ccr-ink transition-colors hover:border-ccr-ink/50"
      }
    >
      {children}
    </Link>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "gold" | "magenta" | "blue" }) {
  const styles = {
    neutral: "bg-ccr-ink/5 text-ccr-ink/70",
    gold: "bg-ccr-gold/15 text-ccr-ink",
    magenta: "bg-ccr-magenta/10 text-ccr-magenta",
    blue: "bg-ccr-blue/10 text-ccr-blue",
  }[tone];
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles}`}>
      {children}
    </span>
  );
}

export function Notice({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "magenta" }) {
  return (
    <p
      className={`mb-6 rounded-lg p-3 text-sm ${
        tone === "gold" ? "bg-ccr-gold/15" : "bg-ccr-magenta/10 text-ccr-magenta"
      }`}
    >
      {children}
    </p>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-ccr-ink/10 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-ccr-ink/10 bg-ccr-ink/[0.03] text-xs uppercase tracking-wide text-ccr-ink/50">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ccr-ink/5">{children}</tbody>
      </table>
    </div>
  );
}
