"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BriefcaseIcon,
  Download,
  GraduationCapIcon,
  LayersIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

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
}: HeaderBarProps) {
  const params = useParams();

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
          {showActions && (
            <>
              <Button asChild size="sm">
                <Link href={`/dashboard/jobs/${params.id}/practice`}>
                  Practice Again
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/jobs">Browse More Jobs</Link>
              </Button>
            </>
          )}
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
