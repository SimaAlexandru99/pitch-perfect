import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader for the ScriptPanel.
 * Provides a visual placeholder while the script is loading.
 */
export function ScriptSkeleton() {
  return (
    <Card
      aria-label="Loading script panel"
      className="w-80 bg-gradient-to-b from-background to-muted/50 border-0 shadow-2xl h-full overflow-y-auto"
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" aria-label="Loading section title" />
          <Skeleton
            className="h-8 w-8 rounded-full"
            aria-label="Loading avatar"
          />
        </div>

        <div className="space-y-3">
          <div>
            <Skeleton className="h-4 w-24 mb-2" aria-label="Loading label" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" aria-label="Loading line" />
              <Skeleton className="h-4 w-3/4" aria-label="Loading line" />
            </div>
          </div>

          <div>
            <Skeleton className="h-4 w-24 mb-2" aria-label="Loading label" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" aria-label="Loading line" />
              <Skeleton className="h-4 w-full" aria-label="Loading line" />
              <Skeleton className="h-4 w-3/4" aria-label="Loading line" />
            </div>
          </div>

          <div>
            <Skeleton className="h-4 w-24 mb-2" aria-label="Loading label" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" aria-label="Loading line" />
                  <Skeleton className="h-4 w-full" aria-label="Loading line" />
                  <Skeleton className="h-4 w-5/6" aria-label="Loading line" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Skeleton className="h-4 w-24 mb-2" aria-label="Loading label" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" aria-label="Loading line" />
              <Skeleton className="h-4 w-3/4" aria-label="Loading line" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
