import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  const isVercel = origin.includes("vercel.app");
  const siteUrl = isVercel
    ? "https://python-mastery-tracker.vercel.app"
    : process.env.NEXT_PUBLIC_SITE_URL || origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${siteUrl}${next}`);
    }
  }

  // Return the user to dashboard on error
  return NextResponse.redirect(`${siteUrl}/dashboard?auth_error=true`);
}
