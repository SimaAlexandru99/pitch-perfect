import JobCard from "@/components/job-card";
import { getJobs } from "@/lib/actions/general.action";
import dayjs from "dayjs";

export default async function JobsPage() {
  const jobs = await getJobs();

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8">
      <h1 className="text-2xl font-bold">Sales Jobs</h1>
      {jobs === null ? (
        <div className="text-destructive text-center py-8">
          Failed to load jobs.
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-muted-foreground text-center py-8">
          No jobs found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              jobId={job.id}
              userId={undefined}
              title={job.title}
              type={job.type}
              domain={job.domain}
              level={job.level}
              createdAt={
                job.createdAt
                  ? dayjs(job.createdAt).format("MMM D, YYYY")
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
