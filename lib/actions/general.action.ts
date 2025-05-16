import { feedbackSchema } from "@/constants"; // Should define sales-focused fields
import { db } from "@/firebase/admin";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";

export async function createSalesFeedback(params: CreateSalesFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
You are a professional sales coach reviewing a mock sales call between a trainee and a simulated customer. Your task is to give structured, honest feedback based on the conversation. Be constructive but strict — highlight missed opportunities, weak responses, and communication issues.

Here is the full transcript:
${formattedTranscript}

Please rate the sales agent from 0 to 100 in the following areas (use only these exact categories):

- **Pitch Delivery**: Clarity, persuasiveness, and structure of the opening pitch.
- **Objection Handling**: Ability to handle common pushbacks or client hesitations.
- **Product Knowledge**: Relevance and accuracy of the offer explanation.
- **Engagement & Rapport**: Tone, empathy, ability to build connection.
- **Call Control & Flow**: Smooth transitions, timing, and guiding the conversation.

Then, provide:
- **Strengths** (bullet list)
- **Areas for Improvement** (bullet list)
- **Final Assessment** (a 2–3 sentence summary of how the agent performed and what they should focus on next)
`,
      system:
        "You are a sales performance evaluator providing detailed feedback on a mock voice-based sales call.",
    });

    const feedback = {
      interviewId,
      userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    const feedbackRef = feedbackId
      ? db.collection("feedback").doc(feedbackId)
      : db.collection("feedback").doc();

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving sales feedback:", error);
    return { success: false };
  }
}

/**
 * Fetches all sales jobs, ordered by creation date (descending).
 * @returns {Promise<Job[] | null>} Array of jobs or null on error.
 */
export async function getJobs(): Promise<Job[] | null> {
  try {
    const snapshot = await db
      .collection("sales_jobs")
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Job[];
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return null;
  }
}

/**
 * Fetches a single sales job by its ID.
 * @param {string} id - The job ID.
 * @returns {Promise<Job | null>} The job or null if not found.
 */
export async function getJobById(id: string): Promise<Job | null> {
  try {
    const doc = await db.collection("sales_jobs").doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Job;
  } catch (error) {
    console.error("Error fetching job by ID:", error);
    return null;
  }
}

/**
 * Creates a new sales job in the database.
 * @param {Omit<Job, 'id'>} jobData - The job data (without id).
 * @returns {Promise<{ success: boolean; jobId?: string }>} Result of creation.
 */
export async function createJob(
  jobData: Omit<Job, "id">
): Promise<{ success: boolean; jobId?: string }> {
  try {
    const docRef = await db.collection("sales_jobs").add({
      ...jobData,
      createdAt: jobData.createdAt || new Date().toISOString(),
    });
    return { success: true, jobId: docRef.id };
  } catch (error) {
    console.error("Error creating job:", error);
    return { success: false };
  }
}

/**
 * Fetches the latest sales jobs, limited by the provided number.
 * @param {number} limit - The maximum number of jobs to fetch.
 * @returns {Promise<Job[] | null>} Array of jobs or null on error.
 */
export async function getLatestJobs(limit: number = 10): Promise<Job[] | null> {
  try {
    const snapshot = await db
      .collection("sales_jobs")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Job[];
  } catch (error) {
    console.error("Error fetching latest jobs:", error);
    return null;
  }
}

/**
 * Fetches all sales jobs created by a specific user, ordered by creation date (descending).
 * @param {string} userId - The user ID.
 * @returns {Promise<Job[] | null>} Array of jobs or null on error.
 */
export async function getJobsByUserId(userId: string): Promise<Job[] | null> {
  try {
    const snapshot = await db
      .collection("sales_jobs")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Job[];
  } catch (error) {
    console.error("Error fetching jobs by userId:", error);
    return null;
  }
}

/**
 * Fetches feedback for a specific job and user.
 * @param {GetFeedbackByJobIdParams} params - The jobId and userId.
 * @returns {Promise<Feedback | null>} The feedback or null if not found.
 */
export async function getFeedbackByJobId(
  params: GetFeedbackByJobIdParams
): Promise<Feedback | null> {
  const { jobId, userId } = params;
  try {
    const querySnapshot = await db
      .collection("feedback")
      .where("jobId", "==", jobId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (querySnapshot.empty) return null;

    const feedbackDoc = querySnapshot.docs[0];
    return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
  } catch (error) {
    console.error("Error fetching feedback by jobId:", error);
    return null;
  }
}
