import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "ATC Conversions by Day",
  description: "Daily ATC conversion overview",
};

export default function ATCConversionsPage() {
  return <ClientPage />;
}
