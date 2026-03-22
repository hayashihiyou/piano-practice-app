import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Mobile Piano Practice Coach",
  description: "Mobile-first piano practice tracking, score review, and post-take analysis.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="hero">
            <div>
              <p className="eyebrow">Practice coach</p>
              <h1>Mobile Piano Practice Coach</h1>
              <p className="hero-copy">
                Track practice time by piece, review normalized score data, and prepare audio takes for
                backend analysis from a phone or tablet.
              </p>
            </div>
            <nav className="top-nav" aria-label="Primary">
              <Link href="/">Dashboard</Link>
              <Link href="/pieces/piece-twinkle">Piece detail</Link>
              <Link href="/practice/session-today">Practice</Link>
              <Link href="/analysis/analysis-1">Analysis</Link>
              <Link href="/pieces/new">New piece</Link>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
