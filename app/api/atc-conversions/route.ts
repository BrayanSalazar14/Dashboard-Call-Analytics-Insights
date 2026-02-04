import { NextRequest, NextResponse } from "next/server";

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

// Dashboard configurations
const DASHBOARD_CONFIGS = {
  "lending-tower": {
    tags: [
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
    ],
    buildFilters: function () {
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
                  value: this.tags,
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
                  value: this.tags,
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
    },
  },
  "reactivation-pitched-ds": {
    tags: [
      "pitched ds atc day 1",
      "pitched ds atc day 3",
      "pitched ds atc day 5",
      "pitched ds atc day 7",
      "pitched ds atc day 10",
      "pitched ds atc day 14",
      "pitched ds atc day 18",
      "pitched ds atc day 22",
      "pitched ds atc day 28",
      "pitched ds atc day 37",
      "pitched ds atc day 42",
      "pitched ds atc day 49",
      "pitched ds atc day 56",
      "pitched ds atc day 63",
    ],
    buildFilters: function () {
      const rejectionValues = [
        "Rejected (Pitched DS",
        "Rejected (Attempting to Contact DS)",
        "Rejected (Approval Call Set DS)",
        "Rejected (Partial DS)",
        "AP (FU) 15+ Days",
      ];

      return [
        {
          group: "OR",
          filters: rejectionValues.map((rejectionValue) => ({
            group: "AND",
            filters: [
              {
                field: "tags",
                operator: "contains",
                value: this.tags,
              },
              {
                field: "customFields.6fEKNMYWRgQiaZFPfQwT",
                operator: "eq",
                value: "Pitched DS Reactivation Lead",
              },
              {
                field: "customFields.lSLvJkqnLA3fUBEFAfCz",
                operator: "eq",
                value: rejectionValue,
              },
            ],
          })),
        },
      ];
    },
  },
  "reactivation-leads": {
    tags: [
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
    ],
    buildFilters: function () {
      return [
        {
          group: "OR",
          filters: [
            {
              group: "AND",
              filters: [
                {
                  field: "tags",
                  operator: "contains",
                  value: this.tags,
                },
                {
                  field: "customFields.6fEKNMYWRgQiaZFPfQwT",
                  operator: "eq",
                  value: "Reactivation Lead",
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
                  operator: "contains",
                  value: this.tags,
                },
                {
                  field: "customFields.lSLvJkqnLA3fUBEFAfCz",
                  operator: "eq",
                  value: "ProLaw Enrolled",
                },
                {
                  field: "customFields.6fEKNMYWRgQiaZFPfQwT",
                  operator: "eq",
                  value: "Reactivation Lead",
                },
              ],
            },
          ],
        },
      ];
    },
  },
} as const;

export type DashboardType = keyof typeof DASHBOARD_CONFIGS;

export async function POST(request: NextRequest) {
  const locationId = process.env.NEXT_PUBLIC_LOCATION_ID_GHL;

  // Get dashboard type from request body
  let dashboardType: DashboardType = "lending-tower";
  try {
    const reqBody = await request.json();
    if (reqBody.dashboardType && reqBody.dashboardType in DASHBOARD_CONFIGS) {
      dashboardType = reqBody.dashboardType as DashboardType;
    }
  } catch {
    // If no body or invalid JSON, use default
  }

  const config = DASHBOARD_CONFIGS[dashboardType];

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
      filters: config.buildFilters(),
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

  // Aggregate counts by tag (only those in config.tags list) on unique contacts
  const counts: Record<string, number> = Object.fromEntries(config.tags.map((t) => [t, 0]));
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
    tags: config.tags,
    dashboardType,
  });
}


