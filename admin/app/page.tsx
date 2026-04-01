"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError("Invalid password");
    }
    setLoading(false);
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="glass-strong p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "linear-gradient(135deg, #7C3AED, #9b5de5)", boxShadow: "0 8px 32px rgba(124,58,237,0.25)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#1a1a2e]">Arrivd Admin</h1>
            <p className="text-sm mt-1 text-[#9992ab]">Sign in to manage subscribers</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl text-sm"
              required
            />

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition disabled:opacity-50 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #9b5de5)",
                boxShadow: "0 8px 24px rgba(124,58,237,0.2)",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-[#b0a8c4]">
          Arrivd &middot; Subscriber Management
        </p>
      </div>
    </div>
  );
}
