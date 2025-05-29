"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { gameModes } from "@/constants";
import { getUserGameStats } from "@/lib/actions/game-stats.action";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  Crown,
  Flame,
  Mic,
  Shield,
  Sparkles,
  Star,
  Sword,
  Timer,
  Trophy,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const iconMap = {
  Trophy,
  Flame,
  Timer,
  User,
  Mic,
} as const;

const difficultyColors = {
  easy: "text-emerald-400",
  medium: "text-amber-400",
  hard: "text-rose-400",
  expert: "text-violet-400",
} as const;

const gameTypeStyles = {
  rpg: "from-indigo-900/50 via-purple-900/50 to-violet-900/50",
  streak: "from-orange-900/50 via-red-900/50 to-rose-900/50",
  timeAttack: "from-cyan-900/50 via-blue-900/50 to-indigo-900/50",
  mysteryPersona: "from-emerald-900/50 via-teal-900/50 to-cyan-900/50",
  voiceOlympics: "from-amber-900/50 via-yellow-900/50 to-orange-900/50",
} as const;

export function GameModesGrid() {
  const router = useRouter();
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUserStats() {
      if (!user?.id) return;

      try {
        const { success, stats } = await getUserGameStats(user.id);
        if (success && stats) {
          setUserStats(stats as UserStats);
        }
      } catch (error) {
        console.error("Error loading user stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserStats();
  }, [user?.id]);

  const handleStartGame = useCallback(
    (modeId: string) => {
      router.push(`/dashboard/games/${modeId}`);
    },
    [router],
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={index}
            className="p-6 bg-gradient-to-br from-slate-900/50 via-gray-900/50 to-slate-900/50 border-primary/30 animate-pulse"
          >
            <div className="space-y-4">
              <div className="h-8 bg-slate-700 rounded w-3/4" />
              <div className="h-4 bg-slate-700 rounded w-full" />
              <div className="h-4 bg-slate-700 rounded w-2/3" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {gameModes.map((mode) => {
        const Icon = iconMap[mode.iconName];
        const difficultyColor =
          difficultyColors[mode.difficulty as keyof typeof difficultyColors] ||
          "text-primary";
        const gameStyle =
          gameTypeStyles[mode.type as keyof typeof gameTypeStyles] ||
          "from-primary/50 to-primary/30";

        return (
          <Card
            key={mode.id}
            className={`p-4 sm:p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-br ${gameStyle} border-primary/30 hover:border-primary/50 hover:scale-[1.02] backdrop-blur-sm h-full`}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-white/10 rounded-lg relative group">
                  <Icon className="size-5 sm:size-6 text-white" />
                  <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="size-3 sm:size-4 text-amber-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-white">
                    {mode.name}
                  </h3>
                  <p className="text-sm sm:text-base text-white/75">
                    {mode.description}
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-3 sm:space-y-4">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Shield className="size-3.5 sm:size-4 text-cyan-400" />
                  <span className="text-xs sm:text-sm font-medium text-white/90">
                    Difficulty:
                  </span>
                  <span
                    className={`text-xs sm:text-sm capitalize ${difficultyColor}`}
                  >
                    {mode.difficulty}
                  </span>
                </div>

                {mode.type === "rpg" && (
                  <>
                    <div className="text-xs sm:text-sm text-white/75 flex items-center gap-1.5 sm:gap-2">
                      <Sword className="size-3.5 sm:size-4 text-violet-400" />
                      <span>{mode.maxLevel} levels to complete</span>
                    </div>
                    {userStats && (
                      <div className="text-xs sm:text-sm text-white/75 flex items-center gap-1.5 sm:gap-2">
                        <Star className="size-3.5 sm:size-4 text-amber-400" />
                        <span>Your Level: {userStats.level}</span>
                      </div>
                    )}
                  </>
                )}
                {mode.type === "streak" && (
                  <>
                    <div className="text-xs sm:text-sm text-white/75 flex items-center gap-1.5 sm:gap-2">
                      <Flame className="size-3.5 sm:size-4 text-orange-400" />
                      <span>Target: {mode.streakGoal} perfect responses</span>
                    </div>
                    {userStats && (
                      <div className="text-xs sm:text-sm text-white/75 flex items-center gap-1.5 sm:gap-2">
                        <Crown className="size-3.5 sm:size-4 text-amber-400" />
                        <span>Best Streak: {userStats.highestStreak}</span>
                      </div>
                    )}
                  </>
                )}
                {mode.type === "timeAttack" && (
                  <>
                    <div className="text-xs sm:text-sm text-white/75 flex items-center gap-1.5 sm:gap-2">
                      <Timer className="size-3.5 sm:size-4 text-cyan-400" />
                      <span>{mode.timeLimit} seconds per round</span>
                    </div>
                    {userStats && (
                      <div className="text-xs sm:text-sm text-white/75 flex items-center gap-1.5 sm:gap-2">
                        <Trophy className="size-3.5 sm:size-4 text-amber-400" />
                        <span>Games Won: {userStats.gamesWon}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <Button
                onClick={() => handleStartGame(mode.id)}
                className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25 text-sm sm:text-base"
              >
                <Crown className="size-3.5 sm:size-4 mr-1.5 sm:mr-2 text-amber-400" />
                Begin Quest
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
