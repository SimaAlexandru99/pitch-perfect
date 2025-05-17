"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
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
  const [lastMessage, setLastMessage] = useState<string>("");
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speakingRole, setSpeakingRole] = useState<"user" | "assistant" | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      setError(null);
      setIsLoading(false);
    };

    const onCallEnd = (reason?: string) => {
      setCallStatus(CallStatus.FINISHED);
      setSpeakingRole(null);
      setIsLoading(false);
      if (reason === "ejection") {
        setError(
          "The call was ended unexpectedly. Don't worry - your feedback will be saved."
        );
      }
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
        setSpeakingRole(message.role === "user" ? "user" : "assistant");
      }
    };

    const onSpeechStart = () => {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage) {
        setSpeakingRole(lastMessage.role === "user" ? "user" : "assistant");
      }
    };

    const onSpeechEnd = () => {
      setTimeout(() => {
        setSpeakingRole(null);
      }, 500);
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
  }, [messages]);

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
  }, [messages, callStatus, feedbackId, jobId, router, type, userId]);

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
        <div className="absolute inset-0 bg-[url('/pattern.png')] bg-center opacity-5" />

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
          <motion.div
            animate={{
              scale: speakingRole === "assistant" ? 1.02 : 1,
              borderColor:
                speakingRole === "assistant"
                  ? "var(--primary-200)"
                  : "var(--primary-200/50)",
            }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={cn(
                "bg-gradient-to-b from-[#171532] to-[#08090D] border-2 relative overflow-hidden transition-all duration-300",
                speakingRole === "assistant"
                  ? "border-primary-200"
                  : "border-primary-200/50"
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
                      <AnimatePresence>
                        {speakingRole === "assistant" && (
                          <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 0.75 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="absolute inset-0 rounded-full bg-primary-200"
                            style={{
                              animation:
                                "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
                            }}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-full border border-border">
                      <Mic className="size-3 sm:size-4 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-primary-100 mt-2">
                    AI Interviewer
                  </h3>
                  <motion.p
                    animate={{
                      opacity: speakingRole === "assistant" ? 1 : 0.7,
                    }}
                    className="text-xs sm:text-sm text-muted-foreground"
                  >
                    {isLoading
                      ? "Connecting..."
                      : speakingRole === "assistant"
                      ? "Speaking..."
                      : speakingRole === "user"
                      ? "Listening..."
                      : "Ready"}
                  </motion.p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Participant Card */}
          <motion.div
            animate={{
              scale: speakingRole === "user" ? 1.02 : 1,
              borderColor:
                speakingRole === "user"
                  ? "var(--primary-200)"
                  : "var(--border)",
            }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={cn(
                "bg-gradient-to-b from-[#1A1C20] to-[#08090D] border relative overflow-hidden transition-all duration-300",
                speakingRole === "user"
                  ? "border-primary-200"
                  : "border-[#4B4D4F]"
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
                    <AnimatePresence>
                      {speakingRole === "user" && (
                        <motion.span
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 0.75 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="absolute inset-0 rounded-full bg-primary-200"
                          style={{
                            animation:
                              "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
                          }}
                        />
                      )}
                    </AnimatePresence>
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
                  <motion.p
                    animate={{
                      opacity: speakingRole === "user" ? 1 : 0.7,
                    }}
                    className="text-xs sm:text-sm text-muted-foreground"
                  >
                    {isLoading
                      ? "Connecting..."
                      : isMuted
                      ? "Muted"
                      : speakingRole === "user"
                      ? "Speaking..."
                      : speakingRole === "assistant"
                      ? "Listening..."
                      : "Ready"}
                  </motion.p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Floating Transcript */}
        <AnimatePresence>
          {messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="fixed z-20 bottom-20 sm:bottom-24 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl bg-background/80 backdrop-blur-sm border-border">
                <CardContent className="py-2.5 px-3 sm:py-3 sm:px-4">
                  <div
                    className="text-xs sm:text-sm text-center text-foreground line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: lastMessage }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
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
              <AnimatePresence>
                {callStatus === "CONNECTING" && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.75 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="absolute inset-0 rounded-full bg-emerald-500"
                    style={{
                      animation:
                        "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
                    }}
                  />
                )}
              </AnimatePresence>
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
