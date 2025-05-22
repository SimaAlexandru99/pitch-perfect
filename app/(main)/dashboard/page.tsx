import {
  ChartAreaInteractive,
  InterviewScorePoint,
} from "@/components/chart-area-interactive";
import { InterviewDataTable } from "@/components/data-table";
import { SectionCards, StatsSummary } from "@/components/section-cards";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getAllGameFeedbackByUser } from "@/lib/actions/game.action";
import {
  getAllInterviewFeedbackByUser,
  getJobs,
} from "@/lib/actions/general.action";
import { redirect } from "next/navigation";
import OnboardingBannerWrapper from "./onboarding-banner-wrapper";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }

  // Fetch all feedback and jobs
  const [gameFeedback, interviewFeedback, jobs] = await Promise.all([
    getAllGameFeedbackByUser(user.id),
    getAllInterviewFeedbackByUser(user.id),
    getJobs(),
  ]);

  // Helper to aggregate stats
  function aggregateStats<T extends { score?: number; totalScore?: number }>(
    arr: T[],
    scoreKey: "score" | "totalScore"
  ): StatsSummary {
    const count = arr.length;
    const scores = arr
      .map((f) => (scoreKey === "score" ? f.score : f.totalScore))
      .filter((v) => typeof v === "number") as number[];
    const averageScore = scores.length
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;
    const bestScore = scores.length ? Math.max(...scores) : 0;
    const lastScore = scores.length ? scores[0] : 0;
    return { count, averageScore, bestScore, lastScore };
  }

  const gameStats = aggregateStats(gameFeedback, "score");
  const interviewStats = aggregateStats(interviewFeedback, "totalScore");

  // Map jobId to job info
  const jobMap = new Map<string, { title: string; domain: string }>();
  if (jobs) {
    for (const job of jobs) {
      jobMap.set(job.id, { title: job.title, domain: job.domain });
    }
  }

  // Transform interview feedback for chart
  const interviewChartData: InterviewScorePoint[] = interviewFeedback
    .filter((f) => typeof f.totalScore === "number" && !!f.createdAt)
    .map((f) => ({
      date: f.createdAt,
      score: f.totalScore,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Transform interview feedback for table
  const interviewTableData = interviewFeedback
    .filter(
      (f) => typeof f.totalScore === "number" && !!f.createdAt && !!f.jobId
    )
    .map((f) => {
      const job = jobMap.get(f.jobId) || {
        title: "Unknown",
        domain: "Unknown",
      };
      return {
        id: f.id || f.jobId + "-" + (f.createdAt || ""),
        date: f.createdAt,
        jobTitle: job.title,
        domain: job.domain,
        score: f.totalScore,
        strengths: Array.isArray(f.strengths)
          ? f.strengths.join(", ")
          : String(f.strengths || ""),
        areas: Array.isArray(f.areasForImprovement)
          ? f.areasForImprovement.join(", ")
          : String(f.areasForImprovement || ""),
        assessment: f.finalAssessment || "",
        jobId: f.jobId,
      };
    });

  return (
    <div className="flex flex-1 flex-col">
      <OnboardingBannerWrapper />
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards gameStats={gameStats} interviewStats={interviewStats} />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive data={interviewChartData} />
          </div>
          <div className="px-4 lg:px-6">
            <InterviewDataTable data={interviewTableData} />
          </div>
        </div>
      </div>
    </div>
  );
}
