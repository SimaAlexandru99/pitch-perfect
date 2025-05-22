"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { sendFriendRequest } from "@/lib/actions/social.action";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const addFriendSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

/**
 * Dialog for sending a friend request by email.
 * @param currentUserId - The current user's ID
 */
export function AddFriendDialog({ currentUserId }: { currentUserId: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = addFriendSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    setIsLoading(true);
    // TODO: Lookup userId by email (for now, fake toUserId)
    const toUserId = email; // Replace with real lookup
    if (toUserId === currentUserId) {
      setError("You cannot add yourself as a friend.");
      setIsLoading(false);
      return;
    }
    const res = await sendFriendRequest(currentUserId, toUserId);
    setIsLoading(false);
    if (res.success) {
      toast.success("Friend request sent!");
      setOpen(false);
      setEmail("");
    } else {
      setError(res.error || "Failed to send friend request.");
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="gap-2">
        <UserPlus className="size-5" /> Add Friend
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Friend</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/80 mb-1">
                Friend&apos;s Email
              </label>
              <Input
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="friend@email.com"
                autoFocus
              />
              {error && (
                <div className="text-rose-400 text-xs mt-1">{error}</div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="animate-spin size-5 mr-2" />
                ) : null}
                {isLoading ? "Sending..." : "Send Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
