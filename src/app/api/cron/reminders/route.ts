import { NextRequest, NextResponse } from "next/server";
import { processReminders } from "@/lib/booking/reminders";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processReminders();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Cron reminder error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
