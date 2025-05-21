"use client";

import { QuickCreateDialog } from "@/components/quick-create-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { domains } from "@/constants";
import { Eye, Info, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DomainsGridClient() {
  const [openDomain, setOpenDomain] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {domains.map((domain) => {
          const DomainIcon = domain.icon;
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
                <div className="flex items-center gap-3">
                  <p className="text-base text-muted-foreground font-medium">
                    {domain.label}
                  </p>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0} aria-label="Info about this domain">
                          <Info className="h-5 w-5 text-muted-foreground cursor-help transition-colors group-hover:text-primary" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
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
