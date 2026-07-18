import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { LanguageSwitcher } from "../components/language-switcher";
import { getDictionary } from "../lib/i18n";
import { getCurrentLocale } from "../lib/i18n-server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mobile Piano Practice Coach",
  description: "Mobile-first piano practice tracking with doremi labels shown under imported score notes.",
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);

  return (
    <html lang={locale}>
      <body>
        <div className="app-shell">
          <header className="hero">
            <div>
              <p className="eyebrow">{dict.layout.eyebrow}</p>
              <h1>{dict.layout.title}</h1>
              <p className="hero-copy">{dict.layout.heroCopy}</p>
            </div>
            <div className="header-actions">
              <LanguageSwitcher locale={locale} />
              <nav className="top-nav" aria-label="Primary">
                <Link href="/">{dict.nav.dashboard}</Link>
                <Link href="/pieces/piece-twinkle">{dict.nav.pieceDetail}</Link>
                <Link href="/practice/session-today">{dict.nav.practice}</Link>
                <Link href="/pieces/new">{dict.nav.newPiece}</Link>
              </nav>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
