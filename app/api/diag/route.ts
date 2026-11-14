import { NextResponse } from "next/server";

// Temporary: receives load steps from browsers that crash on start (iPhone Safari) and writes
// them to the server log. Only step names, timings and the user agent; no user data.
export async function POST(req: Request) {
  const body = (await req.text()).slice(0, 600).replace(/[^\x20-\x7e]/g, "?");
  console.log(`[diag] ${body} | ${(req.headers.get("user-agent") ?? "").slice(0, 200)}`);
  return new NextResponse(null, { status: 204 });
}
