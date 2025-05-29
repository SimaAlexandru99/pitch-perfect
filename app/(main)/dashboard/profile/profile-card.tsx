"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Star, Trophy, User } from "lucide-react";
import { EditProfileDialog } from "./edit-profile-dialog";

export function ProfileCard({
  user,
  stats,
  achievements,
}: {
  user: { name: string; email: string; avatar: string };
  stats: { level: number; xp: number; totalGames: number };
  achievements: { id: string; unlockedAt: string }[];
}) {
  return (
    <Card className="w-full max-w-xl mx-auto bg-gradient-to-br from-violet-900/60 via-indigo-900/60 to-slate-900/60 border-none shadow-2xl">
      <CardHeader className="flex flex-col items-center gap-3 pb-0">
        <Avatar className="h-24 w-24 rounded-xl border-4 border-amber-400 shadow-lg">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="rounded-xl text-3xl bg-amber-900/40 text-amber-200">
            {user.name?.[0] ?? "U"}
          </AvatarFallback>
        </Avatar>
        <CardTitle className="text-2xl font-bold text-center text-white mt-2">
          {user.name}
        </CardTitle>
        <div className="text-white/80 text-center text-base">{user.email}</div>
      </CardHeader>
      <CardContent className="mt-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center bg-amber-900/30 rounded-lg p-4">
            <Star className="size-7 text-amber-400 mb-1" />
            <span className="text-lg font-semibold text-white">Level</span>
            <span className="text-2xl font-bold text-amber-200">
              {stats?.level ?? 1}
            </span>
          </div>
          <div className="flex flex-col items-center bg-indigo-900/30 rounded-lg p-4">
            <Trophy className="size-7 text-indigo-400 mb-1" />
            <span className="text-lg font-semibold text-white">XP</span>
            <span className="text-2xl font-bold text-indigo-200">
              {stats?.xp ?? 0}
            </span>
          </div>
          <div className="flex flex-col items-center bg-violet-900/30 rounded-lg p-4">
            <Award className="size-7 text-violet-400 mb-1" />
            <span className="text-lg font-semibold text-white">
              Achievements
            </span>
            <span className="text-2xl font-bold text-violet-200">
              {achievements.length}
            </span>
          </div>
          <div className="flex flex-col items-center bg-cyan-900/30 rounded-lg p-4">
            <User className="size-7 text-cyan-400 mb-1" />
            <span className="text-lg font-semibold text-white">
              Games Played
            </span>
            <span className="text-2xl font-bold text-cyan-200">
              {stats?.totalGames ?? 0}
            </span>
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <EditProfileDialog user={user} />
        </div>
      </CardContent>
    </Card>
  );
}
