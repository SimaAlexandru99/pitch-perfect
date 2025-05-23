"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createScript } from "@/lib/actions/scripts.action";
import { useAuth } from "@/lib/hooks/use-auth";
import { FileText, Loader2, Plus, Tag } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

// Zod schema for script form
const scriptSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(2000, "Content exceeds 2000 characters."),
  tags: z.array(z.string()),
});

// Dynamic import for react-markdown
const Markdown = dynamic(() => import("react-markdown"), { ssr: false });

export default function AddScriptDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", tags: "" });
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>(
    {}
  );
  const [tab, setTab] = useState("edit");
  const contentMax = 2000;
  const contentLength = form.content.length;
  const contentOver = contentLength > contentMax;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleTagInput(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      const value = form.tags.trim();
      if (value && !tags.includes(value)) {
        setTags([...tags, value]);
      }
      setForm({ ...form, tags: "" });
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    // Zod validation
    const result = scriptSchema.safeParse({
      title: form.title,
      content: form.content,
      tags,
    });
    if (!result.success) {
      const fieldErrors: { title?: string; content?: string } = {};
      for (const err of result.error.errors) {
        if (err.path[0] === "title") fieldErrors.title = err.message;
        if (err.path[0] === "content") fieldErrors.content = err.message;
      }
      setErrors(fieldErrors);
      return;
    }
    if (!user) {
      toast.error("You must be signed in to add a script.");
      return;
    }
    setIsLoading(true);
    const res = await createScript({
      title: form.title,
      content: form.content,
      tags,
      authorId: user.id,
      authorName: user.name ?? "Anonymous",
    });
    setIsLoading(false);
    if (res.success) {
      toast.success("Script/resource added!");
      setOpen(false);
      setForm({ title: "", content: "", tags: "" });
      setTags([]);
    } else {
      toast.error(res.error || "Failed to add script/resource.");
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="default" className="gap-2">
        <Plus className="size-5" /> Add Script
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-full rounded-xl shadow-2xl bg-gradient-to-b from-background to-muted/60 border border-border/40">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" /> Add Script or
              Resource
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-white/80 mb-1 flex items-center gap-1">
                <FileText className="size-4 text-muted-foreground" /> Title
              </label>
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Script or resource title"
                autoFocus
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? "title-error" : undefined}
              />
              <div className="text-xs text-muted-foreground mt-1">
                Give your script/resource a clear, descriptive title.
              </div>
              {errors.title && (
                <div
                  id="title-error"
                  className="text-rose-400 text-xs mt-1 animate-pulse"
                >
                  {errors.title}
                </div>
              )}
            </div>
            <div>
              <label className="text-white/80 mb-1 flex items-center gap-1">
                <Tag className="size-4 text-muted-foreground" /> Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="pr-1 pl-2 py-1 gap-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      className="ml-1 text-xs text-muted-foreground hover:text-rose-400 focus:outline-none"
                      aria-label={`Remove tag ${tag}`}
                      onClick={() => removeTag(tag)}
                      tabIndex={0}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                onKeyDown={handleTagInput}
                disabled={isLoading}
                placeholder="Type a tag and press Enter or comma"
                aria-label="Add tag"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Add relevant tags (e.g. objection, closing, pitch).
              </div>
            </div>
            <div>
              <label className="text-white/80 mb-1 flex items-center gap-1">
                <FileText className="size-4 text-muted-foreground" /> Content
              </label>
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">
                  <Textarea
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="Paste your script, resource, or tip here... Markdown supported."
                    rows={5}
                    maxLength={contentMax + 100}
                    aria-invalid={!!errors.content || contentOver}
                    aria-describedby={
                      errors.content ? "content-error" : undefined
                    }
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-muted-foreground">
                      Markdown supported. Format your script for clarity.
                    </span>
                    <span
                      className={`text-xs ${
                        contentOver ? "text-rose-400" : "text-muted-foreground"
                      }`}
                    >
                      {contentLength}/{contentMax}
                    </span>
                  </div>
                  {errors.content && (
                    <div
                      id="content-error"
                      className="text-rose-400 text-xs mt-1 animate-pulse"
                    >
                      {errors.content}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="preview">
                  <div className="border rounded-md p-3 min-h-[120px] bg-background/80 text-sm prose prose-invert max-w-none">
                    {form.content.trim() ? (
                      <Markdown>{form.content}</Markdown>
                    ) : (
                      <span className="text-muted-foreground">
                        Nothing to preview yet.
                      </span>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="animate-spin size-5 mr-2" />
                ) : null}
                {isLoading ? "Adding..." : "Add Script"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
