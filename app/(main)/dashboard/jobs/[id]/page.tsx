import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { domains } from "@/constants";
import { getJobById } from "@/lib/actions/general.action";
import dayjs from "dayjs";
import Link from "next/link";
import { notFound } from "next/navigation";

interface JobDetailsPageProps {
  params: { id: string };
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const resolvedParams = await params;
  const job = await getJobById(resolvedParams.id);

  if (!job) return notFound();

  const domainMeta = domains.find((d) => d.value === job.domain);
  const DomainIcon = domainMeta?.icon;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 lg:p-12 max-w-6xl mx-auto w-full min-h-[80vh]">
      {/* Main Content */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        <Card className="w-full p-8 flex flex-col gap-8 shadow-lg border border-border rounded-2xl bg-card relative">
          {/* Domain Icon */}
          <div className="flex justify-center -mt-16 mb-2">
            {DomainIcon ? (
              <div className="bg-gradient-to-tr from-primary/20 to-accent/30 rounded-full p-2 shadow-lg">
                <DomainIcon
                  className="rounded-full ring-2 ring-primary shadow-md object-cover size-[110px] bg-card p-6"
                  aria-label={domainMeta?.label || job.domain}
                />
              </div>
            ) : (
              <div className="rounded-full ring-2 ring-primary shadow-md object-cover size-[110px] bg-muted flex items-center justify-center text-4xl text-muted-foreground">
                ?
              </div>
            )}
          </div>
          {/* Title & Meta */}
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-3xl font-bold text-center capitalize leading-tight">
              {job.title}
            </h1>
            <div className="flex flex-row flex-wrap gap-4 items-center text-base text-muted-foreground justify-center">
              <span className="font-medium flex items-center gap-1">
                {domainMeta?.label || job.domain}
              </span>
              <span className="px-3 py-1 rounded bg-muted text-xs font-semibold uppercase tracking-wide">
                {job.level}
              </span>
              <span className="text-sm">
                {dayjs(job.createdAt).format("MMM D, YYYY")}
              </span>
            </div>
          </div>
          {/* Description Section */}
          <section className="mt-4">
            <h2 className="text-lg font-semibold mb-2 text-primary">
              About the Role
            </h2>
            <p className="text-base text-muted-foreground whitespace-pre-line">
              {job.description}
            </p>
          </section>
          {/* Actions */}
          <div className="w-full flex flex-col gap-2 mt-8 lg:mt-6 sticky bottom-0 z-10 bg-card/80 pt-4 pb-2 lg:static lg:bg-transparent">
            <Button
              asChild
              className="w-full btn-primary text-base font-semibold py-3 rounded-lg shadow-md"
            >
              <Link href={`/dashboard/jobs/${job.id}/practice`}>
                Practice for this Job
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full text-base font-semibold py-3 rounded-lg"
            >
              <Link href="/dashboard/jobs">Back to Jobs</Link>
            </Button>
          </div>
        </Card>
      </div>
      {/* Sidebar */}
      <aside className="hidden lg:block col-span-1">
        <Card className="p-6 shadow-md border border-border rounded-2xl bg-muted/40 flex flex-col gap-4">
          <h3 className="text-lg font-semibold mb-2 text-primary">
            Related Jobs
          </h3>
          <ul className="flex flex-col gap-3">
            {/* Placeholder related jobs */}
            <li className="text-base text-muted-foreground">
              No related jobs found.
            </li>
          </ul>
        </Card>
      </aside>
    </div>
  );
}
