"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteFeedbackByJobIdUserId } from "@/lib/actions/general.action";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Trophy } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

interface BadgeInfo {
  icon: React.ElementType;
  label: string;
}

interface HeaderBarProps {
  title: string;
  description?: string;
  badges?: BadgeInfo[];
  actions?: {
    showExport?: boolean;
    onExport?: () => void;
    showPracticeAgain?: boolean;
    jobId?: string;
    userId?: string;
    showBrowseJobs?: boolean;
  };
  navigation?: {
    backHref?: string;
    backLabel?: string;
  };
  children?: React.ReactNode;
}

const PracticeAgainDialog = ({
  jobId,
  userId,
  isPending,
  onPracticeAgain,
}: {
  jobId: string;
  userId: string;
  isPending: boolean;
  onPracticeAgain: () => void;
}) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button size="sm" variant="default" disabled={isPending}>
        Practice Again
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Practice Again?</AlertDialogTitle>
        <AlertDialogDescription>
          This will delete your current feedback and let you retry the practice
          interview for this job. Are you sure you want to continue?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
        <AlertDialogAction disabled={isPending} onClick={onPracticeAgain}>
          Yes, Practice Again
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default function HeaderBar({
  title,
  description,
  badges = [],
  actions = {},
  navigation,
  children,
}: HeaderBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const isGamesPage = pathname?.includes("/games");

  const handlePracticeAgain = async () => {
    if (!actions.jobId || !actions.userId) return;
    const res = await deleteFeedbackByJobIdUserId(
      actions.jobId,
      actions.userId
    );
    if (res.success) {
      router.push(`/dashboard/jobs/${actions.jobId}/practice`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "sticky top-0 z-30 border-b backdrop-blur supports-[backdrop-filter]",
        isGamesPage
          ? "bg-gradient-to-r from-slate-800/95 via-slate-900/95 to-slate-800/95 border-primary/30"
          : "bg-background/95 supports-[backdrop-filter]:bg-background/60"
      )}
    >
      <div className="flex h-14 items-center px-3 sm:px-4">
        {navigation?.backHref && (
          <Button
            asChild
            variant="ghost"
            size="icon"
            className={cn(
              "mr-2 sm:mr-4",
              isGamesPage
                ? "text-white/75 hover:text-white hover:bg-slate-800/50"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Link href={navigation.backHref}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">{navigation.backLabel || "Back"}</span>
            </Link>
          </Button>
        )}

        <div className="flex flex-1 items-center gap-2 sm:gap-4 overflow-x-auto pb-3 pt-3 scrollbar-none">
          <div className="flex flex-col">
            <h1
              className={cn(
                "text-base sm:text-lg font-semibold whitespace-nowrap",
                isGamesPage ? "text-white" : ""
              )}
            >
              {title}
            </h1>
            {description && (
              <p
                className={cn(
                  "text-sm",
                  isGamesPage ? "text-white/75" : "text-muted-foreground"
                )}
              >
                {description}
              </p>
            )}
          </div>
          {badges.length > 0 && (
            <div className="flex items-center gap-2 min-w-0">
              {badges.map((badge, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={cn(
                    "gap-1 pl-2 whitespace-nowrap text-xs",
                    isGamesPage && "border-primary/30 text-white/90"
                  )}
                >
                  <badge.icon className="h-3 w-3" />
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {children}
          {actions.showPracticeAgain && actions.jobId && actions.userId && (
            <PracticeAgainDialog
              jobId={actions.jobId}
              userId={actions.userId}
              isPending={isPending}
              onPracticeAgain={() => startTransition(handlePracticeAgain)}
            />
          )}
          <Button
            asChild
            variant={isGamesPage ? "default" : "outline"}
            size="sm"
            className={cn(
              "gap-2",
              isGamesPage &&
                "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-none"
            )}
          >
            <Link href="/dashboard/games">
              <Trophy className="h-4 w-4" />
              Games
            </Link>
          </Button>
          {actions.showBrowseJobs && (
            <Button
              asChild
              variant={isGamesPage ? "outline" : "outline"}
              className={
                isGamesPage
                  ? "border-primary/30 text-white/90 hover:bg-slate-800/50"
                  : ""
              }
              size="sm"
            >
              <Link href="/dashboard/jobs">Browse More Jobs</Link>
            </Button>
          )}
          {actions.showExport && !children && (
            <Button
              variant={isGamesPage ? "outline" : "outline"}
              size="sm"
              className={cn(
                "gap-2",
                isGamesPage &&
                  "border-primary/30 text-white/90 hover:bg-slate-800/50"
              )}
              onClick={actions.onExport}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
