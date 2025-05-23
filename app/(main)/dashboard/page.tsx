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
  getDailyPitchStatus,
  getJobs,
} from "@/lib/actions/general.action";
import { redirect } from "next/navigation";
import OnboardingBannerWrapper from "./onboarding-banner-wrapper";
import ProfileStatsCard from "./profile-stats-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

  // Check if user has completed today's pitch challenge
  const hasDailyPitch = await getDailyPitchStatus(user.id);

  // Calculate stats
  const streak = gameFeedback.length > 0 ? 3 : 0;
  const globalRank = 42;
  const topDomains = jobs && jobs.length > 0 ? [jobs[0].domain] : [];

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 pt-4">
        <ProfileStatsCard
          user={user}
          streak={streak}
          globalRank={globalRank}
          topDomains={topDomains}
        />
      </div>
      <div className="px-4 pt-4">
        <OnboardingBannerWrapper />
      </div>

      {/* Daily Pitch Challenge Card - Prominent placement */}
      <div className="px-4 pt-4">
        <Card
          className={cn(
            "bg-gradient-to-br border transition-all duration-300",
            hasDailyPitch
              ? "from-green-50 to-background border-green-100"
              : "from-primary-50 to-background border-primary-100"
          )}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Daily Pitch Challenge
              {hasDailyPitch ? (
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-600">
                  Completed
                </span>
              ) : (
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                  New Today
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Practice handling 3 sales objections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {hasDailyPitch
                    ? "Great job completing today's challenge!"
                    : "Practice your objection handling skills"}
                </p>
                <p
                  className={cn(
                    "text-xs",
                    hasDailyPitch ? "text-green-600" : "text-primary"
                  )}
                >
                  {hasDailyPitch
                    ? "Come back tomorrow for a new challenge"
                    : "Complete today's challenge to maintain your streak!"}
                </p>
              </div>
              {!hasDailyPitch && (
                <Link href="/dashboard/pitch-of-the-day">
                  <Button
                    size="lg"
                    className="shadow-lg hover:shadow-xl transition-all"
                  >
                    Start Challenge
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"></div>
      </div>
    </div>
  );
}
