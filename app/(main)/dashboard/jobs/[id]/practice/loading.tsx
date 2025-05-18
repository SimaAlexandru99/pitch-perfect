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

const PracticeLoading = () => {
  return (
    <main className="flex flex-col flex-1 overflow-hidden">
      {/* Header Bar */}
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-3 sm:px-4">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground mr-2 sm:mr-4"
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
                <Skeleton className="h-3 w-16" />
              </Badge>
              <Badge
                variant="outline"
                className="gap-1 pl-2 whitespace-nowrap text-xs"
              >
                <LayersIcon className="h-3 w-3" />
                <Skeleton className="h-3 w-20" />
              </Badge>
              <Badge
                variant="outline"
                className="gap-1 pl-2 whitespace-nowrap text-xs"
              >
                <GraduationCapIcon className="h-3 w-3" />
                <Skeleton className="h-3 w-12" />
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Space */}
      <div className="flex-1 p-3 sm:p-6">
        <div className="mx-auto max-w-[1500px] h-full flex gap-6">
          {/* Agent Card Skeleton */}
          <Card className="bg-gradient-to-b from-background to-muted/50 border-0 shadow-2xl h-full flex-1">
            <div className="relative flex flex-col min-h-[calc(100vh-12rem)] w-full overflow-hidden">
              <div className="flex-1 w-full flex items-center justify-center relative px-3 py-6 sm:p-8">
                {/* Participants Grid */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 sm:gap-8 w-full max-w-5xl relative z-10">
                  {/* AI Participant Card Skeleton */}
                  <Card className="bg-gradient-to-b from-[#171532] to-[#08090D] border-2 relative overflow-hidden">
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <div className="bg-gradient-to-l from-[#FFFFFF] to-[#CAC5FE] rounded-full p-1 relative mb-3 sm:mb-4">
                            <Skeleton className="size-24 sm:size-32 md:size-40 rounded-full" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-32 mt-2" />
                        <Skeleton className="h-4 w-20 mt-1" />
                      </div>
                    </div>
                  </Card>

                  {/* User Participant Card Skeleton */}
                  <Card className="bg-gradient-to-b from-[#1A1C20] to-[#08090D] border relative overflow-hidden">
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <Skeleton className="size-24 sm:size-32 md:size-40 rounded-full mb-3 sm:mb-4" />
                        </div>
                        <Skeleton className="h-6 w-32 mt-2" />
                        <Skeleton className="h-4 w-20 mt-1" />
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Call Controls Skeleton */}
              <div className="fixed bottom-4 sm:bottom-6 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 z-30">
                <div className="flex items-center justify-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-full bg-background/80 backdrop-blur-sm border shadow-lg max-w-md mx-auto">
                  <Skeleton className="size-10 sm:size-11 rounded-full" />
                  <Skeleton className="size-12 sm:size-14 rounded-full" />
                  <Skeleton className="size-10 sm:size-11 rounded-full" />
                </div>
              </div>
            </div>
          </Card>

          {/* Script Panel Skeleton */}
          <Card className="w-[400px] h-full bg-gradient-to-b from-background to-muted/50 border-0 shadow-2xl">
            <div className="p-6 space-y-6">
              {/* Introduction Section */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-24 w-full" />
              </div>

              {/* Product Pitch Section */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-32 w-full" />
              </div>

              {/* Objections Section */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Closing Statement Section */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default PracticeLoading;
