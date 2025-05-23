import Agent from "@/app/(main)/dashboard/jobs/[id]/practice/Agent";
import HeaderBar from "@/components/HeaderBar";
import { interviewer } from "@/constants";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFeedbackByJobId, getJobById } from "@/lib/actions/general.action";

import { redirect } from "next/navigation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Server component for the Practice Interview page.
 * Fetches user, job, and feedback data, and renders the main layout.
 * Script logic is handled in Agent.tsx.
 */
const PracticeDetails = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();
  const job = await getJobById(id);
  if (!job) return redirect("/");

  const feedback = await getFeedbackByJobId({
    jobId: id,
    userId: user?.id ?? "Guest",
  });

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-muted/40 w-full">
      <HeaderBar
        title="Practice Interview"
        description={`${job.domain} - ${job.title}`}
        badges={[
          {
            icon: "trophy",
            label: job.level,
          },
        ]}
      />
      {/* Meeting Space */}
      <div className="flex-1 p-2 sm:p-6 flex items-center justify-center min-h-0">
        <div className="w-full h-full flex flex-col lg:flex-row gap-6 min-h-0 items-stretch">
          <div className="flex-1 flex flex-col justify-center min-h-0 rounded-xl bg-gradient-to-b from-background to-muted/50 border border-border/40 shadow-2xl p-0 sm:p-4">
            <Agent
              userName={user?.name ?? "Guest"}
              userId={user?.id ?? "Guest"}
              jobId={id}
              type="practice"
              jobTitle={job.title}
              jobDomain={job.domain}
              jobLevel={job.level}
              feedbackId={feedback?.id}
              config={interviewer}
            />
          </div>
          {/* Script Panel is handled inside Agent */}
        </div>
      </div>
    </div>
  );
};

export default PracticeDetails;
