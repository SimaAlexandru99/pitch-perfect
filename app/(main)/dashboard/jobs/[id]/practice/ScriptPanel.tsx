"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createScript, getScript } from "@/lib/actions/general.action";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Markdown from "react-markdown";
import { toast } from "sonner";
import { ScriptSkeleton } from "./ScriptSkeleton";

interface Script {
  introduction: string;
  productPitch: string;
  objections: Array<{
    objection: string;
    response: string;
  }>;
  closingStatement: string;
}

interface ScriptPanelProps {
  script: Script;
  jobId: string;
  userId: string;
}

export function ScriptPanel({ script, jobId, userId }: ScriptPanelProps) {
  const router = useRouter();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      setError(null);

      // Step 1: Create new script with overwrite flag
      const result = await createScript({
        jobId,
        userId,
        overwrite: true, // Explicitly request overwrite
      });

      if (!result.success) {
        throw new Error("Failed to regenerate script");
      }

      // Step 2: Get the new script
      const newScript = await getScript({
        jobId,
        userId,
      });

      if (!newScript) {
        throw new Error("Failed to fetch new script");
      }

      // Step 3: Show success and refresh
      toast.success("Script regenerated successfully");
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error("Error regenerating script");
    } finally {
      setIsRegenerating(false);
      setIsDialogOpen(false);
    }
  };

  if (isRegenerating) {
    return <ScriptSkeleton />;
  }

  return (
    <Card className="w-80 bg-gradient-to-b from-background to-muted/50 border-0 shadow-2xl h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Interview Script</h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={isRegenerating}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`}
                />
                <span className="sr-only">Regenerate Script</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Regenerate Script</DialogTitle>
                <DialogDescription>
                  Are you sure you want to regenerate the script? This will
                  create a new version with updated content.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isRegenerating}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="gap-2 w-full sm:w-auto"
                >
                  {isRegenerating && (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}
                  {isRegenerating ? "Regenerating..." : "Regenerate"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Introduction
            </h4>
            <div className="text-sm mt-1 prose prose-sm dark:prose-invert">
              <Markdown>{script.introduction}</Markdown>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Product Pitch
            </h4>
            <div
              className="text-sm mt-1 prose prose-sm dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: script.productPitch }}
            />
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Objection Handling
            </h4>
            <div className="space-y-2 mt-1">
              {script.objections.map((obj, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium">Objection: {obj.objection}</p>
                  <div
                    className="text-muted-foreground prose prose-sm dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: obj.response }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Closing Statement
            </h4>
            <div className="text-sm mt-1 prose prose-sm dark:prose-invert">
              <Markdown>{script.closingStatement}</Markdown>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
