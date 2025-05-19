import HeaderBar from "@/components/HeaderBar";
import { Metadata } from "next";
import DomainsGridClient from "./domains-grid-client";

export const metadata: Metadata = {
  title: "Sales Domains - Practice Different Sales Scenarios",
  description:
    "Explore different sales domains and practice your skills in various industries.",
  openGraph: {
    title: "Sales Domains - Practice Different Sales Scenarios",
    description:
      "Explore different sales domains and practice your skills in various industries.",
    type: "website",
  },
};

export default function DomainsPage() {
  return (
    <main className="flex flex-col flex-1 overflow-hidden">
      <HeaderBar
        title="Sales Domains"
        description="Explore different sales scenarios and practice your skills"
        backHref="/dashboard"
        backLabel="Back to Dashboard"
      />
      <div className="flex-1 p-4 sm:p-8 pt-8 sm:pt-12">
        <div className="mx-auto max-w-[1500px] h-full">
          <DomainsGridClient />
        </div>
      </div>
    </main>
  );
}
