// User related types
interface User {
  name: string;
  profileURL: string;
  email: string;
  id: string;
  avatar: string;
}

interface SignInParams {
  email: string;
  idToken: string;
}

interface FeedbackContentProps {
  feedback: Feedback;
  job: Job;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}

// Job related types
interface Job {
  id: string;
  title: string;
  domain: string;
  level: string;
  description: string;
  createdAt?: string;
  userId: string;
  type: string;
  finalized?: boolean;
}

interface JobCardProps {
  jobId?: string;
  userId?: string;
  title: string;
  type: string;
  domain: string;
  level: string;
  createdAt?: string;
}

// Script related types
interface CreateScriptParams {
  jobId: string;
  userId: string;
  introduction: string;
  productPitch: string;
  objections: Array<{
    objection: string;
    response: string;
  }>;
  closingStatement: string;
  createdAt: string;
}

interface CreateScriptResponse {
  success: boolean;
  scriptId?: string;
}

interface GetScriptParams {
  jobId: string;
  userId: string;
}

interface AIScriptResponse {
  introduction?: string;
  productPitch?: string;
  objections?: Array<{ objection: string; response: string }>;
  closingStatement?: string;
}

// Feedback related types
interface CategoryScore {
  name: string;
  score: number;
  comment: string;
  subcategories?: {
    name: string;
    score: number;
    comment: string;
  }[];
}

interface FeedbackMetrics {
  totalDuration: number;
  userSpeakingTime: number;
  aiSpeakingTime: number;
  silenceTime: number;
  interruptions: number;
}

interface FeedbackRecommendations {
  shortTerm: string[];
  longTerm: string[];
  resources: {
    title: string;
    url: string;
    description: string;
  }[];
}

interface Feedback {
  id: string;
  jobId: string;
  userId: string;
  totalScore: number;
  categoryScores: CategoryScore[];
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  transcript: { role: string; content: string }[];
  metrics: FeedbackMetrics;
  recommendations: FeedbackRecommendations;
  createdAt: string;
  updatedAt?: string;
}

interface CreateFeedbackParams {
  jobId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
  metrics?: FeedbackMetrics;
}

interface GetFeedbackByJobIdParams {
  jobId: string;
  userId: string;
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

// Next.js specific types
interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

// Component props types
interface AgentProps {
  userName: string;
  userId?: string;
  jobId: string;
  feedbackId?: string;
  type: "generate" | "practice";
  questions?: string[];
  jobTitle?: string;
  jobDomain?: string;
  jobLevel?: string;
}

interface InterviewCardProps {
  interviewId?: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
}

// Utility types
type FormType = "sign-in" | "sign-up";

type FirebaseError = {
  code: string;
  message: string;
};

// Game related types
interface GameMode {
  id: string;
  name: string;
  description: string;
  type: "rpg" | "streak" | "timeAttack" | "mystery" | "voiceOlympics";
  difficulty: "easy" | "medium" | "hard";
  maxLevel?: number;
  streakGoal?: number;
  timeLimit?: number;
  lives?: number;
}

interface GameSession {
  id: string;
  userId: string;
  gameModeId: string;
  currentLevel: number;
  score: number;
  lives: number;
  streak: number;
  timeRemaining: number;
  startedAt: Date;
  status: "active" | "completed" | "failed";
  feedbackAt?: Date;
  completedAt?: Date;
  completedLevels?: number[];
  xp: number;
  characterStats: {
    charisma: number;
    persuasion: number;
    confidence: number;
  };
  questProgress: {
    currentQuest: string;
    objectives: { description: string; completed: boolean }[];
  };
}

interface GameFeedback {
  userName: string;
  sessionId: string;
  userId: string;
  level: number;
  score: number;
  timeSpent: number;
  transcript: Array<{
    role: "system" | "assistant" | "user";
    content: string;
  }>;
  metrics: {
    totalDuration: number;
    userSpeakingTime: number;
    aiSpeakingTime: number;
    silenceTime: number;
    interruptions: number;
    streakCount: number;
    correctResponses: number;
    incorrectResponses: number;
    levelCompletionTime: number;
    totalGames: number;
  };
  gameMode: {
    id: string;
    name: string;
    type: string;
    difficulty: string;
  };
  createdAt: string;
}

interface GameMetrics {
  totalDuration: number;
  userSpeakingTime: number;
  aiSpeakingTime: number;
  silenceTime: number;
  interruptions: number;
  streakCount: number;
  correctResponses: number;
  incorrectResponses: number;
  levelCompletionTime: number;
  totalGames: number;
}

interface UserGameStats {
  xp: number;
  level: number;
  charisma: number;
  persuasion: number;
  confidence: number;
  achievements: string[];
  totalGames: number;
  gamesWon: number;
  highestStreak: number;
  createdAt?: string;
  updatedAt?: string;
}

interface FirebaseTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

interface FirestoreTimestamp {
  toDate: () => Date;
}

interface UserStats {
  xp: number;
  level: number;
  charisma: number;
  persuasion: number;
  confidence: number;
  achievements: string[];
  totalGames: number;
  gamesWon: number;
  highestStreak: number;
}

interface GameState {
  timeRemaining: number;
  streak: number;
  lives: number;
  currentLevel: number;
  metrics: GameMetrics;
  powerUps: {
    shield: boolean;
    doublePoints: boolean;
    timeFreeze: boolean;
  };
  achievements: string[];
  xp: number;
  level: number;
  characterStats: {
    charisma: number;
    persuasion: number;
    confidence: number;
  };
  questProgress: {
    currentQuest: string;
    objectives: { description: string; completed: boolean }[];
  };
}

interface GameAgentProps {
  userName: string;
  userId: string;
  gameMode: GameMode;
  session: GameSession;
  initialStats?: {
    xp: number;
    level: number;
    charisma: number;
    persuasion: number;
    confidence: number;
    achievements: string[];
    totalGames: number;
    gamesWon: number;
    highestStreak: number;
  };
}
