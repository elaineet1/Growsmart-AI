// app/page.js — redirect root to dashboard
import { redirect } from "next/navigation";
export default function Home() {
  redirect("/dashboard");
}
