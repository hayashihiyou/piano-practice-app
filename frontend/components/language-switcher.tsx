"use client";

import { getDictionary, Locale } from "../lib/i18n";

type LanguageSwitcherProps = {
  locale: Locale;
};

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const dict = getDictionary(locale);

  function setLocale(nextLocale: Locale) {
    document.cookie = `locale=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  }

  return (
    <div className="locale-switcher" role="group" aria-label={dict.switchLanguage}>
      <button
        className={`locale-button ${locale === "en" ? "active" : ""}`}
        type="button"
        onClick={() => setLocale("en")}
      >
        EN
      </button>
      <button
        className={`locale-button ${locale === "ja" ? "active" : ""}`}
        type="button"
        onClick={() => setLocale("ja")}
      >
        日本語
      </button>
    </div>
  );
}
