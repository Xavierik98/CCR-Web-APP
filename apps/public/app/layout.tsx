import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import { Footer } from "./_components/footer";
import { Header } from "./_components/header";
import "./globals.css";

// Appariement inspire du logo officiel : un serif a empattements marques pour les
// grands titres (echo des lettres ornees du logo), un sans-serif net pour le reste
// (meme famille que la reference etudiee, impactcentrechretien.com).
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
  description: "Site officiel de l'eglise CCR Famille a Casablanca.",
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
      </body>
    </html>
  );
}
