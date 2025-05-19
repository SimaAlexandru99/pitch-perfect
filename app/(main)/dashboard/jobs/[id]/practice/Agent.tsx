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
}

const Agent = ({
  userName,
  userId,
  jobId,
  feedbackId,
  type,
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

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
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

      const { success, feedbackId: id } = await createFeedback({
        jobId,
        userId: userId!,
        transcript: messages,
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
            jobId,
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

        const jobContext = `
Job Title: ${jobTitle}
Domain: ${jobDomain}
Level: ${jobLevel}
        `;

        await vapi.start(interviewer, {
          variableValues: {
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
    <div className="flex flex-col h-full space-y-6 p-6">
      {/* Profile Cards Container */}
      <div className="flex flex-col sm:flex-row gap-6 flex-1 min-h-[280px]">
        {/* AI Interviewer Card */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#171532] to-[#08090D] rounded-2xl border-2 border-primary-200/50 shadow-lg transition-all duration-300 hover:border-primary-200/75">
          <div className="relative">
            <div className="relative flex items-center justify-center blue-gradient rounded-full size-32 transition-transform duration-300 hover:scale-105">
              <Image
                src="/ai-avatar.png"
                alt="AI Interviewer"
                width={75}
                height={62}
                className="object-cover"
                priority
              />
              {isSpeaking && (
                <span className="absolute inset-0 animate-ping rounded-full bg-primary-200 opacity-75" />
              )}
            </div>
          </div>
          <h3 className="mt-6 text-xl font-medium text-primary-100">
            AI Interviewer
          </h3>
        </div>

        {/* User Profile Card */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-background to-muted/50 rounded-2xl border border-border/50 shadow-lg transition-all duration-300 hover:border-border">
          <div className="relative">
            <div className="size-32 rounded-full overflow-hidden transition-transform duration-300 hover:scale-105">
              <Image
                src="/user-avatar.png"
                alt="User Avatar"
                width={128}
                height={128}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          </div>
          <h3 className="mt-6 text-xl font-medium">{userName}</h3>
        </div>
      </div>

      {/* Transcript Area */}
      {lastMessage && (
        <div className="flex-none relative rounded-2xl border border-border/50 bg-gradient-to-b from-background to-muted/50 shadow-lg overflow-hidden transition-all duration-300 hover:border-border">
          <div className="p-6 max-h-[200px] overflow-y-auto">
            <p
              key={lastMessage}
              className={cn(
                "text-lg leading-relaxed transition-opacity duration-500",
                "animate-fadeIn"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {/* Call Controls */}
      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
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
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </div>
  );
};

export default Agent;
