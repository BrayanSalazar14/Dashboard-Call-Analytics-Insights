"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RefreshCw, Phone } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface DashboardHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdate?: string;
  isCached?: boolean;
}

export function DashboardHeader({
  onRefresh,
  isRefreshing,
  lastUpdate,
  isCached,
}: DashboardHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 w-full"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Phone className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Call Analytics & Insights</h1>
          <p className="text-sm text-muted-foreground">
            Lending Tower Analytics
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {lastUpdate && (
          <div className="flex flex-col items-end">
            <p className="text-xs text-muted-foreground">Last Updated</p>
            <p className="text-sm font-medium">{formatDate(lastUpdate)}</p>
            {isCached && (
              <span className="text-xs text-orange-500 mt-1">📦 Cached</span>
            )}
          </div>
        )}
        <Button
          onClick={onRefresh}
          disabled={isRefreshing}
          size="lg"
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
    </motion.div>
  );
}
