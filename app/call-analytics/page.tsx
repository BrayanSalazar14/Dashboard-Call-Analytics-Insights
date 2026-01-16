import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Call Analytics & Insights - Lending Tower",
  description: "Advanced analytics dashboard for Retell AI call metrics",
};

export default function CallAnalyticsPage() {
  return <ClientPage />;
}
