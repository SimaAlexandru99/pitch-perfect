import dayjs from "dayjs";
import {Calendar, Star} from "lucide-react";
import Link from "next/link";

import {domains} from "@/constants/";
import {getFeedbackByJobId} from "@/lib/actions/general.action";
import {cn} from "@/lib/utils";
import {Button} from "./ui/button";
import {Card} from "./ui/card";

const JobCard = async ({
                           jobId,
                           userId,
                           title,
                           domain,
                           level,
                           createdAt,
                       }: JobCardProps) => {
    const feedback =
        userId && jobId ? await getFeedbackByJobId({jobId, userId}) : null;

    const domainMeta = domains.find((d) => d.value === domain);
    const DomainIcon = domainMeta?.icon;

    const badgeColor =
        {
            SDR: "bg-blue-100 text-blue-800",
            AE: "bg-green-100 text-green-800",
            Manager: "bg-yellow-100 text-yellow-800",
        }[level] || "bg-gray-100 text-gray-800";

    const formattedDate = dayjs(
        feedback?.createdAt || createdAt || Date.now()
    ).format("MMM D, YYYY");

    return (
        <Card
            className="relative w-full max-w-xs min-h-96 flex flex-col justify-between shadow-lg border border-border rounded-xl bg-card transition-transform hover:-translate-y-1 hover:shadow-2xl duration-200">
            {/* Level Badge */}
            <div
                className={cn(
                    "absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-xs font-semibold z-10",
                    badgeColor
                )}
            >
                {level}
            </div>

            {/* Cover Image (now DomainIcon) */}
            <div className="flex justify-center mt-6">
                {DomainIcon ? (
                    <DomainIcon
                        className="rounded-full ring-2 ring-primary shadow-md object-cover size-[90px] bg-card p-4"
                        aria-label={domainMeta?.label || domain}
                    />
                ) : (
                    <div
                        className="rounded-full ring-2 ring-primary shadow-md object-cover size-[90px] bg-muted flex items-center justify-center text-3xl text-muted-foreground">
                        ?
                    </div>
                )}
            </div>

            {/* Card Content */}
            <div className="flex flex-col items-center px-6 mt-4 flex-1">
                {/* Job Title */}
                <h3 className="text-lg font-bold capitalize text-center mb-1 line-clamp-1">
                    {title}
                </h3>

                {/* Domain Icon and Label */}
                <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-muted-foreground font-medium">
            {domainMeta?.label || domain}
          </span>
                </div>

                {/* Date & Score */}
                <div className="flex flex-row gap-5 mt-2 mb-2 w-full justify-center">
                    <div className="flex flex-row gap-2 items-center">
                        <Calendar
                            className="w-5 h-5 text-muted-foreground"
                            aria-label="calendar"
                        />
                        <span className="text-xs text-muted-foreground">
              {formattedDate}
            </span>
                    </div>

                    <div className="flex flex-row gap-2 items-center">
                        <Star
                            className="w-5 h-5 text-yellow-600 fill-yellow-400/80"
                            aria-label="star"
                        />
                        <span className="text-xs font-semibold text-yellow-600">
              {feedback?.totalScore || "---"}/100
            </span>
                    </div>
                </div>

                {/* Feedback or Placeholder Text */}
                <p className="line-clamp-2 text-sm text-center text-muted-foreground mt-2 mb-4">
                    {feedback?.finalAssessment ||
                        "You haven't applied for this job yet. Apply now to get feedback."}
                </p>
            </div>

            {/* Action Button */}
            <div className="px-6 pb-6 w-full mt-auto">
                <Button className="w-full btn-primary text-base font-semibold py-2 rounded-lg">
                    <Link
                        href={
                            feedback
                                ? `/dashboard/jobs/${jobId}/feedback`
                                : `/dashboard/jobs/${jobId}`
                        }
                        className="w-full h-full flex items-center justify-center"
                    >
                        {feedback ? "Check Feedback" : "View Job"}
                    </Link>
                </Button>
            </div>
        </Card>
    );
};

export default JobCard;
