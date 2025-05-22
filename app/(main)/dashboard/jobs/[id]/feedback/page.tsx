import HeaderBar from "@/components/HeaderBar";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFeedbackByJobId, getJobById } from "@/lib/actions/general.action";
import { redirect } from "next/navigation";
import ExportButton from "./ExportButton";
import FeedbackContent from "./FeedbackContent";

export default async function FeedbackPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const job = await getJobById(id);
  if (!job) redirect("/dashboard/jobs");

  const feedback = await getFeedbackByJobId({
    jobId: id,
    userId: user?.id ?? "Guest",
  });
  if (!feedback) redirect(`/dashboard/jobs/${id}`);

  return (
    <main className="flex flex-col flex-1 overflow-hidden">
      <HeaderBar
        title="Practice Feedback"
        domain={job.domain}
        jobTitle={job.title}
        level={job.level}
        showExport
        showActions
        jobId={job.id}
        userId={user?.id ?? "Guest"}
      >
        <ExportButton
          feedback={feedback}
          jobTitle={job.title}
          domain={job.domain}
          level={job.level}
        />
      </HeaderBar>

      {/* Meeting Space */}
      <div className="flex-1 p-3 sm:p-6">
        <div className="mx-auto max-w-[1500px] h-full">
          <Card className="bg-gradient-to-b from-background to-muted/50 border-0 shadow-2xl h-full">
            <FeedbackContent feedback={feedback} job={job} />
          </Card>
        </div>
      </div>
    </main>
  );
}
