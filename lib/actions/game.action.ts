"use server";

import { gameModes } from "@/constants";
import { db } from "@/firebase/admin";
import { updateOnboardingStep } from "@/lib/actions/auth.action";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { DocumentData } from "firebase-admin/firestore";
import { z } from "zod";

// Define the game feedback schema using Zod
const gameFeedbackSchema = z.object({
  totalScore: z.number().min(0).max(100),
  categoryScores: z
    .array(
      z.object({
        name: z.string(),
        score: z.number().min(0).max(100),
        comment: z.string(),
      }),
    )
    .min(1),
  strengths: z.array(z.string()).min(1),
  areasForImprovement: z.array(z.string()).min(1),
  finalAssessment: z.string().min(10),
  recommendations: z.object({
    shortTerm: z.array(z.string()).min(1),
    longTerm: z.array(z.string()).min(1),
    resources: z
      .array(
        z.object({
          title: z.string().min(1),
          url: z.string().url(),
          description: z.string().min(10),
        }),
      )
      .min(1),
  }),
});

export async function createGameSession({
  userId,
  gameModeId,
  lives,
  timeLimit,
  xp = 0,
  characterStats = {
    charisma: 1,
    persuasion: 1,
    confidence: 1,
  },
  questProgress = {
    currentQuest: "The First Pitch",
    objectives: [
      { description: "Introduce yourself professionally", completed: false },
      { description: "Identify customer needs", completed: false },
      { description: "Present your solution", completed: false },
    ],
  },
}: {
  userId: string;
  gameModeId: string;
  lives: number;
  timeLimit: number;
  xp?: number;
  characterStats?: {
    charisma: number;
    persuasion: number;
    confidence: number;
  };
  questProgress?: {
    currentQuest: string;
    objectives: { description: string; completed: boolean }[];
  };
}) {
  try {
    const sessionRef = db.collection("gameSessions").doc();
    const session: GameSession = {
      id: sessionRef.id,
      userId,
      gameModeId,
      currentLevel: 1,
      score: 0,
      lives,
      streak: 0,
      timeRemaining: timeLimit,
      startedAt: new Date(),
      status: "active",
      xp,
      characterStats,
      questProgress,
    };

    await sessionRef.set(session);
    // Mark onboarding step complete
    try {
      await updateOnboardingStep(userId, "firstGame", true);
    } catch {}
    return { success: true, session };
  } catch (error) {
    console.error("Error creating game session:", error);
    return { success: false, error };
  }
}

export async function getGameFeedback(sessionId: string) {
  try {
    // Search in gameFeedback collection by sessionId
    const feedbackSnapshot = await db
      .collection("gameFeedback")
      .where("sessionId", "==", sessionId)
      .limit(1)
      .get();

    if (feedbackSnapshot.empty) {
      return { success: false, error: "Feedback not found" };
    }

    const data = feedbackSnapshot.docs[0].data();
    if (!data) {
      return { success: false, error: "No data found" };
    }

    const feedback: GameFeedback = {
      sessionId: data.sessionId,
      userId: data.userId,
      userName: data.userName,
      level: data.level,
      score: data.score,
      timeSpent: data.timeSpent,
      transcript: data.transcript,
      metrics: data.metrics,
      gameMode: data.gameMode,
      createdAt: data.createdAt,
    };

    return { success: true, feedback };
  } catch (error) {
    console.error("Error getting game feedback:", error);
    return { success: false, error: "Failed to get feedback" };
  }
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  level: number;
  gameModeId: string;
  gameModeName: string;
  timestamp: number;
  metrics: GameMetrics;
}

