import { GameModesGrid } from "@/app/(main)/dashboard/games/game-modes-grid";
import { UserProfile } from "@/app/(main)/dashboard/games/user-profile";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { initializeGameModes } from "@/lib/actions/game.action";
import { Sparkles, Trophy } from "lucide-react";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sales Quest - Choose Your Adventure",
  description:
    "Embark on an epic journey to master the art of sales through magical challenges and quests",
  openGraph: {
    title: "Sales Quest - Choose Your Adventure",
    description:
      "Embark on an epic journey to master the art of sales through magical challenges and quests",
    type: "website",
  },
};

export default async function GamesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Initialize game modes in Firebase
  await initializeGameModes();

  return (
    <div className="w-full min-h-screen">
      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-0 w-[50vw] h-[50vh] bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[50vw] h-[50vh] bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vh] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-[2000px] mx-auto">
          <div className="mb-8 sm:mb-16 text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Trophy className="size-8 sm:size-12 text-amber-400" />
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Sales Quest
              </h1>
              <Sparkles className="size-8 sm:size-12 text-amber-400" />
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-white/75 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Choose your path and embark on an epic journey to master the art
              of sales. Each quest offers unique challenges and rewards to help
              you become a legendary sales warrior.
            </p>
          </div>

          {/* User Profile */}
          <div className="mb-8 sm:mb-12">
            <UserProfile user={user} />
          </div>

          <div className="relative">
            <GameModesGrid />
          </div>
        </div>
      </div>
    </div>
  );
}
