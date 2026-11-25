import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eglise CCR",
  description: "Site officiel de l'Eglise CCR",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
