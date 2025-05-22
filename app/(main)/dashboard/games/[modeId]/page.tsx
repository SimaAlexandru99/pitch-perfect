import GameAgent from "@/app/(main)/dashboard/games/GameAgent";
import HeaderBar from "@/components/HeaderBar";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getUserGameStats } from "@/lib/actions/game-stats.action";
import { createGameSession, getGameMode } from "@/lib/actions/game.action";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Leaderboard from "../components/Leaderboard";

export const metadata: Metadata = {
  title: "Adventure Awaits - Sales Quest",
  description:
    "Embark on an epic journey to master the art of sales through interactive challenges",
  openGraph: {
    title: "Adventure Awaits - Sales Quest",
    description:
      "Embark on an epic journey to master the art of sales through interactive challenges",
    type: "website",
  },
};

type TimestampType =
  | FirebaseTimestamp
  | FirestoreTimestamp
  | string
  | null
  | undefined;

// Helper function to convert Firebase Timestamp to ISO string
function convertTimestamp(timestamp: TimestampType): string | undefined {
  if (!timestamp) return undefined;

  // If it's already a string, return it
  if (typeof timestamp === "string") {
    return timestamp;
  }

  // Handle Firebase Timestamp object
  if ("_seconds" in timestamp) {
    return new Date(timestamp._seconds * 1000).toISOString();
  }

  // Handle Firestore Timestamp
  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate().toISOString();
  }

  return undefined;
}

async function initializeGameSession(
  userId: string,
  gameModeId: string,
  gameMode: GameMode
) {
  const defaultLives = 3;
  const defaultTimeLimit = 0;

  const { session, success } = await createGameSession({
    userId,
    gameModeId,
    lives: gameMode.lives ?? defaultLives,
    timeLimit: gameMode.timeLimit ?? defaultTimeLimit,
  });

  if (!success || !session) {
    redirect("/dashboard/games?error=session_creation_failed");
  }

  return session;
}

export default async function GameSessionPage({
  params,
}: {
  params: { modeId: string };
}) {
  const { modeId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const { success, gameMode } = await getGameMode(modeId);

  if (!success || !gameMode) {
    redirect("/dashboard/games?error=game_mode_not_found");
  }

  const session = await initializeGameSession(
    user.id,
    modeId,
    gameMode as GameMode
  );
  const { stats: userStats } = await getUserGameStats(user.id);

  // Transform Firebase document data to match the expected type
  const initialStats: UserGameStats | undefined = userStats
    ? {
        xp: userStats.xp ?? 0,
        level: userStats.level ?? 1,
        charisma: userStats.charisma ?? 1,
        persuasion: userStats.persuasion ?? 1,
        confidence: userStats.confidence ?? 1,
        achievements: Array.isArray(userStats.achievements)
          ? userStats.achievements
          : [],
        totalGames: userStats.totalGames ?? 0,
        gamesWon: userStats.gamesWon ?? 0,
        highestStreak: userStats.highestStreak ?? 0,
        createdAt: convertTimestamp(userStats.createdAt),
        updatedAt: convertTimestamp(userStats.updatedAt),
      }
    : undefined;

  return (
    <main className="flex flex-col flex-1 w-full overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
      <HeaderBar
        title={gameMode.name}
        description={`Level ${session.currentLevel} • ${gameMode.description}`}
        navigation={{
          backHref: "/dashboard/games",
          backLabel: "Return to Quest Board",
        }}
        actions={{
          showBrowseJobs: false,
        }}
      />
      <div className="flex-1 p-4 sm:p-8 pt-16 sm:pt-16">
        <div className="mx-auto max-w-[1500px] h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <GameAgent
                userName={user.name || "Adventurer"}
                userId={user.id}
                gameMode={gameMode as GameMode}
                session={session}
                initialStats={initialStats}
              />
            </div>
            <div className="lg:col-span-1">
              <Leaderboard
                gameModeId={gameMode.id}
                gameModeName={gameMode.name}
                className="h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
