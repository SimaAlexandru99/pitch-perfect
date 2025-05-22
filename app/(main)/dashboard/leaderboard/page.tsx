import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentUser } from "@/lib/actions/auth.action";
import type { LeaderboardEntry } from "@/lib/actions/game.action";
import { getLeaderboard } from "@/lib/actions/game.action";
import { cn } from "@/lib/utils";
import { Crown, Star, Trophy } from "lucide-react";

export default async function LeaderboardPage() {
  const user = await getCurrentUser();
  // Fetch leaderboard for the main game mode (e.g., 'rpg')
  const { success, leaderboard } = await getLeaderboard("rpg", 10);

  return (
    <div className="w-full min-h-screen">
      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <Card className="mb-8 bg-gradient-to-br from-violet-900/60 via-indigo-900/60 to-slate-900/60 border-none shadow-xl">
            <CardHeader className="flex flex-col items-center gap-2">
              <Trophy className="size-10 text-amber-400" />
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Leaderboard
              </CardTitle>
              <div className="text-white/80 text-center mt-2">
                Top 10 Adventurers
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white/80">Rank</TableHead>
                    <TableHead className="text-white/80">Name</TableHead>
                    <TableHead className="text-white/80">Level</TableHead>
                    <TableHead className="text-white/80">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {success && leaderboard && leaderboard.length > 0 ? (
                    (leaderboard as LeaderboardEntry[]).map(
                      (entry, idx: number) => {
                        const isCurrentUser = user && entry.userId === user.id;
                        let rowClass = "";
                        if (idx === 0)
                          rowClass =
                            "bg-gradient-to-r from-amber-900/50 to-amber-800/50 border-amber-500/30";
                        else if (idx === 1)
                          rowClass =
                            "bg-gradient-to-r from-slate-900/50 to-slate-800/50 border-slate-500/30";
                        else if (idx === 2)
                          rowClass =
                            "bg-gradient-to-r from-orange-900/50 to-orange-800/50 border-orange-500/30";
                        else
                          rowClass =
                            "bg-gradient-to-r from-slate-800/30 to-slate-900/30 border-slate-600/30";
                        return (
                          <TableRow
                            key={entry.userId + "-" + idx}
                            className={cn(
                              rowClass,
                              isCurrentUser &&
                                "bg-amber-100/10 border-amber-400 border-l-4"
                            )}
                          >
                            <TableCell className="text-white/90 font-bold">
                              {idx === 0 ? (
                                <Crown className="inline size-5 text-amber-400" />
                              ) : (
                                idx + 1
                              )}
                            </TableCell>
                            <TableCell className="text-white/90">
                              {entry.userName || "Anonymous"}
                              {isCurrentUser && (
                                <span className="ml-2 inline-flex items-center gap-1 text-amber-400 font-bold text-xs">
                                  (You) <Star className="inline size-4" />
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-white/80">
                              {entry.level}
                            </TableCell>
                            <TableCell className="text-white/80">
                              {entry.score}
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-white/60"
                      >
                        No leaderboard data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