export async function updateLeaderboard(entry: LeaderboardEntry) {
  try {
    await db.collection("leaderboards").add({
      ...entry,
      timestamp: Date.now(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    return { success: false, error: "Failed to update leaderboard" };
  }
}

export async function getLeaderboard(gameModeId: string, limit: number = 10) {
  try {
    const snapshot = await db
      .collection("leaderboards")
      .where("gameModeId", "==", gameModeId)
      .orderBy("score", "desc")
      .limit(limit)
      .get();

    const leaderboard = snapshot.docs.map((doc: DocumentData) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, leaderboard };
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return { success: false, error: "Failed to fetch leaderboard" };
  }
}

export async function createGameFeedback(
  data: Omit<GameFeedback, "createdAt">,
) {
  try {
    // Use sessionId as the document ID
    await db
      .collection("gameFeedback")
      .doc(data.sessionId)
      .set({
        ...data,
        createdAt: new Date().toISOString(),
      });

    await updateLeaderboard({
      userId: data.userId,
      userName: data.userName || "Anonymous",
      score: data.score,
      level: data.level,
      gameModeId: data.gameMode.id,
      gameModeName: data.gameMode.name,
      timestamp: Date.now(),
      metrics: data.metrics,
    });

    return { success: true, feedbackId: data.sessionId };
  } catch (error) {
    console.error("Error creating game feedback:", error);
    return { success: false, error: "Failed to create game feedback" };
  }
}

export async function updateGameSession(
  sessionId: string,
  updates: Partial<GameSession>,
) {
  try {
    const sessionRef = db.collection("gameSessions").doc(sessionId);
    await sessionRef.update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating game session:", error);
    return { success: false, error };
  }
}

export async function completeGameSession(
  sessionId: string,
  finalScore: number,
  completedLevels: number,
) {
  try {
    const sessionRef = db.collection("gameSessions").doc(sessionId);
    await sessionRef.update({
      status: "completed",
      finalScore,
      completedLevels,
      completedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error completing game session:", error);
    return { success: false, error };
  }
}

export async function generateGameFeedback(params: {
  sessionId: string;
  userId: string;
  userName: string;
  transcript: Array<{ role: "system" | "assistant" | "user"; content: string }>;
  metrics: GameMetrics;
  gameMode: {
    id: string;
    name: string;
    type: string;
    difficulty: string;
  };
  level: number;
}) {
  const { sessionId, userId, userName, transcript, metrics, gameMode, level } =
    params;

  try {
    const formattedTranscript = transcript
      .map((sentence) => `- ${sentence.role}: ${sentence.content}\n`)
      .join("");

    // Calculate performance metrics
    const totalSpeakingTime = metrics.userSpeakingTime + metrics.aiSpeakingTime;
    const userSpeakingPercentage =
      totalSpeakingTime > 0
        ? Math.round((metrics.userSpeakingTime / totalSpeakingTime) * 100)
        : 0;
    const aiSpeakingPercentage =
      totalSpeakingTime > 0
        ? Math.round((metrics.aiSpeakingTime / totalSpeakingTime) * 100)
        : 0;

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      output: "no-schema",
      prompt: `
You are a professional game performance evaluator reviewing a sales practice session. Your task is to give structured, honest feedback based on the conversation and performance metrics. Be constructive and balanced in your assessment — recognize both strengths and areas for improvement.

Game Context:
Mode: ${gameMode.name}
Type: ${gameMode.type}
Difficulty: ${gameMode.difficulty}
Level: ${level}

Here is the full transcript:
${formattedTranscript}

Performance Metrics:
- Total Duration: ${metrics.totalDuration} seconds
- User Speaking Time: ${metrics.userSpeakingTime} seconds (${userSpeakingPercentage}%)
- AI Speaking Time: ${metrics.aiSpeakingTime} seconds (${aiSpeakingPercentage}%)
- Silence Time: ${metrics.silenceTime} seconds
- Interruptions: ${metrics.interruptions}
- Streak Count: ${metrics.streakCount}
- Correct Responses: ${metrics.correctResponses}
- Incorrect Responses: ${metrics.incorrectResponses}
- Level Completion Time: ${metrics.levelCompletionTime} seconds
- Total Games: ${metrics.totalGames}

Please provide detailed feedback in the following areas:

1. Category Scores (0-100):
- Communication Skills (clarity, confidence, engagement)
- Sales Technique (pitch delivery, objection handling, closing)
- Game Performance (response time, accuracy, consistency)
- Learning Progress (improvement, adaptation, skill development)

2. Strengths (MUST provide at least one strength, even if minor)
3. Areas for Improvement (MUST provide at least one area)
4. Final Assessment (2-3 sentences)
5. Recommendations:
   - Short-term improvements (list of specific actions)
   - Long-term development goals (list of strategic goals)
   - Learning resources (list of {title, url, description} objects)

Consider the following in your analysis:
- Speaking time distribution (aim for 40-60% user speaking time)
- Number of interruptions (fewer is better)
- Response times (should be natural and not rushed)
- Silence time (should be appropriate for the context)
- Overall conversation flow and structure
- Game-specific metrics (streak count, correct/incorrect responses)

IMPORTANT: You MUST provide at least one strength and one area for improvement, even if the performance was poor or excellent. For strengths, focus on any positive aspects like:
- Good greeting or introduction
- Clear voice or pronunciation
- Basic product knowledge
- Attempts at objection handling
- Professional demeanor
- Any other positive aspects, no matter how minor

Return the response in this exact format:
{
  "totalScore": number,
  "categoryScores": [
    {
      "name": string,
      "score": number,
      "comment": string
    }
  ],
  "strengths": string[],
  "areasForImprovement": string[],
  "finalAssessment": string,
  "recommendations": {
    "shortTerm": string[],
    "longTerm": string[],
    "resources": [
      {
        "title": string,
        "url": string,
        "description": string
      }
    ]
  }
}`,
      system:
        "You are a game performance evaluator providing detailed feedback on a sales practice session. Focus on actionable insights and specific examples from the conversation. Be encouraging and constructive in your feedback. Always start with a higher baseline score and look for positive aspects to reward.",
    });

    // Parse and validate the AI response
    let parsedObject;
    try {
      parsedObject = typeof object === "string" ? JSON.parse(object) : object;
    } catch (error) {
      console.error("Error parsing AI response:", error);
      throw new Error("Failed to parse AI response");
    }

    // Validate the parsed object against the schema
    const validationResult = gameFeedbackSchema.safeParse(parsedObject);
    if (!validationResult.success) {
      console.error("Invalid feedback structure:", validationResult.error);
      throw new Error("Invalid feedback structure");
    }

    // Ensure all scores are within valid range
    const validatedObject = validationResult.data;
    if (validatedObject.totalScore < 0 || validatedObject.totalScore > 100) {
      throw new Error("Total score must be between 0 and 100");
    }

    validatedObject.categoryScores.forEach((category) => {
      if (category.score < 0 || category.score > 100) {
        throw new Error(
          `Category score for ${category.name} must be between 0 and 100`,
        );
      }
    });

    // Create the feedback document
    const feedbackData: Omit<GameFeedback, "createdAt"> = {
      sessionId,
      userId,
      userName,
      level,
      score: validatedObject.totalScore,
      timeSpent: metrics.totalDuration,
      transcript,
      metrics,
      gameMode,
    };

    // Store the AI-generated feedback in a separate collection
    const aiFeedbackData = {
      sessionId,
      userId,
      userName,
      level,
      totalScore: validatedObject.totalScore,
      categoryScores: validatedObject.categoryScores,
      strengths: validatedObject.strengths,
      areasForImprovement: validatedObject.areasForImprovement,
      finalAssessment: validatedObject.finalAssessment,
      recommendations: validatedObject.recommendations,
      createdAt: new Date().toISOString(),
    };

    // Save both the game feedback and AI feedback
    await Promise.all([
      db
        .collection("gameFeedback")
        .doc(sessionId)
        .set({
          ...feedbackData,
          createdAt: new Date().toISOString(),
        }),
      db.collection("gameAIFeedback").doc(sessionId).set(aiFeedbackData),
    ]);

    return {
      success: true,
      feedback: {
        ...feedbackData,
        createdAt: new Date().toISOString(),
      },
      aiFeedback: aiFeedbackData,
    };
  } catch (error) {
    console.error("Error generating game feedback:", error);
    return { success: false, error: "Failed to generate feedback" };
  }
}

export async function initializeGameModes() {
  try {
    const batch = db.batch();
    const gameModesRef = db.collection("gameModes");

    // Check if game modes already exist
    const snapshot = await gameModesRef.limit(1).get();
    if (!snapshot.empty) {
      return { success: true, message: "Game modes already initialized" };
    }

    // Add each game mode to the batch
    gameModes.forEach((mode) => {
      const docRef = gameModesRef.doc(mode.id);
      batch.set(docRef, mode);
    });

    // Commit the batch
    await batch.commit();
    return { success: true, message: "Game modes initialized successfully" };
  } catch (error) {
    console.error("Error initializing game modes:", error);
    return { success: false, error: "Failed to initialize game modes" };
  }
}

export async function getGameMode(modeId: string) {
  try {
    // First try to get from Firebase
    const doc = await db.collection("gameModes").doc(modeId).get();

    if (doc.exists) {
      return { success: true, gameMode: doc.data() };
    }

    // If not in Firebase, try to get from constants
    const modeFromConstants = gameModes.find((mode) => mode.id === modeId);
    if (modeFromConstants) {
      // Initialize the game mode in Firebase for future use
      await db.collection("gameModes").doc(modeId).set(modeFromConstants);
      return { success: true, gameMode: modeFromConstants };
    }

    return { success: false, error: "Game mode not found" };
  } catch (error) {
    console.error("Error fetching game mode:", error);
    return { success: false, error: "Failed to fetch game mode" };
  }
}

/**
 * Fetches all game feedback for a specific user, ordered by createdAt descending.
 */
export async function getAllGameFeedbackByUser(
  userId: string,
): Promise<GameFeedback[]> {
  try {
    const snapshot = await db
      .collection("gameFeedback")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc) => doc.data() as GameFeedback);
  } catch (error) {
    console.error("Error fetching all game feedback by user:", error);
    return [];
  }
}
