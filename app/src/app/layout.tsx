import type { ReactNode } from "react";

export const metadata = {
  title: "InfinityTelegraph",
  description: "Verifiable market signals for autonomous agents, on Telegraph.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0b0d16", color: "#eef1f9" }}>
        {children}
      </body>
    </html>
  );
}
