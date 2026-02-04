"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, ChevronDown } from "lucide-react";
import { useState } from "react";
import { TagChart } from "@/components/dashboard/tag-chart";
import { useQuery } from "@tanstack/react-query";

type DashboardType = "lending-tower" | "reactivation-pitched-ds" | "reactivation-leads";

const DASHBOARD_OPTIONS: {
  value: DashboardType;
  label: string;
  colors: string[];
}[] = [
  {
    value: "lending-tower",
    label: "Lending Tower",
    colors: ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"], // Blue
  },
  {
    value: "reactivation-leads",
    label: "Reactivation Leads",
    colors: ["#22c55e", "#4ade80", "#86efac", "#bbf7d0", "#dcfce7"], // Green
  },
  {
    value: "reactivation-pitched-ds",
    label: "Reactivation Lead - Pitched DS",
    colors: ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#ffedd5"], // Orange
  },
];

type AtcResponse = {
  counts: Record<string, number>;
  totalFetched: number;
  totalReported: number;
  tags: string[];
  dashboardType: DashboardType;
};

async function fetchAtcConversions(dashboardType: DashboardType): Promise<AtcResponse> {
  const res = await fetch("/api/atc-conversions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dashboardType }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to load ATC conversions");
  }
  return res.json();
}

export default function ClientPage() {
  const [dashboardType, setDashboardType] = useState<DashboardType>("lending-tower");

  const { data, isLoading, error, refetch, isRefetching, dataUpdatedAt } =
    useQuery({
      queryKey: ["atc-conversions", dashboardType],
      queryFn: () => fetchAtcConversions(dashboardType),
      refetchInterval: 6 * 60 * 1000,
      refetchOnMount: true,
      staleTime: 0,
      gcTime: 0,
    });
  const counts = data?.counts ?? null;
  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleString()
    : undefined;

  const currentDashboard = DASHBOARD_OPTIONS.find(
    (opt) => opt.value === dashboardType
  );
  const currentDashboardLabel = currentDashboard?.label;
  const currentDashboardColors = currentDashboard?.colors;

  return (
    <div className="min-h-screen bg-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full px-4 py-8 max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">ATC Conversions by Day</h1>
              <p className="text-sm text-muted-foreground">
                Daily conversion trends
              </p>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {lastUpdated}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={dashboardType}
                onChange={(e) => setDashboardType(e.target.value as DashboardType)}
                disabled={isLoading || isRefetching}
                className="appearance-none bg-background border border-input rounded-md px-3 py-2 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {DASHBOARD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
            </div>
            <Button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="gap-2"
            >
              {isRefetching ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-background" />
              ) : null}
              {isRefetching ? "Refreshing..." : "Refresh"}
            </Button>
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </Link>
          </div>
        </div>

        {isLoading && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Loading ATC conversions...</CardTitle>
                <CardDescription>
                  Fetching all contacts across pages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </CardContent>
            </Card>
          </div>
        )}

        {!!error && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Error</CardTitle>
                <CardDescription>
                  Failed to load ATC conversions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {(error as Error).message}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {counts && (
          <TagChart
            data={counts}
            title={`ATC Conversions - ${currentDashboardLabel}`}
            colors={currentDashboardColors}
          />
        )}
      </div>
    </div>
  );
}
