import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-serif", display: "swap" });

const SITE = "https://sinais.infinityprocode.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "InfinityTelegraph · Sinais de mercado verificáveis para máquinas",
  description:
    "Sinais de direção de mercado verificáveis contra o preço real, servidos por um miner na rede Telegraph (Base). Direção, confiança e regime por ativo, em tempo real.",
  keywords: ["sinais de mercado", "Telegraph protocol", "x402", "trading signals", "verifiable inference", "Base"],
  openGraph: {
    title: "InfinityTelegraph · Sinais verificáveis para agentes",
    description: "Direção, confiança e regime por ativo, verificados contra o preço real. Miner na rede Telegraph (Base).",
    url: SITE, siteName: "InfinityTelegraph", locale: "pt_BR", type: "website",
  },
  twitter: { card: "summary_large_image", creator: "@InfinityProCode" },
  alternates: { canonical: SITE },
};

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "InfinityTelegraph",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  description:
    "Camada de sinais de mercado verificáveis para agentes autônomos, construída sobre a rede Telegraph (Base). Um miner transforma dados de mercado em sinais de direção pontuados e checáveis contra o preço real.",
  url: SITE,
  author: { "@type": "Organization", name: "Infinity Pro Code", url: "https://infinityprocode.com.br" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${mono.variable} ${serif.variable}`}>
      <body>
        <div className="orbs" aria-hidden="true">
          <span className="orb a" /><span className="orb b" /><span className="orb c" />
        </div>
        <div className="grain" aria-hidden="true" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />
        {children}
      </body>
    </html>
  );
}
