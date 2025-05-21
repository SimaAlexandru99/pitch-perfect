"use client";

import { Switch } from "@/components/ui/switch";
import { File, FileText, Mic, MicOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { interviewer } from "@/constants";
import { Persona, personas } from "@/constants/personas";
import {
  createFeedback,
  createScript,
  getScript,
} from "@/lib/actions/general.action";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { ScriptPanel } from "./ScriptPanel";
import { ScriptSkeleton } from "./ScriptSkeleton";

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

interface Script {
  introduction: string;
  productPitch: string;
  objections: Array<{
    objection: string;
    response: string;
  }>;
  closingStatement: string;
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
  const [isMuted, setIsMuted] = useState(false);
  const [isScriptOpen, setIsScriptOpen] = useState(false);
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const [script, setScript] = useState<Script | null>(null);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [selectedPersona, setSelectedPersona] = useState<Persona>(personas[0]);
  const [partialTranscript, setPartialTranscript] = useState<string | null>(
    null
  );
  const [isCoachMode, setIsCoachMode] = useState(false);

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

  const handleMuteToggle = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    vapi.setMuted(newMutedState);
  };

  const handleScriptToggle = async () => {
    if (!isScriptOpen) {
      setIsScriptOpen(true);
      if (!script) {
        setIsScriptLoading(true);
        setScriptError(null);
        try {
          const safeJobId = jobId ?? "";
          const safeUserId = userId ?? "Guest";
          let fetchedScript = await getScript({
            jobId: safeJobId,
            userId: safeUserId,
          });
          if (!fetchedScript) {
            const { success, scriptId } = await createScript({
              jobId: safeJobId,
              userId: safeUserId,
            });
            if (success && scriptId) {
              fetchedScript = await getScript({
                jobId: safeJobId,
                userId: safeUserId,
              });
            }
          }
          if (fetchedScript) {
            setScript(fetchedScript);
          } else {
            setScriptError("Failed to load script.");
          }
        } catch {
          setScriptError("Failed to load script.");
        } finally {
          setIsScriptLoading(false);
        }
      }
    } else {
      setIsScriptOpen(false);
    }
  };

  const handlePersonaChange = (key: string) => {
    const persona = personas.find((p) => p.key === key) || personas[0];
    setSelectedPersona(persona);
  };

  const handleRandomizePersona = () => {
    const randomIndex = Math.floor(Math.random() * personas.length);
    setSelectedPersona(personas[randomIndex]);
  };

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      setCallStartTime(Date.now());
    };

    const onCallEnd = () => {
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
    };

    const onMessage = (message: Message) => {
      if (message.type !== "transcript") return;
      if (message.transcriptType === "partial") {
        setPartialTranscript(message.transcript);
      }
      if (message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
        setPartialTranscript(null);
      }
    };

    const onSpeechStart = () => {
      setIsSpeaking(true);
      setLastSpeakingStart(Date.now());
    };

    const onSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const onError = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const handleVolume = (volume: number) => setVolumeLevel(volume);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);
    vapi.on("volume-level", handleVolume);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
      vapi.off("volume-level", handleVolume);
    };
  }, [callStartTime, lastSpeakingStart]);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
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

  // Helper to get interviewer config with or without coach mode
  const getInterviewerConfig = () => {
    if (!isCoachMode) return interviewer;
    const coachInterviewer = structuredClone(interviewer);
    const systemMsg = coachInterviewer.model?.messages?.[0];
    if (systemMsg) {
      systemMsg.content += `\n---\nCOACH MODE:\nAt the end of the conversation, or if the agent requests feedback by saying something like \"Can I get feedback?\", provide a brief, constructive summary of the agent's performance, including strengths and areas for improvement. Speak as a coach, not as a customer.`;
    }
    return coachInterviewer;
  };

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
            persona: selectedPersona.key,
          },
        });
      } else {
        if (!jobTitle || !jobDomain || !jobLevel) {
          throw new Error("Missing job information");
        }

        const jobContext = `\nJob Title: ${jobTitle}\nDomain: ${jobDomain}\nLevel: ${jobLevel}\n        `;
        const personaInstructions = selectedPersona.behavioralGuidelines;

        await vapi.start(getInterviewerConfig(), {
          variableValues: {
            jobContext,
            jobTitle,
            jobDomain,
            jobLevel,
            personaInstructions,
            persona: selectedPersona.key,
          },
        });
      }
    } catch {
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    try {
      setCallStatus(CallStatus.FINISHED);
      vapi.stop();
    } catch {
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-full w-full gap-y-4 relative">
      {/* Persona Selector */}
      <div className="flex items-center gap-2 mb-2">
        <Switch
          checked={isCoachMode}
          onCheckedChange={setIsCoachMode}
          id="coach-mode"
        />
        <label htmlFor="coach-mode" className="text-sm">
          AI Coach Mode
        </label>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 items-center mb-2 w-full max-w-xl">
        <label
          htmlFor="persona-select"
          className="text-sm font-medium mr-2 whitespace-nowrap"
        >
          Customer Persona:
        </label>
        <Select value={selectedPersona.key} onValueChange={handlePersonaChange}>
          <SelectTrigger className="w-40" id="persona-select">
            <SelectValue placeholder="Select persona" />
          </SelectTrigger>
          <SelectContent>
            {personas.map((persona) => (
              <SelectItem key={persona.key} value={persona.key}>
                {persona.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          className="ml-2"
          onClick={handleRandomizePersona}
        >
          Randomize
        </Button>
      </div>
      <div className="w-full max-w-xl mb-2">
        <span
          className="block text-xs text-muted-foreground truncate"
          title={selectedPersona.description}
        >
          {selectedPersona.description}
        </span>
      </div>
      {/* Profile Cards Container */}
      <div className="flex flex-col sm:flex-row gap-6 w-full justify-center items-center">
        {/* AI Interviewer Card */}
        <div className="h-[450px] w-full max-w-[700px] mx-auto flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#171532] to-[#08090D] rounded-xl border-2 border-primary-200/50 shadow-lg transition-all duration-300 hover:border-primary-200/75 focus-within:ring-2 focus-within:ring-primary-300">
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
        <div className="h-[450px] w-full max-w-[700px] mx-auto flex flex-col items-center justify-center p-8 bg-gradient-to-b from-background to-muted/50 rounded-xl border border-border/50 shadow-lg transition-all duration-300 hover:border-border focus-within:ring-2 focus-within:ring-primary-300">
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
      {/* Message Display */}
      {(lastMessage || partialTranscript) && (
        <div className="flex-none relative rounded-xl border border-border/50 bg-gradient-to-b from-background to-muted/50 shadow-lg overflow-hidden transition-all duration-300 hover:border-border max-w-xl w-full mx-auto mt-6">
          <div className="p-6 max-h-[200px] overflow-y-auto">
            {lastMessage && (
              <p
                key={lastMessage}
                className={cn(
                  "text-lg leading-relaxed transition-opacity duration-500",
                  "animate-fadeIn"
                )}
              >
                {lastMessage}
              </p>
            )}
            {partialTranscript && (
              <p className="text-muted-foreground italic animate-pulse mt-2">
                {partialTranscript}
              </p>
            )}
          </div>
        </div>
      )}
      {/* Call Controls */}
      <TooltipProvider>
        <div className="w-full flex justify-center gap-4 mt-6">
          {/* Script Toggle Button - always visible */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-12 h-12 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 hover:bg-accent"
                onClick={handleScriptToggle}
                aria-label={isScriptOpen ? "Hide Script" : "Show Script"}
                aria-pressed={isScriptOpen}
              >
                {isScriptOpen ? (
                  <FileText className="h-5 w-5" />
                ) : (
                  <File className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isScriptOpen ? "Hide Script" : "Show Script"}
            </TooltipContent>
          </Tooltip>
          {callStatus !== "ACTIVE" ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="relative btn-call focus:outline-none focus:ring-2 focus:ring-primary-300"
                  onClick={() => handleCall()}
                >
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
              </TooltipTrigger>
              <TooltipContent side="top">Start Call</TooltipContent>
            </Tooltip>
          ) : (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "rounded-full w-12 h-12 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300",
                      isMuted
                        ? "bg-destructive hover:bg-destructive/90"
                        : "hover:bg-accent"
                    )}
                    onClick={handleMuteToggle}
                  >
                    {isMuted ? (
                      <MicOff className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {isMuted ? "Unmute Microphone" : "Mute Microphone"}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="btn-disconnect focus:outline-none focus:ring-2 focus:ring-destructive-300"
                    onClick={() => handleDisconnect()}
                  >
                    End
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">End Call</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </TooltipProvider>
      {/* Volume Meter */}
      <div className="w-full flex justify-center mt-2">
        <div className="h-2 w-48 bg-muted rounded-full overflow-hidden">
          <div
            className={
              `h-2 bg-primary transition-all duration-200 ` +
              (volumeLevel === 0
                ? "w-0"
                : volumeLevel < 0.1
                ? "w-1/12"
                : volumeLevel < 0.2
                ? "w-1/6"
                : volumeLevel < 0.3
                ? "w-1/4"
                : volumeLevel < 0.4
                ? "w-1/3"
                : volumeLevel < 0.5
                ? "w-2/5"
                : volumeLevel < 0.6
                ? "w-1/2"
                : volumeLevel < 0.7
                ? "w-3/5"
                : volumeLevel < 0.8
                ? "w-2/3"
                : volumeLevel < 0.9
                ? "w-3/4"
                : volumeLevel < 1
                ? "w-11/12"
                : "w-full")
            }
          />
        </div>
      </div>
      {/* Script Panel Overlay */}
      {isScriptOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col h-full animate-slideIn transition-all duration-300">
          <div className="flex justify-end p-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleScriptToggle}
              aria-label="Close Script Panel"
            >
              <span className="text-lg">×</span>
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isScriptLoading ? (
              <ScriptSkeleton />
            ) : script ? (
              <ScriptPanel
                script={script}
                jobId={jobId ?? ""}
                userId={userId ?? "Guest"}
                userName={userName}
              />
            ) : scriptError ? (
              <div className="p-4 text-destructive">{scriptError}</div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default Agent;
