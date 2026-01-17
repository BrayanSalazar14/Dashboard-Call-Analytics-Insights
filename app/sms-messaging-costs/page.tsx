import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "SMS Messaging Costs - Lending Tower",
  description: "Advanced analytics dashboard for Retell AI SMS messaging costs",
};

export default function SMSMessagingCostsPage() {
  return <ClientPage />;
}
