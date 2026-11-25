import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "CCR Famille - Intranet",
  description: "Espace de gestion interne CCR Famille Casablanca",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${montserrat.variable} ${playfair.variable}`}>
      <body className="bg-ccr-cream font-body text-ccr-ink">{children}</body>
    </html>
  );
}
