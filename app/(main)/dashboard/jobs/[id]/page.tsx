import HeaderBar from "@/components/HeaderBar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {domains} from "@/constants";
import {getJobById} from "@/lib/actions/general.action";
import dayjs from "dayjs";
import {
    BriefcaseIcon,
    Calendar,
    GraduationCapIcon,
    Info,
    LayersIcon,
} from "lucide-react";
import {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";

interface JobDetailsPageProps {
    params: { id: string };
}

export async function generateMetadata({
                                           params,
                                       }: JobDetailsPageProps): Promise<Metadata> {
    const job = await getJobById(params.id);

    if (!job) {
        return {
            title: "Job Not Found",
            description: "The requested job could not be found.",
        };
    }

    return {
        title: `${job.title} - Sales Job Details`,
        description: `Practice interview for ${job.title} position in ${job.domain} at ${job.level} level.`,
        openGraph: {
            title: `${job.title} - Sales Job Details`,
            description: `Practice interview for ${job.title} position in ${job.domain} at ${job.level} level.`,
            type: "website",
        },
    };
}

export default async function JobDetailsPage({params}: JobDetailsPageProps) {
    const resolvedParams = await params;
    const job = await getJobById(resolvedParams.id);

    if (!job) return notFound();

    const domainMeta = domains.find((d) => d.value === job.domain);
    const DomainIcon = domainMeta?.icon;

    return (
        <main className="flex flex-col flex-1 overflow-hidden">
            <HeaderBar
                title="Job Details"
                domain={job.domain}
                jobTitle={job.title}
                level={job.level}
            />

            <div className="flex-1 p-3 sm:p-6">
                <div className="mx-auto max-w-[1500px] h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            <Card
                                className="w-full p-6 lg:p-8 flex flex-col gap-6 shadow-lg border border-border rounded-2xl bg-card relative">
                                {/* Domain Icon */}
                                <div className="flex justify-center -mt-16 mb-2">
                                    {DomainIcon ? (
                                        <div
                                            className="bg-gradient-to-tr from-primary/20 to-accent/30 rounded-full p-2 shadow-lg">
                                            <DomainIcon
                                                className="rounded-full ring-2 ring-primary shadow-md object-cover size-[110px] bg-card p-6"
                                                aria-label={domainMeta?.label || job.domain}
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className="rounded-full ring-2 ring-primary shadow-md object-cover size-[110px] bg-muted flex items-center justify-center text-4xl text-muted-foreground">
                                            ?
                                        </div>
                                    )}
                                </div>

                                {/* Title & Meta */}
                                <div className="flex flex-col items-center gap-3">
                                    <h2 className="text-2xl lg:text-3xl font-bold text-center capitalize leading-tight">
                                        {job.title}
                                    </h2>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Badge variant="outline" className="gap-1 pl-2">
                                                        <BriefcaseIcon className="h-3 w-3"/>
                                                        {domainMeta?.label || job.domain}
                                                    </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Job Domain/Industry</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge variant="outline" className="gap-1 pl-2">
                                                    <GraduationCapIcon className="h-3 w-3"/>
                                                    {job.level}
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Experience Level Required</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge variant="outline" className="gap-1 pl-2">
                                                    <Calendar className="h-3 w-3"/>
                                                    {dayjs(job.createdAt).format("MMM D, YYYY")}
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Job Posted Date</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>

                                {/* Description Section */}
                                <section className="mt-2">
                                    <div className="flex items-center gap-2 mb-3">
                                        <LayersIcon className="h-5 w-5 text-primary"/>
                                        <h3 className="text-lg font-semibold text-primary">
                                            About the Role
                                        </h3>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-4 w-4 text-muted-foreground cursor-help"/>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>
                                                        Detailed description of the job responsibilities and
                                                        requirements
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <div className="prose prose-sm max-w-none">
                                        <p className="text-base text-muted-foreground whitespace-pre-line leading-relaxed">
                                            {job.description}
                                        </p>
                                    </div>
                                </section>

                                {/* Actions */}
                                <div className="flex flex-col gap-3 mt-6 pt-6 border-t">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    asChild
                                                    size="lg"
                                                    className="w-full text-base font-semibold py-6 rounded-lg shadow-md"
                                                >
                                                    <Link href={`/dashboard/jobs/${job.id}/practice`}>
                                                        Start Practice Interview
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Begin a practice interview for this position</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="lg"
                                                    className="w-full text-base font-semibold py-6 rounded-lg"
                                                >
                                                    <Link href="/dashboard/jobs">Browse Other Jobs</Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>View all available job positions</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <aside className="lg:col-span-1">
                            <Card
                                className="p-6 shadow-md border border-border rounded-2xl bg-muted/40 flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <BriefcaseIcon className="h-5 w-5 text-primary"/>
                                    <h3 className="text-lg font-semibold text-primary">
                                        Related Jobs
                                    </h3>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-muted-foreground cursor-help"/>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Similar positions you might be interested in</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        No related jobs found at the moment.
                                    </p>
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href="/dashboard/jobs">Explore All Jobs</Link>
                                    </Button>
                                </div>
                            </Card>
                        </aside>
                    </div>
                </div>
            </div>
        </main>
    );
}
