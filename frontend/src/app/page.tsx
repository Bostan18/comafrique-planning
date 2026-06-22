"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.push(user ? "/interventions" : "/login");
  }, [loading, user, router]);

  return <div className="empty-state" style={{ minHeight: "100vh" }}>Chargement…</div>;
}
