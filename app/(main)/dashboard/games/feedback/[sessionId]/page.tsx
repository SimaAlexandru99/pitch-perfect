import HeaderBar from "@/components/HeaderBar";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getGameFeedback } from "@/lib/actions/game.action";
import { cn } from "@/lib/utils";
import {
  Award,
  Clock,
  Crown,
  Flame,
  MessageSquare,
  Mic,
  Star,
  Trophy,
} from "lucide-react";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Game Feedback - Sales Quest",
  description:
    "Review your performance and get detailed feedback on your sales pitch",
  openGraph: {
    title: "Game Feedback - Sales Quest",
    description:
      "Review your performance and get detailed feedback on your sales pitch",
    type: "website",
  },
};

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const resolvedParams = await params;
  const { sessionId } = resolvedParams;

  if (!sessionId) {
    notFound();
  }

  const { success, feedback } = await getGameFeedback(sessionId);

  if (!success || !feedback) {
    notFound();
  }

  const { score, timeSpent, metrics, transcript, level } = feedback;

  // Calculate performance metrics
  const speakingPercentage =
    (metrics.userSpeakingTime / metrics.totalDuration) * 100;
  const silencePercentage = (metrics.silenceTime / metrics.totalDuration) * 100;
  const aiSpeakingPercentage =
    (metrics.aiSpeakingTime / metrics.totalDuration) * 100;

  return (
    <main className="flex flex-col flex-1 w-full overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
      <HeaderBar
        title="Game Feedback"
        description="Review your performance and get detailed feedback"
        navigation={{
          backHref: "/dashboard/games",
          backLabel: "Return to Quest Board",
        }}
        actions={{
          showBrowseJobs: false,
        }}
      />

      <div className="flex-1 p-4 sm:p-8 pt-16 sm:pt-16">
        <div className="mx-auto max-w-4xl">
          {/* Score Card */}
          <Card className="p-4 sm:p-6 mb-4 sm:mb-6 bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-800/80 border-2 border-amber-500/30 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="size-6 sm:size-7 text-amber-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Final Score
                </h2>
              </div>
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                {score}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              <div className="flex items-center gap-2 bg-slate-800/50 p-2 sm:p-3 rounded-lg">
                <Clock className="size-4 sm:size-5 text-cyan-400" />
                <span className="text-sm sm:text-base font-medium text-white">
                  {Math.round(timeSpent)}s
                </span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/50 p-2 sm:p-3 rounded-lg">
                <Star className="size-4 sm:size-5 text-amber-400" />
                <span className="text-sm sm:text-base font-medium text-white">
                  Level {level}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/50 p-2 sm:p-3 rounded-lg">
                <Flame className="size-4 sm:size-5 text-orange-400" />
                <span className="text-sm sm:text-base font-medium text-white">
                  {metrics.streakCount} Streak
                </span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/50 p-2 sm:p-3 rounded-lg">
                <Crown className="size-4 sm:size-5 text-violet-400" />
                <span className="text-sm sm:text-base font-medium text-white">
                  {metrics.correctResponses} Correct
                </span>
              </div>
            </div>
          </Card>

          {/* Performance Metrics */}
          <Card className="p-4 sm:p-6 mb-4 sm:mb-6 bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-800/80 border-2 border-cyan-500/30 shadow-lg">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
              <Award className="size-5 sm:size-6 text-cyan-400" />
              Performance Metrics
            </h3>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white font-medium">Speaking Time</span>
                  <span className="text-cyan-400 font-medium">
                    {Math.round(speakingPercentage)}%
                  </span>
                </div>
                <Progress
                  value={speakingPercentage}
                  className="h-2 sm:h-3 bg-slate-700"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white font-medium">Silence Time</span>
                  <span className="text-cyan-400 font-medium">
                    {Math.round(silencePercentage)}%
                  </span>
                </div>
                <Progress
                  value={silencePercentage}
                  className="h-2 sm:h-3 bg-slate-700"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white font-medium">
                    AI Speaking Time
                  </span>
                  <span className="text-cyan-400 font-medium">
                    {Math.round(aiSpeakingPercentage)}%
                  </span>
                </div>
                <Progress
                  value={aiSpeakingPercentage}
                  className="h-2 sm:h-3 bg-slate-700"
                />
              </div>
            </div>
          </Card>

          {/* Conversation Transcript */}
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-800/80 border-2 border-indigo-500/30 shadow-lg">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <MessageSquare className="size-5 sm:size-6 text-indigo-400" />
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Conversation Transcript
              </h3>
            </div>
            <div className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2">
              {transcript.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 sm:p-4 rounded-lg shadow-md",
                    message.role === "user"
                      ? "bg-indigo-900/50 ml-4 sm:ml-8 border border-indigo-500/30"
                      : "bg-slate-800/50 mr-4 sm:mr-8 border border-slate-600/30",
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {message.role === "user" ? (
                      <Mic className="size-4 sm:size-5 text-indigo-400" />
                    ) : (
                      <Award className="size-4 sm:size-5 text-cyan-400" />
                    )}
                    <span className="text-sm font-bold text-white">
                      {message.role === "user" ? "You" : "AI Character"}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                    {message.content}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
