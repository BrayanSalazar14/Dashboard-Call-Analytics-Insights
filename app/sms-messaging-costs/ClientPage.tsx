"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowLeft,
  MessageSquare,
  DollarSign,
  Hash,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  X,
} from "lucide-react";
import Link from "next/link";

const SMS_COST_PER_MESSAGE = 0.0079;

interface Message {
  id: string;
  body?: string;
  contactId?: string;
  conversationId?: string;
  direction?: string;
  status?: string;
  dateAdded?: string;
  messageType?: string;
}

interface MessagesResponse {
  messages: Message[];
  nextCursor: string | null;
  total: number;
}

type StatusFilter = "all" | "delivered" | "failed" | "sent" | "pending" | "read";

const STATUS_CONFIG: Record<StatusFilter, {
  label: string;
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
  iconColor: string;
}> = {
  all: {
    label: "All Messages",
    icon: MessageSquare,
    bgColor: "bg-gray-100 dark:bg-gray-800",
    textColor: "text-gray-900 dark:text-gray-100",
    iconColor: "text-gray-600 dark:text-gray-400",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-700 dark:text-green-400",
    iconColor: "text-green-600 dark:text-green-400",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    bgColor: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-700 dark:text-red-400",
    iconColor: "text-red-600 dark:text-red-400",
  },
  sent: {
    label: "Sent",
    icon: Send,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-700 dark:text-blue-400",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    textColor: "text-yellow-700 dark:text-yellow-400",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
  read: {
    label: "Read",
    icon: CheckCircle,
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-700 dark:text-purple-400",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
};

async function fetchMessages(
  cursor?: string,
  limit: number = 100
): Promise<MessagesResponse> {
  const res = await fetch("/api/sms-messaging-costs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cursor, limit }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export default function ClientPage() {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [pageLimit, setPageLimit] = useState(100);
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["sms-messages", pageIndex, pageLimit],
    queryFn: () => fetchMessages(cursor, pageLimit),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  const totalMessages = data?.total || 0;
  const totalCost = totalMessages * SMS_COST_PER_MESSAGE;
  const currentPage = pageIndex + 1;

  // Count messages by status from current page
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: data?.messages.length || 0,
      delivered: 0,
      failed: 0,
      sent: 0,
      pending: 0,
      read: 0,
    };

    data?.messages.forEach((msg) => {
      const status = msg.status?.toLowerCase() || "pending";
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });

    return counts;
  }, [data?.messages]);

  // Filter messages by selected status
  const filteredMessages = useMemo(() => {
    if (selectedStatus === "all") {
      return data?.messages || [];
    }
    return (data?.messages || []).filter(
      (msg) => (msg.status?.toLowerCase() || "pending") === selectedStatus
    );
  }, [data?.messages, selectedStatus]);

  const handleNextPage = () => {
    if (data?.nextCursor) {
      setCursorHistory((prev) => [...prev, cursor || ""]);
      setCursor(data.nextCursor);
      setPageIndex((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (cursorHistory.length > 0) {
      const newHistory = [...cursorHistory];
      const prevCursor = newHistory.pop();
      setCursorHistory(newHistory);
      setCursor(prevCursor === "" ? undefined : prevCursor);
      setPageIndex((prev) => prev - 1);
    }
  };

  const handlePageLimitChange = (newLimit: number) => {
    setPageLimit(newLimit);
    setCursor(undefined);
    setCursorHistory([]);
    setPageIndex(0);
  };

  const handleStatusClick = (status: StatusFilter) => {
    setSelectedStatus(status);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">SMS Messaging Costs</h1>
                  <p className="text-sm text-muted-foreground">
                    Lending Tower Analytics
                  </p>
                </div>
              </div>
              <Link href="/">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading messages...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">SMS Messaging Costs</h1>
                  <p className="text-sm text-muted-foreground">
                    Lending Tower Analytics
                  </p>
                </div>
              </div>
              <Link href="/">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="p-4 bg-destructive/10 rounded-lg max-w-md">
                  <p className="text-destructive font-semibold mb-2">
                    Error loading messages
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(error as Error).message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">SMS Messaging Costs</h1>
                <p className="text-sm text-muted-foreground">
                  Lending Tower Analytics
                </p>
              </div>
            </div>
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </Link>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Total Messages Card */}
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Hash className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Total SMS Messages
                  </p>
                  <p className="text-4xl font-bold text-gray-900">
                    {totalMessages.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Total Cost Card */}
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Total SMS Cost
                  </p>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                    ${totalCost.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${SMS_COST_PER_MESSAGE} per message
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Status Filter Cards */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Stats of current page ({data?.messages.length || 0} messages)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {(Object.keys(STATUS_CONFIG) as StatusFilter[]).map((status) => {
                const config = STATUS_CONFIG[status];
                const Icon = config.icon;
                const count = statusCounts[status];
                const isSelected = selectedStatus === status;

                return (
                  <Card
                    key={status}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? "ring-2 ring-primary shadow-md"
                        : "hover:ring-1 hover:ring-gray-300"
                    }`}
                    onClick={() => handleStatusClick(status)}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`p-2 rounded-lg ${config.bgColor} mb-2`}>
                        <Icon className={`h-5 w-5 ${config.iconColor}`} />
                      </div>
                      <p className="text-xs text-gray-600 font-medium">
                        {config.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {count.toLocaleString()}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Messages Table */}
          <Card className="shadow-sm">
            <div className="p-6">
              {/* Controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Show:</span>
                    <div className="flex gap-1">
                      {[50, 100, 200].map((limit) => (
                        <Button
                          key={limit}
                          variant={pageLimit === limit ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageLimitChange(limit)}
                        >
                          {limit}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {selectedStatus !== "all" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStatus("all")}
                      className="gap-1"
                    >
                      <X className="h-3 w-3" />
                      Clear filter
                    </Button>
                  )}
                </div>

                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  {isFetching && <Loader2 className="h-4 w-4 animate-spin" />}
                  Showing {filteredMessages.length} of {data?.messages.length || 0}{" "}
                  messages (Page {currentPage})
                  {selectedStatus !== "all" && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${STATUS_CONFIG[selectedStatus].bgColor} ${STATUS_CONFIG[selectedStatus].textColor}`}>
                      {STATUS_CONFIG[selectedStatus].label}
                    </span>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-500 dark:text-green-500">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-500 dark:text-green-500">
                        Message
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-500 dark:text-green-500">
                        Direction
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-500 dark:text-green-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-500 dark:text-green-500">
                        Cost
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-500 dark:text-green-500">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMessages.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          No messages found with status &quot;{STATUS_CONFIG[selectedStatus].label}&quot;
                        </td>
                      </tr>
                    ) : (
                      filteredMessages.map((message) => (
                        <tr
                          key={message.id}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <td className="px-4 py-3 text-xs text-gray-800 font-mono">
                            <Tooltip content={message.id}>
                              <span className="cursor-help">
                                {message.id.slice(0, 8)}...
                              </span>
                            </Tooltip>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-800 max-w-xs">
                            {message.body && message.body.length > 50 ? (
                              <Tooltip content={message.body}>
                                <span className="truncate block max-w-[200px] cursor-help">
                                  {message.body}
                                </span>
                              </Tooltip>
                            ) : (
                              <span>{message.body || "—"}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                message.direction === "outbound"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {message.direction || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {(() => {
                              const status = (message.status?.toLowerCase() || "pending") as StatusFilter;
                              const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
                              return (
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
                                >
                                  {message.status || "pending"}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                            ${SMS_COST_PER_MESSAGE.toFixed(4)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-800">
                            {message.dateAdded
                              ? new Date(message.dateAdded).toLocaleDateString()
                              : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={pageIndex === 0 || isFetching}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!data?.nextCursor || isFetching}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
