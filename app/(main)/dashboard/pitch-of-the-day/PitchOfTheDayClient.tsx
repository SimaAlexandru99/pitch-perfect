"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { dailyPitchInterviewer } from "@/constants";
import { completeDailyPitch } from "@/lib/actions/general.action";
import Agent from "@/app/(main)/dashboard/jobs/[id]/practice/Agent";
import router from "next/router";
import { setTimeout } from "timers";

interface DailyPitchProgressProps {
  userId: string;
  userName: string;
}

export default function PitchOfTheDayClient({
  userId,
  userName,
}: DailyPitchProgressProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleStart = () => {
    setIsStarted(true);
  };

  // Update progress based on completed objections  const router = useRouter();
  const [latestScore, setLatestScore] = useState<number>(0);

  const handleProgressUpdate = async (completed: number, score?: number) => {
    if (score !== undefined) {
      setLatestScore(score);
    }

    const progressPercent = (completed / 3) * 100;
    setProgress(progressPercent);

    // If all objections are handled, complete the challenge
    if (completed === 3) {
      try {
        const result = await completeDailyPitch({
          userId,
          score: latestScore,
        });

        if (result.success) {
          toast.success("Daily challenge completed!");
          // Give time for the toast to show before redirecting
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        }
      } catch (error) {
        console.error("Error completing daily pitch:", error);
        toast.error("Failed to save challenge completion");
      }
    }
  };

  if (!isStarted) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Daily Pitch Challenge</h2>
        <p className="mb-4">
          Practice handling 3 common sales objections. This daily challenge
          helps you improve your objection handling skills.
        </p>
        <Button onClick={handleStart}>Start Daily Challenge</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Progress</h3>
        <Progress value={progress} className="mb-2" />
        <p className="text-sm text-muted-foreground">
          {Math.round(progress)}% complete
        </p>
      </Card>

      <Card className="p-4">
        <Agent
          userName={userName}
          userId={userId}
          type="daily-pitch"
          jobId="daily-pitch"
          jobTitle="Daily Pitch Challenge"
          jobDomain="Sales Training"
          jobLevel="Practice"
          config={dailyPitchInterviewer}
          onProgress={handleProgressUpdate}
        />
      </Card>
    </div>
  );
}
