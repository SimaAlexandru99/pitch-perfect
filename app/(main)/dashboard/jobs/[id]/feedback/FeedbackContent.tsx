"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Award,
  Check,
  ChevronRight,
  Info,
  LineChart,
  Star,
  TrendingUp,
  XCircle,
} from "lucide-react";



export default function FeedbackContent({ feedback }: FeedbackContentProps) {
  // Calculate speaking time percentages
  const totalSpeakingTime =
    feedback.metrics.userSpeakingTime + feedback.metrics.aiSpeakingTime;
  const userSpeakingPercentage = Math.round(
    (feedback.metrics.userSpeakingTime / totalSpeakingTime) * 100
  );
  const aiSpeakingPercentage = Math.round(
    (feedback.metrics.aiSpeakingTime / totalSpeakingTime) * 100
  );

  // Calculate average response time
  const avgResponseTime = Math.round(
    feedback.metrics.totalDuration / (feedback.transcript.length / 2)
  );

  // Get top and bottom categories
  const topCategory = feedback.categoryScores.reduce((prev, current) =>
    prev.score > current.score ? prev : current
  );
  const bottomCategory = feedback.categoryScores.reduce((prev, current) =>
    prev.score < current.score ? prev : current
  );

  // Get performance message based on score
  const getPerformanceMessage = (score: number) => {
    if (score >= 80) {
      return {
        title: "Excellent Performance!",
        description:
          "You've demonstrated strong sales skills and are well-prepared for real conversations.",
      };
    } else if (score >= 60) {
      return {
        title: "Good Effort!",
        description:
          "You're on the right track! With some refinements, you'll be ready for real sales situations.",
      };
    }
    return {
      title: "Room for Improvement",
      description:
        "Keep practicing! Focus on the areas of improvement highlighted below.",
    };
  };

  const performanceMessage = getPerformanceMessage(feedback.totalScore);

  return (
    <div className="flex flex-col h-full">
      {/* Feedback Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Overall Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.3,
                    }}
                    className="relative mb-4"
                  >
                    <div className="relative">
                      <motion.div
                        initial={{ rotate: -180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{
                          duration: 0.8,
                          delay: 0.4,
                          type: "spring",
                          stiffness: 100,
                        }}
                        className="size-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-4"
                      >
                        <div className="size-full rounded-full border-4 border-primary/20 flex items-center justify-center">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            className="text-center"
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <div className="text-4xl font-bold text-primary">
                                      {feedback.totalScore}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      OUT OF 100
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Your overall performance score based on all
                                    categories
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </motion.div>
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1, duration: 0.3 }}
                        className="absolute -top-2 -right-2"
                      >
                        {feedback.totalScore >= 80 ? (
                          <div className="rounded-full bg-emerald-500/10 p-2">
                            <Star className="size-6 text-emerald-500" />
                          </div>
                        ) : feedback.totalScore >= 60 ? (
                          <div className="rounded-full bg-yellow-500/10 p-2">
                            <TrendingUp className="size-6 text-yellow-500" />
                          </div>
                        ) : (
                          <div className="rounded-full bg-primary/10 p-2">
                            <AlertCircle className="size-6 text-primary" />
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="space-y-4 max-w-md"
                  >
                    <div>
                      <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="text-2xl font-semibold mb-2"
                      >
                        {performanceMessage.title}
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                        className="text-muted-foreground"
                      >
                        {performanceMessage.description}
                      </motion.p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Top Category
                        </p>
                        <div className="flex items-center gap-2">
                          <Award className="size-4 text-primary" />
                          <p className="font-medium">{topCategory.name}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Needs Work
                        </p>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="size-4 text-primary" />
                          <p className="font-medium">{bottomCategory.name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <div className="size-2 rounded-full bg-emerald-500" />
                          <span>80+</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="size-2 rounded-full bg-yellow-500" />
                          <span>60-79</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="size-2 rounded-full bg-primary" />
                          <span>0-59</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <Tabs defaultValue="performance" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="metrics">Call Metrics</TabsTrigger>
                <TabsTrigger value="recommendations">
                  Recommendations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="space-y-4">
                {/* Category Scores */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Award className="size-5 text-primary" />
                      <CardTitle>Performance by Category</CardTitle>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Detailed breakdown of your performance across key
                              sales skills
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <CardDescription>
                      Detailed breakdown of your performance across key sales
                      skills
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {feedback.categoryScores.map((category) => (
                        <div key={category.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{category.name}</h3>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant={
                                      category.score >= 80
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="w-12 justify-center"
                                  >
                                    {category.score}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Score out of 100 for {category.name}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Progress value={category.score} className="h-2" />
                          <p className="text-sm text-muted-foreground">
                            {category.comment}
                          </p>
                          {category.subcategories && (
                            <div className="mt-2 space-y-2 pl-4 border-l-2 border-border">
                              {category.subcategories.map((sub) => (
                                <div key={sub.name} className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">{sub.name}</span>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Badge
                                            variant="outline"
                                            className="w-12 justify-center"
                                          >
                                            {sub.score}
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Score out of 100 for {sub.name}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                  <Progress value={sub.score} className="h-1" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                {/* Call Metrics */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <LineChart className="size-5 text-primary" />
                      <CardTitle>Call Metrics</CardTitle>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Detailed analysis of the call duration and
                              speaking patterns
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <CardDescription>
                      Detailed analysis of the call duration and speaking
                      patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Total Duration
                              </p>
                              <p className="text-2xl font-semibold">
                                {Math.round(feedback.metrics.totalDuration)}s
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Total length of the interview in seconds</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                User Speaking Time
                              </p>
                              <div className="space-y-1">
                                <p className="text-2xl font-semibold">
                                  {Math.round(
                                    feedback.metrics.userSpeakingTime
                                  )}
                                  s
                                </p>
                                <Progress
                                  value={userSpeakingPercentage}
                                  className="h-1"
                                />
                                <p className="text-xs text-muted-foreground">
                                  {userSpeakingPercentage}% of total speaking
                                  time
                                </p>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Time spent speaking during the interview</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                AI Speaking Time
                              </p>
                              <div className="space-y-1">
                                <p className="text-2xl font-semibold">
                                  {Math.round(feedback.metrics.aiSpeakingTime)}s
                                </p>
                                <Progress
                                  value={aiSpeakingPercentage}
                                  className="h-1"
                                />
                                <p className="text-xs text-muted-foreground">
                                  {aiSpeakingPercentage}% of total speaking time
                                </p>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Time spent listening to the AI interviewer</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Silence Time
                              </p>
                              <p className="text-2xl font-semibold">
                                {Math.round(feedback.metrics.silenceTime)}s
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Time spent in silence during the interview</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Interruptions
                              </p>
                              <p className="text-2xl font-semibold">
                                {feedback.metrics.interruptions}
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Number of times the conversation was interrupted
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Avg. Response Time
                              </p>
                              <p className="text-2xl font-semibold">
                                {avgResponseTime}s
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Average time taken to respond to questions</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="size-5 text-primary" />
                      <CardTitle>Development Plan</CardTitle>
                    </div>
                    <CardDescription>
                      Actionable steps to improve your sales performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-sm font-medium mb-3">
                          Short-term Improvements
                        </h3>
                        <ul className="space-y-3">
                          {feedback.recommendations.shortTerm.map(
                            (item, index) => (
                              <li key={index} className="flex gap-2 text-sm">
                                <ChevronRight className="size-4 text-primary shrink-0 mt-1" />
                                <span>{item}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-3">
                          Long-term Goals
                        </h3>
                        <ul className="space-y-3">
                          {feedback.recommendations.longTerm.map(
                            (item, index) => (
                              <li key={index} className="flex gap-2 text-sm">
                                <ChevronRight className="size-4 text-primary shrink-0 mt-1" />
                                <span>{item}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-3">
                          Learning Resources
                        </h3>
                        <div className="space-y-4">
                          {feedback.recommendations.resources.map(
                            (resource, index) => (
                              <div key={index} className="text-sm">
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline font-medium"
                                >
                                  {resource.title}
                                </a>
                                <p className="text-muted-foreground mt-1">
                                  {resource.description}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Final Assessment */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <XCircle className="size-5 text-primary" />
                <CardTitle>Final Assessment</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Overall evaluation of your interview performance</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-line">
                {feedback.finalAssessment}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
