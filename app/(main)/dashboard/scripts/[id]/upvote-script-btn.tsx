"use client";
import { upvoteScript } from "@/lib/actions/scripts.action";
import { useAuth } from "@/lib/hooks/use-auth";
import { ThumbsUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface UpvoteScriptBtnProps {
  scriptId: string;
  upvotes: string[];
}

export default function UpvoteScriptBtn({
  scriptId,
  upvotes,
}: UpvoteScriptBtnProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(upvotes);
  const hasUpvoted = user ? localUpvotes.includes(user.id) : false;

  async function handleUpvote() {
    if (!user) {
      toast.error("You must be signed in to like a script.");
      return;
    }
    setIsLoading(true);
    // Optimistic update
    setLocalUpvotes((prev) =>
      hasUpvoted ? prev.filter((id) => id !== user.id) : [...prev, user.id],
    );
    const res = await upvoteScript(scriptId, user.id);
    setIsLoading(false);
    if (!res.success) {
      // Revert optimistic update
      setLocalUpvotes(upvotes);
      toast.error(res.error || "Failed to update like.");
    }
  }

  return (
    <button
      onClick={handleUpvote}
      disabled={isLoading}
      aria-pressed={hasUpvoted}
      className={`flex items-center gap-1 px-2 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary/60 ${
        hasUpvoted ? "text-primary" : "text-muted-foreground hover:text-primary"
      } ${isLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-muted/40"}`}
      title={user ? (hasUpvoted ? "Unlike" : "Like") : "Sign in to like"}
      type="button"
    >
      <ThumbsUp
        className={`size-5 transition-transform duration-200 ${
          hasUpvoted ? "scale-110 animate-pulse" : ""
        }`}
        aria-hidden="true"
      />
      <span className="font-semibold text-sm tabular-nums">
        {localUpvotes.length}
      </span>
    </button>
  );
}
