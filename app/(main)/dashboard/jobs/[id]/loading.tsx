import HeaderBar from "@/components/HeaderBar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <HeaderBar
        title="Job Details"
        description="Loading job details..."
        navigation={{
          backHref: "/dashboard/jobs",
          backLabel: "Back to Jobs",
        }}
      />

      <div className="flex-1 p-3 sm:p-6">
        <div className="mx-auto max-w-[1500px] h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Card className="w-full p-6 lg:p-8 flex flex-col gap-6 shadow-lg border border-border rounded-2xl bg-card relative">
                {/* Domain Icon Skeleton */}
                <div className="flex justify-center -mt-16 mb-2">
                  <div className="bg-gradient-to-tr from-primary/20 to-accent/30 rounded-full p-2 shadow-lg">
                    <Skeleton className="size-[110px] rounded-full" />
                  </div>
                </div>

                {/* Title & Meta Skeleton */}
                <div className="flex flex-col items-center gap-3">
                  <Skeleton className="h-8 w-3/4 max-w-md" />
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>

                {/* Description Section Skeleton */}
                <section className="mt-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Skeleton className="size-5" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </section>

                {/* Actions Skeleton */}
                <div className="flex flex-col gap-3 mt-6 pt-6 border-t">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </Card>
            </div>

            {/* Sidebar Skeleton */}
            <aside className="lg:col-span-1">
              <Card className="p-6 shadow-md border border-border rounded-2xl bg-muted/40 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-5" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
