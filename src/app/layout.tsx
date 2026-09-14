import type { Metadata } from "next";
import { Manrope, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ALLO VIDANGE — Vidange & Entretien Auto en Tunisie",
    template: "%s — ALLO VIDANGE",
  },
  description:
    "ALLO VIDANGE : vidange moteur, remplacement de filtres et entretien automobile à Tunis. Prenez rendez-vous en ligne rapidement et facilement.",
  keywords: [
    "vidange",
    "vidange Tunis",
    "vidange voiture Tunis",
    "entretien auto Tunis",
    "changement huile Tunis",
    "filtre huile Tunis",
    "ALLO VIDANGE",
    "garage Tunis",
    "vidange Bardo",
  ],
  authors: [{ name: "ALLO VIDANGE" }],
  openGraph: {
    type: "website",
    locale: "fr_TN",
    siteName: "ALLO VIDANGE",
    title: "ALLO VIDANGE — Vidange & Entretien Auto en Tunisie",
    description:
      "Prenez rendez-vous pour votre vidange, remplacement de filtres ou entretien automobile à Tunis.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${manrope.variable} ${barlowCondensed.variable}`}
        style={{ fontFamily: "var(--font-manrope, system-ui, sans-serif)" }}
      >
        {children}
      </body>
    </html>
  );
}
