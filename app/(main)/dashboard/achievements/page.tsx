import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ALL_ACHIEVEMENTS } from "@/constants/achievements";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getUserGameStats } from "@/lib/actions/game-stats.action";
import * as LucideIcons from "lucide-react";

export default async function AchievementsPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="p-8 text-center text-white">
        Please sign in to view your achievements.
      </div>
    );
  }
  const { success, stats } = await getUserGameStats(user.id);
  // Assume stats.achievements: { id: string, unlockedAt: string }[]
  type AchievementUnlock = { id: string; unlockedAt: string };
  const achievementsArr: AchievementUnlock[] =
    success && stats && Array.isArray(stats.achievements)
      ? stats.achievements
      : [];
  const unlockedMap: Map<string, string> = new Map(
    achievementsArr.map((a) => [a.id, a.unlockedAt])
  );
  const unlockedCount = Array.from(unlockedMap.keys()).length;
  const totalCount = ALL_ACHIEVEMENTS.length;

  // Sort: unlocked (by date desc), then locked (by name)
  const sortedAchievements = [...ALL_ACHIEVEMENTS].sort((a, b) => {
    const aUnlocked = unlockedMap.has(a.id);
    const bUnlocked = unlockedMap.has(b.id);
    if (aUnlocked && bUnlocked) {
      // Desc by unlock date
      return (
        new Date(unlockedMap.get(b.id) || 0).getTime() -
        new Date(unlockedMap.get(a.id) || 0).getTime()
      );
    }
    if (aUnlocked) return -1;
    if (bUnlocked) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="w-full min-h-screen">
      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <Card className="mb-8 bg-gradient-to-br from-violet-900/60 via-indigo-900/60 to-slate-900/60 border-none shadow-xl">
            <CardHeader className="flex flex-col items-center gap-2">
              <LucideIcons.Award className="size-10 text-amber-400" />
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Achievements
              </CardTitle>
              <div className="text-white/80 text-center mt-2">
                <span className="font-semibold text-emerald-300">
                  {unlockedCount}
                </span>
                <span className="text-white/60"> / {totalCount} unlocked</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                {sortedAchievements.map((ach) => {
                  const unlockedAt = unlockedMap.get(ach.id);
                  const iconName = ach.icon as keyof typeof LucideIcons;
                  const Icon =
                    typeof LucideIcons[iconName] === "function"
                      ? (LucideIcons[iconName] as React.FC<
                          React.SVGProps<SVGSVGElement>
                        >)
                      : LucideIcons.Award;
                  return (
                    <Card
                      key={ach.id}
                      aria-label={
                        unlockedAt
                          ? `${ach.name} achievement unlocked on ${new Date(
                              unlockedAt
                            ).toLocaleDateString()}`
                          : `${ach.name} achievement locked`
                      }
                      className={`flex flex-row items-center gap-4 p-4 transition-all duration-200 focus-within:ring-2 focus-within:ring-emerald-400 outline-none ${
                        unlockedAt
                          ? "bg-gradient-to-r from-amber-900/20 to-violet-900/20 border-amber-400/40 shadow-lg"
                          : "bg-gradient-to-r from-slate-900/40 to-gray-900/40 opacity-60 border-slate-600/30"
                      }`}
                      tabIndex={0}
                    >
                      <Icon
                        className={`size-8 flex-shrink-0 ${
                          unlockedAt ? "text-amber-400" : "text-indigo-400"
                        }`}
                        aria-hidden="true"
                      />
                      <div>
                        <div
                          className={`font-semibold text-lg ${
                            unlockedAt ? "text-white" : "text-gray-300"
                          }`}
                        >
                          {ach.name}
                        </div>
                        <div
                          className={`text-sm ${
                            unlockedAt ? "text-white/80" : "text-gray-400"
                          }`}
                        >
                          {ach.description}
                        </div>
                        {unlockedAt ? (
                          <div className="text-xs text-emerald-400 mt-1">
                            Unlocked:{" "}
                            {new Date(unlockedAt).toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="text-xs text-amber-200 mt-1">
                            Hint: {ach.hint}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
