import { getCurrentUser } from "@/lib/actions/auth.action";
import { getUserGameStats } from "@/lib/actions/game-stats.action";
import { redirect } from "next/navigation";
import { ProfileCard } from "./profile-card";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }
  const { success, stats } = await getUserGameStats(user.id);
  const achievements = (success && stats && stats.achievements) || [];

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-12 px-4">
      <ProfileCard
        user={{ name: user.name, email: user.email, avatar: user.avatar }}
        stats={{
          level: stats?.level ?? 1,
          xp: stats?.xp ?? 0,
          totalGames: stats?.totalGames ?? 0,
        }}
        achievements={achievements}
      />
    </div>
  );
}
