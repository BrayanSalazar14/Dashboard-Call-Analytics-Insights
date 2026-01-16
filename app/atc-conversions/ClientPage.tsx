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
import { ArrowLeft, BarChart3 } from "lucide-react";
import { useState } from "react";
import { TagChart } from "@/components/dashboard/tag-chart";
import { useQuery } from "@tanstack/react-query";

type AtcResponse = {
  counts: Record<string, number>;
  totalFetched: number;
  totalReported: number;
  tags: string[];
};

async function fetchAtcConversions(): Promise<AtcResponse> {
  const res = await fetch("/api/atc-conversions", {
    method: "POST",
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to load ATC conversions");
  }
  return res.json();
}

export default function ClientPage() {
  const { data, isLoading, error, refetch, isRefetching, dataUpdatedAt } =
    useQuery({
      queryKey: ["atc-conversions"],
      queryFn: fetchAtcConversions,
      refetchInterval: 6 * 60 * 1000,
      refetchOnMount: true,
      staleTime: 0,
      gcTime: 0,
    });
  const counts = data?.counts ?? null;
  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleString()
    : undefined;

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

        {counts && <TagChart data={counts} title="ATC Conversions by Tag" />}
      </div>
    </div>
  );
}
