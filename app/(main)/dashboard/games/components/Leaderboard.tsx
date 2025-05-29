"use client";

import { Card } from "@/components/ui/card";
import { getLeaderboard } from "@/lib/actions/game.action";
import { cn } from "@/lib/utils";
import { Crown, Medal, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

interface LeaderboardProps {
  gameModeId: string;
  gameModeName: string;
  className?: string;
}

interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  score: number;
  level: number;
  timestamp: number;
}

export default function Leaderboard({
  gameModeId,
  gameModeName,
  className,
}: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      const { success, leaderboard: data } = await getLeaderboard(gameModeId);
      if (success && data) {
        setLeaderboard(data as LeaderboardEntry[]);
      }
      setLoading(false);
    }

    fetchLeaderboard();
  }, [gameModeId]);

  return (
    <Card
      className={cn(
        "p-6 bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-800/80 border-2 border-primary/30 shadow-lg backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="size-6 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">
          {gameModeName} Leaderboard
        </h3>
      </div>

      {loading ? (
        <div className="text-white/75">Loading leaderboard...</div>
      ) : leaderboard.length === 0 ? (
        <div className="text-white/75">
          No scores yet. Be the first to play!
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-colors border",
                index === 0
                  ? "bg-gradient-to-r from-amber-900/50 to-amber-800/50 border-amber-500/30"
                  : index === 1
                    ? "bg-gradient-to-r from-slate-900/50 to-slate-800/50 border-slate-500/30"
                    : index === 2
                      ? "bg-gradient-to-r from-orange-900/50 to-orange-800/50 border-orange-500/30"
                      : "bg-gradient-to-r from-slate-800/30 to-slate-900/30 border-slate-600/30",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2",
                    index === 0
                      ? "bg-amber-900/50 border-amber-500/30"
                      : index === 1
                        ? "bg-slate-900/50 border-slate-500/30"
                        : index === 2
                          ? "bg-orange-900/50 border-orange-500/30"
                          : "bg-slate-900/50 border-slate-600/30",
                  )}
                >
                  {index === 0 ? (
                    <Crown className="size-5 text-amber-400" />
                  ) : index === 1 ? (
                    <Medal className="size-5 text-slate-400" />
                  ) : index === 2 ? (
                    <Medal className="size-5 text-orange-400" />
                  ) : (
                    <span className="text-white/75">{index + 1}</span>
                  )}
                </div>
                <div>
                  <div className="text-white font-medium">{entry.userName}</div>
                  <div className="text-white/75 text-sm">
                    Level {entry.level}
                  </div>
                </div>
              </div>
              <div className="text-white font-bold">{entry.score}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
