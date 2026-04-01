"use client";

import { useState, useEffect } from "react";

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  unsubscribed: boolean;
}

export default function DashboardPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    try {
      const res = await fetch("/api/subscribers");
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers);
        setLoading(false);
        return;
      }
    } catch { /* fall through to mock */ }

    setSubscribers([
      { id: "1", email: "sarah.johnson@gmail.com", subscribed_at: "2026-04-01T10:30:00Z", unsubscribed: false },
      { id: "2", email: "mike.chen@outlook.com", subscribed_at: "2026-04-01T09:15:00Z", unsubscribed: false },
      { id: "3", email: "emma.wilson@yahoo.com", subscribed_at: "2026-03-31T22:45:00Z", unsubscribed: false },
      { id: "4", email: "alex.kumar@gmail.com", subscribed_at: "2026-03-31T18:20:00Z", unsubscribed: false },
      { id: "5", email: "lisa.park@icloud.com", subscribed_at: "2026-03-30T14:10:00Z", unsubscribed: false },
      { id: "6", email: "james.wright@gmail.com", subscribed_at: "2026-03-30T11:05:00Z", unsubscribed: false },
      { id: "7", email: "nina.patel@hotmail.com", subscribed_at: "2026-03-29T16:30:00Z", unsubscribed: false },
      { id: "8", email: "david.lee@gmail.com", subscribed_at: "2026-03-28T09:45:00Z", unsubscribed: false },
      { id: "9", email: "rachel.green@outlook.com", subscribed_at: "2026-03-27T20:15:00Z", unsubscribed: false },
      { id: "10", email: "tom.baker@gmail.com", subscribed_at: "2026-03-26T12:00:00Z", unsubscribed: false },
      { id: "11", email: "sophia.martinez@yahoo.com", subscribed_at: "2026-03-25T08:30:00Z", unsubscribed: false },
      { id: "12", email: "ryan.taylor@gmail.com", subscribed_at: "2026-03-24T15:45:00Z", unsubscribed: false },
    ]);
    setLoading(false);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === subscribers.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(subscribers.map((s) => s.id)));
    }
  }

  const sendCount = selected.size || subscribers.length;
  const sendLabel = selected.size > 0
    ? `Send to ${selected.size} selected`
    : `Send to all ${subscribers.length}`;

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm(`Send email to ${sendCount} subscriber${sendCount > 1 ? "s" : ""}?`)) return;

    setSending(true);
    setResult(null);

    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        html: body.replace(/\n/g, "<br>"),
        emails: selected.size > 0
          ? subscribers.filter((s) => selected.has(s.id)).map((s) => s.email)
          : undefined,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setResult(`Sent to ${data.sent} subscribers. ${data.failed} failed.`);
      setSubject("");
      setBody("");
    } else {
      setResult(`Error: ${data.error}`);
    }
    setSending(false);
  }

  function exportCSV() {
    const csv = "email,subscribed_at\n" +
      subscribers.map((s) => `${s.email},${s.subscribed_at}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arrivd-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const weekCount = subscribers.filter((s) => {
    return new Date().getTime() - new Date(s.subscribed_at).getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const todayCount = subscribers.filter((s) => {
    return new Date(s.subscribed_at).toDateString() === new Date().toDateString();
  }).length;

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7C3AED, #9b5de5)", boxShadow: "0 4px 16px rgba(124,58,237,0.2)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1a1a2e]">Arrivd</h1>
            <p className="text-xs text-[#b0a8c4]">Subscriber Dashboard</p>
          </div>
        </div>
        <button
          onClick={exportCSV}
          className="glass glass-hover px-5 py-2.5 text-sm font-medium cursor-pointer text-[#6b6185]"
        >
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass glass-hover p-6">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#b0a8c4]">Total Subscribers</p>
          <p className="text-4xl font-bold mt-2 text-[#1a1a2e]">
            {loading ? "—" : subscribers.length}
          </p>
        </div>
        <div className="glass glass-hover p-6">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#b0a8c4]">This Week</p>
          <p className="text-4xl font-bold mt-2" style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {loading ? "—" : weekCount}
          </p>
        </div>
        <div className="glass glass-hover p-6">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#b0a8c4]">Today</p>
          <p className="text-4xl font-bold mt-2" style={{ background: "linear-gradient(135deg, #10B981, #6EE7B7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {loading ? "—" : todayCount}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscriber List */}
        <div className="glass overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(124,58,237,0.06)" }}>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleAll}
                className="w-5 h-5 rounded flex items-center justify-center transition cursor-pointer"
                style={{
                  background: selected.size === subscribers.length && subscribers.length > 0 ? "#7C3AED" : "rgba(124,58,237,0.06)",
                  border: selected.size === subscribers.length && subscribers.length > 0 ? "none" : "1.5px solid rgba(124,58,237,0.15)",
                }}
              >
                {selected.size === subscribers.length && subscribers.length > 0 && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </button>
              <h2 className="font-semibold text-[#1a1a2e] text-sm">Subscribers</h2>
            </div>
            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(124,58,237,0.12)", color: "#7C3AED" }}>
                  {selected.size} selected
                </span>
              )}
              <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(124,58,237,0.06)", color: "#9992ab" }}>
                {subscribers.length}
              </span>
            </div>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="p-12 text-center text-[#b0a8c4]">Loading...</div>
            ) : subscribers.length === 0 ? (
              <div className="p-12 text-center text-[#b0a8c4]">No subscribers yet</div>
            ) : (
              <div>
                {subscribers.map((sub, i) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between px-6 py-3.5 transition-colors cursor-pointer"
                    style={{
                      borderBottom: i < subscribers.length - 1 ? "1px solid rgba(124,58,237,0.04)" : "none",
                      background: selected.has(sub.id) ? "rgba(124,58,237,0.03)" : "transparent",
                    }}
                    onClick={() => toggleSelect(sub.id)}
                    onMouseEnter={(e) => { if (!selected.has(sub.id)) e.currentTarget.style.background = "rgba(124,58,237,0.015)"; }}
                    onMouseLeave={(e) => { if (!selected.has(sub.id)) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition"
                        style={{
                          background: selected.has(sub.id) ? "#7C3AED" : "rgba(124,58,237,0.06)",
                          border: selected.has(sub.id) ? "none" : "1.5px solid rgba(124,58,237,0.15)",
                        }}
                      >
                        {selected.has(sub.id) && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                      </div>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          background: `linear-gradient(135deg, hsl(${(i * 47) % 360}, 55%, 55%), hsl(${(i * 47 + 40) % 360}, 55%, 65%))`,
                          color: "white",
                        }}
                      >
                        {sub.email[0].toUpperCase()}
                      </div>
                      <span className="text-sm text-[#3d3652]">{sub.email}</span>
                    </div>
                    <span className="text-xs text-[#b0a8c4]">
                      {new Date(sub.subscribed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Send Email */}
        <div className="glass">
          <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(124,58,237,0.06)" }}>
            <h2 className="font-semibold text-[#1a1a2e] text-sm">Compose Email</h2>
          </div>
          <form onSubmit={handleSendEmail} className="p-6 space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[2px] mb-2 text-[#b0a8c4]">Subject</label>
              <input
                type="text"
                placeholder="Your email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[2px] mb-2 text-[#b0a8c4]">Body</label>
              <textarea
                placeholder="Write your email content here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                required
              />
            </div>

            {result && (
              <div className="rounded-xl px-4 py-3 text-sm" style={{
                background: result.startsWith("Error") ? "rgba(239,68,68,0.06)" : "rgba(16,185,129,0.06)",
                border: `1px solid ${result.startsWith("Error") ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)"}`,
                color: result.startsWith("Error") ? "#DC2626" : "#059669",
              }}>
                {result}
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition disabled:opacity-50 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #9b5de5)",
                boxShadow: "0 8px 24px rgba(124,58,237,0.2)",
              }}
            >
              {sending ? "Sending..." : sendLabel}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
