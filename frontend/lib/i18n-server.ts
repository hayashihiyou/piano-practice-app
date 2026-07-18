import { cookies } from "next/headers";

import type { Locale } from "./i18n";

export async function getCurrentLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value;
  return locale === "ja" ? "ja" : "en";
}
