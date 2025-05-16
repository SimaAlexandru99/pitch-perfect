"use client";

import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { domains } from "@/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const levelOptions = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  domain: z.string().min(1, "Domain is required"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  description: z.string().min(5, "Description is required"),
});

type FormValues = z.infer<typeof schema>;

export function QuickCreateDialog() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      domain: "",
      level: "beginner",
      description: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/sales-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to create job");
      form.reset();
      toast.success("Sales job created successfully!");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Quick Create Sales Job</DialogTitle>
        <DialogDescription>
          Fill in the details to quickly add a new sales job.
        </DialogDescription>
      </DialogHeader>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="title"
            control={form.control}
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Job Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="domain"
            control={form.control}
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel>Domain</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {domains.map((domain) => {
                        const Icon = domain.icon;
                        return (
                          <SelectItem key={domain.value} value={domain.value}>
                            <span className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {domain.label}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="level"
            control={form.control}
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel>Level</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levelOptions.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Job Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="pt-4 flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <svg
                  className="animate-spin mr-2 h-4 w-4 text-white inline"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </DialogContent>
  );
}
