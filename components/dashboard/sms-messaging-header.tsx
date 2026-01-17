"use client";

import { MessageSquare } from "lucide-react";

interface SMSMessagingHeaderProps {
  totalContacts: number;
  totalCost?: number;
}

export function SMSMessagingHeader({
  totalContacts,
  totalCost,
}: SMSMessagingHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-lg">
        <MessageSquare className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h1 className="text-3xl font-bold">SMS Messaging Costs</h1>
        <p className="text-sm text-muted-foreground">Lending Tower Analytics</p>
        <div className="flex items-center gap-4 mt-2">
          <div>
            <p className="text-xs text-muted-foreground">Total Contacts</p>
            <p className="text-lg font-bold">
              {totalContacts.toLocaleString()}
            </p>
          </div>
          {totalCost !== undefined && (
            <div>
              <p className="text-xs text-muted-foreground">Total Cost</p>
              <p className="text-lg font-bold text-primary">
                ${totalCost.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
