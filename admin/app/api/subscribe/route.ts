import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Valid email required" },
      { status: 400, headers: corsHeaders }
    );
  }

  const { error } = await getSupabase()
    .from("subscribers")
    .insert({ email: email.toLowerCase().trim() });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Already subscribed" },
        { status: 409, headers: corsHeaders }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500, headers: corsHeaders }
    );
  }

  return NextResponse.json(
    { message: "Subscribed successfully" },
    { headers: corsHeaders }
  );
}
