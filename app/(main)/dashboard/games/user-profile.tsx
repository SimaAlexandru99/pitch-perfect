"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getUserGameStats } from "@/lib/actions/game-stats.action";
import { Crown, Sparkles, Star, Sword } from "lucide-react";
import { useEffect, useState } from "react";

interface UserProfileProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar?: string;
  };
}

interface UserStats {
  xp: number;
  level: number;
  charisma: number;
  persuasion: number;
  confidence: number;
  achievements: string[];
  totalGames: number;
  gamesWon: number;
  highestStreak: number;
}

const XP_THRESHOLDS = [
  0, // Level 1
  100, // Level 2
  250, // Level 3
  500, // Level 4
  1000, // Level 5
  2000, // Level 6
  4000, // Level 7
  8000, // Level 8
  16000, // Level 9
  32000, // Level 10
] as const;

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserProfile({ user }: UserProfileProps) {
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    level: 1,
    charisma: 1,
    persuasion: 1,
    confidence: 1,
    achievements: [],
    totalGames: 0,
    gamesWon: 0,
    highestStreak: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUserStats() {
      try {
        const { success, stats: userStats } = await getUserGameStats(user.id);
        if (success && userStats) {
          setStats(userStats as UserStats);
        }
      } catch (error) {
        console.error("Error loading user stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserStats();
  }, [user.id]);

  const nextLevelXP = XP_THRESHOLDS[stats.level] || Infinity;
  const currentLevelXP = XP_THRESHOLDS[stats.level - 1] || 0;
  const progress =
    ((stats.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-slate-900/50 via-gray-900/50 to-slate-900/50 border-primary/30">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="size-20 rounded-full bg-slate-700" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-700 rounded" />
              <div className="h-3 w-24 bg-slate-700 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-700 rounded" />
            <div className="h-2 w-full bg-slate-700 rounded" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-900/50 via-gray-900/50 to-slate-900/50 border-primary/30">
      <div className="flex flex-col md:flex-row gap-6">
        {/* User Avatar and Basic Info */}
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14 border-2 border-primary shadow">
            <AvatarImage src={user.avatar} alt={user.name || "Avatar"} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold text-white">
              {user.name || "Adventurer"}
            </h2>
            <p className="text-white/75">Level {stats.level} Sales Warrior</p>
          </div>
        </div>

        {/* XP and Progress */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3 bg-amber-900/30 p-3 rounded-lg">
            <Star className="size-5 text-amber-400" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/90">Level {stats.level}</span>
                <span className="text-white/75">
                  {stats.xp} / {nextLevelXP} XP
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Character Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2 bg-indigo-900/30 p-2 rounded-lg">
              <Sparkles className="size-4 text-indigo-400" />
              <span className="text-indigo-200">
                Charisma: {stats.charisma.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-violet-900/30 p-2 rounded-lg">
              <Crown className="size-4 text-violet-400" />
              <span className="text-violet-200">
                Persuasion: {stats.persuasion.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-cyan-900/30 p-2 rounded-lg">
              <Sword className="size-4 text-cyan-400" />
              <span className="text-cyan-200">
                Confidence: {stats.confidence.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-900/30 p-2 rounded-lg text-center">
              <p className="text-white/75 text-sm">Games Played</p>
              <p className="text-white text-lg font-semibold">
                {stats.totalGames}
              </p>
            </div>
            <div className="bg-slate-900/30 p-2 rounded-lg text-center">
              <p className="text-white/75 text-sm">Games Won</p>
              <p className="text-white text-lg font-semibold">
                {stats.gamesWon}
              </p>
            </div>
            <div className="bg-slate-900/30 p-2 rounded-lg text-center">
              <p className="text-white/75 text-sm">Best Streak</p>
              <p className="text-white text-lg font-semibold">
                {stats.highestStreak}
              </p>
            </div>
          </div>

          {/* Achievements */}
          {stats.achievements.length > 0 && (
            <div className="mt-4">
              <h3 className="text-white/90 text-sm mb-2">Achievements</h3>
              <div className="flex flex-wrap gap-2">
                {stats.achievements.map((achievement) => (
                  <div
                    key={achievement}
                    className="bg-amber-900/30 px-3 py-1 rounded-full text-amber-200 text-sm"
                  >
                    {achievement}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
