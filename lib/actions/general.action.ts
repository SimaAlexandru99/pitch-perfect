"use server";

import { domains, feedbackSchema } from "@/constants"; // Should define sales-focused fields
import { db } from "@/firebase/admin";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";

export async function createFeedback(params: CreateSalesFeedbackParams) {
  const { jobId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    // Get job details if jobId is provided
    let jobContext = "";
    if (jobId) {
      const job = await getJobById(jobId);
      if (job) {
        jobContext = `
Job Context:
Title: ${job.title}
Domain: ${job.domain}
Level: ${job.level}
Description: ${job.description}
`;
      }
    }

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
You are a professional sales coach reviewing a mock sales call between a trainee and a simulated customer. Your task is to give structured, honest feedback based on the conversation. Be constructive but strict — highlight missed opportunities, weak responses, and communication issues.

${jobContext}

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
      jobId,
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

/**
 * Generates a sales script for a specific job and user.
 * @param {Object} params - The jobId, userId, and optional overwrite flag.
 * @returns {Promise<{ success: boolean; scriptId?: string }>} Result of script generation.
 */
export async function createScript(params: {
  jobId: string;
  userId: string;
  overwrite?: boolean;
}) {
  const { jobId, userId, overwrite = false } = params;

  try {
    // First check if a script already exists
    const existingScript = await getScript({ jobId, userId });
    if (existingScript && !overwrite) {
      return { success: true, scriptId: existingScript.id };
    }

    // Get job details if jobId is provided
    let jobContext = "";
    let job: Job | null = null;
    if (jobId) {
      job = await getJobById(jobId);
      if (job) {
        jobContext = `
Job Context:
Title: ${job.title}
Domain: ${job.domain}
Level: ${job.level}
Description: ${job.description}
`;
      }
    }

    // Get domain-specific prompt
    const domainConfig = domains.find((d) => d.value === job?.domain);
    const domainPrompt =
      domainConfig?.prompt ||
      `You are a professional sales agent creating a script. The script should include:

1. **Introduction**: A friendly and professional introduction.
2. **Product Pitch**: A compelling pitch for your product or service.
3. **Objection Handling**: Common objections and responses.
4. **Closing Statement**: A professional closing that maintains the relationship.`;

    // Generate the script using AI
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      output: "no-schema",
      prompt: `${domainPrompt}

${jobContext}

IMPORTANT:
1. Generate the script in English only. Do not use any other language.
2. Use the job context provided above to tailor the script.
3. Ensure all content is relevant to the job title, domain, and level.

Return the response in this exact format:
{
  "introduction": "string (in English)",
  "productPitch": "string (with HTML formatting, in English)",
  "objections": [
    {
      "objection": "string (in English)",
      "response": "string (in English)"
    }
  ],
  "closingStatement": "string (in English)"
}`,
      system:
        "You are a sales script generator specializing in creating domain-specific sales scripts. Always generate content in English and ensure it's tailored to the specific job context provided.",
    });

    // Parse the AI response with better error handling
    let aiResponse;
    try {
      if (typeof object === "string") {
        aiResponse = JSON.parse(object);
      } else if (object && typeof object === "object") {
        aiResponse = object;
      } else {
        console.error("Invalid AI response format:", object);
        throw new Error("Invalid AI response format");
      }
    } catch (error) {
      console.error("Error parsing AI response:", error);
      aiResponse = {};
    }

    // Ensure we have valid data with defaults
    const defaultScript = {
      introduction: `Hello, I'm calling from Vodafone. As a telecom specialist, I wanted to discuss our latest premium mobile plan that could benefit ${
        job?.level || "your household"
      }.`,
      productPitch: `I'd like to tell you about our GOLD <strong>with</strong> HBO Max plan:

<ul>
<li>Disney+ subscription included</li>
<li>UNLIMITED 5G Internet</li>
<li>UNLIMITED minutes and SMS in any national network</li>
<li>500 international minutes</li>
<li>25 GB in EU roaming</li>
<li>5G Ready</li>
<li>Priority customer support</li>
</ul>`,
      objections: [
        {
          objection: "I'm already on a good plan with another provider",
          response:
            "I understand. Could you tell me what features you value most in your current plan? I'd like to show you how our plan might offer better value, especially with the included streaming service.",
        },
        {
          objection: "The price seems high compared to my current plan",
          response:
            "Let me break down the value you're getting: unlimited data, international minutes, and the streaming service subscription. When you consider these benefits, it's actually a great value. Would you like me to compare it with your current plan?",
        },
        {
          objection: "I'm concerned about the contract length",
          response:
            "We offer flexible contract options, including month-to-month plans. Would you like to hear about our different commitment options?",
        },
      ],
      closingStatement:
        "Thank you for your time. Would you be interested in a personalized plan comparison or a trial of our 5G network?",
    };

    // Merge AI response with defaults, ensuring all fields exist
    const scriptData = {
      ...defaultScript,
      ...aiResponse,
      objections: Array.isArray(aiResponse?.objections)
        ? aiResponse.objections
        : defaultScript.objections,
    };

    const script: CreateScriptParams = {
      jobId,
      userId,
      introduction: scriptData.introduction || defaultScript.introduction,
      productPitch: scriptData.productPitch || defaultScript.productPitch,
      objections: scriptData.objections || defaultScript.objections,
      closingStatement:
        scriptData.closingStatement || defaultScript.closingStatement,
      createdAt: new Date().toISOString(),
    };

    // If overwriting, update existing script, otherwise create new
    if (existingScript && overwrite) {
      // Convert script object to Firestore update format
      const updateData = {
        introduction: script.introduction,
        productPitch: script.productPitch,
        objections: script.objections,
        closingStatement: script.closingStatement,
        createdAt: script.createdAt,
        jobId: script.jobId,
        userId: script.userId,
      };

      await db.collection("scripts").doc(existingScript.id).update(updateData);
      return { success: true, scriptId: existingScript.id };
    } else {
      const scriptRef = db.collection("scripts").doc();
      await scriptRef.set(script);
      return { success: true, scriptId: scriptRef.id };
    }
  } catch {
    return { success: false };
  }
}

/**
 * Fetches a script for a specific job and user.
 * @param {GetFeedbackByJobIdParams} params - The jobId and userId.
 * @returns {Promise<(CreateScriptParams & { id: string }) | null>} The script or null if not found.
 */
export async function getScript(
  params: GetFeedbackByJobIdParams
): Promise<(CreateScriptParams & { id: string }) | null> {
  const { jobId, userId } = params;
  try {
    const querySnapshot = await db
      .collection("scripts")
      .where("jobId", "==", jobId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (querySnapshot.empty) return null;

    const scriptDoc = querySnapshot.docs[0];
    return { id: scriptDoc.id, ...scriptDoc.data() } as CreateScriptParams & {
      id: string;
    };
  } catch (error) {
    console.error("Error fetching script:", error);
    return null;
  }
}
