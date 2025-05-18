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
  transcript: TranscriptMessage[];
  metrics: FeedbackMetrics;
  recommendations: FeedbackRecommendations;
  createdAt: string;
  updatedAt?: string;
}

interface CreateFeedbackParams {
  jobId: string;
  userId: string;
  transcript: TranscriptMessage[];
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

// Common types
interface TranscriptMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
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
