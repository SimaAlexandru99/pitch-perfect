import JobCard from "@/components/job-card";
import { domains } from "@/constants";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getJobs } from "@/lib/actions/general.action";
import dayjs from "dayjs";

interface JobsPageProps {
  searchParams: Promise<{ domain?: string }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const jobs = await getJobs();
  const user = await getCurrentUser();
  const { domain } = await searchParams;

  // Filter jobs by domain if specified
  const filteredJobs = domain
    ? jobs?.filter((job) => job.domain === domain)
    : jobs;

  // Get domain label for the header
  const domainInfo = domain ? domains.find((d) => d.value === domain) : null;

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">
          {domainInfo ? `${domainInfo.label} Jobs` : "Sales Jobs"}
        </h1>
        {domainInfo && (
          <p className="text-muted-foreground">
            Browse and practice sales scenarios in the {domainInfo.label} domain
          </p>
        )}
      </div>

      {!filteredJobs ? (
        <div className="text-destructive text-center py-8">
          Failed to load jobs.
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-muted-foreground text-center py-8">
          {domain
            ? `No jobs found in the ${domainInfo?.label} domain.`
            : "No jobs found."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              jobId={job.id}
              userId={user?.id}
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
