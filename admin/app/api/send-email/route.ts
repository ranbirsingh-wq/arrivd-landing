import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getResend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const { subject, html } = await req.json();

  if (!subject || !html) {
    return NextResponse.json(
      { error: "Subject and HTML body required" },
      { status: 400 }
    );
  }

  const { data: subscribers, error } = await getSupabase()
    .from("subscribers")
    .select("email")
    .eq("unsubscribed", false);

  if (error || !subscribers?.length) {
    return NextResponse.json(
      { error: error?.message || "No subscribers found" },
      { status: 500 }
    );
  }

  let sent = 0;
  let failed = 0;

  // Send in batches of 10 with small delays
  for (let i = 0; i < subscribers.length; i += 10) {
    const batch = subscribers.slice(i, i + 10);
    const results = await Promise.allSettled(
      batch.map((sub) =>
        getResend().emails.send({
          from: "Arrivd <hello@arrivd.net>",
          to: sub.email,
          subject,
          html,
        })
      )
    );

    results.forEach((r) => {
      if (r.status === "fulfilled") sent++;
      else failed++;
    });

    // Rate limit pause between batches
    if (i + 10 < subscribers.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return NextResponse.json({ sent, failed, total: subscribers.length });
}
