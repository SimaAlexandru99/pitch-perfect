import { IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface StatsSummary {
  count: number;
  averageScore: number;
  bestScore: number;
  lastScore: number;
}

export function SectionCards({
  gameStats,
  interviewStats,
}: {
  gameStats: StatsSummary;
  interviewStats: StatsSummary;
}) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Games Played</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {gameStats.count}
          </CardTitle>
          <div className="mt-2">
            <Badge variant="outline">
              <IconTrendingUp />
              Best: {gameStats.bestScore}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Avg Score: {gameStats.averageScore.toFixed(1)}
          </div>
          <div className="text-muted-foreground">
            Last Score: {gameStats.lastScore}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Interviews Completed</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {interviewStats.count}
          </CardTitle>
          <div className="mt-2">
            <Badge variant="outline">
              <IconTrendingUp />
              Best: {interviewStats.bestScore}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Avg Score: {interviewStats.averageScore.toFixed(1)}
          </div>
          <div className="text-muted-foreground">
            Last Score: {interviewStats.lastScore}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
