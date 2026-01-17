"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SMSMessagingHeader } from "@/components/dashboard/sms-messaging-header";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

interface Contact {
  id: string;
  firstNameLowerCase?: string;
  lastNameLowerCase?: string;
  email?: string;
  phone?: string;
  customFields?: Array<{
    id: string;
    value: string | string[];
  }>;
  dateAdded?: string;
}

interface ContactsResponse {
  contacts: Contact[];
  total: number;
}

async function fetchContacts(
  page: number,
  pageLimit: number
): Promise<ContactsResponse> {
  const res = await fetch("/api/sms-messaging-costs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page, pageLimit }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch contacts");
  return res.json();
}

export default function ClientPage() {
  const [page, setPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);

  const { data, isLoading, error } = useQuery({
    queryKey: ["sms-contacts", page, pageLimit],
    queryFn: () => fetchContacts(page, pageLimit),
    staleTime: 0,
    gcTime: 0,
  });

  const totalPages = data ? Math.ceil(data.total / pageLimit) : 0;
  const startRecord = data ? (page - 1) * pageLimit + 1 : 0;
  const endRecord = data ? Math.min(page * pageLimit, data.total) : 0;

  const handlePageLimitChange = (newLimit: number) => {
    setPageLimit(newLimit);
    setPage(1);
  };

  const getSmsMessagingCost = (contact: Contact): number => {
    const customField = contact.customFields?.find(
      (cf) => cf.id === "TPtURWK4SpGRRn90jsXG"
    );
    return parseFloat(customField?.value?.toString() || "0");
  };

  const totalCost = data?.contacts.reduce(
    (sum, contact) => sum + getSmsMessagingCost(contact),
    0
  );

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
                <p className="text-muted-foreground">Loading contacts...</p>
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
                    Error loading contacts
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
          <div className="mb-6 flex items-center justify-between">
            <SMSMessagingHeader
              totalContacts={data?.total || 0}
              totalCost={totalCost}
            />
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </Link>
          </div>

          <Card className="shadow-sm">
            <div className="p-6">
              {/* Controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show:</span>
                  <div className="flex gap-1">
                    {[20, 50, 100].map((limit) => (
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
                  <span className="text-sm text-muted-foreground ml-2">
                    entries
                  </span>
                </div>

                <div className="text-sm text-muted-foreground">
                  Showing {startRecord} to {endRecord} of {data?.total || 0}{" "}
                  contacts
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-green-500 dark:text-green-500">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-500 dark:text-green-500">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-500 dark:text-green-500">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-500 dark:text-green-500">
                        Total Cost
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-500 dark:text-green-500">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.contacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-4 py-3 text-xs text-gray-900 font-mono">
                          {contact.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {contact.firstNameLowerCase ||
                          contact.lastNameLowerCase
                            ? `${contact.firstNameLowerCase || ""} ${
                                contact.lastNameLowerCase || ""
                              }`.trim()
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {contact.email || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {contact.phone || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          ${getSmsMessagingCost(contact).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {contact.dateAdded
                            ? new Date(contact.dateAdded).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
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
