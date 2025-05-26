"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getOnboardingSteps,
  OnboardingSteps,
  getOnboardingDismissed,
  setOnboardingDismissed,
} from "@/lib/actions/auth.action";
import { useAuth } from "@/lib/hooks/use-auth";
import { CheckCircle2, Circle, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ONBOARDING_STEPS: {
  key: keyof OnboardingSteps;
  label: string;
  description: string;
}[] = [
  {
    key: "profile",
    label: "Complete your profile",
    description: "Add your name and avatar.",
  },
  {
    key: "firstGame",
    label: "Play your first game",
    description: "Start a game to begin your journey.",
  },
  {
    key: "addFriend",
    label: "Add a friend",
    description: "Connect with another user.",
  },
  {
    key: "firstAchievement",
    label: "Unlock your first achievement",
    description: "Earn an achievement badge.",
  },
];

export default function OnboardingBanner() {
  const { user } = useAuth();
  const [steps, setSteps] = useState<OnboardingSteps | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [onboardingDismissed, setOnboardingDismissedState] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getOnboardingDismissed(user.id).then((dismissed) => {
      setOnboardingDismissedState(dismissed);
    });
    getOnboardingSteps(user.id)
      .then((res) => {
        if (res.success && res.steps) setSteps(res.steps);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  // Celebrate when onboarding is completed
  useEffect(() => {
    if (!steps) return;
    const completed = ONBOARDING_STEPS.filter((s) => steps[s.key]).length;
    if (completed === ONBOARDING_STEPS.length && !celebrated) {
      setCelebrated(true);
      toast.success("Onboarding complete! You earned 100 XP! 🎉");
      setTimeout(() => setCelebrated(false), 6000);
    }
  }, [steps, celebrated]);

  const completed = steps
    ? ONBOARDING_STEPS.filter((s) => steps[s.key]).length
    : 0;
  const total = ONBOARDING_STEPS.length;
  const percent = Math.round((completed / total) * 100);

  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (
    !user ||
    loading ||
    !steps ||
    completed === total ||
    dismissed ||
    onboardingDismissed
  )
    return loading ? (
      <div className="w-full flex items-center justify-center py-4">
        <Loader2 className="animate-spin size-6 text-white/80" />
      </div>
    ) : null;

  return (
    <Card className="w-full bg-gradient-to-r from-violet-900/80 to-indigo-900/80 border border-violet-700 shadow-lg rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 relative z-30">
      {celebrated && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={350}
          recycle={false}
          gravity={0.25}
        />
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-white text-lg">
            Welcome! Complete your onboarding
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="ml-2"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss onboarding banner"
          >
            <X className="size-5 text-white/60" />
          </Button>
          <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="ml-2 text-xs border-white/30 text-white/80 hover:bg-white/10"
                onClick={() => setShowDialog(true)}
              >
                Don&apos;t show again
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hide Onboarding?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to hide the onboarding banner? You
                  can&apos;t undo this action.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    if (user?.id) {
                      await setOnboardingDismissed(user.id, true);
                      setOnboardingDismissedState(true);
                    }
                  }}
                >
                  Yes, don&apos;t show again
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Progress
                  value={percent}
                  className="h-2 bg-violet-800/60 cursor-pointer"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              Complete all steps to earn a reward!
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex flex-wrap gap-4 mt-3">
          {ONBOARDING_STEPS.map((step) => (
            <div key={step.key} className="flex items-center gap-2">
              {steps[step.key] ? (
                <CheckCircle2 className="size-5 text-emerald-400" />
              ) : (
                <Circle className="size-5 text-white/40" />
              )}
              <span
                className={
                  steps[step.key] ? "text-emerald-300" : "text-white/80"
                }
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
