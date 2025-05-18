"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
  timestamp: string;
}

const Agent = ({
  userName,
  userId,
  jobId,
  feedbackId,
  type,
  questions,
  jobTitle,
  jobDomain,
  jobLevel,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  // Add metrics tracking
  const [metrics, setMetrics] = useState({
    totalDuration: 0,
    userSpeakingTime: 0,
    aiSpeakingTime: 0,
    silenceTime: 0,
    interruptions: 0,
  });
  const [callStartTime, setCallStartTime] = useState<number>(0);
  const [lastSpeakingStart, setLastSpeakingStart] = useState<number>(0);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      setCallStartTime(Date.now());
    };

    const onCallEnd = (reason?: string) => {
      setCallStatus(CallStatus.FINISHED);
      setIsSpeaking(false);

      // Calculate final metrics
      const totalDuration = (Date.now() - callStartTime) / 1000;
      setMetrics((prev) => ({
        ...prev,
        totalDuration,
        silenceTime:
          totalDuration - prev.userSpeakingTime - prev.aiSpeakingTime,
      }));

      if (reason === "ejection") {
        console.log(
          "The call was ended unexpectedly. Don't worry - your feedback will be saved."
        );
      }
    };

    const onMessage = (message: {
      type: string;
      transcriptType?: string;
      role: "user" | "assistant" | "system";
      transcript: string;
    }) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage: SavedMessage = {
          role: message.role,
          content: message.transcript,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      setIsSpeaking(true);
      setLastSpeakingStart(Date.now());
    };

    const onSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.error("Call error:", error);
      console.log(
        "The call was ended unexpectedly. Don't worry - your feedback will be saved."
      );
      setCallStatus(CallStatus.FINISHED);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, [callStartTime, lastSpeakingStart]);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      // Map SavedMessage[] to TranscriptMessage[]
      const transcript = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })) as TranscriptMessage[];

      const { success, feedbackId: id } = await createFeedback({
        jobId,
        userId: userId!,
        transcript,
        feedbackId,
        metrics,
      });

      if (success && id) {
        router.push(`/dashboard/jobs/${jobId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, jobId, router, type, userId, metrics]);

  const handleCall = async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);

      if (type === "generate") {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            username: userName,
            userid: userId,
            jobTitle,
            jobDomain,
            jobLevel,
          },
          clientMessages: [],
          serverMessages: [],
        });
      } else {
        // Ensure all required job context variables are available
        if (!jobTitle || !jobDomain || !jobLevel) {
          throw new Error("Missing job information");
        }

        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        const jobContext = `
Job Title: ${jobTitle}
Domain: ${jobDomain}
Level: ${jobLevel}
        `;

        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
            jobContext,
            jobTitle,
            jobDomain,
            jobLevel,
          },
          clientMessages: [],
          serverMessages: [],
        });
      }
    } catch (error) {
      console.error("Error starting call:", error);
      console.log("Failed to start the call. Please try again.");
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    try {
      setCallStatus(CallStatus.FINISHED);
      vapi.stop();
    } catch (error) {
      console.error("Error disconnecting:", error);
      console.log("Error ending the call. Please try again.");
    }
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {lastMessage && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={handleCall}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />
            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
