"use server";

import { domains } from "@/constants";
import { db } from "@/firebase/admin";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// Define the feedback schema using Zod
const feedbackSchema = z.object({
  totalScore: z.number().min(0).max(100),
  categoryScores: z
    .array(
      z.object({
        name: z.string(),
        score: z.number().min(0).max(100),
        comment: z.string(),
        subcategories: z
          .array(
            z.object({
              name: z.string(),
              score: z.number().min(0).max(100),
              comment: z.string(),
            })
          )
          .optional(),
      })
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
        })
      )
      .min(1),
  }),
});

export async function createFeedback(params: CreateFeedbackParams) {
  const { jobId, userId, transcript, feedbackId, metrics } = params;

  try {
    // Log transcript details
    console.log("=== Interview Transcript ===");
    console.log("Total messages:", transcript.length);
    console.log("Messages:");
    transcript.forEach((message, index) => {
      console.log(
        `[${index + 1}] ${message.role.toUpperCase()} (${message.timestamp}):`
      );
      console.log(`    ${message.content}`);
    });
    console.log("========================");

    const formattedTranscript = transcript
      .map(
        (sentence) =>
          `- ${sentence.role} (${sentence.timestamp}): ${sentence.content}\n`
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

    // Calculate speaking time percentages
    const totalSpeakingTime = metrics
      ? metrics.userSpeakingTime + metrics.aiSpeakingTime
      : 0;
    const userSpeakingPercentage =
      totalSpeakingTime > 0
        ? Math.round(
            ((metrics?.userSpeakingTime || 0) / totalSpeakingTime) * 100
          )
        : 0;
    const aiSpeakingPercentage =
      totalSpeakingTime > 0
        ? Math.round(((metrics?.aiSpeakingTime || 0) / totalSpeakingTime) * 100)
        : 0;

    // Calculate average response time safely
    const messageCount = transcript.length;
    const avgResponseTime =
      messageCount > 0 && metrics?.totalDuration
        ? Math.round(metrics.totalDuration / (messageCount / 2))
        : 0;

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      output: "no-schema",
      prompt: `
You are a professional sales coach reviewing a mock sales call between a trainee and a simulated customer. Your task is to give structured, honest feedback based on the conversation. Be constructive and balanced in your assessment — recognize both strengths and areas for improvement.

IMPORTANT SCORING GUIDELINES:
- Base scores on effort and attempt, not just perfection
- Consider this is a practice session, not a real sales call
- Start from a baseline of 60 points and adjust based on performance
- Award points for:
  * Basic attempt (40-50 points)
  * Good effort (50-65 points)
  * Strong performance (65-80 points)
  * Excellent execution (80-90 points)
  * Outstanding mastery (90-100 points)
- Never give scores below 40 unless there was no attempt at all
- Consider the difficulty level of the job (${
        jobContext.includes("Level:")
          ? jobContext.split("Level:")[1].split("\n")[0].trim()
          : "entry"
      })
- Give bonus points for:
  * Checking availability in introduction (+5 points)
  * Professional greeting (+5 points)
  * Clear communication (+5 points)
  * Good objection handling (+5 points)
  * Proper closing (+5 points)

${jobContext}

Here is the full transcript:
${formattedTranscript}

${
  metrics
    ? `
Call Metrics:
- Total Duration: ${metrics.totalDuration || 0} seconds
- User Speaking Time: ${
        metrics.userSpeakingTime || 0
      } seconds (${userSpeakingPercentage}%)
- AI Speaking Time: ${
        metrics.aiSpeakingTime || 0
      } seconds (${aiSpeakingPercentage}%)
- Silence Time: ${metrics.silenceTime || 0} seconds
- Interruptions: ${metrics.interruptions || 0}
- Average Response Time: ${avgResponseTime} seconds
`
    : ""
}

Please provide detailed feedback in the following areas:

1. Category Scores (0-100):
- Pitch Delivery (with subcategories: Clarity, Structure, Confidence)
- Objection Handling (with subcategories: Response Quality, Follow-up, Resolution)
- Product Knowledge (with subcategories: Accuracy, Depth, Relevance)
- Engagement & Rapport (with subcategories: Active Listening, Empathy, Connection)
- Call Control & Flow (with subcategories: Pacing, Transitions, Time Management)

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
      "comment": string,
      "subcategories": [
        {
          "name": string,
          "score": number,
          "comment": string
        }
      ]
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
        "You are a sales performance evaluator providing detailed feedback on a mock voice-based sales call. Focus on actionable insights and specific examples from the conversation. Be encouraging and constructive in your feedback. Always start with a higher baseline score and look for positive aspects to reward.",
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
    const validationResult = feedbackSchema.safeParse(parsedObject);
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
          `Category score for ${category.name} must be between 0 and 100`
        );
      }
      category.subcategories?.forEach((sub) => {
        if (sub.score < 0 || sub.score > 100) {
          throw new Error(
            `Subcategory score for ${sub.name} must be between 0 and 100`
          );
        }
      });
    });

    const feedback = {
      jobId,
      userId,
      totalScore: validatedObject.totalScore,
      categoryScores: validatedObject.categoryScores,
      strengths: validatedObject.strengths,
      areasForImprovement: validatedObject.areasForImprovement,
      finalAssessment: validatedObject.finalAssessment,
      transcript,
      metrics,
      recommendations: validatedObject.recommendations,
      createdAt: new Date().toISOString(),
    };

    // Check for existing feedback
    const existingFeedback = await getFeedbackByJobId({ jobId, userId });

    // If feedbackId is provided or existing feedback exists, update it
    if (feedbackId || existingFeedback) {
      const feedbackRef = feedbackId
        ? db.collection("feedback").doc(feedbackId)
        : db.collection("feedback").doc(existingFeedback!.id);

      await feedbackRef.set(feedback);
      return { success: true, feedbackId: feedbackRef.id };
    } else {
      // Create new feedback
      const feedbackRef = db.collection("feedback").doc();
      await feedbackRef.set(feedback);
      return { success: true, feedbackId: feedbackRef.id };
    }
  } catch (error) {
    console.error("Error saving sales feedback:", error);
    return { success: false };
  }
}

/**
 * Fetches all sales jobs, ordered by creation date (descending).
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
 */
export async function createScript(params: {
  jobId: string;
  userId: string;
  overwrite?: boolean;
}): Promise<CreateScriptResponse> {
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
4. The introduction MUST include checking the client's availability before proceeding.

Return the response in this exact format:
{
  "introduction": "string (in English, must include checking availability)",
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
        "You are a sales script generator specializing in creating domain-specific sales scripts. Always generate content in English and ensure it's tailored to the specific job context provided. Always include checking client availability in the introduction.",
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
      introduction: `Hello, I'm calling from Vodafone. I hope I'm not catching you at a bad time? Do you have a few minutes to discuss our latest premium mobile plan that could benefit ${
        job?.level || "your household"
      }?`,
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
 */
export async function getScript(
  params: GetScriptParams
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
