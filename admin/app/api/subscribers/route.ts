import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await getSupabase()
    .from("subscribers")
    .select("*")
    .eq("unsubscribed", false)
    .order("subscribed_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subscribers: data, count: data.length });
}
