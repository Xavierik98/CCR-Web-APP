import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import { BackToTop } from "./_components/back-to-top";
import { Footer } from "./_components/footer";
import { Header } from "./_components/header";
import "./globals.css";

// Appariement inspiré du logo officiel : un serif à empattements marqués pour les
// grands titres (écho des lettres ornées du logo), un sans-serif net pour le reste
// (même famille que la référence étudiée, impactcentrechretien.com).
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-display",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: "CCR Famille Casablanca",
    template: "%s | CCR Famille Casablanca",
  },
  description: "Site officiel de l'église CCR Famille à Casablanca.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${playfair.variable} ${montserrat.variable}`}>
      <body className="bg-ccr-cream font-body text-ccr-ink">
        <Header />
        {children}
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
