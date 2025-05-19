import Agent from "@/app/(main)/dashboard/jobs/[id]/practice/Agent";
import HeaderBar from "@/components/HeaderBar";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  createScript,
  getFeedbackByJobId,
  getJobById,
  getScript,
} from "@/lib/actions/general.action";
import { redirect } from "next/navigation";
import { Suspense } from "react";
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
    <div className="flex flex-col h-dvh overflow-hidden">
      <HeaderBar
        title="Practice Interview"
        domain={job.domain}
        jobTitle={job.title}
        level={job.level}
      />{" "}
      {/* Meeting Space */}
      <div className="flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-[1500px] flex flex-col lg:flex-row gap-6">
          <Card className="bg-gradient-to-b from-background to-muted/50 border-0 shadow-2xl h-full flex-1 p-4">
            <div className="h-full flex flex-col">
              <Agent
                userName={user?.name ?? "Guest"}
                userId={user?.id ?? "Guest"}
                jobId={id}
                type="practice"
                jobTitle={job.title}
                jobDomain={job.domain}
                jobLevel={job.level}
                feedbackId={feedback?.id}
              />
            </div>
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
    </div>
  );
};

export default PracticeDetails;
