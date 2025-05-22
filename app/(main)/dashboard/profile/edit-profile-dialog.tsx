"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  updateOnboardingStep,
  updateUserProfile,
} from "@/lib/actions/auth.action";
import { useAuth } from "@/lib/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  avatar: z.string().url("Must be a valid URL"),
});

export function EditProfileDialog({
  user,
}: {
  user: { name: string; email: string; avatar: string };
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: user.name, avatar: user.avatar });
  const [errors, setErrors] = useState<{ name?: string; avatar?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { user: authUser } = useAuth();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleOpenChange(val: boolean) {
    setOpen(val);
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = profileSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: { name?: string; avatar?: string } = {};
      for (const err of result.error.errors) {
        fieldErrors[err.path[0] as "name" | "avatar"] = err.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setIsLoading(true);
    try {
      if (!authUser?.id) throw new Error("User not found");
      const res = await updateUserProfile(authUser.id, form.name, form.avatar);
      if (res.success) {
        await updateOnboardingStep(authUser.id, "profile", true);
        toast.success("Profile updated!");
        setOpen(false);
      } else {
        toast.error(res.error || "Failed to update profile.");
      }
    } catch (err) {
      toast.error((err as Error).message || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-8 py-2 rounded-lg shadow-md"
      >
        Edit Profile
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-16 w-16 rounded-xl border-2 border-amber-400">
                <AvatarImage src={form.avatar} alt={form.name} />
                <AvatarFallback className="rounded-xl text-xl bg-amber-900/40 text-amber-200">
                  {form.name?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <label className="block text-white/80 mb-1">Name</label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.name && (
                <div className="text-rose-400 text-xs mt-1">{errors.name}</div>
              )}
            </div>
            <div>
              <label className="block text-white/80 mb-1">Avatar URL</label>
              <Input
                name="avatar"
                value={form.avatar}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.avatar && (
                <div className="text-rose-400 text-xs mt-1">
                  {errors.avatar}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="animate-spin size-5 mr-2" />
                ) : null}
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
