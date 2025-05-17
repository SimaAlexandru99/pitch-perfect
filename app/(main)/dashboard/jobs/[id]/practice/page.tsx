import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  createScript,
  getFeedbackByJobId,
  getJobById,
  getScript,
} from "@/lib/actions/general.action";
import {
  ArrowLeft,
  BriefcaseIcon,
  GraduationCapIcon,
  LayersIcon,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AgentWrapper from "./AgentWrapper";
import { ScriptPanel } from "./ScriptPanel";
import { ScriptSkeleton } from "./ScriptSkeleton";

const PracticeDetails = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();
  const job = await getJobById(id);
  if (!job) redirect("/");

  const feedback = await getFeedbackByJobId({
    jobId: id,
    userId: user?.id ?? "Guest",
  });

  // Get or create script
  let script = await getScript({
    jobId: id,
    userId: user?.id ?? "Guest",
  });

  if (!script) {
    const { success, scriptId } = await createScript({
      jobId: id,
      userId: user?.id ?? "Guest",
    });
    if (success && scriptId) {
      script = await getScript({
        jobId: id,
        userId: user?.id ?? "Guest",
      });
    }
  }

  return (
    <main className="flex flex-col flex-1 overflow-hidden">
      {/* Header Bar */}
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-3 sm:px-4">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground mr-2 sm:mr-4"
          >
            <Link href={`/dashboard/jobs/${id}`}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Job Details</span>
            </Link>
          </Button>

          <div className="flex flex-1 items-center gap-2 sm:gap-4 overflow-x-auto pb-3 pt-3 scrollbar-none">
            <h1 className="text-base sm:text-lg font-semibold whitespace-nowrap">
              Practice Interview
            </h1>
            <div className="flex items-center gap-2 min-w-0">
              <Badge
                variant="outline"
                className="gap-1 pl-2 whitespace-nowrap text-xs"
              >
                <BriefcaseIcon className="h-3 w-3" />
                {job.domain}
              </Badge>
              <Badge
                variant="outline"
                className="gap-1 pl-2 whitespace-nowrap text-xs"
              >
                <LayersIcon className="h-3 w-3" />
                {job.title}
              </Badge>
              <Badge
                variant="outline"
                className="gap-1 pl-2 whitespace-nowrap text-xs"
              >
                <GraduationCapIcon className="h-3 w-3" />
                {job.level}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Space */}
      <div className="flex-1 p-3 sm:p-6">
        <div className="mx-auto max-w-[1500px] h-full flex gap-6">
          <Card className="bg-gradient-to-b from-background to-muted/50 border-0 shadow-2xl h-full flex-1">
            <AgentWrapper
              userName={user?.name ?? "Guest"}
              userId={user?.id ?? "Guest"}
              jobId={id}
              type="practice"
              jobTitle={job.title}
              jobDomain={job.domain}
              jobLevel={job.level}
              feedbackId={feedback?.id}
            />
          </Card>

          {/* Script Panel */}
          <Suspense fallback={<ScriptSkeleton />}>
            {script ? (
              <ScriptPanel
                script={script}
                jobId={id}
                userId={user?.id ?? "Guest"}
              />
            ) : (
              <ScriptSkeleton />
            )}
          </Suspense>
        </div>
      </div>
    </main>
  );
};

export default PracticeDetails;
