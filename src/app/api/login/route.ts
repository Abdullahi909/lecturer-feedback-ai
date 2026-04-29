// Login route.
// This checks the users table in Supabase using a plain username/password match.
// It is intentionally simple because this project is a demo/student-style app.

import { fetchUserByUsername } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Read the JSON body from the incoming request.
  let body: { username?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Clean the values a little first.
  const username = (body.username ?? "").trim().toLowerCase();
  const password = (body.password ?? "").trim();

  // Stop early if either field is blank.
  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  try {
    // Look up the user in Supabase.
    const user = await fetchUserByUsername(username);

    // Reject the login if the user does not exist or the password is wrong.
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Incorrect username or password." }, { status: 401 });
    }

    // Return only the fields the frontend needs to store.
    return NextResponse.json({
      id: user.id,
      name: user.name,
      initials: user.initials,
      role: user.role,
    });
  } catch (error) {
    // Give a friendly message if Supabase is not configured yet.
    const message =
      error instanceof Error ? error.message : "Could not complete login.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
