"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createScript, getScript } from "@/lib/actions/general.action";
import {
  Copy,
  Handshake,
  Info,
  Megaphone,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
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
  userName?: string;
}

/**
 * Copy button with tooltip for script sections.
 */
function CopyButtonWithTooltip({
  onCopy,
  section,
  copiedSection,
  label,
}: {
  onCopy: () => void;
  section: string;
  copiedSection: string | null;
  label: string;
}) {
  return (
    <Tooltip open={copiedSection === section}>
      <TooltipTrigger asChild>
        <Button size="icon" variant="ghost" aria-label={label} onClick={onCopy}>
          <Copy className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        {copiedSection === section ? "Copied!" : label}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * ScriptPanel displays the interview script with copy and regenerate features.
 * Renders HTML safely for sections that may contain markup (e.g., closingStatement, productPitch).
 *
 * @param script - The script object containing all sections
 * @param jobId - The job ID
 * @param userId - The user ID
 * @param userName - The user's display name (for introduction replacement)
 */
export function ScriptPanel({
  script,
  jobId,
  userId,
  userName,
}: ScriptPanelProps) {
  const router = useRouter();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const displayName = userName || "Candidate";

  // --- Handlers ---
  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      setError(null);
      const result = await createScript({ jobId, userId, overwrite: true });
      if (!result.success) throw new Error("Failed to regenerate script");
      const newScript = await getScript({ jobId, userId });
      if (!newScript) throw new Error("Failed to fetch new script");
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
  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 1500);
  };

  if (isRegenerating) return <ScriptSkeleton />;

  return (
    <ScrollArea className="overflow-y-auto h-full min-h-0">
      <Card className="w-full max-w-xs lg:max-w-full bg-gradient-to-b from-background to-muted/50 border border-border/40 rounded-xl shadow-2xl h-full flex flex-col min-h-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/90 backdrop-blur px-4 py-3 flex flex-col gap-1 border-b border-border rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                Interview Script
              </h3>
              <div className="text-xs text-muted-foreground">
                Your personalized practice script
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 focus:outline-none focus:ring-2 focus:ring-primary-300"
                  disabled={isRegenerating}
                  aria-label="Regenerate Script"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      isRegenerating ? "animate-spin" : ""
                    }`}
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
        </div>
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-t-xl flex items-center gap-2 border-b border-destructive/20">
            <RefreshCw className="h-4 w-4" />
            {error}
          </div>
        )}
        <TooltipProvider>
          <div className="space-y-6 p-4 flex-1 min-h-0">
            {/* Introduction */}
            <div className="bg-muted/30 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary-400" />
                  <h4 className="text-base font-semibold text-primary-900">
                    Introduction
                  </h4>
                </div>
                <CopyButtonWithTooltip
                  onCopy={() =>
                    handleCopy(
                      script.introduction.replaceAll(
                        "[Your Name]",
                        displayName,
                      ),
                      "introduction",
                    )
                  }
                  section="introduction"
                  copiedSection={copiedSection}
                  label="Copy Introduction"
                />
              </div>
              <div className="text-sm mt-1 prose prose-sm dark:prose-invert">
                <Markdown>
                  {script.introduction.replaceAll("[Your Name]", displayName)}
                </Markdown>
              </div>
            </div>
            {/* Product Pitch */}
            <div className="bg-muted/30 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary-400" />
                  <h4 className="text-base font-semibold text-primary-900">
                    Product Pitch
                  </h4>
                </div>
                <CopyButtonWithTooltip
                  onCopy={() => handleCopy(script.productPitch, "productPitch")}
                  section="productPitch"
                  copiedSection={copiedSection}
                  label="Copy Product Pitch"
                />
              </div>
              {/*
                Renders HTML for productPitch. Ensure the HTML is trusted and sanitized if user-generated.
              */}
              <div
                className="text-sm mt-1 prose prose-sm dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: script.productPitch }}
              />
            </div>
            {/* Objection Handling */}
            <div className="bg-muted/30 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-primary-400" />
                  <h4 className="text-base font-semibold text-primary-900">
                    Objection Handling
                  </h4>
                </div>
                <CopyButtonWithTooltip
                  onCopy={() =>
                    handleCopy(
                      script.objections
                        .map(
                          (o) =>
                            `Objection: ${o.objection}\nResponse: ${o.response}`,
                        )
                        .join("\n\n"),
                      "objections",
                    )
                  }
                  section="objections"
                  copiedSection={copiedSection}
                  label="Copy All Objections"
                />
              </div>
              <Accordion type="single" collapsible className="mt-2">
                {script.objections.map((obj, index) => (
                  <AccordionItem value={`objection-${index}`} key={index}>
                    <AccordionTrigger className="no-underline border-none">
                      Objection: {obj.objection}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div dangerouslySetInnerHTML={{ __html: obj.response }} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            {/* Closing Statement */}
            <div className="bg-muted/30 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Handshake className="h-5 w-5 text-primary-400" />
                  <h4 className="text-base font-semibold text-primary-900">
                    Closing Statement
                  </h4>
                </div>
                <CopyButtonWithTooltip
                  onCopy={() =>
                    handleCopy(script.closingStatement, "closingStatement")
                  }
                  section="closingStatement"
                  copiedSection={copiedSection}
                  label="Copy Closing Statement"
                />
              </div>
              {/*
                Renders HTML for closingStatement. Ensure the HTML is trusted and sanitized if user-generated.
              */}
              <div
                className="text-sm mt-1 prose prose-sm dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: script.closingStatement }}
              />
            </div>
          </div>
        </TooltipProvider>
      </Card>
    </ScrollArea>
  );
}
