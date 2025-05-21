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
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BriefcaseIcon,
  Download,
  GraduationCapIcon,
  LayersIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface HeaderBarProps {
  title: string;
  description?: string;
  domain?: string;
  jobTitle?: string;
  level?: string;
  showExport?: boolean;
  onExport?: () => void;
  showActions?: boolean;
  backHref?: string;
  backLabel?: string;
  jobId?: string;
  userId?: string;
}

export default function HeaderBar({
  title,
  description,
  domain,
  jobTitle,
  level,
  showExport = false,
  onExport,
  showActions = false,
  backHref,
  backLabel = "Back",
  jobId,
  userId,
}: HeaderBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handlePracticeAgain = async () => {
    if (!jobId || !userId) return;
    const res = await deleteFeedbackByJobIdUserId(jobId, userId);
    if (res.success) {
      router.push(`/dashboard/jobs/${jobId}/practice`);
    } else {
      // Optionally show error toast
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="flex h-14 items-center px-3 sm:px-4">
        {backHref && (
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground mr-2 sm:mr-4"
          >
            <Link href={backHref}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">{backLabel}</span>
            </Link>
          </Button>
        )}

        <div className="flex flex-1 items-center gap-2 sm:gap-4 overflow-x-auto pb-3 pt-3 scrollbar-none">
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-semibold whitespace-nowrap">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {(domain || jobTitle || level) && (
            <div className="flex items-center gap-2 min-w-0">
              {domain && (
                <Badge
                  variant="outline"
                  className="gap-1 pl-2 whitespace-nowrap text-xs"
                >
                  <BriefcaseIcon className="h-3 w-3" />
                  {domain}
                </Badge>
              )}
              {jobTitle && (
                <Badge
                  variant="outline"
                  className="gap-1 pl-2 whitespace-nowrap text-xs"
                >
                  <LayersIcon className="h-3 w-3" />
                  {jobTitle}
                </Badge>
              )}
              {level && (
                <Badge
                  variant="outline"
                  className="gap-1 pl-2 whitespace-nowrap text-xs"
                >
                  <GraduationCapIcon className="h-3 w-3" />
                  {level}
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showActions && jobId && userId && (
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
                    This will delete your current feedback and let you retry the
                    practice interview for this job. Are you sure you want to
                    continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isPending}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isPending}
                    onClick={() => startTransition(handlePracticeAgain)}
                  >
                    Yes, Practice Again
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/jobs">Browse More Jobs</Link>
          </Button>
          {showExport && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onExport}
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
