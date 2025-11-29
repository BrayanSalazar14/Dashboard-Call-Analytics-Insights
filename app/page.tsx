"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { DirectionChart } from "@/components/dashboard/direction-chart";
import { StatusChart } from "@/components/dashboard/status-chart";
import { DisconnectionChart } from "@/components/dashboard/disconnection-chart";
import { Phone, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { CallMetrics } from "@/lib/supabase";

interface MetricsResponse {
  data: CallMetrics;
  cached: boolean;
  lastUpdate: string;
  warning?: string;
}

async function fetchMetrics(): Promise<MetricsResponse> {
  const res = await fetch("/api/metrics");
  if (!res.ok) throw new Error("Failed to fetch metrics");
  return res.json();
}

async function refreshMetrics(): Promise<MetricsResponse> {
  const res = await fetch("/api/refresh", { method: "POST" });
  if (!res.ok) throw new Error("Failed to refresh metrics");
  return res.json();
}

export default function Home() {
  const [isManualRefresh, setIsManualRefresh] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["metrics"],
    queryFn: fetchMetrics,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });

  async function handleRefresh() {
    setIsManualRefresh(true);
    try {
      await refreshMetrics();
      await refetch();
    } finally {
      setIsManualRefresh(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading metrics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="p-4 bg-destructive/10 rounded-lg max-w-md">
                <p className="text-destructive font-semibold mb-2">
                  Error loading metrics
                </p>
                <p className="text-sm text-muted-foreground">
                  {(error as Error).message}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const metrics = data?.data;

  if (!metrics) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 max-w-7xl">
        <DashboardHeader
          onRefresh={handleRefresh}
          isRefreshing={isManualRefresh}
          lastUpdate={data?.lastUpdate}
          isCached={data?.cached}
        />

        {data?.warning && (
          <div className="mb-6 p-4 bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              ⚠️ {data.warning}
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <StatCard
            title="Total Calls"
            value={metrics.total_calls}
            description="All processed calls"
            icon={Phone}
            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            delay={0}
          />
          <StatCard
            title="Inbound Calls"
            value={metrics.inbound}
            description="Incoming calls received"
            icon={PhoneIncoming}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            delay={0.1}
          />
          <StatCard
            title="Outbound Calls"
            value={metrics.outbound}
            description="Outgoing calls made"
            icon={PhoneOutgoing}
            gradient="bg-gradient-to-br from-orange-500 to-amber-600"
            delay={0.2}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <DirectionChart
            inbound={metrics.inbound}
            outbound={metrics.outbound}
          />
          <StatusChart data={metrics.by_status} />
        </div>

        <div className="grid gap-6 lg:grid-cols-1">
          <DisconnectionChart data={metrics.by_disconnection_reason} />
        </div>
      </div>
    </div>
  );
}
