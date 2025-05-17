import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFeedbackByJobId, getJobById } from "@/lib/actions/general.action";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  BriefcaseIcon,
  Check,
  ChevronRight,
  GraduationCapIcon,
  LayersIcon,
  Star,
  TrendingUp,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const FeedbackPage = async ({ params }: { params: { id: string } }) => {
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
              Practice Feedback
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

      {/* Feedback Content */}
      <div className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Overall Score */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-2">
                  <Star className="size-12 text-primary" />
                  <div className="absolute inset-0 flex items-center justify-center font-semibold text-lg">
                    {feedback.totalScore}
                  </div>
                </div>
                <h2 className="text-xl font-semibold mb-1">Overall Score</h2>
                <p className="text-muted-foreground text-sm max-w-md">
                  {feedback.totalScore >= 80
                    ? "Excellent performance! You're well-prepared for real sales conversations."
                    : feedback.totalScore >= 60
                    ? "Good effort! With some refinements, you'll be ready for real sales situations."
                    : "Keep practicing! Focus on the areas of improvement highlighted below."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Category Scores */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="size-5 text-primary" />
                <CardTitle>Performance by Category</CardTitle>
              </div>
              <CardDescription>
                Detailed breakdown of your performance across key sales skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="max-md:hidden">Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedback.categoryScores.map((category) => (
                    <TableRow key={category.name}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            category.score >= 80 ? "default" : "secondary"
                          }
                          className="w-12 justify-center"
                        >
                          {category.score}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-md:hidden text-sm text-muted-foreground">
                        {category.comment}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Strengths & Areas for Improvement */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Check className="size-5 text-emerald-500" />
                  <CardTitle>Key Strengths</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index} className="flex gap-2 text-sm">
                      <ChevronRight className="size-4 text-emerald-500 shrink-0 mt-1" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-5 text-primary" />
                  <CardTitle>Areas for Improvement</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {feedback.areasForImprovement.map((area, index) => (
                    <li key={index} className="flex gap-2 text-sm">
                      <AlertCircle className="size-4 text-primary shrink-0 mt-1" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Final Assessment */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <XCircle className="size-5 text-primary" />
                <CardTitle>Final Assessment</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-line">
                {feedback.finalAssessment}
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="sm:flex-1 max-w-[300px]">
              <Link href={`/dashboard/jobs/${id}/practice`}>
                Practice Again
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="sm:flex-1 max-w-[300px]"
            >
              <Link href="/dashboard/jobs">Browse More Jobs</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FeedbackPage;
