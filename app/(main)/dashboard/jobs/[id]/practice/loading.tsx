import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  BriefcaseIcon,
  GraduationCapIcon,
  LayersIcon,
} from "lucide-react";
import Link from "next/link";

/**
 * Loading skeleton for the Practice Interview page.
 * Matches the actual page layout and structure for a seamless loading experience.
 */
const PracticeLoading = () => {
  return (
    <main
      className="flex flex-col h-dvh overflow-hidden bg-muted/40 w-full"
      aria-busy="true"
      aria-label="Loading practice interview"
    >
      {/* Header Bar */}
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-3 sm:px-4">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground mr-2 sm:mr-4"
            aria-label="Back to Job Details"
          >
            <Link href="#">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Job Details</span>
            </Link>
          </Button>
          <div className="flex flex-1 items-center gap-2 sm:gap-4 overflow-x-auto pb-3 pt-3 scrollbar-none">
            <h1 className="text-base sm:text-lg font-semibold whitespace-nowrap">
              Practice Interview
            </h1>
            <div className="flex items-center gap-2 min-w-0">
              <Badge
                variant="outline"
                className="gap-1 pl-2 whitespace-nowrap text-xs"
              >
                <BriefcaseIcon className="h-3 w-3" />
                <Skeleton className="h-3 w-16" aria-label="Loading job title" />
              </Badge>
              <Badge
                variant="outline"
                className="gap-1 pl-2 whitespace-nowrap text-xs"
              >
                <LayersIcon className="h-3 w-3" />
                <Skeleton className="h-3 w-20" aria-label="Loading domain" />
              </Badge>
              <Badge
                variant="outline"
                className="gap-1 pl-2 whitespace-nowrap text-xs"
              >
                <GraduationCapIcon className="h-3 w-3" />
                <Skeleton className="h-3 w-12" aria-label="Loading level" />
              </Badge>
            </div>
          </div>
        </div>
      </div>
      {/* Meeting Space */}
      <div className="flex-1 p-2 sm:p-6 flex items-center justify-center min-h-0">
        <div className="w-full h-full flex flex-col lg:flex-row gap-6 min-h-0 items-stretch">
          {/* Left/Main Area: Agent Skeleton */}
          <div className="flex-1 flex flex-col justify-center min-h-0 rounded-xl bg-gradient-to-b from-background to-muted/50 border border-border/40 shadow-2xl p-0 sm:p-4">
            <div className="flex flex-col justify-center items-center h-full w-full gap-y-4 relative">
              {/* Persona Selector Skeleton */}
              <div className="flex flex-col sm:flex-row gap-2 items-center mb-2 w-full max-w-xl">
                <Skeleton
                  className="h-5 w-32 mr-2"
                  aria-label="Loading persona label"
                />
                <Skeleton
                  className="h-10 w-40"
                  aria-label="Loading persona dropdown"
                />
                <Skeleton
                  className="h-8 w-24 ml-2"
                  aria-label="Loading randomize button"
                />
              </div>
              <div className="w-full max-w-xl mb-2">
                <Skeleton
                  className="h-4 w-3/4"
                  aria-label="Loading persona description"
                />
              </div>
              {/* Profile Cards Container */}
              <div className="flex flex-col sm:flex-row gap-6 w-full justify-center items-center">
                {/* AI Interviewer Card Skeleton */}
                <Card className="h-[450px] w-full max-w-[700px] mx-auto flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#171532] to-[#08090D] rounded-xl border-2 border-primary-200/50 shadow-lg">
                  <div className="relative">
                    <div className="relative flex items-center justify-center blue-gradient rounded-full size-32">
                      <Skeleton
                        className="size-24 sm:size-32 rounded-full"
                        aria-label="Loading AI avatar"
                      />
                    </div>
                  </div>
                  <Skeleton
                    className="h-6 w-32 mt-6"
                    aria-label="Loading AI name"
                  />
                </Card>
                {/* User Profile Card Skeleton */}
                <Card className="h-[450px] w-full max-w-[700px] mx-auto flex flex-col items-center justify-center p-8 bg-gradient-to-b from-background to-muted/50 rounded-xl border border-border/50 shadow-lg">
                  <div className="relative">
                    <Skeleton
                      className="size-32 rounded-full mb-3"
                      aria-label="Loading user avatar"
                    />
                  </div>
                  <Skeleton
                    className="h-6 w-32 mt-6"
                    aria-label="Loading user name"
                  />
                </Card>
              </div>
              {/* Transcript Area Skeleton */}
              <div className="flex-none relative rounded-xl border border-border/50 bg-gradient-to-b from-background to-muted/50 shadow-lg overflow-hidden max-w-xl w-full mx-auto mt-6">
                <div className="p-6 max-h-[200px]">
                  <Skeleton
                    className="h-6 w-3/4 mb-2"
                    aria-label="Loading transcript line"
                  />
                  <Skeleton
                    className="h-4 w-1/2"
                    aria-label="Loading transcript line"
                  />
                </div>
              </div>
              {/* Call Controls Skeleton */}
              <div className="w-full flex justify-center gap-4 mt-6">
                <Skeleton
                  className="w-12 h-12 rounded-full"
                  aria-label="Loading call control"
                />
                <Skeleton
                  className="w-12 h-12 rounded-full"
                  aria-label="Loading call control"
                />
                <Skeleton
                  className="w-12 h-12 rounded-full"
                  aria-label="Loading call control"
                />
              </div>
              {/* Volume Meter Skeleton */}
              <div className="w-full flex justify-center mt-2">
                <div className="h-2 w-48 bg-muted rounded-full overflow-hidden">
                  <div className="h-2 bg-primary/30 w-1/2" />
                </div>
              </div>
            </div>
          </div>
          {/* No right-side script panel skeleton by default, matches Agent behavior */}
        </div>
      </div>
    </main>
  );
};

export default PracticeLoading;
