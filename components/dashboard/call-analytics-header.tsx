"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, Phone, ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface CallAnalyticsHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdate?: string;
  isCached?: boolean;
}

export function CallAnalyticsHeader({
  onRefresh,
  isRefreshing,
  lastUpdate,
  isCached,
}: CallAnalyticsHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Phone className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Call Analytics & Insights</h1>
          <p className="text-sm text-muted-foreground">
            Lending Tower Analytics
          </p>
          {lastUpdate && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {formatDate(lastUpdate)}
              {isCached && <span className="text-orange-500 ml-2">📦 Cached</span>}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          {isRefreshing ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-background" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
      </div>
    </div>
  );
}

