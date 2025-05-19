import {Card} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

export function ScriptSkeleton() {
    return (
        <Card className="w-80 bg-gradient-to-b from-background to-muted/50 border-0 shadow-2xl h-full overflow-y-auto">
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32"/>
                    <Skeleton className="h-8 w-8 rounded-full"/>
                </div>

                <div className="space-y-3">
                    <div>
                        <Skeleton className="h-4 w-24 mb-2"/>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full"/>
                            <Skeleton className="h-4 w-3/4"/>
                        </div>
                    </div>

                    <div>
                        <Skeleton className="h-4 w-24 mb-2"/>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full"/>
                            <Skeleton className="h-4 w-full"/>
                            <Skeleton className="h-4 w-3/4"/>
                        </div>
                    </div>

                    <div>
                        <Skeleton className="h-4 w-24 mb-2"/>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-3/4"/>
                                    <Skeleton className="h-4 w-full"/>
                                    <Skeleton className="h-4 w-5/6"/>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Skeleton className="h-4 w-24 mb-2"/>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full"/>
                            <Skeleton className="h-4 w-3/4"/>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
