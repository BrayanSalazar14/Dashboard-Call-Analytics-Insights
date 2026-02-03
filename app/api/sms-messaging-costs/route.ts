import { NextResponse, NextRequest } from 'next/server'

const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const LOCATION_ID = process.env.NEXT_PUBLIC_LOCATION_ID_GHL || "";
const AUTH_TOKEN = process.env.NEXT_PUBLIC_API_KEY_GHL || "";

export async function POST(request: NextRequest) {
  const { cursor, limit = 100 } = await request.json();

  const headers: Record<string, string> = {
    Authorization: AUTH_TOKEN,
    Version: "2021-04-15",
    Accept: "application/json",
  };

  const params = new URLSearchParams({
    locationId: LOCATION_ID,
    channel: "SMS",
    limit: limit.toString(),
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  if (cursor) {
    params.append("cursor", cursor);
  }

  const res = await fetch(`${GHL_BASE_URL}/conversations/messages/export?${params.toString()}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("GHL request failed:", res.status, errorText);
    return NextResponse.json({ error: "GHL request failed", details: errorText }, { status: 502 });
  }

  const data = await res.json();
  console.log("API Response - total:", data.total, "messages count:", data.messages?.length, "nextCursor:", data.nextCursor);
  return NextResponse.json(data);
}