// Root page — immediately sends visitors to the login page.
// The login page then decides where to go based on the user's role.

import { redirect } from "next/navigation";

export default function Home() {
  // Send everyone to the login page first.
  redirect("/login");
}
