import Link from "next/link";
import { ArrowRight, Phone, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full px-4 py-10 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Select a view</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose which dashboard to open.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Call Analytics & Insights</CardTitle>
                  <CardDescription>
                    Calls metrics and visualizations (inbound/outbound, status, and disconnections).
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/call-analytics">
                <Button className="gap-2">
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>ATC Conversions by Day</CardTitle>
                  <CardDescription>
                    Daily ATC conversion trends by date.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/atc-conversions">
                <Button className="gap-2" variant="secondary">
                  View conversions
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
