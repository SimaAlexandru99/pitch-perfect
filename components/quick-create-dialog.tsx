"use client";

import { Badge } from "@/components/ui/badge";
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
import QuickCreateSubmitButton from "@/components/ui/quick-create-submit-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { domains } from "@/constants";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { FormProvider, Resolver, useForm } from "react-hook-form";
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

interface QuickCreateDialogProps {
  selectedDomain?: string;
  onClose?: () => void;
}

export function QuickCreateDialog({
  selectedDomain,
  onClose,
}: QuickCreateDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues, unknown>,
    defaultValues: {
      title: "",
      domain: selectedDomain || "",
      level: "beginner",
      description: "",
    },
  });

  useEffect(() => {
    if (selectedDomain) {
      form.setValue("domain", selectedDomain);
    }
  }, [selectedDomain, form]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/sales-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to create job");
      form.reset();
      toast.success("Sales job created successfully!");
      if (onClose) {
        setTimeout(onClose, 1200);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedDomainInfo = selectedDomain
    ? domains.find((d) => d.value === selectedDomain)
    : null;

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader className="space-y-3">
        <DialogTitle className="text-2xl font-bold">
          Quick Create Sales Job
        </DialogTitle>
        <DialogDescription className="text-base">
          {selectedDomainInfo ? (
            <>
              Create a new sales job in the{" "}
              <span className="font-medium text-primary">
                {selectedDomainInfo.label}
              </span>{" "}
              domain. This will help you practice your sales skills in this
              specific industry.
            </>
          ) : (
            "Fill in the details to quickly add a new sales job. This will help you practice your sales skills in a specific domain."
          )}
        </DialogDescription>
      </DialogHeader>
      {submitError && (
        <div
          className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm"
          role="alert"
        >
          {submitError}
        </div>
      )}
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <FormField
            name="title"
            control={form.control}
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-base">Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Senior Sales Representative"
                    className="h-11"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="domain"
            control={form.control}
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-base">Domain</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-11" aria-disabled={isLoading}>
                      <SelectValue placeholder="Select a sales domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {domains.map((domain) => {
                        const Icon = domain.icon;
                        return (
                          <SelectItem
                            key={domain.value}
                            value={domain.value}
                            className="py-2"
                            aria-label={domain.label}
                          >
                            <span className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-primary" />
                              <span className="font-medium">
                                {domain.label}
                              </span>
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
              <FormItem className="space-y-2">
                <FormLabel className="text-base">Experience Level</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-11" aria-disabled={isLoading}>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levelOptions.map((level) => (
                        <SelectItem
                          key={level.value}
                          value={level.value}
                          className="py-2"
                          aria-label={level.label}
                        >
                          <span className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "px-2 py-0.5",
                                level.value === "beginner" &&
                                  "bg-green-500/10 text-green-500",
                                level.value === "intermediate" &&
                                  "bg-blue-500/10 text-blue-500",
                                level.value === "advanced" &&
                                  "bg-purple-500/10 text-purple-500"
                              )}
                            >
                              {level.label}
                            </Badge>
                          </span>
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
              <FormItem className="space-y-2">
                <FormLabel className="text-base">Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the sales scenario and key objectives..."
                    className="min-h-[120px] resize-none"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="pt-4 flex justify-end">
            <QuickCreateSubmitButton isLoading={isLoading} />
          </div>
        </form>
      </FormProvider>
    </DialogContent>
  );
}
