import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

export function getGameConfig(
  gameMode: GameMode,
  currentLevel: number,
  userName: string,
): CreateAssistantDTO {
  return {
    name: "Sales Game AI",
    firstMessage: getFirstMessage(gameMode, currentLevel),
    transcriber: {
      provider: "deepgram" as const,
      model: "nova-2",
      language: "en-US" as const,
    },
    voice: {
      provider: "11labs" as const,
      voiceId: "sarah",
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 0.9,
      style: 0.5,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai" as const,
      model: "gpt-4" as const,
      messages: [
        {
          role: "system" as const,
          content: getSystemPrompt(gameMode, currentLevel, userName),
        },
      ],
    },
  };
}

export function getFirstMessage(
  gameMode: GameMode,
  currentLevel: number,
): string {
  switch (gameMode.type) {
    case "rpg":
      return `Welcome to Level ${currentLevel} of Sales Quest! I'll be your ${getRoleForLevel(
        currentLevel,
      )}. Let's begin!`;
    case "streak":
      return "Welcome to Streak Mode! Let's see how long you can maintain a perfect response streak!";
    case "timeAttack":
      return "Time Attack Mode: You have 60 seconds to make your pitch. Go!";
    case "mystery":
      return "Welcome to Mystery Persona Match! Try to figure out what kind of customer I am.";
    case "voiceOlympics":
      return "Welcome to Voice Olympics! Let's test your vocal skills.";
    default:
      return "Welcome to the sales practice game!";
  }
}

export function getSystemPrompt(
  gameMode: GameMode,
  currentLevel: number,
  userName: string,
): string {
  const basePrompt = `You are a sales training AI playing the role of a customer in a game mode: ${
    gameMode.type
  }.
  Your goal is to help the user improve their sales skills through this interactive game.

  Game Mode: ${gameMode.type}
  Current Level: ${currentLevel}
  User Name: ${userName}

  Guidelines:
  1. Stay in character based on the game mode
  2. Provide appropriate challenges based on the level
  3. Give clear feedback on performance
  4. Maintain game mechanics (time limits, streak counting, etc.)

  ${getModeSpecificPrompt(gameMode, currentLevel)}`;

  return basePrompt;
}

export function getModeSpecificPrompt(
  gameMode: GameMode,
  currentLevel: number,
): string {
  switch (gameMode.type) {
    case "rpg":
      return `
      RPG Mode Guidelines:
      - Level ${currentLevel} focus: ${getLevelFocus(currentLevel)}
      - Provide appropriate challenges for this level
      - Give clear success/failure criteria
      - Allow retries on the same level if failed`;
    case "streak":
      return `
      Streak Mode Guidelines:
      - Start with simple objections
      - Increase difficulty after each successful response
      - Introduce "Boss Objection" after 5 successful streaks
      - End session after 3 failed responses`;
    case "timeAttack":
      return `
      Time Attack Guidelines:
      - Keep responses short and quick
      - Press for clarity and speed
      - Focus on time management
      - End when time runs out`;
    case "mystery":
      return `
      Mystery Persona Guidelines:
      - Maintain consistent persona throughout
      - Drop subtle hints about personality
      - Don't reveal the persona until the end
      - Provide feedback on correct/incorrect guesses`;
    case "voiceOlympics":
      return `
      Voice Olympics Guidelines:
      - Focus on vocal clarity and confidence
      - Challenge specific aspects (pronunciation, speed, etc.)
      - Provide immediate feedback on performance
      - Award medals based on performance`;
    default:
      return "";
  }
}

export function getRoleForLevel(level: number): string {
  switch (level) {
    case 1:
      return "potential customer for your introduction";
    case 2:
      return "customer with specific objections";
    case 3:
      return "customer ready for closing";
    default:
      return "customer";
  }
}

export function getLevelFocus(level: number): string {
  switch (level) {
    case 1:
      return "Perfect Introduction";
    case 2:
      return "Objection Handling";
    case 3:
      return "Sales Closing";
    default:
      return "General Sales Skills";
  }
}

export function calculateScore(
  gameMode: GameMode,
  currentLevel: number,
  metrics: {
    correctResponses: number;
    streakCount: number;
  },
  streak: number,
  timeRemaining: number,
): number {
  let score = 0;
  switch (gameMode.type) {
    case "rpg":
      score = currentLevel * 100 + metrics.correctResponses * 10;
      break;
    case "streak":
      score = streak * 50 + metrics.correctResponses * 20;
      break;
    case "timeAttack":
      score = Math.max(0, timeRemaining * 2 + metrics.correctResponses * 30);
      break;
    case "mystery":
      score = metrics.correctResponses * 100;
      break;
    case "voiceOlympics":
      score = metrics.correctResponses * 50 + metrics.streakCount * 20;
      break;
  }
  return score;
}
