"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { downloadFeedbackPDF } from "./utils";

interface ExportButtonProps {
  feedback: Feedback;
  jobTitle: string;
  domain: string;
  level: string;
}

export default function ExportButton({
  feedback,
  jobTitle,
  domain,
  level,
}: ExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    try {
      setIsGenerating(true);
      await downloadFeedbackPDF(feedback, jobTitle, domain, level);
      toast.success("PDF Generated", {
        description: "Your feedback report has been downloaded successfully.",
      });
    } catch (error) {
      console.error(error);
      toast.error("Export Failed", {
        description: "There was an error generating the PDF. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={handleExport}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      {isGenerating ? "Generating..." : "Export PDF"}
    </Button>
  );
}
