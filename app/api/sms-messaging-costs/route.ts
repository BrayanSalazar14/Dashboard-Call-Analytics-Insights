// {"filters":[{"group":"OR","filters":[{"group":"AND","filters":[{"field":"customFields.TPtURWK4SpGRRn90jsXG","operator":"range","value":{"gt":1},"uiMeta":{"operator":"gt"}}]}]}],"locationId":"iC88OQ63i0nUqb3v0Q1F","page":1,"pageLimit":20,"sort":[{"field":"dateAdded","direction":"desc"}]}

import { NextResponse, NextRequest } from 'next/server'

const GHL_BASE_URL = "https://services.leadconnectorhq.com";

export async function POST(request: NextRequest) {
  const locationId = process.env.NEXT_PUBLIC_LOCATION_ID_GHL;

  // Get pagination parameters from request body
  const { page = 1, pageLimit = 20 } = await request.json();

  const headers: Record<string, string> = {
    Authorization: process.env.NEXT_PUBLIC_API_KEY_GHL || "",
    Version: "2021-07-28",
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const body: any = {
    locationId,
    filters: [{ group: "OR", filters: [{ group: "AND", filters: [{ field: "customFields.TPtURWK4SpGRRn90jsXG", operator: "eq", value: "1" }] }] }],
    page: page,
    pageLimit: pageLimit,
    sort: [{ field: "dateAdded", direction: "desc" }],
  };

  const res = await fetch(`${GHL_BASE_URL}/contacts/search`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "GHL request failed" }, { status: 502 });
  }
  
  const data = await res.json();
  return NextResponse.json(data);
}