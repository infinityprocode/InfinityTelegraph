import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Archivo({ subsets: ["latin"], weight: ["500", "700", "900"], variable: "--font-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-mono", display: "swap" });

const SITE = "https://sinais.infinityprocode.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "InfinityTelegraph · Sinais de mercado verificáveis on-chain",
  description:
    "Sinais de direção de mercado verificados contra o preço real, servidos por um miner na rede Telegraph (Base). Direção, convicção e regime por ativo, ao vivo.",
  keywords: ["sinais de mercado", "Telegraph protocol", "x402", "trading signals", "verifiable inference", "Base", "DeFi", "on-chain"],
  openGraph: {
    title: "InfinityTelegraph · Sinais verificáveis para agentes", type: "website", locale: "pt_BR",
    url: SITE, siteName: "InfinityTelegraph",
    description: "Direção, convicção e regime por ativo, verificados contra o preço real. Miner na rede Telegraph (Base).",
  },
  twitter: { card: "summary_large_image", creator: "@InfinityProCode" },
  alternates: { canonical: SITE },
};

const JSONLD = {
  "@context": "https://schema.org", "@type": "SoftwareApplication", name: "InfinityTelegraph",
  applicationCategory: "FinanceApplication", operatingSystem: "Web", url: SITE,
  description: "Camada de sinais de mercado verificáveis para agentes autônomos, na rede Telegraph (Base). Um miner transforma dados de mercado em sinais de direção pontuados e checáveis contra o preço real.",
  author: { "@type": "Organization", name: "Infinity Pro Code", url: "https://infinityprocode.com.br" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${mono.variable}`}>
      <body>
        <div className="bg-grid" aria-hidden="true" />
        <div className="bg-scan" aria-hidden="true" />
        <div className="bg-glow" aria-hidden="true" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />
        {children}
      </body>
    </html>
  );
}
