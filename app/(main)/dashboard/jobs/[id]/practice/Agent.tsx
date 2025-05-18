"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mic, MicOff, Phone, PhoneOff, Settings, User } from "lucide-react";
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

const MessageBubble = ({ message }: { message: SavedMessage }) => {
  const isAI = message.role === "assistant";
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <div
      className={cn(
        "flex items-start gap-2 p-2 rounded-lg",
        isAI && "bg-primary/10",
        isUser && "bg-muted",
        isSystem && "bg-secondary/10"
      )}
    >
      <Avatar className="size-6">
        {isAI ? (
          <AvatarImage src="/ai-avatar.png" alt="AI" />
        ) : isUser ? (
          <AvatarImage src="/user-avatar.png" alt="User" />
        ) : (
          <AvatarFallback>S</AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1">
        <p className="text-xs font-medium mb-1">
          {isAI ? "AI Interviewer" : isUser ? "You" : "System"}
        </p>
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  );
};

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
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreparingFeedback, setIsPreparingFeedback] = useState(false);

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
  const [currentSpeaker, setCurrentSpeaker] = useState<
    "user" | "assistant" | null
  >(null);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      setError(null);
      setIsLoading(false);
      setCallStartTime(Date.now());
    };

    const onCallEnd = (reason?: string) => {
      setCallStatus(CallStatus.FINISHED);
      setIsSpeaking(false);
      setIsLoading(false);

      // Calculate final metrics
      const totalDuration = (Date.now() - callStartTime) / 1000;
      setMetrics((prev) => ({
        ...prev,
        totalDuration,
        silenceTime:
          totalDuration - prev.userSpeakingTime - prev.aiSpeakingTime,
      }));

      if (reason === "ejection") {
        setError(
          "The call was ended unexpectedly. Don't worry - your feedback will be saved."
        );
      }
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = {
          role: message.role,
          content: message.transcript,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newMessage]);

        // Track speaking time
        if (currentSpeaker) {
          const speakingDuration = (Date.now() - lastSpeakingStart) / 1000;
          setMetrics((prev) => ({
            ...prev,
            [currentSpeaker === "user" ? "userSpeakingTime" : "aiSpeakingTime"]:
              prev[
                currentSpeaker === "user"
                  ? "userSpeakingTime"
                  : "aiSpeakingTime"
              ] + speakingDuration,
          }));
        }

        // Check for interruptions
        if (currentSpeaker && currentSpeaker !== message.role) {
          setMetrics((prev) => ({
            ...prev,
            interruptions: prev.interruptions + 1,
          }));
        }

        setCurrentSpeaker(message.role as "user" | "assistant");
        setLastSpeakingStart(Date.now());
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
      setLastSpeakingStart(Date.now());
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);

      // Update speaking time when speech ends
      if (currentSpeaker) {
        const speakingDuration = (Date.now() - lastSpeakingStart) / 1000;
        setMetrics((prev) => ({
          ...prev,
          [currentSpeaker === "user" ? "userSpeakingTime" : "aiSpeakingTime"]:
            prev[
              currentSpeaker === "user" ? "userSpeakingTime" : "aiSpeakingTime"
            ] + speakingDuration,
        }));
      }
    };

    const onError = (error: Error) => {
      console.error("Call error:", error);
      setError(
        "An error occurred during the call. Your feedback will be saved."
      );
      setIsLoading(false);
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
  }, [callStartTime, currentSpeaker, lastSpeakingStart]);

  useEffect(() => {
    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");
      setIsPreparingFeedback(true);

      const { success, feedbackId: id } = await createFeedback({
        jobId,
        userId: userId!,
        transcript: messages,
        feedbackId,
        metrics,
      });

      setIsPreparingFeedback(false);

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
      setIsLoading(true);
      setCallStatus(CallStatus.CONNECTING);
      setError(null);

      if (type === "generate") {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            username: userName,
            userid: userId,
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
      setError(
        error instanceof Error
          ? error.message
          : "Failed to start the call. Please try again."
      );
      setCallStatus(CallStatus.INACTIVE);
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    try {
      setCallStatus(CallStatus.FINISHED);
      vapi.stop();
    } catch (error) {
      console.error("Error disconnecting:", error);
      setError("Error ending the call. Please try again.");
    }
  };

  return (
    <div className="relative flex flex-col min-h-[calc(100vh-12rem)] w-full overflow-hidden">
      {/* Main Meeting Area */}
      <div className="flex-1 w-full flex items-center justify-center relative px-3 py-6 sm:p-8">
        {error && (
          <Card className="fixed z-30 top-4 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md bg-destructive/10 backdrop-blur-sm border-destructive/20">
            <CardContent className="py-2.5 px-3 sm:py-3 sm:px-4">
              <p className="text-xs sm:text-sm text-center text-destructive font-medium">
                {error}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Participants Grid */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 sm:gap-8 w-full max-w-5xl relative z-10">
          {/* AI Participant Card */}
          <Card
            className={cn(
              "bg-gradient-to-b from-[#171532] to-[#08090D] border-2 relative overflow-hidden transition-all duration-300",
              isSpeaking ? "border-primary-200" : "border-primary-200/50"
            )}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="bg-gradient-to-l from-[#FFFFFF] to-[#CAC5FE] rounded-full p-1 relative mb-3 sm:mb-4">
                    <Avatar className="size-24 sm:size-32 md:size-40">
                      <AvatarImage
                        src="/ai-avatar.png"
                        alt="AI Interviewer"
                        className="object-cover"
                      />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    {isSpeaking && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-primary-200 opacity-75" />
                    )}
                  </div>
                  <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-full border border-border">
                    <Mic className="size-3 sm:size-4 text-primary" />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-primary-100 mt-2">
                  AI Interviewer
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isLoading
                    ? "Connecting..."
                    : isSpeaking
                    ? "Speaking..."
                    : "Ready"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Participant Card */}
          <Card
            className={cn(
              "bg-gradient-to-b from-[#1A1C20] to-[#08090D] border relative overflow-hidden transition-all duration-300",
              isSpeaking ? "border-primary-200" : "border-[#4B4D4F]"
            )}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="size-24 sm:size-32 md:size-40 mb-3 sm:mb-4">
                    <AvatarImage
                      src="/user-avatar.png"
                      alt={userName}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      <User className="size-12 sm:size-16" />
                    </AvatarFallback>
                  </Avatar>
                  {isSpeaking && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary-200 opacity-75" />
                  )}
                  <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-full border border-border">
                    {isMuted ? (
                      <MicOff className="size-3 sm:size-4 text-destructive" />
                    ) : (
                      <Mic className="size-3 sm:size-4 text-primary" />
                    )}
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mt-2">
                  {userName}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isLoading
                    ? "Connecting..."
                    : isMuted
                    ? "Muted"
                    : isSpeaking
                    ? "Speaking..."
                    : "Ready"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Floating Transcript */}
        {messages.length > 0 && (
          <Card className="fixed z-20 bottom-20 sm:bottom-24 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl bg-background/80 backdrop-blur-sm border-border">
            <CardContent className="py-2.5 px-3 sm:py-3 sm:px-4">
              <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                {messages.slice(-3).map((message, index) => (
                  <MessageBubble key={index} message={message} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading Dialog */}
        <Dialog open={isPreparingFeedback}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Preparing Your Feedback</DialogTitle>
              <DialogDescription>
                Please wait while we analyze your performance and generate
                detailed feedback.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative">
                <div className="size-12 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 size-12 border-4 border-primary rounded-full animate-spin border-t-transparent" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground text-center">
                This may take a few moments...
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Call Controls */}
      <div className="fixed bottom-4 sm:bottom-6 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 z-30">
        <div className="flex items-center justify-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-full bg-background/80 backdrop-blur-sm border shadow-lg max-w-md mx-auto">
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "size-10 sm:size-11 rounded-full transition-colors",
              isMuted &&
                "bg-destructive/10 hover:bg-destructive/20 text-destructive"
            )}
            onClick={() => setIsMuted(!isMuted)}
            disabled={isLoading || callStatus === CallStatus.FINISHED}
          >
            {isMuted ? (
              <MicOff className="size-4 sm:size-5" />
            ) : (
              <Mic className="size-4 sm:size-5" />
            )}
          </Button>

          {callStatus !== "ACTIVE" ? (
            <Button
              size="icon"
              className="size-12 sm:size-14 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors relative"
              onClick={() => handleCall()}
              disabled={isLoading}
            >
              <span
                className={cn(
                  "absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-75",
                  callStatus !== "CONNECTING" && "hidden"
                )}
              />
              <Phone className="size-5 sm:size-6" />
            </Button>
          ) : (
            <Button
              size="icon"
              variant="destructive"
              className="size-12 sm:size-14 rounded-full transition-colors"
              onClick={() => handleDisconnect()}
              disabled={isLoading}
            >
              <PhoneOff className="size-5 sm:size-6" />
            </Button>
          )}

          <Button
            size="icon"
            variant="ghost"
            className="size-10 sm:size-11 rounded-full transition-colors"
            onClick={() => {}}
            disabled={isLoading || callStatus === CallStatus.FINISHED}
          >
            <Settings className="size-4 sm:size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Agent;
