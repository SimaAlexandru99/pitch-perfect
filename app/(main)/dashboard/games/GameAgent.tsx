"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ALL_ACHIEVEMENTS } from "@/constants/achievements";
import { updateUserGameStats } from "@/lib/actions/game-stats.action";
import { createGameFeedback } from "@/lib/actions/game.action";
import { calculateScore, getGameConfig } from "@/lib/game-config";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import {
  Check,
  Crown,
  Flame,
  Heart,
  Medal,
  Mic,
  MicOff,
  Scroll,
  Shield,
  Sparkles,
  Star,
  Sword,
  Timer,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface GameMessage {
  role: "system" | "assistant" | "user";
  content: string;
}

const XP_REWARDS = {
  PERFECT_RESPONSE: 50,
  GOOD_RESPONSE: 25,
  OBJECTION_HANDLED: 30,
  CLOSING_ATTEMPT: 40,
  LEVEL_COMPLETE: 100,
  ACHIEVEMENT_UNLOCKED: 75,
  QUEST_COMPLETE: 150,
  STREAK_MILESTONE: 50,
} as const;

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

const DEFAULT_METRICS: GameMetrics = {
  totalDuration: 0,
  userSpeakingTime: 0,
  aiSpeakingTime: 0,
  silenceTime: 0,
  interruptions: 0,
  streakCount: 0,
  correctResponses: 0,
  incorrectResponses: 0,
  levelCompletionTime: 0,
  totalGames: 0,
};

const DEFAULT_LIVES = 3;
const DEFAULT_TIME_LIMIT = 0;

const DEFAULT_GAME_STATE: GameState = {
  timeRemaining: 0,
  streak: 0,
  lives: 3,
  currentLevel: 1,
  metrics: DEFAULT_METRICS,
  powerUps: {
    shield: false,
    doublePoints: false,
    timeFreeze: false,
  },
  achievements: [],
  xp: 0,
  level: 1,
  characterStats: {
    charisma: 1,
    persuasion: 1,
    confidence: 1,
  },
  questProgress: {
    currentQuest: "The First Pitch",
    objectives: [
      { description: "Introduce yourself professionally", completed: false },
      { description: "Identify customer needs", completed: false },
      { description: "Present your solution", completed: false },
    ],
  },
};

// Helper to check if achievement is unlocked
function hasAchievement(
  achievements: { id: string; unlockedAt: string }[],
  id: string
) {
  return achievements.some((a) => a.id === id);
}

// Helper to unlock achievement
function unlockAchievement(
  achievements: { id: string; unlockedAt: string }[],
  id: string
) {
  if (hasAchievement(achievements, id)) return achievements;
  toast.success(
    `Achievement Unlocked: ${
      ALL_ACHIEVEMENTS.find((a) => a.id === id)?.name || id
    }`
  );
  return [...achievements, { id, unlockedAt: new Date().toISOString() }];
}

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function GameAgent({
  userName,
  userId,
  gameMode,
  session,
  initialStats,
  userAvatar,
}: GameAgentProps) {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<GameMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [partialTranscript, setPartialTranscript] = useState<string | null>(
    null
  );
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    ...DEFAULT_GAME_STATE,
    timeRemaining: gameMode.timeLimit ?? DEFAULT_TIME_LIMIT,
    lives: gameMode.lives ?? DEFAULT_LIVES,
    xp: initialStats?.xp ?? 0,
    level: initialStats?.level ?? 1,
    characterStats: {
      charisma: initialStats?.charisma ?? 1,
      persuasion: initialStats?.persuasion ?? 1,
      confidence: initialStats?.confidence ?? 1,
    },
    achievements: Array.isArray(initialStats?.achievements)
      ? initialStats.achievements.map((a) =>
          typeof a === "string"
            ? { id: a, unlockedAt: new Date().toISOString() }
            : a
        )
      : [],
  });

  const [callStartTime, setCallStartTime] = useState<number>(0);
  const [lastSpeakingStart, setLastSpeakingStart] = useState<number>(0);

  const handleMuteToggle = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    vapi.setMuted(newMutedState);
  }, [isMuted]);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      setCallStartTime(Date.now());
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
      setIsSpeaking(false);

      // Calculate final metrics
      const totalDuration = (Date.now() - callStartTime) / 1000;
      setGameState((prev) => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          totalDuration,
          silenceTime:
            totalDuration -
            prev.metrics.userSpeakingTime -
            prev.metrics.aiSpeakingTime,
        },
      }));
    };

    const onMessage = (message: Message) => {
      if (message.type !== "transcript") return;
      if (message.transcriptType === "partial") {
        setPartialTranscript(message.transcript);
      }
      if (message.transcriptType === "final") {
        const newMessage: GameMessage = {
          role: message.role as "system" | "assistant" | "user",
          content: message.transcript,
        };
        setMessages((prev) => [...prev, newMessage]);
        setPartialTranscript(null);
      }
    };

    const onSpeechStart = () => {
      setIsSpeaking(true);
      setLastSpeakingStart(Date.now());
    };

    const onSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const onError = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const handleVolume = (volume: number) => setVolumeLevel(volume);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);
    vapi.on("volume-level", handleVolume);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
      vapi.off("volume-level", handleVolume);
    };
  }, [callStartTime, lastSpeakingStart]);

  const handleGameEnd = useCallback(async () => {
    try {
      setIsGeneratingFeedback(true);
      const gameFeedback = await createGameFeedback({
        sessionId: session.id,
        userId,
        level: gameState.level,
        score: calculateScore(
          gameMode,
          gameState.currentLevel,
          {
            correctResponses: gameState.metrics.correctResponses,
            streakCount: gameState.metrics.streakCount,
          },
          gameState.streak,
          gameState.timeRemaining
        ),
        timeSpent: gameState.metrics.totalDuration,
        transcript: messages,
        metrics: {
          totalDuration: gameState.metrics.totalDuration,
          userSpeakingTime: gameState.metrics.userSpeakingTime,
          aiSpeakingTime: gameState.metrics.aiSpeakingTime,
          silenceTime: gameState.metrics.silenceTime,
          interruptions: gameState.metrics.interruptions,
          streakCount: gameState.metrics.streakCount,
          correctResponses: gameState.metrics.correctResponses,
          incorrectResponses: gameState.metrics.incorrectResponses,
          levelCompletionTime: gameState.metrics.levelCompletionTime,
          totalGames: gameState.metrics.totalGames,
        },
        gameMode: {
          id: gameMode.id,
          name: gameMode.name,
          type: gameMode.type,
          difficulty: gameMode.difficulty,
        },
        userName: userName,
      });

      if (gameFeedback.success) {
        // Wait for a short delay to ensure feedback is fully created
        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.push(`/dashboard/games/feedback/${session.id}`);
      } else {
        console.error("Failed to create game feedback:", gameFeedback.error);
        toast.error("Failed to generate feedback. Please try again.");
        setIsGeneratingFeedback(false);
      }
    } catch (error) {
      console.error("Error creating game feedback:", error);
      toast.error("An error occurred while generating feedback.");
      setIsGeneratingFeedback(false);
    }
  }, [
    session.id,
    userId,
    gameState.level,
    gameState.currentLevel,
    gameState.metrics,
    gameState.streak,
    gameState.timeRemaining,
    gameMode,
    messages,
    userName,
    router,
  ]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      setLastMessage(lastMessage.content);

      setGameState((prev) => {
        let newXP = prev.xp;
        let newLevel = prev.level;
        let newAchievements = [...prev.achievements];
        let newCharacterStats = { ...prev.characterStats };

        // Award XP for different actions
        if (lastMessage.role === "user") {
          // Check for perfect response (based on AI feedback)
          if (lastMessage.content.includes("Excellent response")) {
            newXP += XP_REWARDS.PERFECT_RESPONSE;
            newAchievements = unlockAchievement(
              newAchievements,
              "perfect_pitch"
            );
          }
          // Check for objection handling
          else if (lastMessage.content.includes("Objection handled")) {
            newXP += XP_REWARDS.OBJECTION_HANDLED;
            newCharacterStats.persuasion += 0.1;
          }
          // Check for closing attempt
          else if (lastMessage.content.includes("Closing attempt")) {
            newXP += XP_REWARDS.CLOSING_ATTEMPT;
            newCharacterStats.confidence += 0.1;
          }
          // Regular good response
          else {
            newXP += XP_REWARDS.GOOD_RESPONSE;
          }
        }

        // Check for level up (multi-level-up loop)
        while (
          newLevel < XP_THRESHOLDS.length - 1 &&
          newXP >= XP_THRESHOLDS[newLevel]
        ) {
          newLevel += 1;
          toast.success(`Level Up! You are now level ${newLevel}`);
          newXP += XP_REWARDS.LEVEL_COMPLETE;
          newCharacterStats = {
            charisma: Number((newCharacterStats.charisma + 0.2).toFixed(1)),
            persuasion: Number((newCharacterStats.persuasion + 0.2).toFixed(1)),
            confidence: Number((newCharacterStats.confidence + 0.2).toFixed(1)),
          };
          // Unlock level 5 achievement
          if (newLevel === 5) {
            newAchievements = unlockAchievement(newAchievements, "level_5");
          }
        }

        // Check for streak milestones
        if (prev.streak > 0 && prev.streak % 5 === 0) {
          newXP += XP_REWARDS.STREAK_MILESTONE;
          toast.success(`Streak Milestone! +${XP_REWARDS.STREAK_MILESTONE} XP`);
          // Unlock streak achievement
          if (prev.streak === 5) {
            newAchievements = unlockAchievement(newAchievements, "streak_5");
          }
        }

        // Example: unlock first win achievement
        if (
          prev.metrics.totalGames === 0 &&
          prev.metrics.correctResponses > 0 &&
          !hasAchievement(newAchievements, "first_win")
        ) {
          newAchievements = unlockAchievement(newAchievements, "first_win");
        }

        // Freeze XP at the cap only if it would otherwise exceed the cap
        if (
          newLevel === XP_THRESHOLDS.length - 1 &&
          newXP > XP_THRESHOLDS[newLevel]
        ) {
          newXP = XP_THRESHOLDS[newLevel];
        }

        return {
          ...prev,
          xp: newXP,
          level: newLevel,
          achievements: newAchievements,
          characterStats: newCharacterStats,
        };
      });
    }
  }, [messages]);

  // Separate effect for Firebase updates
  useEffect(() => {
    const syncWithFirebase = async () => {
      if (gameState.xp > 0) {
        try {
          await updateUserGameStats(userId, {
            xp: gameState.xp,
            level: gameState.level,
            charisma: gameState.characterStats.charisma,
            persuasion: gameState.characterStats.persuasion,
            confidence: gameState.characterStats.confidence,
            achievements: gameState.achievements,
            totalGames: gameState.metrics.totalGames,
            gamesWon: gameState.metrics.correctResponses,
            highestStreak: Math.max(
              gameState.streak,
              gameState.metrics.streakCount
            ),
          });
        } catch (error) {
          console.error("Error updating user stats:", error);
        }
      }
    };

    syncWithFirebase();
  }, [
    gameState.xp,
    gameState.level,
    gameState.characterStats,
    gameState.achievements,
    gameState.metrics,
    gameState.streak,
    userId,
  ]);

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      handleGameEnd();
    }
  }, [callStatus, handleGameEnd]);

  useEffect(() => {
    if (callStatus === CallStatus.ACTIVE && gameMode.type === "timeAttack") {
      const timer = setInterval(() => {
        setGameState((prev) => {
          if (prev.timeRemaining <= 0) {
            clearInterval(timer);
            setTimeout(() => {
              handleGameEnd();
            }, 0);
            return { ...prev, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [callStatus, gameMode.type, handleGameEnd]);

  const handleCall = useCallback(async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);
      const config = getGameConfig(gameMode, gameState.currentLevel, userName);
      await vapi.start(config);
    } catch (error) {
      console.error("Error starting call:", error);
      toast.error("Failed to start game session");
      setCallStatus(CallStatus.INACTIVE);
    }
  }, [gameMode, gameState.currentLevel, userName]);

  const handleDisconnect = useCallback(() => {
    try {
      setCallStatus(CallStatus.FINISHED);
      vapi.stop();
    } catch (error) {
      console.error("Error stopping call:", error);
      setCallStatus(CallStatus.INACTIVE);
    }
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-full w-full gap-y-4 relative">
      {/* Motivational AlertDialog for Feedback Generation */}
      <Dialog open={isGeneratingFeedback}>
        <DialogContent className="max-w-md bg-gradient-to-br from-violet-900/90 via-indigo-900/90 to-slate-900/90 border-2 border-amber-400/30 shadow-xl flex flex-col items-center">
          <div className="flex flex-col items-center gap-3 py-2">
            <Sparkles className="size-10 text-amber-400 animate-bounce" />
            <h2 className="text-2xl font-bold text-white text-center">
              Great work!
            </h2>
            <p className="text-white/80 text-center text-base max-w-xs">
              We&apos;re generating your personalized feedback. This may take a
              few moments.
            </p>
            <button
              disabled
              className="mt-4 flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-violet-500 text-white font-semibold text-lg opacity-80 cursor-not-allowed shadow-lg"
            >
              <span>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              </span>
              Generating Feedback…
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Timer for Time Attack Mode */}
      {gameMode.type === "timeAttack" && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-900/80 via-violet-900/80 to-indigo-900/80 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg border-2 border-indigo-500/30 shadow-lg">
            <Timer className="size-5 sm:size-6 text-indigo-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm text-indigo-300/80">
                Time Remaining
              </span>
              <span className="text-xl sm:text-2xl font-bold text-indigo-200">
                {gameState.timeRemaining}s
              </span>
            </div>
            {gameState.timeRemaining <= 10 && (
              <div className="absolute inset-0 bg-red-500/20 animate-pulse rounded-lg" />
            )}
          </div>
        </div>
      )}

      {/* Game Status Card with Fantasy Theme */}
      <Card className="w-full max-w-2xl p-4 sm:p-6 bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-800/80 border-2 border-primary/30 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Crown className="size-6 sm:size-7 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {gameMode.name}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {gameMode.type === "streak" && (
              <div className="flex items-center gap-2 bg-violet-900/50 px-3 sm:px-4 py-2 rounded-lg border border-violet-500/30">
                <Flame className="size-5 sm:size-6 text-violet-400" />
                <span className="text-lg sm:text-xl font-bold text-violet-200">
                  Streak: {gameState.streak}
                </span>
              </div>
            )}
            {gameMode.lives && (
              <div className="flex items-center gap-2 bg-cyan-900/50 px-3 sm:px-4 py-2 rounded-lg border border-cyan-500/30">
                <div className="flex gap-1">
                  {Array.from({ length: gameMode.lives }).map((_, index) => (
                    <Heart
                      key={index}
                      className={cn(
                        "size-5 sm:size-6 transition-colors duration-300",
                        index < gameState.lives
                          ? "text-red-400 fill-red-400"
                          : "text-gray-600 fill-gray-600"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Indicators with Fantasy Theme */}
        <div className="space-y-3 sm:space-y-4">
          {gameMode.type === "rpg" && (
            <>
              {/* Level Progress */}
              <div className="flex items-center gap-2 sm:gap-3 bg-violet-900/50 p-2 sm:p-3 rounded-lg border border-violet-500/30">
                <Sword className="size-5 sm:size-6 text-violet-400" />
                <span className="text-base sm:text-lg font-bold text-violet-200">
                  Level {gameState.currentLevel}
                </span>
                <Progress
                  value={
                    (gameState.currentLevel / (gameMode.maxLevel || 3)) * 100
                  }
                  className="h-2 sm:h-3 bg-violet-900/50"
                />
              </div>

              {/* XP Bar */}
              <div className="flex items-center gap-2 sm:gap-3 bg-amber-900/50 p-2 sm:p-3 rounded-lg border border-amber-500/30">
                <Star className="size-5 sm:size-6 text-amber-400" />
                <span className="text-base sm:text-lg font-bold text-amber-200">
                  XP: {gameState.xp}
                </span>
                <Progress
                  value={
                    ((gameState.xp - XP_THRESHOLDS[gameState.level - 1]) /
                      (XP_THRESHOLDS[gameState.level] -
                        XP_THRESHOLDS[gameState.level - 1])) *
                    100
                  }
                  className="h-2 sm:h-3 bg-amber-900/50"
                />
              </div>

              {/* Character Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <div className="flex items-center gap-2 bg-indigo-900/50 p-2 sm:p-3 rounded-lg border border-indigo-500/30">
                  <Sparkles className="size-4 sm:size-5 text-indigo-400" />
                  <span className="text-base sm:text-lg font-bold text-indigo-200">
                    Charisma: {gameState.characterStats.charisma}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-violet-900/50 p-2 sm:p-3 rounded-lg border border-violet-500/30">
                  <Crown className="size-4 sm:size-5 text-violet-400" />
                  <span className="text-base sm:text-lg font-bold text-violet-200">
                    Persuasion: {gameState.characterStats.persuasion}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-cyan-900/50 p-2 sm:p-3 rounded-lg border border-cyan-500/30">
                  <Shield className="size-4 sm:size-5 text-cyan-400" />
                  <span className="text-base sm:text-lg font-bold text-cyan-200">
                    Confidence: {gameState.characterStats.confidence}
                  </span>
                </div>
              </div>

              {/* Quest Progress */}
              <div className="bg-slate-800/50 p-3 sm:p-4 rounded-lg border border-slate-600/30">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <Scroll className="size-5 sm:size-6 text-amber-400" />
                  <h3 className="text-base sm:text-lg font-bold text-amber-200">
                    {gameState.questProgress.currentQuest}
                  </h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {gameState.questProgress.objectives.map(
                    (objective, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
                      >
                        <div
                          className={cn(
                            "size-4 sm:size-5 rounded-full border-2 transition-colors duration-300",
                            objective.completed
                              ? "border-emerald-400 bg-emerald-400"
                              : "border-gray-600"
                          )}
                        >
                          {objective.completed && (
                            <Check className="size-3 sm:size-4 text-slate-900" />
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-white/90 font-medium",
                            objective.completed && "line-through text-white/50"
                          )}
                        >
                          {objective.description}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </>
          )}
          {gameMode.type === "voiceOlympics" && (
            <div className="flex items-center gap-2 sm:gap-3 bg-indigo-900/50 p-2 sm:p-3 rounded-lg border border-indigo-500/30">
              <Medal className="size-5 sm:size-6 text-indigo-400" />
              <span className="text-base sm:text-lg font-bold text-indigo-200">
                Score:{" "}
                {calculateScore(
                  gameMode,
                  gameState.currentLevel,
                  {
                    correctResponses: gameState.metrics.correctResponses,
                    streakCount: gameState.metrics.streakCount,
                  },
                  gameState.streak,
                  gameState.timeRemaining
                )}
              </span>
              <Progress
                value={
                  (calculateScore(
                    gameMode,
                    gameState.currentLevel,
                    {
                      correctResponses: gameState.metrics.correctResponses,
                      streakCount: gameState.metrics.streakCount,
                    },
                    gameState.streak,
                    gameState.timeRemaining
                  ) /
                    1000) *
                  100
                }
                className="h-2 sm:h-3 bg-indigo-900/50"
              />
            </div>
          )}
        </div>

        {/* Power-ups Display */}
        <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4">
          {gameState.powerUps.shield && (
            <Tooltip>
              <TooltipTrigger>
                <div className="p-2 sm:p-3 bg-indigo-900/50 rounded-lg border border-indigo-500/30">
                  <Shield className="size-5 sm:size-6 text-indigo-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-indigo-900/90 text-indigo-100">
                Shield Active - Extra Life
              </TooltipContent>
            </Tooltip>
          )}
          {gameState.powerUps.doublePoints && (
            <Tooltip>
              <TooltipTrigger>
                <div className="p-2 sm:p-3 bg-violet-900/50 rounded-lg border border-violet-500/30">
                  <Star className="size-5 sm:size-6 text-violet-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-violet-900/90 text-violet-100">
                Double Points Active
              </TooltipContent>
            </Tooltip>
          )}
          {gameState.powerUps.timeFreeze && (
            <Tooltip>
              <TooltipTrigger>
                <div className="p-2 sm:p-3 bg-cyan-900/50 rounded-lg border border-cyan-500/30">
                  <Sparkles className="size-5 sm:size-6 text-cyan-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-cyan-900/90 text-cyan-100">
                Time Freeze Active
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </Card>

      {/* Profile Cards with Fantasy Theme */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full justify-center items-center">
        {/* AI Character Card */}
        <div className="h-[350px] sm:h-[450px] w-full max-w-[700px] mx-auto flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-800/80 rounded-xl border-2 border-primary/30 shadow-lg transition-all duration-300 hover:border-primary/50">
          <div className="relative">
            <div className="relative flex items-center justify-center bg-gradient-to-br from-violet-500/30 to-indigo-500/30 rounded-full size-28 sm:size-36 transition-transform duration-300 hover:scale-105 border-2 border-violet-500/30">
              <Image
                src="/ai-avatar.png"
                alt="AI Character"
                width={90}
                height={75}
                className="object-cover"
                priority
              />
              {isSpeaking && (
                <span className="absolute inset-0 animate-ping rounded-full bg-violet-500/75" />
              )}
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="size-6 sm:size-7 text-amber-400 animate-pulse" />
            </div>
          </div>
          <h3 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-bold text-white">
            AI Character
          </h3>
          <p className="text-white/90 text-base sm:text-lg mt-2">
            Level {gameState.currentLevel} Guide
          </p>
        </div>

        {/* User Profile Card */}
        <div className="h-[350px] sm:h-[450px] w-full max-w-[700px] mx-auto flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-800/80 rounded-xl border-2 border-primary/30 shadow-lg transition-all duration-300 hover:border-primary/50">
          <div className="relative">
            <div className="size-28 sm:size-36 rounded-full overflow-hidden transition-transform duration-300 hover:scale-105 border-2 border-primary/30 flex items-center justify-center">
              <Avatar className="w-full h-full">
                <AvatarImage
                  src={
                    typeof userAvatar !== "undefined" ? userAvatar : undefined
                  }
                  alt={userName || "Avatar"}
                />
                <AvatarFallback>{getInitials(userName)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute -top-2 -right-2">
              <Crown className="size-6 sm:size-7 text-amber-400" />
            </div>
          </div>
          <h3 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-bold text-white">
            {userName}
          </h3>
          <p className="text-white/90 text-base sm:text-lg mt-2">Adventurer</p>
        </div>
      </div>

      {/* Message Display with Fantasy Theme */}
      {(lastMessage || partialTranscript) && (
        <div className="flex-none relative rounded-xl border-2 border-primary/30 bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-800/80 shadow-lg overflow-hidden transition-all duration-300 hover:border-primary/50 max-w-xl w-full mx-auto mt-4 sm:mt-6">
          <div className="p-4 sm:p-6 max-h-[150px] sm:max-h-[200px] overflow-y-auto">
            {lastMessage && (
              <p
                key={lastMessage}
                className={cn(
                  "text-base sm:text-lg leading-relaxed transition-opacity duration-500 text-white font-medium",
                  "animate-fadeIn"
                )}
              >
                {lastMessage}
              </p>
            )}
            {partialTranscript && (
              <p className="text-white/75 italic animate-pulse mt-2 text-sm sm:text-base">
                {partialTranscript}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Call Controls with Fantasy Theme */}
      <TooltipProvider>
        <div className="w-full flex justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
          {callStatus !== CallStatus.ACTIVE ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="relative btn-call focus:outline-none focus:ring-2 focus:ring-primary-300 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-base sm:text-lg font-bold px-6 sm:px-8 py-2 sm:py-3 rounded-lg shadow-lg"
                  onClick={handleCall}
                >
                  <span
                    className={cn(
                      "absolute animate-ping rounded-full opacity-75",
                      callStatus !== CallStatus.CONNECTING && "hidden"
                    )}
                  />
                  <span className="relative">
                    {callStatus === CallStatus.INACTIVE ||
                    callStatus === CallStatus.FINISHED
                      ? "Start Adventure"
                      : ". . ."}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-violet-900/90 text-violet-100"
              >
                Start Adventure
              </TooltipContent>
            </Tooltip>
          ) : (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "rounded-full w-12 h-12 sm:w-16 sm:h-16 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-300",
                      "border-2 shadow-lg backdrop-blur-sm",
                      isMuted
                        ? "bg-red-900/50 hover:bg-red-900/70 border-red-500/50 hover:border-red-500/70"
                        : "bg-violet-900/50 hover:bg-violet-900/70 border-violet-500/50 hover:border-violet-500/70"
                    )}
                    onClick={handleMuteToggle}
                  >
                    <div className="relative">
                      {isMuted ? (
                        <>
                          <MicOff className="h-6 w-6 sm:h-7 sm:w-7 text-red-400" />
                          <span className="absolute -top-1 -right-1">
                            <div className="size-2 sm:size-3 rounded-full bg-red-400 animate-pulse" />
                          </span>
                        </>
                      ) : (
                        <>
                          <Mic className="h-6 w-6 sm:h-7 sm:w-7 text-violet-400" />
                          <span className="absolute -top-1 -right-1">
                            <div className="size-2 sm:size-3 rounded-full bg-violet-400 animate-pulse" />
                          </span>
                        </>
                      )}
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className={cn(
                    "px-3 sm:px-4 py-2 text-sm sm:text-base font-bold",
                    isMuted
                      ? "bg-red-900/90 text-red-100"
                      : "bg-violet-900/90 text-violet-100"
                  )}
                >
                  {isMuted ? "Unmute Microphone" : "Mute Microphone"}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="btn-disconnect focus:outline-none focus:ring-2 focus:ring-destructive-300 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-base sm:text-lg font-bold px-6 sm:px-8 py-2 sm:py-3 rounded-lg shadow-lg"
                    onClick={handleDisconnect}
                  >
                    End Quest
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-red-900/90 text-red-100"
                >
                  End Quest
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </TooltipProvider>

      {/* Volume Meter with Fantasy Theme */}
      <div className="w-full flex justify-center mt-3 sm:mt-4">
        <div className="h-2 sm:h-3 w-36 sm:w-48 bg-slate-700/50 rounded-full overflow-hidden border border-slate-600/30">
          <div
            className={cn(
              "h-2 sm:h-3 bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-200",
              volumeLevel === 0
                ? "w-0"
                : volumeLevel < 0.1
                  ? "w-1/12"
                  : volumeLevel < 0.2
                    ? "w-1/6"
                    : volumeLevel < 0.3
                      ? "w-1/4"
                      : volumeLevel < 0.4
                        ? "w-1/3"
                        : volumeLevel < 0.5
                          ? "w-2/5"
                          : volumeLevel < 0.6
                            ? "w-1/2"
                            : volumeLevel < 0.7
                              ? "w-3/5"
                              : volumeLevel < 0.8
                                ? "w-2/3"
                                : volumeLevel < 0.9
                                  ? "w-3/4"
                                  : volumeLevel < 1
                                    ? "w-11/12"
                                    : "w-full"
            )}
          />
        </div>
      </div>

      {/* XP Display */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 w-56 sm:w-72">
        <Card className="p-3 sm:p-4 bg-slate-800/80 backdrop-blur-sm border-2 border-primary/30 shadow-lg">
          <XPDisplay xp={gameState.xp} level={gameState.level} />
        </Card>
      </div>
    </div>
  );
}

function XPDisplay({ xp, level }: { xp: number; level: number }) {
  const nextLevelXP = XP_THRESHOLDS[level] || Infinity;
  const currentLevelXP = XP_THRESHOLDS[level - 1] || 0;
  const progress =
    ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-white/90">Level {level}</span>
          <span className="text-white/75">
            {xp} / {nextLevelXP} XP
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}
