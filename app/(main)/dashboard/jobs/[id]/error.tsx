"use client";

import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {AlertCircle} from "lucide-react";
import Link from "next/link";

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 p-3 sm:p-6">
                <div className="mx-auto max-w-[1500px] h-full">
                    <Card
                        className="w-full p-6 lg:p-8 flex flex-col items-center gap-6 shadow-lg border border-border rounded-2xl bg-card">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="rounded-full bg-destructive/10 p-3">
                                <AlertCircle className="size-8 text-destructive"/>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-semibold">
                                    Something went wrong!
                                </h2>
                                <p className="text-muted-foreground">
                                    {error.message ||
                                        "Failed to load job details. Please try again."}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button onClick={reset} className="w-full sm:w-auto">
                                    Try Again
                                </Button>
                                <Button asChild variant="outline" className="w-full sm:w-auto">
                                    <Link href="/dashboard/jobs">Back to Jobs</Link>
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
