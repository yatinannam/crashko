import { NextResponse } from "next/server";

/**
 * The credentials/signup flow has been replaced with Google OAuth.
 * This route is kept as a stub so any stale bookmarks get a clean response.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Sign-up via email is no longer supported. Please use Google." },
    { status: 410 },
  );
}

