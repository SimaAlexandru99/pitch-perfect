"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { vapi } from "@/lib/vapi.sdk";
import { Mic, MicOff } from "lucide-react";
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

interface PitchOfTheDayAgentProps {
  userId: string;
  userName: string;
  config: CreateAssistantDTO | string;
  onProgressAction: (completed: number, score?: number) => void;
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface VapiTranscriptMessage {
  type: string;
  transcriptType?: "partial" | "final";
  role: "user" | "system" | "assistant";
  transcript: string;
}

const MAX_OBJECTIONS = 3;

export default function PitchOfTheDayAgent({
  userId,
  userName,
  config,
  onProgressAction,
}: PitchOfTheDayAgentProps) {
  const [callStatus, setCallStatus] = useState<
    "INACTIVE" | "CONNECTING" | "ACTIVE" | "FINISHED"
  >("INACTIVE");
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);

  useEffect(() => {
    const onCallStart = () => setCallStatus("ACTIVE");
    const onCallEnd = () => setCallStatus("FINISHED");
    const onMessage = (message: VapiTranscriptMessage) => {
      if (message.type !== "transcript") return;
      if (message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => {
          const newMessages = [...prev, newMessage];
          // Only count assistant messages after the intro
          const assistantMessages = newMessages.filter(
            (m) => m.role === "assistant",
          );
          if (assistantMessages.length > 1) {
            // First assistant message is intro
            const completed = Math.min(
              assistantMessages.length - 1,
              MAX_OBJECTIONS,
            );
            onProgressAction(completed);
          }
          return newMessages;
        });
      }
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = () => setCallStatus("FINISHED");
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
  }, [onProgressAction]);

  const handleCall = async () => {
    try {
      setCallStatus("CONNECTING");
      await vapi.start(config, {
        variableValues: {
          userId,
          userName,
        },
      });
    } catch {
      setCallStatus("INACTIVE");
    }
  };

  const handleDisconnect = () => {
    try {
      setCallStatus("FINISHED");
      vapi.stop();
    } catch {
      setCallStatus("INACTIVE");
    }
  };

  const handleMuteToggle = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    vapi.setMuted(newMutedState);
  };

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
  }, [messages]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* AI and User Avatars */}
      <div className="flex gap-8 justify-center w-full">
        <div className="flex flex-col items-center">
          <div className="relative flex items-center justify-center rounded-full size-24 bg-primary-100">
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
          <span className="mt-2 text-sm font-medium text-primary-100">
            AI Interviewer
          </span>
        </div>
        <div className="flex flex-col items-center">
          <div className="size-24 rounded-full overflow-hidden bg-muted">
            <Image
              src="/user-avatar.png"
              alt="User Avatar"
              width={96}
              height={96}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <span className="mt-2 text-sm font-medium">{userName}</span>
        </div>
      </div>
      {/* Message Display */}
      {lastMessage && (
        <div className="rounded-xl border border-border/50 bg-gradient-to-b from-background to-muted/50 shadow-lg max-w-xl w-full mx-auto p-6 mt-2">
          <p className="text-lg leading-relaxed">{lastMessage}</p>
        </div>
      )}
      {/* Call Controls */}
      <div className="flex gap-4 mt-4">
        {callStatus !== "ACTIVE" ? (
          <Button onClick={handleCall} disabled={callStatus === "CONNECTING"}>
            {callStatus === "INACTIVE" || callStatus === "FINISHED"
              ? "Call"
              : ". . ."}
          </Button>
        ) : (
          <>
            <Button
              variant={isMuted ? "destructive" : "outline"}
              onClick={handleMuteToggle}
            >
              {isMuted ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
            <Button variant="destructive" onClick={handleDisconnect}>
              End
            </Button>
          </>
        )}
      </div>
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
    </div>
  );
}
