"use server";

import { db } from "@/firebase/admin";
import { updateOnboardingStep } from "@/lib/actions/auth.action";

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

// Helper function to ensure all data is serializable
function ensureSerializable<T>(data: T): T {
  if (!data) return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => ensureSerializable(item)) as T;
  }

  // Handle objects
  if (typeof data === "object") {
    const result = {} as Record<string, unknown>;
    for (const [key, value] of Object.entries(
      data as Record<string, unknown>,
    )) {
      // Convert timestamps
      if (key === "createdAt" || key === "updatedAt") {
        result[key] = convertTimestamp(value as TimestampType);
      } else {
        result[key] = ensureSerializable(value);
      }
    }
    return result as T;
  }

  return data;
}

// Cache for user stats to reduce Firebase reads
const statsCache = new Map<
  string,
  { stats: UserGameStats; timestamp: number }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getUserGameStats(userId: string) {
  try {
    // Check cache first
    const cached = statsCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return { success: true, stats: cached.stats };
    }

    const statsRef = db.collection("userGameStats").doc(userId);
    const statsDoc = await statsRef.get();

    if (!statsDoc.exists) {
      // Initialize default stats if none exist
      const defaultStats: UserGameStats = {
        xp: 0,
        level: 1,
        charisma: 1,
        persuasion: 1,
        confidence: 1,
        achievements: [],
        totalGames: 0,
        gamesWon: 0,
        highestStreak: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await statsRef.set(defaultStats);
      statsCache.set(userId, { stats: defaultStats, timestamp: Date.now() });
      return { success: true, stats: defaultStats };
    }

    const data = statsDoc.data();
    if (!data) {
      return { success: false, error: "No data found" };
    }

    // Ensure all data is serializable
    const serializedData = ensureSerializable(data);

    // Convert to UserGameStats type with defaults
    const stats: UserGameStats = {
      xp: serializedData.xp ?? 0,
      level: serializedData.level ?? 1,
      charisma: serializedData.charisma ?? 1,
      persuasion: serializedData.persuasion ?? 1,
      confidence: serializedData.confidence ?? 1,
      achievements: Array.isArray(serializedData.achievements)
        ? serializedData.achievements
        : [],
      totalGames: serializedData.totalGames ?? 0,
      gamesWon: serializedData.gamesWon ?? 0,
      highestStreak: serializedData.highestStreak ?? 0,
      createdAt: serializedData.createdAt,
      updatedAt: serializedData.updatedAt,
    };

    // Update cache
    statsCache.set(userId, { stats, timestamp: Date.now() });
    return { success: true, stats };
  } catch (error) {
    console.error("Error getting user game stats:", error);
    return { success: false, error: "Failed to get user stats" };
  }
}

// Batch updates to reduce Firebase writes
const updateQueue = new Map<string, Partial<UserGameStats>>();
let updateTimeout: NodeJS.Timeout | null = null;

function scheduleUpdate(userId: string, stats: Partial<UserGameStats>) {
  const currentStats = updateQueue.get(userId) || {};
  updateQueue.set(userId, { ...currentStats, ...stats });

  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }

  updateTimeout = setTimeout(async () => {
    const batch = db.batch();
    for (const [uid, stats] of updateQueue.entries()) {
      const statsRef = db.collection("userGameStats").doc(uid);
      batch.set(
        statsRef,
        {
          ...stats,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
    }
    await batch.commit();
    updateQueue.clear();
  }, 1000); // Batch updates every second
}

export async function updateUserGameStats(
  userId: string,
  stats: Partial<UserGameStats>,
) {
  try {
    scheduleUpdate(userId, stats);
    return { success: true };
  } catch (error) {
    console.error("Error updating user game stats:", error);
    return { success: false, error: "Failed to update user stats" };
  }
}

export async function addUserAchievement(userId: string, achievement: string) {
  try {
    const statsRef = db.collection("userGameStats").doc(userId);
    const statsDoc = await statsRef.get();

    if (!statsDoc.exists) {
      return { success: false, error: "User stats not found" };
    }

    const data = statsDoc.data();
    const achievements = Array.isArray(data?.achievements)
      ? data.achievements
      : [];

    if (!achievements.includes(achievement)) {
      scheduleUpdate(userId, {
        achievements: [...achievements, achievement],
      });
      // Mark onboarding step complete
      try {
        await updateOnboardingStep(userId, "firstAchievement", true);
      } catch {}
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding user achievement:", error);
    return { success: false, error: "Failed to add achievement" };
  }
}
