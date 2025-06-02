import HeaderBar from "@/components/HeaderBar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex flex-col flex-1 overflow-hidden">
      <HeaderBar
        title="Sales Domains"
        description="Loading domains..."
        navigation={{
          backHref: "/dashboard",
          backLabel: "Back to Dashboard",
        }}
      />

      <div className="flex-1 p-4 sm:p-8 pt-8 sm:pt-12">
        <div className="mx-auto max-w-[1500px] h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card
                key={index}
                className="w-full p-8 flex flex-col gap-8 shadow-lg border border-border rounded-2xl bg-card relative"
              >
                {/* Domain Icon Skeleton */}
                <div className="flex justify-center -mt-24 mb-4">
                  <div className="bg-gradient-to-tr from-primary/20 to-accent/30 rounded-full p-3 shadow-lg">
                    <Skeleton className="size-[120px] rounded-full" />
                  </div>
                </div>

                {/* Title & Description Skeleton */}
                <div className="flex flex-col items-center gap-4 text-center">
                  <Skeleton className="h-8 w-40" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-56" />
                    <Skeleton className="size-5 rounded-full" />
                  </div>
                </div>

                {/* Actions Skeleton */}
                <div className="flex flex-col gap-4 mt-4">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
