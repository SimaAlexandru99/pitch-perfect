import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Loading() {
  return (
    <main className="flex flex-col flex-1 overflow-hidden">
      {/* Header Bar Skeleton */}
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-3 sm:px-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex flex-1 items-center gap-2 sm:gap-4 ml-2 sm:ml-4">
            <Skeleton className="h-6 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Feedback Content Skeleton */}
      <div className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Overall Score Skeleton */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Skeleton className="size-32 rounded-full mb-4" />
                <div className="space-y-4 max-w-md w-full">
                  <Skeleton className="h-8 w-48 mx-auto" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs Skeleton */}
          <Tabs defaultValue="performance" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="metrics">Call Metrics</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-4">
              {/* Category Scores Skeleton */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-5 rounded-full" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-5 w-12" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <div className="mt-2 space-y-2 pl-4 border-l-2 border-border">
                          {[1, 2, 3].map((j) => (
                            <div key={j} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-12" />
                              </div>
                              <Skeleton className="h-1 w-full" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Strengths & Areas for Improvement Skeleton */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Skeleton className="size-5 rounded-full" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-2">
                          <Skeleton className="size-4 rounded-full" />
                          <Skeleton className="h-4 flex-1" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Skeleton className="size-5 rounded-full" />
                      <Skeleton className="h-6 w-40" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-2">
                          <Skeleton className="size-4 rounded-full" />
                          <Skeleton className="h-4 flex-1" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              {/* Call Metrics Skeleton */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-5 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-16" />
                        {i === 2 || i === 3 ? (
                          <>
                            <Skeleton className="h-1 w-full" />
                            <Skeleton className="h-3 w-32" />
                          </>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              {/* Recommendations Skeleton */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-5 rounded-full" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {[1, 2, 3].map((section) => (
                      <div key={section}>
                        <Skeleton className="h-5 w-40 mb-3" />
                        <div className="space-y-3">
                          {[1, 2, 3].map((item) => (
                            <div key={item} className="flex gap-2">
                              <Skeleton className="size-4 rounded-full" />
                              <Skeleton className="h-4 flex-1" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Final Assessment Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="size-5 rounded-full" />
                <Skeleton className="h-6 w-40" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons Skeleton */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Skeleton className="h-10 w-full sm:max-w-[300px]" />
            <Skeleton className="h-10 w-full sm:max-w-[300px]" />
          </div>
        </div>
      </div>
    </main>
  );
}
