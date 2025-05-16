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
  interviewId: string;
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
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
}

interface InterviewCardProps {
  interviewId?: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
}
