"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";

interface ProfileStatsCardProps {
  user: {
    id: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
  streak?: number;
  globalRank?: number;
  topDomains?: string[];
}

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfileStatsCard({
  user,
  streak = 0,
  globalRank = 0,
  topDomains = [],
}: ProfileStatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80 }}
      className="w-full"
    >
      <Card className="flex flex-col sm:flex-row items-center gap-4 p-4 md:p-6 bg-gradient-to-r from-indigo-900/80 to-violet-900/80 border border-violet-700 shadow-lg rounded-xl">
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="w-14 h-14 border-2 border-primary shadow">
            <AvatarImage src={user.avatar} alt={user.name || "Avatar"} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-bold text-lg text-white">
              {user.name || "Anonymous"}
            </div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
            <div className="flex gap-3 mt-2">
              <div className="flex flex-col items-center">
                <span className="text-sm text-white font-semibold">
                  {streak}
                </span>
                <span className="text-xs text-muted-foreground">Streak</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-white font-semibold">
                  #{globalRank}
                </span>
                <span className="text-xs text-muted-foreground">
                  Global Rank
                </span>
              </div>
              {topDomains.length > 0 && (
                <div className="flex flex-col items-center">
                  <span className="text-sm text-white font-semibold">
                    {topDomains.slice(0, 2).join(", ")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Top Domains
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <Link href="/dashboard/profile" className="flex-shrink-0">
          <Button
            variant="secondary"
            className="font-semibold px-4 py-2 rounded-lg"
          >
            View Profile
          </Button>
        </Link>
      </Card>
    </motion.div>
  );
}
