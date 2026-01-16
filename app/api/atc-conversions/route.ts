import { NextResponse } from "next/server";

const GHL_BASE_URL = "https://services.leadconnectorhq.com";

type Contact = {
  id: string;
  tags?: string[];
  [key: string]: any;
};

type SearchResponse = {
  contacts: Contact[];
  total: number;
  page?: number;
  nextPage?: number;
  searchAfter?: string;
};

const TAGS = [
  "atc day 1",
  "atc day 2",
  "atc day 3",
  "atc day 7",
  "atc day 17",
  "atc day 35",
  "atc day 48",
  "atc day 69",
  "atc day 90",
  "atc day 125",
  "atc day 167",
  "atc day 241",
  "atc day 331",
];

function buildFilters() {
  // Exact requested nested structure:
  // "filters":[{"group":"OR","filters":[
  //   {"group":"AND","filters":[
  //     {"field":"tags","operator":"contains","value":[...TAGS_LDR...]},
  //     {"field":"custom_fields.lSLvJkqnLA3fUBEFAfCz","operator":"match","value":"LDR Enrolled"}
  //   ]},
  //   {"group":"AND","filters":[
  //     {"field":"tags","operator":"contains","value":[...TAGS_PROLAW...]},
  //     {"field":"custom_fields.lSLvJkqnLA3fUBEFAfCz","operator":"match","value":"ProLaw Enrolled"}
  //   ]}
  // ]}]
  const TAGS_LDR = TAGS;
  const TAGS_PROLAW = TAGS;
  return [
    {
      group: "OR",
      filters: [
        {
          group: "AND",
          filters: [
            {
              field: "tags",
              operator: "eq",
              value: TAGS_LDR,
            },
            {
              field: "customFields.lSLvJkqnLA3fUBEFAfCz",
              operator: "eq",
              value: "LDR Enrolled",
            },
          ],
        },
        {
          group: "AND",
          filters: [
            {
              field: "tags",
              operator: "eq",
              value: TAGS_PROLAW,
            },
            {
              field: "customFields.lSLvJkqnLA3fUBEFAfCz",
              operator: "eq",
              value: "ProLaw Enrolled",
            },
          ],
        },
      ],
    },
  ];
}

export async function POST() {
  const locationId = process.env.NEXT_PUBLIC_LOCATION_ID_GHL;

  const headers: Record<string, string> = {
    Authorization: process.env.NEXT_PUBLIC_API_KEY_GHL || "",
    Version: "2021-07-28",
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const pageLimit = 100; // higher limit to reduce pagination rounds
  const contactById: Map<string, Contact> = new Map();
  let total = 0;

  // Prefer cursor-based pagination if supported; otherwise fallback to page number
  let usingCursor = false;
  let page = 1;
  let searchAfter: string | undefined = undefined;

  for (let i = 0; i < 200; i++) {
    const body: any = {
      locationId,
      pageLimit,
      filters: buildFilters(),
    };
    if (usingCursor && searchAfter) {
      body.searchAfter = searchAfter;
    } else if (!usingCursor) {
      body.page = page;
    }

    const res = await fetch(`${GHL_BASE_URL}/contacts/search`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "GHL request failed", details: text },
        { status: 502 }
      );
    }

    const data = (await res.json()) as SearchResponse & {
      traceId?: string;
    };

    const contacts = Array.isArray((data as any).contacts)
      ? (data as any).contacts
      : (data as any).results || [];

    // On first page, capture reported total if present
    if (i === 0 && typeof (data as any).total === "number") {
      total = (data as any).total;
    }

    // Merge contacts ensuring uniqueness by id
    for (const c of contacts) {
      if (c && typeof c.id === "string" && c.id.length > 0) {
        if (!contactById.has(c.id)) {
          contactById.set(c.id, c);
        }
      }
    }

    // Adopt cursor mode if API returns searchAfter
    const nextCursor = typeof (data as any).searchAfter === "string" ? (data as any).searchAfter as string : undefined;
    if (nextCursor) {
      usingCursor = true;
      searchAfter = nextCursor;
    }

    // Stop if we've collected the reported total (if provided)
    if (total && contactById.size >= total) break;

    // If no contacts were returned, no more pages
    if (contacts.length === 0) break;

    // If not using cursor, increment page and continue
    if (!usingCursor) {
      page += 1;
      // If no total reported, stop when a short page appears
      if (!total && contacts.length < pageLimit) break;
    }

  }

  // Aggregate counts by tag (only those in TAGS list) on unique contacts
  const counts: Record<string, number> = Object.fromEntries(TAGS.map((t) => [t, 0]));
  for (const contact of contactById.values()) {
    const tagList = Array.isArray(contact.tags) ? contact.tags : [];
    for (const tag of tagList) {
      if (tag in counts) {
        counts[tag] += 1;
      }
    }
  }

  return NextResponse.json({
    totalReported: total || contactById.size,
    totalFetched: contactById.size,
    counts,
    tags: TAGS,
  });
}


