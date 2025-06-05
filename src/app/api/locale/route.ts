import { NextResponse } from "next/server";
import { Locale, locales } from "@/i18n/config";

export async function POST(request: Request) {
  const { locale } = await request.json();
  if (!locales.includes(locale as Locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
