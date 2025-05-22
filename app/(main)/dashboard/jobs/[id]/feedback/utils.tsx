import { Feedback } from "@/types";
import { pdf } from "@react-pdf/renderer";
import { FeedbackPDF } from "./FeedbackPDF";

export async function downloadFeedbackPDF(
  feedback: Feedback,
  jobTitle: string,
  domain: string,
  level: string
) {
  try {
    const blob = await pdf(
      <FeedbackPDF
        feedback={feedback}
        jobTitle={jobTitle}
        domain={domain}
        level={level}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `feedback-report-${jobTitle
      .toLowerCase()
      .replace(/\s+/g, "-")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
}
