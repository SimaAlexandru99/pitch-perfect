import HeaderBar from "@/components/HeaderBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { domains } from "@/constants";
import { Info } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {domains.map((domain) => {
              const DomainIcon = domain.icon;
              return (
                <Card
                  key={domain.value}
                  className="w-full p-8 flex flex-col gap-8 shadow-lg border border-border rounded-2xl bg-card relative group hover:shadow-xl transition-all duration-300"
                >
                  {/* Domain Icon */}
                  <div className="flex justify-center -mt-24 mb-4">
                    <div className="bg-gradient-to-tr from-primary/20 to-accent/30 rounded-full p-3 shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <DomainIcon
                        className="rounded-full ring-2 ring-primary shadow-md object-cover size-[120px] bg-card p-7"
                        aria-label={domain.label}
                      />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="flex flex-col items-center gap-4 text-center">
                    <h2 className="text-2xl font-bold capitalize leading-tight">
                      {domain.value.replace("_", " ")}
                    </h2>
                    <div className="flex items-center gap-3">
                      <p className="text-base text-muted-foreground">
                        {domain.label}
                      </p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-5 w-5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Click to explore jobs in this domain</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-4 mt-4">
                    <Button
                      asChild
                      size="lg"
                      className="w-full text-base font-semibold py-7 rounded-lg shadow-md"
                    >
                      <Link href={`/dashboard/jobs?domain=${domain.value}`}>
                        View Jobs
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="w-full text-base font-semibold py-7 rounded-lg"
                    >
                      <Link href={`/dashboard/jobs/new?domain=${domain.value}`}>
                        Create Job
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
