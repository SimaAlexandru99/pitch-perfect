"use client";

import { QuickCreateDialog } from "@/components/quick-create-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { domains } from "@/constants";
import { getJobs } from "@/lib/actions/general.action";
import { Eye, Info, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DomainsGridClient() {
  const [openDomain, setOpenDomain] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobCounts, setJobCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobCounts = async () => {
      try {
        const jobs = await getJobs();
        if (jobs) {
          const counts = jobs.reduce((acc, job) => {
            acc[job.domain] = (acc[job.domain] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          setJobCounts(counts);
        }
      } catch (error) {
        console.error("Error fetching job counts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobCounts();
  }, []);

  const filteredDomains = domains.filter(
    (domain) =>
      domain.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      domain.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Header Section */}
      <div className="mb-20">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold">Browse Sales Domains</h1>
          <p className="text-muted-foreground">
            Select a domain to explore sales scenarios and practice your skills
            in different industries.
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20">
        {filteredDomains.map((domain) => {
          const DomainIcon = domain.icon;
          const jobCount = jobCounts[domain.value] || 0;

          return (
            <Card
              key={domain.value}
              className="w-full p-8 flex flex-col gap-8 shadow-lg border border-border rounded-2xl bg-card relative group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              tabIndex={0}
              aria-label={`Domain: ${domain.value.replace("_", " ")}`}
            >
              {/* Domain Icon with animated gradient ring */}
              <div className="flex justify-center -mt-24 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/30 to-accent/40 blur-md opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-300 animate-pulse" />
                  <div className="bg-gradient-to-tr from-primary/20 to-accent/30 rounded-full p-3 shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <DomainIcon
                      className="rounded-full ring-2 ring-primary shadow-md object-cover size-[120px] bg-card p-7"
                      aria-label={domain.label}
                    />
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <div className="flex flex-col items-center gap-4 text-center">
                <h2 className="text-2xl font-bold capitalize leading-tight tracking-tight text-foreground">
                  {domain.value.replace("_", " ")}
                </h2>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-base text-muted-foreground font-medium">
                    {domain.label}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="px-2 py-1 bg-primary/10 rounded-full">
                      {isLoading ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : (
                        `${jobCount} ${
                          jobCount === 1 ? "Job" : "Jobs"
                        } Available`
                      )}
                    </span>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            tabIndex={0}
                            aria-label="Info about this domain"
                          >
                            <Info className="h-5 w-5 text-muted-foreground cursor-help transition-colors group-hover:text-primary" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[300px]">
                          <p>
                            Explore sales scenarios and practice your skills in
                            this domain. Click to view available jobs or create
                            a new one.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-4 mt-4">
                <Button
                  asChild
                  size="lg"
                  className="w-full text-base font-semibold py-7 rounded-lg shadow-md group/button group-hover:bg-primary/90 transition-colors"
                  aria-label={`View jobs in ${domain.value.replace("_", " ")}`}
                >
                  <Link
                    href={`/dashboard/jobs?domain=${domain.value}`}
                    tabIndex={-1}
                  >
                    <Eye className="mr-2 h-5 w-5" aria-hidden="true" />
                    View Jobs
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full text-base font-semibold py-7 rounded-lg group/button"
                  aria-label={`Create job in ${domain.value.replace("_", " ")}`}
                  onClick={() => setOpenDomain(domain.value)}
                >
                  <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
                  Create Job
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
      {/* Quick Create Dialog Modal wrapped in Dialog */}
      <Dialog
        open={!!openDomain}
        onOpenChange={(open) => !open && setOpenDomain(null)}
      >
        {openDomain && (
          <QuickCreateDialog
            selectedDomain={openDomain}
            onClose={() => setOpenDomain(null)}
          />
        )}
      </Dialog>
    </>
  );
}
