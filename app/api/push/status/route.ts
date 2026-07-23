import { NextResponse } from "next/server";
import { kvConfigured } from "../../../lib/kv";
import { pushServerReady } from "../../../lib/pushServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lets the Settings UI tell the user exactly what backend config is missing.
export async function GET() {
  const storage = kvConfigured();
  const vapid = pushServerReady();
  return NextResponse.json({
    ready: storage && vapid,
    storage,
    vapid,
    cronSecret: !!process.env.CRON_SECRET,
  });
}
