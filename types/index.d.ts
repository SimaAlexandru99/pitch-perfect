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

interface CreateFeedbackParams {
  jobId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}

type FormType = "sign-in" | "sign-up";

type FirebaseError = {
  code: string;
  message: string;
};

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

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

interface CreateJobFeedbackParams {
  jobId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}

interface GetFeedbackByJobIdParams {
  jobId: string;
  userId: string;
}

interface Feedback {
  id: string;
  jobId: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

interface CreateSalesFeedbackParams {
  jobId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}

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

interface CreateScriptParams {
  jobId: string;
  userId: string;
  introduction: string;
  productPitch: string;
  objections: Array<{ objection: string; response: string }>;
  closingStatement: string;
  createdAt: string;
}

interface AIScriptResponse {
  introduction?: string;
  productPitch?: string;
  objections?: Array<{ objection: string; response: string }>;
  closingStatement?: string;
}
